'use client'

import { useState } from 'react'
import { formatStageLabel } from '@/lib/utils/notifications'

type HistoryEntry = {
  id: string
  stage: number
  sent_at: string
  items: { name: string; category: string }[] | null
}

export function NotificationHistoryPanel({ history }: { history: HistoryEntry[] }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn" aria-label="Open notification history">
        History
      </button>

      <div
        className={`fixed inset-0 z-50 bg-black/60 transition-opacity duration-200 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
      />

      <aside
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-surface border-l border-line flex flex-col transition-transform duration-200 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <span className="eyebrow">Notification history</span>
          <button onClick={() => setOpen(false)} className="text-text-muted hover:text-text text-lg leading-none" aria-label="Close">×</button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {history.length === 0 ? (
            <p className="text-sm text-text-muted">No reminders sent yet.</p>
          ) : (
            history.map((h) => (
              <div key={h.id} className="border-b border-line pb-3 last:border-0">
                <p className="text-sm text-text">{h.items?.[0]?.name ?? 'Item'}</p>
                <p className="text-xs text-text-muted mt-0.5 font-display">
                  {h.items?.[0]?.category ?? ''} · {formatStageLabel(h.stage)} · {new Date(h.sent_at).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  )
}