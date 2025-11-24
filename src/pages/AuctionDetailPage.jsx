import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchAuction } from '../features/auctions/api'
import { registerForAuction, getParticipationStatus } from '../features/user/api'
import BidModal from '../components/BidModal'
import { DollarSign, Target } from '../components/icons'
import { useAuctionRealTime } from '../hooks/useAuctionRealTime'
import TermsOfServiceModal from '../components/TermsOfServiceModal'
import DepositPaymentModal from '../components/DepositPaymentModal'

export default function AuctionDetailPage() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Real-time updates
  const { data: realTimeData, bids: realTimeBids, isConnected, error: realTimeError } = useAuctionRealTime(id)

  // Registration state
  const [registrationStatus, setRegistrationStatus] = useState('unknown') // unknown, not_registered, registered, payment_pending, completed
  const [openBid, setOpenBid] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [showDeposit, setShowDeposit] = useState(false)
  const [depositAmount, setDepositAmount] = useState(0)
  const [registrationMessage, setRegistrationMessage] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const item = await fetchAuction(id, { signal: controller.signal })
        setData(item)
      } catch (e) {
        console.error('Error fetching auction:', e)
        if (e.name === 'AbortError') {
          // Request was cancelled, don't show error
          return
        }
        if (e.message.includes('fetch') || e.message.includes('Failed to fetch')) {
          setError('Mất kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.')
        } else if (e.message.includes('404')) {
          setError('Phiên đấu giá không tồn tại.')
        } else if (e.message.includes('401')) {
          setError('Bạn cần đăng nhập để xem phiên đấu giá này.')
        } else if (e.message.includes('403')) {
          setError('Bạn không có quyền xem phiên đấu giá này.')
        } else if (e.message.includes('500')) {
          setError('Lỗi máy chủ. Vui lòng thử lại sau.')
        } else {
          setError('Lỗi khi tải thông tin phiên đấu giá.')
        }
      } finally {
        setLoading(false)
      }
    })()
    return () => controller.abort()
  }, [id])

  // Update data when real-time data is available
  useEffect(() => {
    if (realTimeData) {
      setData(prevData => ({
        ...prevData,
        ...realTimeData,
        bids: realTimeBids
      }))
    }
  }, [realTimeData, realTimeBids])

  // Check registration status when component loads
  useEffect(() => {
    if (data && id) {
      checkRegistrationStatus()
    }
  }, [data, id])

  async function checkRegistrationStatus() {
    try {
      const participationStatus = await getParticipationStatus(id)
      
      if (participationStatus.is_registered) {
        // User is registered, check if deposit is paid
        // For now, we'll assume registration means deposit is paid in API v2.1
        // In real implementation, we'd check payment status
        setRegistrationStatus('completed')
      } else {
        setRegistrationStatus('not_registered')
      }
    } catch (error) {
      console.error('Error checking registration status:', error)
      setRegistrationStatus('unknown')
    }
  }

  async function handleRegistration() {
    try {
      setRegistrationMessage('')
      setRegistrationStatus('registered')
      
      // Register for auction (this creates deposit payment automatically in API v2.1)
      await registerForAuction(id)
      
      // Set deposit amount based on auction price step
      const deposit = Math.floor((data.current_price || data.starting_price || 100000) * 0.1)
      setDepositAmount(deposit)
      
      // Show terms of service
      setShowTerms(true)
      
    } catch (error) {
      console.error('Registration error:', error)
      setRegistrationStatus('not_registered')
      
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        setRegistrationMessage('Mất kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.')
      } else if (error.message.includes('401')) {
        setRegistrationMessage('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
      } else if (error.message.includes('409')) {
        setRegistrationMessage('Bạn đã đăng ký tham gia phiên đấu giá này rồi.')
        setRegistrationStatus('completed')
      } else if (error.message.includes('500')) {
        setRegistrationMessage('Lỗi máy chủ khi đăng ký. Vui lòng liên hệ hỗ trợ.')
      } else {
        setRegistrationMessage(`Lỗi đăng ký tham gia: ${error.message}`)
      }
    }
  }

  async function handleTermsAccepted() {
    // User accepted terms, now show deposit payment modal
    setShowTerms(false)
    setShowDeposit(true)
  }

  async function handleDepositComplete(depositData) {
    // Deposit payment completed successfully
    setShowDeposit(false)
    setRegistrationStatus('completed')
    setRegistrationMessage(`Đã đăng ký tham gia thành công! Bạn có thể đấu giá ngay.`)
  }

  const renderRegistrationButton = () => {
    switch (registrationStatus) {
      case 'unknown':
        return (
          <button
            className="rounded-xl border px-3 py-2 flex flex-col items-center gap-1 px-4 py-3 opacity-50"
            disabled
          >
            <Target className="w-8 h-8" />
            <span>Đang kiểm tra...</span>
          </button>
        )
      case 'not_registered':
        return (
          <button
            className="rounded-xl border px-3 py-2 flex flex-col items-center gap-1 px-4 py-3 hover:bg-gray-50"
            onClick={handleRegistration}
          >
            <Target className="w-8 h-8" />
            <span>Đăng ký tham gia</span>
          </button>
        )
      case 'registered':
        return (
          <button
            className="rounded-xl border px-3 py-2 flex flex-col items-center gap-1 px-4 py-3 bg-yellow-50 border-yellow-300"
            onClick={() => setShowDeposit(true)}
          >
            <Target className="w-8 h-8" />
            <span>Thanh toán đặt cọc</span>
          </button>
        )
      case 'completed':
        return (
          <div className="rounded-xl border px-3 py-2 flex flex-col items-center gap-1 px-4 py-3 bg-green-50 border-green-300 text-green-700">
            <Target className="w-8 h-8" />
            <span>Đã đăng ký & đặt cọc</span>
            <span className="text-xs">Có thể đấu giá</span>
          </div>
        )
      default:
        return null
    }
  }

  if (loading) return <div className="bento-card p-6">Loading…</div>
  if (error) return <div className="bento-card p-6">Failed to load.</div>
  if (!data) return <div className="bento-card p-6">Not found.</div>

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bento-card overflow-hidden">
        <img src={data.image_url} alt={data.title} className="w-full object-cover" />
      </div>
      <div className="bento-card p-6 flex flex-col gap-4">
        <h1 className="font-display text-3xl tracking-tight">{data.title}</h1>
        <p className="text-black/70">{data.description || 'No description.'}</p>
        <div className="price-chip w-fit">${data.current_price ?? '—'}</div>
        
        {/* Real-time connection status */}
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-gray-600">
            {isConnected ? 'Cập nhật trực tiếp đang kết nối' : 'Cập nhật trực tiếp bị ngắt'}
          </span>
        </div>

        <div className="flex gap-2">
          <button 
            className="btn-primary flex flex-col items-center gap-1 px-4 py-3"
            onClick={() => setOpenBid(true)}
          >
            <DollarSign className="w-8 h-8" />
            <span>Đặt giá</span>
          </button>
          {renderRegistrationButton()}
        </div>
        
        {registrationMessage && (
          <div className="text-sm text-green-700">{registrationMessage}</div>
        )}

        {/* Terms of Service Modal */}
        <TermsOfServiceModal 
          isOpen={showTerms}
          onClose={() => setShowTerms(false)}
          onAccept={handleTermsAccepted}
        />

        {/* Deposit Payment Modal */}
        <DepositPaymentModal
          open={showDeposit}
          onClose={() => setShowDeposit(false)}
          auctionId={id}
          amount={depositAmount}
          onSuccess={handleDepositComplete}
        />

        {data.status === 'FINISHED' && (
          <div className="mt-2 rounded-xl border border-black/15 bg-white/60 p-3">
            <div className="text-sm">Phiên đã kết thúc. Theo dõi tiến độ thanh toán:</div>
            <Link to={`/payment/${id}`} className="btn-primary mt-2 inline-block">Xem trạng thái thanh toán</Link>
          </div>
        )}
      </div>
      <BidModal open={openBid} onClose={() => setOpenBid(false)} auction={data} />
    </div>
  )
}
