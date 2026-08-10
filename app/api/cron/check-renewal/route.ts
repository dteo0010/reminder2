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
  if (importance === 'low') return sorted.slice(-1)  // only the closest stage
  return sorted.length > 1 ? sorted.slice(1) : sorted // 'normal': drop the furthest
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: items } = await supabase.from('items').select('*').eq('status', 'active')
  const { data: rules } = await supabase.from('category_rules').select('*')
  const ruleMap = new Map<string, CategoryRule>(rules!.map(r => [r.category, r]))

  const dueByUser = new Map<string, { item: Item; daysLeft: number }[]>()

  for (const item of (items as Item[])) {
    const rule = ruleMap.get(item.category)!
    const leadDays = item.lead_days ?? rule.default_lead_days
    const importance = item.importance ?? rule.default_importance
    const stages = effectiveStages(leadDays, importance)
    const daysLeft = daysUntil(item.renewal_date)

    // Overdue expiry items always get flagged once, as their own stage (0)
    const isOverdueExpiry = item.reminder_type === 'expiry' && daysLeft < 0
    const matchedStage = isOverdueExpiry ? 0 : stages.find(s => s === daysLeft)
    if (matchedStage === undefined) continue

    // Dedupe: skip if this exact stage was already logged for this item
    const { data: existing } = await supabase
      .from('notification_log')
      .select('id')
      .eq('item_id', item.id)
      .eq('stage', matchedStage)
      .limit(1)
    if (existing && existing.length > 0) continue

    if (!dueByUser.has(item.user_id)) dueByUser.set(item.user_id, [])
    dueByUser.get(item.user_id)!.push({ item, daysLeft })

    // Log immediately so a mid-run failure can't cause a duplicate send later
    await supabase.from('notification_log').insert({
      item_id: item.id,
      stage: matchedStage,
      channel: 'digest',
    })
  }

  for (const [userId, entries] of dueByUser) {
    const message = buildDigestMessage(entries)
    await sendDigest(userId, message) // push/email sending — next step
  }

  return NextResponse.json({ checked: items?.length ?? 0, notified: dueByUser.size })
}

function buildDigestMessage(entries: { item: Item; daysLeft: number }[]) {
  const expiring = entries.filter(e => e.item.reminder_type === 'expiry')
  const renewing = entries.filter(e => e.item.reminder_type === 'renewal')

  // Name only the high-importance items, capped at 2, so the string
  // stays short even on a day when several things happen to line up.
  const highlighted = entries
    .filter(e => (e.item.importance ?? 'normal') === 'high')
    .slice(0, 2)

  const counts: string[] = []
  if (expiring.length > 0) counts.push(`${expiring.length} expiring`)
  if (renewing.length > 0) counts.push(`${renewing.length} renewing`)

  const title = counts.join(', ')
  const body = highlighted.length > 0
    ? highlighted.map(e => `${e.item.name} (${e.daysLeft <= 0 ? 'overdue' : e.daysLeft + 'd'})`).join(', ')
    : 'Open the app to review.'

  return { title, body }
}