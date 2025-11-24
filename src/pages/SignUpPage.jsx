import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerWithOTP } from '../features/auth/register'
import { validateEmail, validateUsername, validatePassword, validatePhone, validateName, validateDateOfBirth } from '../utils/validation'

export default function SignUpPage() {
  const [form, setForm] = useState({ 
    username: '', 
    email: '', 
    password: '',
    first_name: '',
    last_name: '',
    phone_num: '',
    date_of_birth: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  // Validate individual field
  const validateField = (name, value) => {
    switch (name) {
      case 'username':
        return validateUsername(value)
      case 'email':
        return validateEmail(value)
      case 'password':
        return validatePassword(value)
      case 'first_name':
      case 'last_name':
        return validateName(value)
      case 'phone_num':
        return validatePhone(value)
      case 'date_of_birth':
        return validateDateOfBirth(value)
      default:
        return ''
    }
  }

  // Validate all fields
  const validateForm = () => {
    const newErrors = {}
    
    Object.keys(form).forEach(key => {
      const error = validateField(key, form[key])
      if (error) newErrors[key] = error
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function onSubmit(e) {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    
    try {
      const response = await registerWithOTP(form)
      
      // Store OTP token in localStorage for verification
      if (response.otp_token) {
        localStorage.setItem('otp_token', response.otp_token)
      }
      
      // Navigate to OTP verification page
      nav('/otp-verification', { 
        replace: true,
        state: { username: form.username }
      })
    } catch (e) {
      setErrors({ 
        general: e.message || 'Đăng ký tài khoản thất bại. Vui lòng thử lại.' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="max-w-md mx-auto bento-card p-6">
      <h1 className="font-display text-2xl mb-6 text-center">Tạo tài khoản mới</h1>
      
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium">Họ</span>
            <input 
              type="text" 
              className={`mt-1 w-full rounded-xl border px-3 py-2 ${errors.first_name ? 'border-red-500' : 'border-black/15'}`}
              value={form.first_name} 
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              placeholder="Nguyen"
            />
            {errors.first_name && <span className="text-red-600 text-xs">{errors.first_name}</span>}
          </label>
          
          <label className="block">
            <span className="text-sm font-medium">Tên</span>
            <input 
              type="text" 
              className={`mt-1 w-full rounded-xl border px-3 py-2 ${errors.last_name ? 'border-red-500' : 'border-black/15'}`}
              value={form.last_name} 
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              placeholder="Van A"
            />
            {errors.last_name && <span className="text-red-600 text-xs">{errors.last_name}</span>}
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium">Tên đăng nhập *</span>
          <input 
            type="text" 
            className={`mt-1 w-full rounded-xl border px-3 py-2 ${errors.username ? 'border-red-500' : 'border-black/15'}`}
            value={form.username} 
            onChange={(e) => handleInputChange('username', e.target.value)}
            placeholder="username123"
          />
          {errors.username && <span className="text-red-600 text-xs">{errors.username}</span>}
        </label>

        <label className="block">
          <span className="text-sm font-medium">Email *</span>
          <input 
            type="email" 
            className={`mt-1 w-full rounded-xl border px-3 py-2 ${errors.email ? 'border-red-500' : 'border-black/15'}`}
            value={form.email} 
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="user@example.com"
          />
          {errors.email && <span className="text-red-600 text-xs">{errors.email}</span>}
        </label>

        <label className="block">
          <span className="text-sm font-medium">Số điện thoại</span>
          <input 
            type="tel" 
            className={`mt-1 w-full rounded-xl border px-3 py-2 ${errors.phone_num ? 'border-red-500' : 'border-black/15'}`}
            value={form.phone_num} 
            onChange={(e) => handleInputChange('phone_num', e.target.value)}
            placeholder="+1234567890"
          />
          {errors.phone_num && <span className="text-red-600 text-xs">{errors.phone_num}</span>}
        </label>

        <label className="block">
          <span className="text-sm font-medium">Ngày sinh</span>
          <input 
            type="date" 
            className={`mt-1 w-full rounded-xl border px-3 py-2 ${errors.date_of_birth ? 'border-red-500' : 'border-black/15'}`}
            value={form.date_of_birth} 
            onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
          />
          {errors.date_of_birth && <span className="text-red-600 text-xs">{errors.date_of_birth}</span>}
        </label>

        <label className="block">
          <span className="text-sm font-medium">Mật khẩu *</span>
          <input 
            type="password" 
            className={`mt-1 w-full rounded-xl border px-3 py-2 ${errors.password ? 'border-red-500' : 'border-black/15'}`}
            value={form.password} 
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder="••••••••"
          />
          {errors.password && <span className="text-red-600 text-xs">{errors.password}</span>}
          <p className="text-xs text-gray-600 mt-1">Tối thiểu 6 ký tự</p>
        </label>

        {errors.general && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            {errors.general}
          </div>
        )}
        
        <button 
          className="btn-primary w-full" 
          disabled={loading}
        >
          {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
        </button>
        
        <p className="text-xs text-gray-600 text-center">
          Bằng việc đăng ký, bạn đồng ý với{' '}
          <a href="/terms" className="text-blue-600 hover:underline">Điều khoản sử dụng</a>
        </p>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-sm">
          Đã có tài khoản?{' '}
          <a href="/signin" className="text-blue-600 hover:underline">Đăng nhập</a>
        </p>
      </div>
    </div>
  )
}

