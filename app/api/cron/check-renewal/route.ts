import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { sendDigest } from '@/lib/notifications/send'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // bypasses RLS — server-only, never exposed to browser
)

type Item = {
  id: string
  user_id: string
  name: string
  category: string
  reminder_type: 'expiry' | 'renewal'
  renewal_date: string
  lead_days: number[] | null
  importance: 'low' | 'normal' | 'high' | null
  status: string
}

type CategoryRule = {
  category: string
  default_lead_days: number[]
  default_importance: 'low' | 'normal' | 'high'
}

function daysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / 86400000)
}

// Importance prunes which lead-time stages actually fire —
// this is what keeps low-stakes items from generating extra noise.
function effectiveStages(leadDays: number[], importance: string): number[] {
  const sorted = [...leadDays].sort((a, b) => b - a) // furthest first
  if (importance === 'high') return sorted
  if (importance === 'low') return sorted.slice(-1)
  return sorted.slice(-2) // 'normal': closest two, regardless of how many total stages exist
}

// --- overdue re-notify bucket: weekly cadence instead of "once, ever" ---
function overdueStage(daysLeft: number): number {
  const weeksOverdue = Math.floor(Math.abs(daysLeft) / 7)
  return -(weeksOverdue * 7) // 0, -7, -14, ... each week gets one notify
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: items } = await supabase.from('items').select('*').eq('status', 'active')
  const { data: rules } = await supabase.from('category_rules').select('*')
  const ruleMap = new Map<string, CategoryRule>(rules!.map(r => [r.category, r]))

  const dueByUser = new Map<string, { item: Item; daysLeft: number; matchedStage: number }[]>()

  for (const item of (items as Item[])) {
    const rule = ruleMap.get(item.category)!
    const leadDays = item.lead_days ?? rule.default_lead_days
    const importance = item.importance ?? rule.default_importance
    const stages = effectiveStages(leadDays, importance)
    const daysLeft = daysUntil(item.renewal_date)

    const { data: loggedStages } = await supabase
      .from('notification_log')
      .select('stage')
      .eq('item_id', item.id)
    const loggedSet = new Set((loggedStages ?? []).map((r) => r.stage))

    let matchedStage: number | undefined

    if (item.reminder_type === 'expiry' && daysLeft < 0) {
      const stage = overdueStage(daysLeft)
      if (!loggedSet.has(stage)) matchedStage = stage
    } else {
      const candidates = stages.filter((s) => daysLeft <= s).sort((a, b) => a - b)
      matchedStage = candidates.find((s) => !loggedSet.has(s))
    }

    if (matchedStage === undefined) continue

    if (!dueByUser.has(item.user_id)) dueByUser.set(item.user_id, [])
    dueByUser.get(item.user_id)!.push({ item, daysLeft, matchedStage })
  }

  for (const [userId, entries] of dueByUser) {
    const hasUrgent = entries.some((e) => e.matchedStage <= 0 || e.item.importance === 'high')

    if (!hasUrgent) {
      const { data: recent } = await supabase
        .from('notification_log')
        .select('sent_at, items!inner(user_id)')
        .eq('items.user_id', userId)
        .order('sent_at', { ascending: false })
        .limit(1)

      const lastSent = recent?.[0]?.sent_at ? new Date(recent[0].sent_at).getTime() : 0
      const hoursSinceLast = (Date.now() - lastSent) / 3600000
      if (hoursSinceLast < 24) continue
    }

    await supabase.from('notification_log').insert(
      entries.map((e) => ({ item_id: e.item.id, stage: e.matchedStage, channel: 'digest' }))
    )

    const message = buildDigestMessage(entries)
    await sendDigest(userId, message)
  }

  return NextResponse.json({ checked: items?.length ?? 0, notified: dueByUser.size })
}

function buildDigestMessage(entries: { item: Item; daysLeft: number; matchedStage: number }[]) {
  const expiring = entries.filter((e) => e.item.reminder_type === 'expiry')
  const renewing = entries.filter((e) => e.item.reminder_type === 'renewal')

  // Sort by urgency: overdue/soonest first. Importance no longer gates inclusion —
  // an overdue normal item now outranks a high-importance item still 14 days out.
  const highlighted = [...entries]
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 2)

  const counts: string[] = []
  if (expiring.length > 0) counts.push(`${expiring.length} expiring`)
  if (renewing.length > 0) counts.push(`${renewing.length} renewing`)

  const title = counts.join(', ')
  const body = highlighted
    .map((e) => `${e.item.name} (${e.daysLeft <= 0 ? 'overdue' : e.daysLeft + 'd'})`)
    .join(', ')

  return { title, body: body || 'Open the app to review.' }
}