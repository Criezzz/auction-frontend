import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register } from '../features/auth/register'

export default function SignUpPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await register(form)
      nav('/signin', { replace: true })
    } catch (e) {
      setError(e.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto bento-card p-6">
      <h1 className="font-display text-2xl mb-4">Create account</h1>
      <form className="space-y-3" onSubmit={onSubmit}>
        <label className="block">
          <span className="text-sm">Username</span>
          <input className="mt-1 w-full rounded-xl border border-black/15 px-3 py-2" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        </label>
        <label className="block">
          <span className="text-sm">Email</span>
          <input type="email" className="mt-1 w-full rounded-xl border border-black/15 px-3 py-2" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label className="block">
          <span className="text-sm">Password</span>
          <input type="password" className="mt-1 w-full rounded-xl border border-black/15 px-3 py-2" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </label>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn-primary w-full" disabled={loading}>{loading ? 'Creating…' : 'Sign up'}</button>
      </form>
    </div>
  )
}

