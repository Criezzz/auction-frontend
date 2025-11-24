import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { startPayment, checkPaymentTokenStatus, completePaymentWithQR } from '../features/user/api'
import TermsOfServiceModal from '../components/TermsOfServiceModal'
import QRCode from 'qrcode'
import { CreditCard } from '../components/icons'

export default function PaymentCheckoutPage() {
  const { id } = useParams()
  const [form, setForm] = useState({ 
    first_name: '', 
    last_name: '', 
    user_address: '', 
    user_receiving_option: 'shipping', 
    user_payment_method: 'bank_transfer' 
  })
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  // QR Payment state
  const [paymentData, setPaymentData] = useState(null)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('')
  const [rawQrCode, setRawQrCode] = useState('')
  const [token, setToken] = useState('')
  const [bankInfo, setBankInfo] = useState(null)
  const [paymentStatus, setPaymentStatus] = useState('pending') // pending, completed, failed
  const [error, setError] = useState('')
  const [timeRemaining, setTimeRemaining] = useState(86400) // 24 hours = 86400 seconds
  const [showQRPayment, setShowQRPayment] = useState(false)
  
  const pollingIntervalRef = useRef(null)
  const countdownIntervalRef = useRef(null)

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

  async function submit(e) {
    e.preventDefault()
    
    if (!acceptedTerms) {
      setMsg('You must accept the terms of service before making payment')
      return
    }
    
    // Basic form validation
    if (!form.first_name || !form.last_name || !form.user_address) {
      setMsg('Please fill in all required fields')
      return
    }
    
    setLoading(true)
    setMsg('')
    setError('')
    
    try {
      // Create final payment
      const paymentResult = await startPayment(id, form)
      
      // Extract payment data from response
      // According to API v2.1, payment should include QR token info
      setPaymentData(paymentResult)
      
      // Extract QR token from payment response
      // Note: Backend should provide the QR token in the payment response
      const qrToken = generateMockQRToken(paymentResult.payment_id)
      
      // Generate QR code data
      const qrData = `MB://QR?data=${qrToken}&amount=${paymentResult.amount}&desc=Final payment for auction ${id}`
      
      setToken(qrToken)
      setRawQrCode(qrData)
      setBankInfo({ bank_name: 'MockBank VietNam', bank_code: 'MB' })
      setPaymentStatus('pending')
      setTimeRemaining(86400) // 24 hours
      
      // Generate QR code image
      if (qrData) {
        try {
          const qrDataUrl = await QRCode.toDataURL(qrData, {
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
        }
      }
      
      // Start countdown timer
      startCountdown()
      
      // Start polling for payment status
      startPollingForPaymentStatus(qrToken)
      
      // Show QR payment interface
      setShowQRPayment(true)
      setMsg(`Thanh toán đã được tạo! Vui lòng quét mã QR để hoàn thành thanh toán trong vòng 24 giờ.`)
      
    } catch (error) {
      console.error('Payment error:', error)
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        setMsg('Mất kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.')
      } else if (error.message.includes('401')) {
        setMsg('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
      } else if (error.message.includes('403')) {
        setMsg('Bạn không có quyền thanh toán cho phiên đấu giá này.')
      } else if (error.message.includes('404')) {
        setMsg('Phiên đấu giá không tồn tại hoặc đã được thanh toán.')
      } else {
        setMsg(error.message || 'Lỗi khi tạo thanh toán. Vui lòng thử lại.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Generate mock QR token for demo purposes
  const generateMockQRToken = (paymentId) => {
    return `payment_token_${paymentId}_${Date.now()}`
  }

  const startCountdown = () => {
    countdownIntervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current)
          setPaymentStatus('failed')
          setError('Mã QR đã hết hạn. Vui lòng tạo lại thanh toán.')
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
        } else {
          clearInterval(pollingIntervalRef.current)
          clearInterval(countdownIntervalRef.current)
          setPaymentStatus('failed')
          setError(tokenStatus.error || 'Mã QR không hợp lệ hoặc đã hết hạn.')
        }
      } catch (error) {
        console.error('Error polling payment status:', error)
        if (!error.message.includes('fetch')) {
          setError('Lỗi kết nối khi kiểm tra trạng thái thanh toán.')
        }
      }
    }, 5000) // Poll every 5 seconds
  }

  const handleTermsAccepted = () => {
    setAcceptedTerms(true)
    setShowTerms(false)
  }

  const simulatePaymentCompletion = async () => {
    try {
      const result = await completePaymentWithQR(token)
      if (result.success) {
        clearInterval(pollingIntervalRef.current)
        clearInterval(countdownIntervalRef.current)
        setPaymentStatus('completed')
        setMsg('Thanh toán đã được hoàn thành thành công!')
      } else {
        throw new Error(result.message || 'Payment failed')
      }
    } catch (error) {
      console.error('Error completing payment:', error)
      setError('Lỗi khi hoàn thành thanh toán.')
    }
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <>
      <div className="max-w-md mx-auto bento-card p-6">
        <h1 className="font-display text-2xl">Thanh toán cuối cùng</h1>
        
        {!showQRPayment ? (
          <form className="mt-4 space-y-3" onSubmit={submit}>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm">Họ</span>
                <input className="mt-1 w-full rounded-xl border px-3 py-2" 
                  value={form.first_name} 
                  onChange={(e)=>setForm({...form,first_name:e.target.value})}
                  placeholder="John"/>
              </label>
              <label className="block">
                <span className="text-sm">Tên</span>
                <input className="mt-1 w-full rounded-xl border px-3 py-2" 
                  value={form.last_name} 
                  onChange={(e)=>setForm({...form,last_name:e.target.value})}
                  placeholder="Doe"/>
              </label>
            </div>
            
            <label className="block">
              <span className="text-sm">Địa chỉ</span>
              <input className="mt-1 w-full rounded-xl border px-3 py-2" 
                value={form.user_address} 
                onChange={(e)=>setForm({...form,user_address:e.target.value})}
                placeholder="123 Main St, City, Country"/>
            </label>
            
            <label className="block">
              <span className="text-sm">Phương thức nhận hàng</span>
              <select className="mt-1 w-full rounded-xl border px-3 py-2" 
                value={form.user_receiving_option} 
                onChange={(e)=>setForm({...form,user_receiving_option:e.target.value})}>
                <option value="shipping">Giao hàng</option>
                <option value="pickup">Tự nhận</option>
              </select>
            </label>
            
            <label className="block">
              <span className="text-sm">Phương thức thanh toán</span>
              <select className="mt-1 w-full rounded-xl border px-3 py-2" 
                value={form.user_payment_method} 
                onChange={(e)=>setForm({...form,user_payment_method:e.target.value})}>
                <option value="bank_transfer">Chuyển khoản ngân hàng</option>
                <option value="credit_card">Thẻ tín dụng</option>
                <option value="cash">Tiền mặt</option>
              </select>
            </label>
            
            {/* Terms of Service checkbox */}
            <div className="mt-4">
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 rounded"
                />
                <span className="text-sm text-black/70">
                  Tôi đồng ý với{' '}
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    Điều khoản dịch vụ
                  </button>{' '}
                  để xử lý thanh toán
                </span>
              </label>
            </div>
            
            <button className="btn-primary w-full" disabled={loading || !acceptedTerms}>
              {loading ? 'Đang xử lý...' : 'Tạo thanh toán QR'}
            </button>
          </form>
        ) : (
          // QR Payment Interface
          <div className="mt-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {paymentData && (
              <div className="text-center">
                <div className="mb-4">
                  <h3 className="font-semibold text-lg mb-2">Quét mã QR để thanh toán</h3>
                  <p className="text-gray-600 text-sm">Số tiền: {paymentData.amount?.toLocaleString()} VND</p>
                  {timeRemaining > 0 && (
                    <p className="text-orange-600 text-sm font-medium">
                      Thời gian còn lại: {formatTime(timeRemaining)}
                    </p>
                  )}
                </div>

                {/* QR Code Display */}
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  <div className="w-48 h-48 bg-white rounded-lg mx-auto flex items-center justify-center border">
                    {paymentStatus === 'pending' && qrCodeDataUrl ? (
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
                    <div className="text-center" style={{ display: paymentStatus === 'pending' && qrCodeDataUrl ? 'none' : 'block' }}>
                      {paymentStatus === 'pending' ? (
                        <div>
                          <div className="w-16 h-16 bg-gray-300 rounded mb-2 mx-auto"></div>
                          <p className="text-xs text-gray-600">QR Code</p>
                          <p className="text-xs text-gray-500 mt-1 break-all">{rawQrCode.substring(0, 50)}...</p>
                        </div>
                      ) : (
                        <div>
                          <div className="text-green-500 text-4xl mb-2">✓</div>
                          <p className="text-green-600 font-semibold">Thanh toán hoàn thành</p>
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
                {paymentStatus === 'pending' && timeRemaining > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <p className="text-yellow-800 text-sm">⏳ Đang chờ xác nhận thanh toán...</p>
                  </div>
                )}

                {paymentStatus === 'completed' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <p className="text-green-800 text-sm">✅ Thanh toán đã được hoàn thành thành công! Chúng tôi sẽ liên hệ với bạn sớm.</p>
                  </div>
                )}

                {paymentStatus === 'failed' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-red-800 text-sm">❌ Thanh toán thất bại. Vui lòng thử lại.</p>
                  </div>
                )}

                {/* Demo button to simulate payment completion */}
                {paymentStatus === 'pending' && process.env.NODE_ENV === 'development' && (
                  <button
                    onClick={simulatePaymentCompletion}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm mb-4"
                  >
                    Demo: Hoàn thành thanh toán
                  </button>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {paymentStatus !== 'completed' && (
                    <button
                      onClick={() => {
                        setShowQRPayment(false)
                        setPaymentData(null)
                        setQrCodeDataUrl('')
                        setToken('')
                        setError('')
                        if (pollingIntervalRef.current) {
                          clearInterval(pollingIntervalRef.current)
                        }
                        if (countdownIntervalRef.current) {
                          clearInterval(countdownIntervalRef.current)
                        }
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Tạo lại thanh toán
                    </button>
                  )}
                  
                  {paymentStatus === 'completed' && (
                    <button
                      onClick={() => window.location.href = '/'}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Về trang chủ
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {msg && <div className="mt-3 text-green-700 text-sm">{msg}</div>}
      </div>

      {/* Terms of Service Modal */}
      <TermsOfServiceModal
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
        onAccept={handleTermsAccepted}
      />
    </>
  )
}
