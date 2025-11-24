import { useState, useEffect, useRef } from 'react'
import { CreditCard } from './icons'
import QRCode from 'qrcode'
import { checkPaymentTokenStatus, completePaymentWithQR } from '../features/user/api'

export default function DepositPaymentModal({ 
  open, 
  onClose, 
  auctionId, 
  amount,
  onSuccess 
}) {
  const [loading, setLoading] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('')
  const [rawQrCode, setRawQrCode] = useState('')
  const [token, setToken] = useState('')
  const [bankInfo, setBankInfo] = useState(null)
  const [status, setStatus] = useState('pending') // pending, completed, failed
  const [error, setError] = useState('')
  const [depositData, setDepositData] = useState(null)
  const [timeRemaining, setTimeRemaining] = useState(300) // 5 minutes = 300 seconds
  const qrCodeRef = useRef(null)
  const pollingIntervalRef = useRef(null)
  const countdownIntervalRef = useRef(null)

  useEffect(() => {
    if (open && auctionId) {
      createDepositPayment()
    }
  }, [open, auctionId])

  const createDepositPayment = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Register for participation (this creates deposit payment automatically)
      const token = localStorage.getItem('auth.tokens.v1') 
        ? JSON.parse(localStorage.getItem('auth.tokens.v1')).access_token 
        : null

      if (!token) {
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
      }

      // Call POST /participation/register (this creates the deposit payment)
      const response = await fetch(`http://localhost:8000/participation/register`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ auction_id: parseInt(auctionId) })
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
        } else if (response.status === 403) {
          throw new Error('Bạn không có quyền đăng ký tham gia phiên đấu giá này.')
        } else if (response.status === 404) {
          throw new Error('Phiên đấu giá không tồn tại hoặc đã kết thúc.')
        } else if (response.status === 409) {
          throw new Error('Bạn đã đăng ký tham gia phiên đấu giá này rồi.')
        } else if (response.status >= 500) {
          throw new Error('Lỗi máy chủ. Vui lòng thử lại sau.')
        } else {
          throw new Error('Không thể tạo đặt cọc. Vui lòng thử lại.')
        }
      }

      const data = await response.json()
      
      // Response should contain payment info with QR token
      // Note: According to API v2.1, backend creates deposit payment automatically
      // and sends email with QR code. We need to get the QR token somehow.
      
      // For now, let's simulate getting a QR token from the response
      // In real implementation, backend should return payment details with token
      const mockToken = 'mock_deposit_token_' + Date.now()
      const mockQRCode = `MB://QR?data=${mockToken}&amount=${amount}&desc=Deposit for auction ${auctionId}`
      
      setToken(mockToken)
      setRawQrCode(mockQRCode)
      setBankInfo({ bank_name: 'MockBank VietNam', bank_code: 'MB' })
      setStatus('pending')
      setTimeRemaining(300) // 5 minutes
      
      // Generate QR code image
      if (mockQRCode) {
        try {
          const qrDataUrl = await QRCode.toDataURL(mockQRCode, {
            width: 200,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          })
          setQrCodeDataUrl(qrDataUrl)
        } catch (qrError) {
          console.error('Error generating QR code:', qrError)
          // Don't fail the whole process if QR generation fails
        }
      }
      
      // Start countdown timer
      startCountdown()
      
      // Start polling for payment status using token
      startPollingForPaymentStatus(mockToken)
      
    } catch (err) {
      console.error('Error creating deposit payment:', err)
      if (err.message.includes('fetch') || err.message.includes('Failed to fetch')) {
        setError('Mất kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.')
      } else {
        setError(err.message || 'Không thể tạo đặt cọc. Vui lòng thử lại.')
      }
    } finally {
      setLoading(false)
    }
  }

  const startCountdown = () => {
    countdownIntervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current)
          setStatus('failed')
          setError('Mã QR đã hết hạn. Vui lòng tạo lại.')
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const startPollingForPaymentStatus = async (qrToken) => {
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const tokenStatus = await checkPaymentTokenStatus(qrToken)
        
        if (tokenStatus.valid) {
          if (tokenStatus.expires_at) {
            const expiresAt = new Date(tokenStatus.expires_at)
            const now = new Date()
            const remainingMs = expiresAt.getTime() - now.getTime()
            setTimeRemaining(Math.floor(remainingMs / 1000))
          }
          
          // If we can get payment info, we could check status here
          // For now, we'll simulate completion after some time
        } else {
          // Token expired or invalid
          clearInterval(pollingIntervalRef.current)
          clearInterval(countdownIntervalRef.current)
          setStatus('failed')
          setError(tokenStatus.error || 'Mã QR không hợp lệ hoặc đã hết hạn.')
        }
      } catch (error) {
        console.error('Error polling payment status:', error)
        // For network errors, continue polling
        if (!error.message.includes('fetch')) {
          setError('Lỗi kết nối khi kiểm tra trạng thái thanh toán.')
        }
      }
    }, 5000) // Poll every 5 seconds
  }

  const simulatePaymentCompletion = async () => {
    try {
      // Simulate user completing payment via QR callback
      const result = await completePaymentWithQR(token)
      if (result.success) {
        clearInterval(pollingIntervalRef.current)
        clearInterval(countdownIntervalRef.current)
        setStatus('completed')
        onSuccess && onSuccess(depositData)
      } else {
        throw new Error(result.message || 'Payment failed')
      }
    } catch (error) {
      console.error('Error completing payment:', error)
      setError('Lỗi khi hoàn thành thanh toán.')
    }
  }

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
      }
    }
  }, [])

  const handleClose = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
    }
    setQrCodeDataUrl('')
    setRawQrCode('')
    setToken('')
    setBankInfo(null)
    setStatus('pending')
    setError('')
    setDepositData(null)
    setTimeRemaining(300)
    onClose()
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex-1 flex justify-center">
            <div className="flex flex-col items-center gap-2">
              <CreditCard className="w-12 h-12 lg:w-16 lg:h-16" />
              <h2 className="text-xl font-semibold">Thanh toán đặt cọc</h2>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Tạo đặt cọc...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {qrCodeDataUrl && !loading && (
            <div className="text-center">
              <div className="mb-4">
                <h3 className="font-semibold text-lg mb-2">Quét mã QR để thanh toán</h3>
                <p className="text-gray-600 text-sm">Số tiền đặt cọc: {amount?.toLocaleString()} VND</p>
                {timeRemaining > 0 && (
                  <p className="text-orange-600 text-sm font-medium">
                    Thời gian còn lại: {formatTime(timeRemaining)}
                  </p>
                )}
              </div>

              {/* QR Code Display */}
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <div className="w-48 h-48 bg-white rounded-lg mx-auto flex items-center justify-center border">
                  {status === 'pending' && qrCodeDataUrl ? (
                    <img 
                      src={qrCodeDataUrl} 
                      alt="QR Code" 
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextElementSibling.style.display = 'block'
                      }}
                    />
                  ) : null}
                  <div className="text-center" style={{ display: status === 'pending' && qrCodeDataUrl ? 'none' : 'block' }}>
                    {status === 'pending' ? (
                      <div>
                        <div className="w-16 h-16 bg-gray-300 rounded mb-2 mx-auto"></div>
                        <p className="text-xs text-gray-600">QR Code</p>
                        <p className="text-xs text-gray-500 mt-1 break-all">{rawQrCode.substring(0, 50)}...</p>
                      </div>
                    ) : (
                      <div>
                        <div className="text-green-500 text-4xl mb-2">✓</div>
                        <p className="text-green-600 font-semibold">Thanh toán thành công</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bank Info */}
              {bankInfo && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm font-medium text-blue-900">{bankInfo.bank_name}</p>
                  <p className="text-xs text-blue-700">Mã ngân hàng: {bankInfo.bank_code}</p>
                </div>
              )}

              {/* Instructions */}
              <div className="text-left text-sm text-gray-600 mb-6">
                <h4 className="font-semibold mb-2">Hướng dẫn:</h4>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Mở ứng dụng ngân hàng</li>
                  <li>Quét mã QR bên trên</li>
                  <li>Xác nhận số tiền thanh toán</li>
                  <li>Đợi xác nhận từ hệ thống</li>
                </ol>
              </div>

              {/* Status Messages */}
              {status === 'pending' && timeRemaining > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-yellow-800 text-sm">⏳ Đang chờ xác nhận thanh toán...</p>
                </div>
              )}

              {status === 'completed' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-green-800 text-sm">✅ Đặt cọc đã được thanh toán thành công! Bạn có thể đấu giá ngay.</p>
                </div>
              )}

              {status === 'failed' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-800 text-sm">❌ Thanh toán thất bại. Vui lòng thử lại.</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {status === 'completed' ? 'Tiếp tục' : 'Hủy'}
                </button>
                
                {status === 'failed' && (
                  <button
                    onClick={createDepositPayment}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Thử lại
                  </button>
                )}

                {/* Demo button to simulate payment completion */}
                {status === 'pending' && process.env.NODE_ENV === 'development' && (
                  <button
                    onClick={simulatePaymentCompletion}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    Demo: Hoàn thành
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}