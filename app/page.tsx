import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { daysUntil, formatDaysLeft } from '@/lib/utils/dates'
import { EnableNotifications } from '@/components/EnableNotifications'

type Item = {
  id: string
  name: string
  category: string
  reminder_type: string
  renewal_date: string
  importance: string | null
}

function groupByUrgency(items: Item[]) {
  const overdue: Item[] = []
  const thisWeek: Item[] = []
  const thisMonth: Item[] = []
  const later: Item[] = []

  for (const item of items) {
    const daysLeft = daysUntil(item.renewal_date)
    if (daysLeft < 0) overdue.push(item)
    else if (daysLeft <= 7) thisWeek.push(item)
    else if (daysLeft <= 30) thisMonth.push(item)
    else later.push(item)
  }

  return { overdue, thisWeek, thisMonth, later }
}

function ItemRow({ item }: { item: Item }) {
  const daysLeft = daysUntil(item.renewal_date)
  return (
    <li>
      <Link href={`/items/${item.id}`}>
        <strong>{item.name}</strong>
        <span> · {item.category}</span>
        {item.importance === 'high' && <span> · High priority</span>}
      </Link>
      <div>{formatDaysLeft(daysLeft, item.reminder_type)}</div>
    </li>
  )
}

function Tier({ title, items }: { title: string; items: Item[] }) {
  if (items.length === 0) return null
  return (
    <section>
      <h2>{title} ({items.length})</h2>
      <ul>
        {items.map((item) => <ItemRow key={item.id} item={item} />)}
      </ul>
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
    return <p>Error loading dashboard: {error.message}</p>
  }

  const { overdue, thisWeek, thisMonth, later } = groupByUrgency(items ?? [])
  const hasAnyItems = (items?.length ?? 0) > 0

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Coming up</h1>
        <Link href="/items/new">+ Add item</Link>
      </div>

      {!hasAnyItems ? (
        <p>No items yet. <Link href="/items/new">Add your first renewal</Link> to get started.</p>
      ) : (
        <>
          <Tier title="Overdue" items={overdue} />
          <Tier title="This week" items={thisWeek} />
          <Tier title="This month" items={thisMonth} />
          <Tier title="Later" items={later} />
        </>
      )}

      <Link href="/items">View all items</Link>

      <EnableNotifications />
    </div>
  )
}