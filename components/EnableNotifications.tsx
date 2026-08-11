'use client'

import { useState } from 'react'
import { subscribeToPush } from '@/lib/notifications/subscribe'

export function EnableNotifications() {
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    const result = await subscribeToPush()
    setStatus(result.message)
    setLoading(false)
  }

  return (
    <div>
      <button onClick={handleClick} disabled={loading}>
        {loading ? 'Enabling...' : 'Enable notifications'}
      </button>
      {status && <p>{status}</p>}
    </div>
  )
}