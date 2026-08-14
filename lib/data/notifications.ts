import { createClient } from '@/lib/supabase/server'

export async function getNotificationHistory() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('notification_log')
    .select('id, stage, sent_at, items(name, category)')
    .order('sent_at', { ascending: false })
    .limit(50)
  return data ?? []
}