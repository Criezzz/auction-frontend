import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function OTPVerificationSuccessPage() {
  const nav = useNavigate()
  const location = useLocation()
  const username = location.state?.username

  useEffect(() => {
    // Auto redirect to signin page after 3 seconds
    const timer = setTimeout(() => {
      nav('/signin', { 
        replace: true,
        state: { 
          message: 'Tài khoản của bạn đã được kích hoạt thành công! Vui lòng đăng nhập.',
          username: username
        }
      })
    }, 3000)

    return () => clearTimeout(timer)
  }, [nav, username])

  return (
    <div className="max-w-md mx-auto bento-card p-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="font-display text-2xl mb-4 text-green-600">
          Xác minh thành công!
        </h1>
        
        <p className="text-gray-600 mb-2">
          Tài khoản của bạn đã được kích hoạt thành công.
        </p>
        
        {username && (
          <p className="text-sm text-gray-500 mb-6">
            Tên tài khoản: <span className="font-medium">{username}</span>
          </p>
        )}
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-700 text-sm">
            Bạn sẽ được chuyển hướng đến trang đăng nhập trong 3 giây...
          </p>
        </div>
        
        <div className="space-y-2">
          <button
            onClick={() => nav('/signin', { state: { username } })}
            className="btn-primary w-full"
          >
            Đăng nhập ngay
          </button>
          
          <button
            onClick={() => nav('/')}
            className="btn-secondary w-full"
          >
            Về trang chủ
          </button>
        </div>
      </div>
      
      {/* Features showcase */}
      <div className="mt-8 pt-6 border-t">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Bạn có thể:</h3>
        <ul className="text-xs text-gray-600 space-y-2">
          <li className="flex items-center">
            <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Tham gia đấu giá các sản phẩm độc đáo
          </li>
          <li className="flex items-center">
            <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Đặt giá thầu cạnh tranh
          </li>
          <li className="flex items-center">
            <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Theo dõi lịch sử đấu giá
          </li>
          <li className="flex items-center">
            <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Nhận thông báo thời gian thực
          </li>
        </ul>
      </div>
    </div>
  )
}