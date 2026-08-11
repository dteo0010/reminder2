'use client'

import { useState } from 'react'
import { addItem } from '@/lib/actions/items'

const CATEGORIES = [
  { value: 'passport', label: 'Passport' },
  { value: 'licence', label: 'Licence' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'road_tax', label: 'Road Tax' },
  { value: 'subscription', label: 'Subscription' },
]

export function AddItemForm() {
  const [showAdvanced, setShowAdvanced] = useState(false)

  return (
    <form action={addItem}>
      <div>
        <label htmlFor="name">Name</label>
        <input id="name" name="name" type="text" required placeholder="e.g. Car insurance" />
      </div>

      <div>
        <label htmlFor="category">Category</label>
        <select id="category" name="category" required defaultValue="">
          <option value="" disabled>Select a category</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="renewal_date">Renewal date</label>
        <input id="renewal_date" name="renewal_date" type="date" required />
      </div>

      <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}>
        {showAdvanced ? 'Hide advanced options' : 'Customize (optional)'}
      </button>

      {showAdvanced && (
        <div>
          <div>
            <label htmlFor="reminder_type">Reminder type</label>
            <select id="reminder_type" name="reminder_type" defaultValue="">
              <option value="">Use category default</option>
              <option value="expiry">Expiry — invalid after this date</option>
              <option value="renewal">Renewal — auto-renews on this date</option>
            </select>
          </div>

          <div>
            <label htmlFor="importance">Importance</label>
            <select id="importance" name="importance" defaultValue="">
              <option value="">Use category default</option>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label htmlFor="lead_days">Custom lead times (days before, comma-separated)</label>
            <input id="lead_days" name="lead_days" type="text" placeholder="e.g. 30, 7, 1" />
          </div>

          <div>
            <label htmlFor="recurrence">Recurrence</label>
            <select id="recurrence" name="recurrence" defaultValue="none">
              <option value="none">None</option>
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
            </select>
          </div>
        </div>
      )}

      <button type="submit">Add item</button>
    </form>
  )
}