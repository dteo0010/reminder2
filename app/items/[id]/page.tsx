import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { daysUntil } from '@/lib/utils/dates'
import { formatStageLabel } from '@/lib/utils/notifications'
import { RenewForm } from '@/components/RenewForm'
import { DeleteButton } from '@/components/DeleteButton'
import { CountdownDigit } from '@/components/CountdownDigit'

const CATEGORY_LABELS: Record<string, string> = {
  passport: 'Passport',
  licence: 'Licence',
  insurance: 'Insurance',
  road_tax: 'Road tax',
  subscription: 'Subscription',
}

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
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="eyebrow mb-1">{CATEGORY_LABELS[item.category] ?? item.category}</p>
          <h1 className="text-2xl text-text">{item.name}</h1>
        </div>
        <Link href={`/items/${item.id}/edit`} className="btn">Edit</Link>
      </div>

      <div className="card p-6 mb-6 flex items-center gap-6">
        <CountdownDigit daysLeft={daysLeft} size="lg" />
        <div>
          <p className="text-xs text-text-muted font-display">
            {item.reminder_type === 'expiry' ? 'Expires' : 'Renews'} {new Date(item.renewal_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          {item.importance && <p className="text-xs text-text-muted mt-1">Importance: {item.importance}</p>}
          {item.recurrence && item.recurrence !== 'none' && <p className="text-xs text-text-muted">Recurs: {item.recurrence}</p>}
        </div>
      </div>

      <div className="card p-6 mb-6">
        <p className="eyebrow mb-4">Mark as renewed</p>
        <RenewForm itemId={item.id} currentDate={item.renewal_date} />
      </div>

      <section className="mb-8">
        <p className="eyebrow mb-3">Notification history</p>
        {(!history || history.length === 0) ? (
          <p className="text-sm text-text-muted">No reminders sent yet for this cycle.</p>
        ) : (
          <div className="card px-5">
            {history.map((h, i) => (
              <div key={i} className="py-3 border-b border-line last:border-0 flex justify-between text-sm">
                <span className="text-text-muted">{formatStageLabel(h.stage)}</span>
                <span className="text-text-muted font-display text-xs">{new Date(h.sent_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <DeleteButton itemId={item.id} />
    </div>
  )
}