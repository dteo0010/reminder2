import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { daysUntil, formatDaysLeft } from '@/lib/utils/dates'
import { formatStageLabel } from '@/lib/utils/notifications'
import { RenewForm } from '@/components/RenewForm'
import { DeleteButton } from '@/components/DeleteButton'

export default async function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: item, error } = await supabase.from('items').select('*').eq('id', id).single()
  if (error || !item) notFound()

  const { data: history } = await supabase
    .from('notification_log')
    .select('stage, sent_at')
    .eq('item_id', id)
    .order('sent_at', { ascending: false })

  const daysLeft = daysUntil(item.renewal_date)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>{item.name}</h1>
        <Link href={`/items/${item.id}/edit`}>Edit</Link>
      </div>

      <p>Category: {item.category}</p>
      <p>Type: {item.reminder_type === 'expiry' ? 'Expires on' : 'Renews on'} {new Date(item.renewal_date).toLocaleDateString()}</p>
      <p>{formatDaysLeft(daysLeft, item.reminder_type)}</p>
      {item.importance && <p>Importance: {item.importance}</p>}
      {item.recurrence && item.recurrence !== 'none' && <p>Recurs: {item.recurrence}</p>}

      <RenewForm itemId={item.id} currentDate={item.renewal_date} />
      <DeleteButton itemId={item.id} />

      <section>
        <h2>Notification history</h2>
        {(!history || history.length === 0) ? (
          <p>No reminders sent yet for this cycle.</p>
        ) : (
          <ul>
            {history.map((h, i) => (
              <li key={i}>
                {formatStageLabel(h.stage)} — {new Date(h.sent_at).toLocaleDateString()} at {new Date(h.sent_at).toLocaleTimeString()}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}