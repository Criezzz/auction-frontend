import { useState, useEffect } from 'react'
import { useAuth } from '../features/auth/AuthProvider'
import { Trophy } from '../components/icons'
import { Link } from 'react-router-dom'
import TermsOfServiceModal from '../components/TermsOfServiceModal'

export default function WonAuctionsPage() {
  const { user } = useAuth()
  const [wonAuctions, setWonAuctions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showTerms, setShowTerms] = useState(false)
  const [selectedAuction, setSelectedAuction] = useState(null)
  const [paymentLoading, setPaymentLoading] = useState(false)

  useEffect(() => {
    if (!user) return

    const fetchWonAuctions = async () => {
      try {
        setLoading(true)
        setError('')
        
        // TODO: Connect to API endpoint for won auctions
        // According to API v2.1, this should use:
        // GET /participation/my-registrations or similar endpoint
        // with filter for won auctions
        
        // Mock data for now - update to use real API later
        const mockWonAuctions = [
          {
            id: 1,
            auction_name: 'Premium Figure Auction',
            product_name: 'Limited Edition Naruto Figure',
            final_price: 150000,
            payment_status: 'pending', // pending, completed, failed
            payment_type: 'final_payment',
            shipping_status: 'pending',
            created_at: '2024-01-15T10:00:00',
            winner_id: user.id,
            payment_id: null // Will be created when user initiates payment
          },
          {
            id: 2,
            auction_name: 'Anime Collection Sale',
            product_name: 'One Piece Collectibles Set',
            final_price: 85000,
            payment_status: 'completed',
            payment_type: 'final_payment',
            shipping_status: 'shipped',
            created_at: '2024-01-10T14:00:00',
            winner_id: user.id,
            payment_id: 456
          }
        ]
        
        setWonAuctions(mockWonAuctions)
      } catch (err) {
        console.error('Error fetching won auctions:', err)
        if (err.message.includes('fetch') || err.message.includes('Failed to fetch')) {
          setError('Mất kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.')
        } else {
          setError('Lỗi khi tải danh sách phiên đấu giá đã thắng.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchWonAuctions()
  }, [user])

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { text: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-800' },
      processing: { text: 'Đang xử lý', color: 'bg-blue-100 text-blue-800' },
      completed: { text: 'Đã thanh toán', color: 'bg-green-100 text-green-800' },
      failed: { text: 'Thất bại', color: 'bg-red-100 text-red-800' },
      cancelled: { text: 'Đã hủy', color: 'bg-gray-100 text-gray-800' }
    }

    const config = statusConfig[status] || { text: status, color: 'bg-gray-100 text-gray-800' }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    )
  }

  const getShippingStatusBadge = (status) => {
    const statusConfig = {
      pending: { text: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' },
      processing: { text: 'Đang chuẩn bị', color: 'bg-blue-100 text-blue-800' },
      shipped: { text: 'Đã giao', color: 'bg-green-100 text-green-800' },
      delivered: { text: 'Đã nhận', color: 'bg-purple-100 text-purple-800' },
      cancelled: { text: 'Đã hủy', color: 'bg-red-100 text-red-800' }
    }

    const config = statusConfig[status] || { text: status, color: 'bg-gray-100 text-gray-800' }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    )
  }

  const handlePaymentClick = (auction) => {
    setSelectedAuction(auction)
    setShowTerms(true)
  }

  const handleTermsAccepted = () => {
    setShowTerms(false)
    // Navigate to payment checkout page with auction details
    window.location.href = `/payment-checkout/${selectedAuction.id}`
  }

  const handlePaymentComplete = async (paymentData) => {
    try {
      setPaymentLoading(true)
      setError('')
      
      // Update the auction status locally after successful payment
      setWonAuctions(prev => prev.map(auction => 
        auction.id === selectedAuction.id 
          ? { ...auction, payment_status: 'completed' }
          : auction
      ))
      
      setSelectedAuction(null)
    } catch (err) {
      console.error('Payment completion error:', err)
      if (err.message.includes('fetch') || err.message.includes('Failed to fetch')) {
        setError('Mất kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.')
      } else {
        setError(err.message || 'Lỗi khi hoàn tất thanh toán.')
      }
    } finally {
      setPaymentLoading(false)
    }
  }

  if (!user) {
    return <div className="bento-card p-6">Vui lòng đăng nhập để xem phiên đấu giá đã thắng.</div>
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bento-card h-64 animate-pulse bg-white/60" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bento-card p-6">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center gap-2">
            <Trophy className="w-12 h-12 lg:w-16 lg:h-16" />
            <h1 className="font-display text-3xl">Phiên đấu giá đã thắng</h1>
          </div>
          <div className="text-sm text-gray-600">
            {wonAuctions.length} phiên đấu giá đã thắng
          </div>
        </div>

        {wonAuctions.length === 0 ? (
          <div className="bento-card p-8 text-center">
            <div className="text-gray-500 mb-4">🏆</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có phiên đấu giá nào được thắng</h3>
            <p className="text-gray-600 mb-4">Bắt đầu đấu giá để giành được sản phẩm!</p>
            <Link to="/" className="btn-primary">
              Xem các phiên đấu giá
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wonAuctions.map((auction) => (
              <div key={auction.id} className="bento-card overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg line-clamp-2">{auction.product_name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{auction.auction_name}</p>
                    </div>
                    <div className="ml-3">
                      {getStatusBadge(auction.payment_status)}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Giá cuối:</span>
                      <span className="font-medium">{auction.final_price.toLocaleString()} VND</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trạng thái thanh toán:</span>
                      <span className="font-medium">{getStatusBadge(auction.payment_status)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vận chuyển:</span>
                      <span className="font-medium">{getShippingStatusBadge(auction.shipping_status)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Thắng vào:</span>
                      <span className="font-medium">
                        {new Date(auction.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex gap-2">
                      <Link 
                        to={`/auction/${auction.id}/status`}
                        className="flex-1 btn-primary text-center"
                      >
                        Xem chi tiết
                      </Link>
                      
                      {auction.payment_status === 'pending' && (
                        <button 
                          onClick={() => handlePaymentClick(auction)}
                          className="flex-1 rounded-xl border px-3 py-2 text-center hover:bg-gray-50"
                          disabled={paymentLoading}
                        >
                          {paymentLoading ? 'Đang xử lý...' : 'Thanh toán ngay'}
                        </button>
                      )}
                      
                      {auction.payment_status === 'completed' && (
                        <div className="flex-1 rounded-xl bg-green-50 border border-green-200 px-3 py-2 text-center text-green-700 text-sm">
                          ✅ Đã thanh toán
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Terms of Service Modal for Final Payment */}
      <TermsOfServiceModal
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
        onAccept={handleTermsAccepted}
      />
    </>
  )
}