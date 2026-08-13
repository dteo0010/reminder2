'use client'

import { updateItem } from '@/lib/actions/items'

type Item = {
  id: string
  name: string
  category: string
  reminder_type: string
  renewal_date: string
  lead_days: number[] | null
  importance: string | null
  recurrence: string | null
}

const CATEGORIES = [
  { value: 'passport', label: 'Passport' },
  { value: 'licence', label: 'Licence' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'road_tax', label: 'Road Tax' },
  { value: 'subscription', label: 'Subscription' },
]

export function EditItemForm({ item }: { item: Item }) {
  const updateItemWithId = updateItem.bind(null, item.id)

  return (
    <form action={updateItemWithId}>
      <div>
        <label htmlFor="name">Name</label>
        <input id="name" name="name" type="text" required defaultValue={item.name} />
      </div>

      <div>
        <label htmlFor="category">Category</label>
        <select id="category" name="category" required defaultValue={item.category}>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="renewal_date">Renewal date</label>
        <input id="renewal_date" name="renewal_date" type="date" required defaultValue={item.renewal_date} />
      </div>

      <div>
        <label htmlFor="reminder_type">Reminder type</label>
        <select id="reminder_type" name="reminder_type" defaultValue={item.reminder_type}>
          <option value="expiry">Expiry — invalid after this date</option>
          <option value="renewal">Renewal — auto-renews on this date</option>
        </select>
      </div>

      <div>
        <label htmlFor="importance">Importance</label>
        <select id="importance" name="importance" defaultValue={item.importance ?? ''}>
          <option value="">Use category default</option>
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
        </select>
      </div>

      <div>
        <label htmlFor="lead_days">Custom lead times (days before, comma-separated)</label>
        <input
          id="lead_days"
          name="lead_days"
          type="text"
          placeholder="e.g. 30, 7, 1"
          defaultValue={item.lead_days ? item.lead_days.join(', ') : ''}
        />
      </div>

      <div>
        <label htmlFor="recurrence">Recurrence</label>
        <select id="recurrence" name="recurrence" defaultValue={item.recurrence ?? 'none'}>
          <option value="none">None</option>
          <option value="monthly">Monthly</option>
          <option value="annual">Annual</option>
        </select>
      </div>

      <button type="submit">Save changes</button>
    </form>
  )
}