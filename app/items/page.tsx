import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { daysUntil, formatDaysLeft } from '@/lib/utils/dates'

export default async function ItemsPage() {
  const supabase = await createClient()

  const { data: items, error } = await supabase
    .from('items')
    .select('*')
    .order('renewal_date', { ascending: true })

  if (error) {
    return <p>Error loading items: {error.message}</p>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>All items</h1>
        <Link href="/items/new">+ Add item</Link>
      </div>

      {(!items || items.length === 0) ? (
        <p>No items yet. Add your first renewal to get started.</p>
      ) : (
        <ul>
          {items.map((item) => {
            const daysLeft = daysUntil(item.renewal_date)
            return (
              <li key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <span> · {item.category}</span>
                  {item.importance === 'high' && <span> · High priority</span>}
                </div>
                <div>
                  {new Date(item.renewal_date).toLocaleDateString()}
                  {' · '}
                  {formatDaysLeft(daysLeft, item.reminder_type)}
                </div>
                <Link href={`/items/${item.id}`}>View / Edit</Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}