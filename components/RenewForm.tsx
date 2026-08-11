'use client'

import { useState } from 'react'
import { markAsRenewed } from '@/lib/actions/items'

export function RenewForm({ itemId, currentDate }: { itemId: string; currentDate: string }) {
  const [date, setDate] = useState(currentDate)

  return (
    <form action={() => markAsRenewed(itemId, date)}>
      <label htmlFor="new_date">Mark as renewed — new date:</label>
      <input
        id="new_date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />
      <button type="submit">Confirm renewal</button>
    </form>
  )
}