import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Modal from './Modal'
import { useAuth } from '../features/auth/AuthProvider'
import { createBid } from '../features/auctions/api'

export default function BidModal({ open, onClose, auction }) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()

  if (!auction) return null

  async function submit() {
    setError('')
    if (!user) {
      nav('/signin', { state: { from: loc } })
      return
    }
    const amt = Number(amount)
    if (!Number.isFinite(amt) || amt <= 0) {
      setError('Enter a valid amount')
      return
    }
    try {
      setLoading(true)
      await createBid(auction.id, { amount: amt })
      onClose?.(true)
    } catch (e) {
      setError(e.message || 'Failed to place bid')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={() => onClose?.(false)}>
      <h2 className="font-display text-xl">Place a bid</h2>
      <p className="text-sm text-black/60 mt-1">{auction.title}</p>
      <div className="mt-4">
        <label className="block text-sm">Amount</label>
        <input
          inputMode="numeric"
          className="mt-1 w-full rounded-xl border border-black/15 px-3 py-2"
          placeholder="e.g. 100"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
      <div className="mt-4 flex gap-2 justify-end">
        <button className="rounded-xl border px-3 py-2" onClick={() => onClose?.(false)} disabled={loading}>Cancel</button>
        <button className="btn-primary" onClick={submit} disabled={loading}>{loading ? 'Submitting…' : 'Place bid'}</button>
      </div>
      {!user && (
        <div className="mt-3 text-xs text-black/60">You must sign in to bid.</div>
      )}
    </Modal>
  )
}

