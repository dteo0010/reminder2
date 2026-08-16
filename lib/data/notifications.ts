import { createClient } from '@/lib/supabase/server'

export type HistoryEntry = {
  id: string
  stage: number
  sent_at: string
  items: { name: string; category: string } | null
}

export async function getNotificationHistory() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('notification_log')
    .select('id, stage, sent_at, items(name, category)')
    .order('sent_at', { ascending: false })
    .limit(50)
    return (data ?? []) as unknown as HistoryEntry[]
}