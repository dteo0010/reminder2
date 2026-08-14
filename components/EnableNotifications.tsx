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
    <div className="flex items-center gap-3">
      <button onClick={handleClick} disabled={loading} className="btn">
        {loading ? 'Enabling…' : 'Enable push notifications'}
      </button>
      {status && <p className="text-xs text-text-muted">{status}</p>}
    </div>
  )
}