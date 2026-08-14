import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { daysUntil } from '@/lib/utils/dates'
import { CountdownDigit, getTier, Tier as TierKey } from '@/components/CountdownDigit'
import { EnableNotifications } from '@/components/EnableNotifications'

type Item = {
  id: string
  name: string
  category: string
  reminder_type: string
  renewal_date: string
  importance: string | null
}

const CATEGORY_LABELS: Record<string, string> = {
  passport: 'Passport',
  licence: 'Licence',
  insurance: 'Insurance',
  road_tax: 'Road tax',
  subscription: 'Subscription',
}

function groupByUrgency(items: Item[]) {
  const groups: Record<TierKey, Item[]> = { overdue: [], thisWeek: [], thisMonth: [], later: [] }
  for (const item of items) {
    groups[getTier(daysUntil(item.renewal_date))].push(item)
  }
  return groups
}

function ItemRow({ item }: { item: Item }) {
  const daysLeft = daysUntil(item.renewal_date)

  return (
    <Link
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
      <span className="text-xs text-text-muted font-display shrink-0">
        {new Date(item.renewal_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
      </span>
    </Link>
  )
}

function Section({ title, items }: { title: string; items: Item[] }) {
  if (items.length === 0) return null
  return (
    <section className="mb-8">
      <div className="flex items-baseline gap-2 mb-1">
        <h2 className="eyebrow">{title}</h2>
        <span className="text-xs text-text-muted font-display">{items.length}</span>
      </div>
      <div className="card px-5">
        {items.map((item) => <ItemRow key={item.id} item={item} />)}
      </div>
    </section>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: items, error } = await supabase
    .from('items')
    .select('id, name, category, reminder_type, renewal_date, importance')
    .eq('status', 'active')
    .order('renewal_date', { ascending: true })

  if (error) {
    return <p className="text-urgent">Error loading dashboard: {error.message}</p>
  }

  const { overdue, thisWeek, thisMonth, later } = groupByUrgency(items ?? [])
  const hasAnyItems = (items?.length ?? 0) > 0

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow mb-1">Dashboard</p>
        <h1 className="text-2xl text-text">Coming up</h1>
      </div>

      {!hasAnyItems ? (
        <div className="card p-8 text-center">
          <p className="text-text-muted mb-4">Nothing tracked yet.</p>
          <Link href="/items/new" className="btn btn-primary inline-flex">Add your first renewal</Link>
        </div>
      ) : (
        <>
          <Section title="Overdue" items={overdue} />
          <Section title="This week" items={thisWeek} />
          <Section title="This month" items={thisMonth} />
          <Section title="Later" items={later} />
        </>
      )}

      <div className="mt-10 pt-6 border-t border-line">
        <EnableNotifications />
      </div>
    </div>
  )
}