import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { verifyOTP, resendOTP, cancelRegistration } from '../features/auth/register'
import { validateOTPCode } from '../utils/validation'

export default function OTPVerificationPage() {
  const [otpCode, setOtpCode] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [countdown, setCountdown] = useState(300) // 5 minutes in seconds
  const [resendAvailable, setResendAvailable] = useState(true)
  const [cleanupAttempted, setCleanupAttempted] = useState(false)
  
  const nav = useNavigate()
  const location = useLocation()
  const username = location.state?.username

  // Redirect if no username in state
  useEffect(() => {
    if (!username) {
      nav('/signup', { replace: true })
    }
  }, [username, nav])

  // Countdown timer for OTP expiration
  useEffect(() => {
    if (countdown <= 0) return

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setResendAvailable(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown])

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      // Cleanup unactivated account when component unmounts
      if (!cleanupAttempted && username) {
        cleanupUnactivatedAccount()
      }
    }
  }, [cleanupAttempted, username])

  // Handle page unload/refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!cleanupAttempted && username) {
        cleanupUnactivatedAccount()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [cleanupAttempted, username])

  // Handle OTP code input (only digits, max 6)
  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setOtpCode(value)
    
    // Clear error when user starts typing
    if (errors.otpCode) {
      setErrors(prev => ({ ...prev, otpCode: '' }))
    }
  }

  // Format countdown display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Cleanup function to delete unactivated account
  const cleanupUnactivatedAccount = async () => {
    if (cleanupAttempted || !username) return
    
    try {
      setCleanupAttempted(true)
      await cancelRegistration(username)
      console.log('Unactivated account cleaned up successfully')
    } catch (error) {
      console.warn('Failed to cleanup unactivated account:', error.message)
      // Don't throw error - we don't want to block navigation
    } finally {
      // Clear OTP token from localStorage
      localStorage.removeItem('otp_token')
    }
  }

  // Handle back to signup with cleanup
  const handleBackToSignup = async () => {
    await cleanupUnactivatedAccount()
    nav('/signup')
  }

  // Verify OTP
  async function handleVerifyOTP(e) {
    e.preventDefault()
    
    const otpError = validateOTPCode(otpCode)
    if (otpError) {
      setErrors({ otpCode: otpError })
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const otpToken = localStorage.getItem('otp_token')
      const response = await verifyOTP({
        otp_code: otpCode,
        otp_token: otpToken,
        username: username
      })

      if (response.success) {
        // Mark cleanup as completed since verification was successful
        setCleanupAttempted(true)
        
        // Clear OTP token from localStorage
        localStorage.removeItem('otp_token')
        
        // Navigate to success page or auto-login
        nav('/otp-verification-success', { 
          replace: true,
          state: { username }
        })
      } else {
        // Handle OTP verification failure
        setErrors({ otpCode: response.message || 'Mã OTP không đúng' })
      }
    } catch (e) {
      setErrors({ 
        general: e.message || 'Xác minh OTP thất bại. Vui lòng thử lại.' 
      })
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP
  async function handleResendOTP() {
    if (!resendAvailable || resendLoading) return

    setResendLoading(true)
    setErrors({})

    try {
      const otpToken = localStorage.getItem('otp_token')
      const response = await resendOTP(username, otpToken)
      
      if (response.success) {
        // Update OTP token
        localStorage.setItem('otp_token', response.otp_token)
        
        // Reset countdown and OTP code
        setCountdown(response.expires_in || 300)
        setOtpCode('')
        setResendAvailable(false)
        
        // Clear any OTP errors
        setErrors({})
        
        // Show success message
        setErrors({ 
          success: 'Mã OTP mới đã được gửi đến email của bạn' 
        })
      }
    } catch (e) {
      setErrors({ 
        general: e.message || 'Không thể gửi lại mã OTP. Vui lòng thử lại.' 
      })
    } finally {
      setResendLoading(false)
    }
  }

  // Auto-submit when 6 digits entered
  useEffect(() => {
    if (otpCode.length === 6) {
      const timer = setTimeout(() => {
        handleVerifyOTP({ preventDefault: () => {} })
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [otpCode])

  if (!username) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="max-w-md mx-auto bento-card p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="font-display text-2xl mb-2">Xác minh email</h1>
        <p className="text-gray-600">
          Chúng tôi đã gửi mã xác minh 6 chữ số đến email của bạn
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Tên tài khoản: <span className="font-medium">{username}</span>
        </p>
      </div>

      <form onSubmit={handleVerifyOTP} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nhập mã OTP
          </label>
          <input
            type="text"
            value={otpCode}
            onChange={handleOtpChange}
            className={`w-full text-center text-2xl font-mono tracking-widest rounded-xl border px-3 py-3 focus:outline-none focus:ring-2 ${
              errors.otpCode 
                ? 'border-red-500 focus:ring-red-200' 
                : 'border-black/15 focus:ring-blue-200'
            }`}
            placeholder="••••••"
            maxLength={6}
            autoComplete="one-time-code"
          />
          {errors.otpCode && (
            <p className="text-red-600 text-sm mt-1">{errors.otpCode}</p>
          )}
        </div>

        {/* Countdown timer */}
        {countdown > 0 && (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Mã OTP sẽ hết hạn sau: <span className="font-medium text-blue-600">{formatTime(countdown)}</span>
            </p>
          </div>
        )}

        {/* Success message */}
        {errors.success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {errors.success}
          </div>
        )}

        {/* General error */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {errors.general}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading || otpCode.length !== 6}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Đang xác minh...' : 'Xác minh OTP'}
        </button>

        {/* Resend OTP */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">Không nhận được mã OTP?</p>
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={!resendAvailable || resendLoading || countdown > 0}
            className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed text-sm font-medium"
          >
            {resendLoading ? 'Đang gửi...' : 'Gửi lại mã OTP'}
          </button>
          {countdown > 0 && (
            <p className="text-xs text-gray-500">
              Bạn có thể gửi lại sau {formatTime(countdown)}
            </p>
          )}
        </div>

        {/* Back to signup */}
        <div className="text-center pt-4 border-t">
          <p className="text-sm text-gray-600">
            Sai thông tin?{' '}
            <button
              type="button"
              onClick={handleBackToSignup}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Quay lại đăng ký
            </button>
          </p>
        </div>
      </form>

      {/* Help section */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Lưu ý:</h3>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Mã OTP chỉ có hiệu lực trong 5 phút</li>
          <li>• Kiểm tra thư mục spam nếu không thấy email</li>
          <li>• Mã OTP demo để test: <strong className="font-mono">123456</strong></li>
        </ul>
      </div>
    </div>
  )
}