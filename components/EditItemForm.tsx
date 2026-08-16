'use client'

import { useState } from 'react'
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
  const [reminderType, setReminderType] = useState(item.reminder_type)
  const isRenewalType = reminderType === 'renewal'

  return (
    <form action={updateItemWithId} className="space-y-5">
      <div>
        <label htmlFor="name" className="field-label">Name</label>
        <input id="name" name="name" type="text" required defaultValue={item.name} className="field" />
      </div>

      <div>
        <label htmlFor="category" className="field-label">Category</label>
        <select id="category" name="category" required defaultValue={item.category} className="field">
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="renewal_date" className="field-label">Renewal date</label>
        <input id="renewal_date" name="renewal_date" type="date" required defaultValue={item.renewal_date} className="field" />
      </div>

      <div>
        <label htmlFor="reminder_type" className="field-label">Reminder type</label>
        <select
          id="reminder_type"
          name="reminder_type"
          value={reminderType}
          onChange={(e) => setReminderType(e.target.value)}
          className="field"
        >
          <option value="expiry">Expiry — invalid after this date</option>
          <option value="renewal">Renewal — auto-renews on this date</option>
        </select>
      </div>

      <div>
        <label htmlFor="importance" className="field-label">Importance</label>
        <select id="importance" name="importance" defaultValue={item.importance ?? ''} className="field">
          <option value="">Use category default</option>
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
        </select>
      </div>

      <div>
        <label htmlFor="lead_days" className="field-label">Custom lead times (days before, comma-separated)</label>
        <input
          id="lead_days"
          name="lead_days"
          type="text"
          placeholder="e.g. 30, 7, 1"
          defaultValue={item.lead_days ? item.lead_days.join(', ') : ''}
          className="field"
        />
      </div>

      {isRenewalType && (
        <div>
          <label htmlFor="recurrence" className="field-label">Recurrence</label>
          <select id="recurrence" name="recurrence" defaultValue={item.recurrence ?? 'none'} className="field">
            <option value="none">None — I'll mark it renewed manually</option>
            <option value="monthly">Monthly — auto-advance the date when overdue</option>
            <option value="annual">Annual — auto-advance the date when overdue</option>
          </select>
          <p className="text-xs text-text-muted mt-1">Only applies to renewal-type items — expired documents can't auto-renew.</p>
        </div>
      )}

      <button type="submit" className="btn btn-primary w-full justify-center">Save changes</button>
    </form>
  )
}