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

const CATEGORY_REMINDER_TYPE: Record<string, 'expiry' | 'renewal'> = {
  passport: 'expiry',
  licence: 'expiry',
  insurance: 'expiry',
  road_tax: 'expiry',
  subscription: 'renewal',
}

export function AddItemForm() {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [category, setCategory] = useState('')
  const [reminderTypeOverride, setReminderTypeOverride] = useState('')

  const effectiveType = reminderTypeOverride || CATEGORY_REMINDER_TYPE[category] || 'expiry'
  const isRenewalType = effectiveType === 'renewal'

  return (
    <form action={addItem} className="space-y-5">
      <div>
        <label htmlFor="name" className="field-label">Name</label>
        <input id="name" name="name" type="text" required placeholder="e.g. Car insurance" className="field" />
      </div>

      <div>
        <label htmlFor="category" className="field-label">Category</label>
        <select
          id="category"
          name="category"
          required
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="field"
        >
          <option value="" disabled>Select a category</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="renewal_date" className="field-label">Renewal date</label>
        <input id="renewal_date" name="renewal_date" type="date" required className="field" />
      </div>

      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-xs text-text-muted hover:text-accent transition-colors font-display"
      >
        {showAdvanced ? '− Hide advanced options' : '+ Customize (optional)'}
      </button>

      {showAdvanced && (
        <div className="space-y-5 pt-5 border-t border-line">
          <div>
            <label htmlFor="reminder_type" className="field-label">Reminder type</label>
            <select
              id="reminder_type"
              name="reminder_type"
              value={reminderTypeOverride}
              onChange={(e) => setReminderTypeOverride(e.target.value)}
              className="field"
            >
              <option value="">Use category default</option>
              <option value="expiry">Expiry — invalid after this date</option>
              <option value="renewal">Renewal — auto-renews on this date</option>
            </select>
          </div>

          <div>
            <label htmlFor="importance" className="field-label">Importance</label>
            <select id="importance" name="importance" defaultValue="" className="field">
              <option value="">Use category default</option>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label htmlFor="lead_days" className="field-label">Custom lead times (days before, comma-separated)</label>
            <input id="lead_days" name="lead_days" type="text" placeholder="e.g. 30, 7, 1" className="field" />
          </div>

          {isRenewalType && (
            <div>
              <label htmlFor="recurrence" className="field-label">Recurrence</label>
              <select id="recurrence" name="recurrence" defaultValue="none" className="field">
                <option value="none">None — I'll mark it renewed manually</option>
                <option value="monthly">Monthly — auto-advance the date when overdue</option>
                <option value="annual">Annual — auto-advance the date when overdue</option>
              </select>
              <p className="text-xs text-text-muted mt-1">Only applies to renewal-type items — expired documents can't auto-renew.</p>
            </div>
          )}
        </div>
      )}

      <button type="submit" className="btn btn-primary w-full justify-center">Add item</button>
    </form>
  )
}