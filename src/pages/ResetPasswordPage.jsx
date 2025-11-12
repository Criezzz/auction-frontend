import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../features/auth/password'

export default function ResetPasswordPage() {
  const [search] = useSearchParams()
  const token = search.get('token') || ''
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const nav = useNavigate()

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await resetPassword({ token, password })
      nav('/signin', { replace: true })
    } catch (e) {
      setError(e.message || 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto bento-card p-6">
      <h1 className="font-display text-2xl mb-4">Set new password</h1>
      <form className="space-y-3" onSubmit={onSubmit}>
        <label className="block">
          <span className="text-sm">New password</span>
          <input type="password" className="mt-1 w-full rounded-xl border border-black/15 px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn-primary w-full" disabled={loading}>{loading ? 'Saving…' : 'Update password'}</button>
      </form>
    </div>
  )
}

