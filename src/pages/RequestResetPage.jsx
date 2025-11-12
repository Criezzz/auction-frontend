import { useState } from 'react'
import { requestPasswordReset } from '../features/auth/password'

export default function RequestResetPage() {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    try {
      await requestPasswordReset({ email })
      setMsg('If an account exists, reset instructions were sent (mock).')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto bento-card p-6">
      <h1 className="font-display text-2xl mb-4">Reset your password</h1>
      <form className="space-y-3" onSubmit={onSubmit}>
        <label className="block">
          <span className="text-sm">Email</span>
          <input type="email" className="mt-1 w-full rounded-xl border border-black/15 px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <button className="btn-primary w-full" disabled={loading}>{loading ? 'Sending…' : 'Send reset email'}</button>
      </form>
      {msg && <div className="text-sm text-black/60 mt-3">{msg}</div>}
    </div>
  )
}

