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
  const safeRecurrence = reminder_type === 'renewal' ? (recurrence || 'none') : 'none'

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
    recurrence: safeRecurrence,
  })

  if (error) {
    throw new Error(error.message)
  }

  redirect('/items')
}

export async function markAsRenewed(itemId: string, newDate: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error: updateError } = await supabase
    .from('items')
    .update({ renewal_date: newDate, status: 'active' })
    .eq('id', itemId)
    .eq('user_id', user.id)

  if (updateError) throw new Error(updateError.message)

  // Clear the log so staged reminders restart fresh against the new date
  const { error: deleteError } = await supabase
    .from('notification_log')
    .delete()
    .eq('item_id', itemId)

  if (deleteError) throw new Error(deleteError.message)

  redirect('/items')
}

export async function deleteItem(itemId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', itemId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  redirect('/items')
}

export async function updateItem(itemId: string, formData: FormData) {
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

  const { error } = await supabase
    .from('items')
    .update({
      name,
      category,
      reminder_type,
      renewal_date,
      lead_days: lead_days && lead_days.length > 0 ? lead_days : null,
      importance: importance || null,
      recurrence: recurrence || 'none',
    })
    .eq('id', itemId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  // Any edited field can change what a "stage" means for this item —
  // clear the log so reminders restart fresh under the new configuration,
  // same reasoning as markAsRenewed clearing it on date changes.
  await supabase.from('notification_log').delete().eq('item_id', itemId)

  redirect(`/items/${itemId}`)
}