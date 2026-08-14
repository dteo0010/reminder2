'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
      else setMessage('Check your email to confirm your account.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else {
        router.push('/')
        router.refresh()
      }
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <p className="eyebrow mb-1 text-center">Renewals</p>
        <h1 className="text-2xl text-text mb-8 text-center">{isSignUp ? 'Create an account' : 'Log in'}</h1>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="field-label">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="field" />
            </div>
            <div>
              <label htmlFor="password" className="field-label">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="field" />
            </div>
            <button type="submit" className="btn btn-primary w-full justify-center">
              {isSignUp ? 'Sign up' : 'Log in'}
            </button>
          </form>
          {message && <p className="text-xs text-text-muted mt-4">{message}</p>}
        </div>

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-xs text-text-muted hover:text-accent transition-colors font-display mt-4 w-full text-center"
        >
          {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  )
}