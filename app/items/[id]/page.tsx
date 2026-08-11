import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { daysUntil, formatDaysLeft } from '@/lib/utils/dates'
import { RenewForm } from '@/components/RenewForm'
import { DeleteButton } from '@/components/DeleteButton'

export default async function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: item, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !item) notFound()

  const daysLeft = daysUntil(item.renewal_date)

  return (
    <div>
      <h1>{item.name}</h1>
      <p>Category: {item.category}</p>
      <p>Type: {item.reminder_type === 'expiry' ? 'Expires on' : 'Renews on'} {new Date(item.renewal_date).toLocaleDateString()}</p>
      <p>{formatDaysLeft(daysLeft, item.reminder_type)}</p>
      {item.importance && <p>Importance: {item.importance}</p>}
      {item.recurrence && item.recurrence !== 'none' && <p>Recurs: {item.recurrence}</p>}

      <RenewForm itemId={item.id} currentDate={item.renewal_date} />
      <DeleteButton itemId={item.id} />
    </div>
  )
}