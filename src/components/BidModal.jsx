import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Modal from './Modal'
import { useAuth } from '../features/auth/AuthProvider'
import { createBid, getBiddingStatus } from '../features/auctions/api'
import { getParticipationStatus } from '../features/user/api'

export default function BidModal({ open, onClose, auction }) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [depositStatus, setDepositStatus] = useState('unknown') // unknown, not_registered, registered, paid
  const { user } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()

  if (!auction) return null

  // Check deposit status when modal opens
  useEffect(() => {
    if (open && user && auction) {
      checkDepositStatus()
    }
  }, [open, user, auction])

  async function checkDepositStatus() {
    try {
      const participationStatus = await getParticipationStatus(auction.id)
      
      if (participationStatus.is_registered) {
        // Check if user has completed deposit payment
        // This would typically involve checking user's payment records
        // For now, we'll assume registration means deposit is paid
        setDepositStatus('paid')
      } else {
        setDepositStatus('not_registered')
      }
    } catch (error) {
      console.error('Error checking deposit status:', error)
      setDepositStatus('unknown')
    }
  }

  async function submit() {
    setError('')
    
    if (!user) {
      nav('/signin', { state: { from: loc } })
      return
    }

    // Check if user has completed deposit payment
    if (depositStatus !== 'paid') {
      setError('Bạn phải đăng ký và thanh toán đặt cọc trước khi đấu giá. Vui lòng nhấn "Đăng ký tham gia" trước.')
      return
    }

    const amt = Number(amount)
    if (!Number.isFinite(amt) || amt <= 0) {
      setError('Nhập số tiền hợp lệ')
      return
    }

    try {
      setLoading(true)
      
      // Place the actual bid
      await createBid(auction.id, { bid_price: Number(amount) })
      
      // Success - close modal and return success
      onClose?.(true)
    } catch (e) {
      console.error('Bid placement error:', e)
      
      // Handle specific API v2.1 error for missing deposit
      if (e.message.includes('You must register and pay the deposit')) {
        setError('Bạn phải đăng ký và thanh toán đặt cọc trước khi đấu giá. Vui lòng nhấn "Đăng ký tham gia" trước.')
        setDepositStatus('not_registered')
      } else if (e.message.includes('fetch') || e.message.includes('Failed to fetch')) {
        setError('Mất kết nối tới máy chủ khi đặt giá. Vui lòng thử lại.')
      } else if (e.message.includes('401')) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
      } else if (e.message.includes('403')) {
        setError('Bạn không có quyền đặt giá trong phiên này.')
      } else if (e.message.includes('409')) {
        setError('Giá đã được cập nhật. Vui lòng nhập giá cao hơn.')
      } else if (e.message.includes('400')) {
        setError('Số tiền đặt giá không hợp lệ hoặc thấp hơn giá hiện tại.')
      } else {
        setError(e.message || 'Lỗi khi đặt giá. Vui lòng thử lại.')
      }
    } finally {
      setLoading(false)
    }
  }

  const renderDepositStatus = () => {
    if (!user) {
      return (
        <div className="mt-3 text-xs text-red-600">
          Bạn cần đăng nhập để đấu giá.
        </div>
      )
    }

    switch (depositStatus) {
      case 'unknown':
        return (
          <div className="mt-3 text-xs text-gray-600">
            Đang kiểm tra trạng thái đăng ký...
          </div>
        )
      case 'not_registered':
        return (
          <div className="mt-3 text-xs text-red-600">
            ⚠️ Bạn cần đăng ký và thanh toán đặt cọc trước khi đấu giá. Vui lòng nhấn "Đăng ký tham gia" trước.
          </div>
        )
      case 'registered':
        return (
          <div className="mt-3 text-xs text-yellow-600">
            ⏳ Bạn đã đăng ký tham gia nhưng chưa hoàn thành thanh toán đặt cọc.
          </div>
        )
      case 'paid':
        return (
          <div className="mt-3 text-xs text-green-600">
            ✅ Bạn đã hoàn thành đặt cọc và có thể đấu giá.
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Modal open={open} onClose={() => onClose?.(false)}>
      <h2 className="font-display text-xl">Đặt giá</h2>
      <p className="text-sm text-black/60 mt-1">{auction.title}</p>
      
      <div className="mt-4">
        <label className="block text-sm">Số tiền (VND)</label>
        <input
          inputMode="numeric"
          className="mt-1 w-full rounded-xl border border-black/15 px-3 py-2"
          placeholder="e.g. 100000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={depositStatus !== 'paid' && depositStatus !== 'unknown'}
        />
      </div>
      
      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
      
      {renderDepositStatus()}
      
      <div className="mt-4 flex gap-2 justify-end">
        <button 
          className="rounded-xl border px-3 py-2" 
          onClick={() => onClose?.(false)} 
          disabled={loading}
        >
          Hủy
        </button>
        <button 
          className="btn-primary" 
          onClick={submit} 
          disabled={loading || depositStatus !== 'paid'}
        >
          {loading ? 'Đang xử lý...' : 'Đặt giá'}
        </button>
      </div>

      <div className="mt-2 text-xs text-black/50">
        Lưu ý: Bạn cần hoàn thành đặt cọc trước khi có thể đấu giá.
      </div>
    </Modal>
  )
}
