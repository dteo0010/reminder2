import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/lib/actions/auth'

export async function NavBar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null // hide nav entirely on /login

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #333' }}>
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <Link href="/">Coming up</Link>
        <Link href="/items">All items</Link>
        <Link href="/items/new">+ Add item</Link>
      </div>
      <form action={logout}>
        <button type="submit">Log out</button>
      </form>
    </nav>
  )
}