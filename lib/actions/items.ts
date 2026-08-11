'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const CATEGORY_REMINDER_TYPE: Record<string, 'expiry' | 'renewal'> = {
  passport: 'expiry',
  licence: 'expiry',
  insurance: 'expiry',
  road_tax: 'expiry',
  subscription: 'renewal',
}

export async function addItem(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = formData.get('name') as string
  const category = formData.get('category') as string
  const renewal_date = formData.get('renewal_date') as string
  const reminderTypeOverride = formData.get('reminder_type') as string
  const importance = formData.get('importance') as string
  const recurrence = formData.get('recurrence') as string
  const leadDaysRaw = formData.get('lead_days') as string

  const reminder_type = reminderTypeOverride || CATEGORY_REMINDER_TYPE[category] || 'expiry'

  const lead_days = leadDaysRaw
    ? leadDaysRaw.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n))
    : null

  const { error } = await supabase.from('items').insert({
    user_id: user.id,
    name,
    category,
    reminder_type,
    renewal_date,
    lead_days: lead_days && lead_days.length > 0 ? lead_days : null,
    importance: importance || null,
    recurrence: recurrence || 'none',
  })

  if (error) {
    throw new Error(error.message)
  }

  redirect('/items')
}