import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { daysUntil } from '@/lib/utils/dates'
import { CountdownDigit } from '@/components/CountdownDigit'

const CATEGORY_LABELS: Record<string, string> = {
  passport: 'Passport',
  licence: 'Licence',
  insurance: 'Insurance',
  road_tax: 'Road tax',
  subscription: 'Subscription',
}

export default async function ItemsPage() {
  const supabase = await createClient()

  const { data: items, error } = await supabase
    .from('items')
    .select('*')
    .order('renewal_date', { ascending: true })

  if (error) {
    return <p className="text-urgent">Error loading items: {error.message}</p>
  }

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow mb-1">Everything tracked</p>
        <h1 className="text-2xl text-text">All items</h1>
      </div>

      {(!items || items.length === 0) ? (
        <div className="card p-8 text-center">
          <p className="text-text-muted mb-4">No items yet.</p>
          <Link href="/items/new" className="btn btn-primary inline-flex">Add your first renewal</Link>
        </div>
      ) : (
        <div className="card px-5">
          {items.map((item) => {
            const daysLeft = daysUntil(item.renewal_date)
            return (
              <Link
                key={item.id}
                href={`/items/${item.id}`}
                className="flex items-center justify-between gap-4 py-4 border-b border-line last:border-0 group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-16 shrink-0 flex justify-center">
                    <CountdownDigit daysLeft={daysLeft} size="md" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-text truncate group-hover:text-accent transition-colors">{item.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {CATEGORY_LABELS[item.category] ?? item.category}
                      {item.importance === 'high' && <span className="text-urgent"> · high priority</span>}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-text font-display shrink-0">
                  {new Date(item.renewal_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}