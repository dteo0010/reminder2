'use client'

import { useState } from 'react'
import { markAsRenewed } from '@/lib/actions/items'

export function RenewForm({ itemId, currentDate }: { itemId: string; currentDate: string }) {
  const [date, setDate] = useState(currentDate)

  return (
    <form action={() => markAsRenewed(itemId, date)} className="flex items-end gap-3 flex-wrap">
      <div className="flex-1 min-w-[160px]">
        <label htmlFor="new_date" className="field-label">New date</label>
        <input
          id="new_date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="field"
        />
      </div>
      <button type="submit" className="btn btn-primary">Confirm renewal</button>
    </form>
  )
}