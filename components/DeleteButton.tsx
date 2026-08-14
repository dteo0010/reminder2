'use client'

import { deleteItem } from '@/lib/actions/items'

export function DeleteButton({ itemId }: { itemId: string }) {
  return (
    <form
      action={() => deleteItem(itemId)}
      onSubmit={(e) => {
        if (!confirm('Delete this item permanently?')) e.preventDefault()
      }}
    >
      <button type="submit" className="btn btn-danger">Delete item</button>
    </form>
  )
}