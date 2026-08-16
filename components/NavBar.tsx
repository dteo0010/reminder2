import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/lib/actions/auth'
import { getNotificationHistory } from '@/lib/data/notifications'
import { NotificationHistoryPanel } from './NotificationHistoryPanel'

export async function NavBar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const history = await getNotificationHistory()

  return (
    <header className="border-b border-line">
      <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-display text-sm tracking-widest text-accent">REMINDER</span>
          <nav className="flex items-center gap-5 text-sm">
            <Link href="/" className="text-text-muted hover:text-text transition-colors">Coming up</Link>
            <Link href="/items" className="text-text-muted hover:text-text transition-colors">All items</Link>
            <Link href="/items/new" className="text-text-muted hover:text-text transition-colors">+ Add</Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <NotificationHistoryPanel history={history} />
          <form action={logout}>
            <button type="submit" className="btn">Log out</button>
          </form>
        </div>
      </div>
    </header>
  )
}