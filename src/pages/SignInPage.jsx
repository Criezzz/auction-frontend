import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthProvider'

export default function SignInPage() {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signIn({ username, password })
      const to = loc.state?.from?.pathname || '/'
      nav(to, { replace: true })
    } catch (e) {
      setError(e.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto bento-card p-6">
      <h1 className="font-display text-2xl mb-4">Sign in</h1>
      <form className="space-y-3" onSubmit={onSubmit}>
        <label className="block">
          <span className="text-sm">Username</span>
          <input className="mt-1 w-full rounded-xl border border-black/15 px-3 py-2" value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm">Password</span>
          <input type="password" className="mt-1 w-full rounded-xl border border-black/15 px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn-primary w-full" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <p className="text-xs text-black/50 mt-3">Mock users: admin/admin, user/user</p>
      <div className="mt-4 text-sm">
        <a className="underline" href="/signup">Create account</a>
        <span className="mx-2">·</span>
        <a className="underline" href="/reset">Forgot password?</a>
      </div>
    </div>
  )
}
