/**
 * Validation utilities for forms
 * Following server-side validation rules from API specification
 */

// Username validation: 3-32 characters, alphanumeric + underscore
export function validateUsername(username) {
  if (!username || username.trim() === '') {
    return 'Tên đăng nhập là bắt buộc'
  }
  
  if (username.length < 3) {
    return 'Tên đăng nhập phải có ít nhất 3 ký tự'
  }
  
  if (username.length > 32) {
    return 'Tên đăng nhập không được vượt quá 32 ký tự'
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới'
  }
  
  return ''
}

// Email validation
export function validateEmail(email) {
  if (!email || email.trim() === '') {
    return 'Email là bắt buộc'
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return 'Định dạng email không hợp lệ'
  }
  
  return ''
}

// Password validation: minimum 6 characters
export function validatePassword(password) {
  if (!password || password.trim() === '') {
    return 'Mật khẩu là bắt buộc'
  }
  
  if (password.length < 6) {
    return 'Mật khẩu phải có ít nhất 6 ký tự'
  }
  
  return ''
}

// Name validation (first_name, last_name)
export function validateName(name) {
  if (!name || name.trim() === '') {
    return 'Trường này là bắt buộc'
  }
  
  if (name.length < 2) {
    return 'Tên phải có ít nhất 2 ký tự'
  }
  
  if (name.length > 50) {
    return 'Tên không được vượt quá 50 ký tự'
  }
  
  if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(name)) {
    return 'Tên chỉ được chứa chữ cái và khoảng trắng'
  }
  
  return ''
}

// Phone number validation (optional field)
export function validatePhone(phone) {
  if (!phone || phone.trim() === '') {
    return '' // Optional field, no error if empty
  }
  
  // Vietnamese phone number format: +84xxxxxxxxx or 0xxxxxxxxx
  const phoneRegex = /^(\+84|84|0)[1-9][0-9]{8,9}$/
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    return 'Số điện thoại không hợp lệ (ví dụ: +84123456789 hoặc 0123456789)'
  }
  
  return ''
}

// Date of birth validation (optional field)
export function validateDateOfBirth(dateOfBirth) {
  if (!dateOfBirth || dateOfBirth.trim() === '') {
    return '' // Optional field, no error if empty
  }
  
  const birthDate = new Date(dateOfBirth)
  const today = new Date()
  
  if (birthDate >= today) {
    return 'Ngày sinh phải trong quá khứ'
  }
  
  const age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    if (age - 1 < 13) {
      return 'Phải từ 13 tuổi trở lên'
    }
  } else if (age < 13) {
    return 'Phải từ 13 tuổi trở lên'
  }
  
  if (age > 120) {
    return 'Ngày sinh không hợp lệ'
  }
  
  return ''
}

// OTP code validation
export function validateOTPCode(otpCode) {
  if (!otpCode || otpCode.trim() === '') {
    return 'Mã OTP là bắt buộc'
  }
  
  if (!/^\d{6}$/.test(otpCode)) {
    return 'Mã OTP phải có 6 chữ số'
  }
  
  return ''
}

// Password confirmation validation
export function validatePasswordConfirmation(password, confirmation) {
  if (!confirmation || confirmation.trim() === '') {
    return 'Vui lòng nhập lại mật khẩu'
  }
  
  if (password !== confirmation) {
    return 'Mật khẩu xác nhận không khớp'
  }
  
  return ''
}

// Validate all form fields at once
export function validateRegistrationForm(formData) {
  const errors = {}
  
  // Required fields
  const requiredFields = [
    { key: 'username', name: 'Tên đăng nhập', validator: validateUsername },
    { key: 'email', name: 'Email', validator: validateEmail },
    { key: 'password', name: 'Mật khẩu', validator: validatePassword },
    { key: 'first_name', name: 'Họ', validator: validateName },
    { key: 'last_name', name: 'Tên', validator: validateName }
  ]
  
  requiredFields.forEach(field => {
    const error = field.validator(formData[field.key])
    if (error) {
      errors[field.key] = error
    }
  })
  
  // Optional fields
  if (formData.phone_num) {
    const phoneError = validatePhone(formData.phone_num)
    if (phoneError) {
      errors.phone_num = phoneError
    }
  }
  
  if (formData.date_of_birth) {
    const dobError = validateDateOfBirth(formData.date_of_birth)
    if (dobError) {
      errors.date_of_birth = dobError
    }
  }
  
  return errors
}

// Real-time validation for individual fields
export function validateFieldRealtime(fieldName, value, allFormData = {}) {
  switch (fieldName) {
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
    case 'password_confirmation':
      return validatePasswordConfirmation(allFormData.password, value)
    default:
      return ''
  }
}

// Utility to check if form is valid
export function isFormValid(formData) {
  const errors = validateRegistrationForm(formData)
  return Object.keys(errors).length === 0
}