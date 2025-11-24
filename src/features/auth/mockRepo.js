// Simple in-memory mock backend for auth flows
const users = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    first_name: 'Admin',
    last_name: 'User',
    email: 'admin@example.com',
    role: 'ADMIN',
    phone_num: '+84123456789',
    date_of_birth: '1990-01-01T00:00:00',
    activated: true,
    is_authenticated: false,
    created_at: '2024-01-01T12:00:00',
    updated_at: null
  },
  {
    id: 2,
    username: 'user1',
    password: 'user123',
    first_name: 'Sample',
    last_name: 'User',
    email: 'user@example.com',
    role: 'USER',
    phone_num: '+84987654321',
    date_of_birth: '1992-05-15T00:00:00',
    activated: true,
    is_authenticated: false,
    created_at: '2024-01-01T12:00:00',
    updated_at: null
  },
]

// Mock OTP tokens store
const otpTokens = new Map() // otp_token -> { username, otp_code, expires_at }
const registrationTokens = new Map() // username -> otp_token

let issuedRefreshTokens = new Map() // refreshToken -> username

function makeTokens(username) {
  const access = `mock.access.${username}.${Math.random().toString(36).slice(2)}`
  const refresh = `mock.refresh.${username}.${Math.random().toString(36).slice(2)}`
  const now = Date.now()
  const expiresIn = 60 * 15 // 15 minutes
  const exp = now + expiresIn * 1000
  issuedRefreshTokens.set(refresh, username)
  return {
    access_token: access,
    refresh_token: refresh,
    token_type: 'bearer',
    expires_in: expiresIn,
    exp,
  }
}

export async function mockSignIn({ username, password }) {
  const user = users.find((u) => u.username === username && u.password === password)
  await new Promise((r) => setTimeout(r, 400))
  if (!user) throw new Error('Invalid credentials')
  return makeTokens(user.username)
}

export async function mockRefresh(refreshToken) {
  await new Promise((r) => setTimeout(r, 300))
  const username = issuedRefreshTokens.get(refreshToken)
  if (!username) throw new Error('Invalid refresh token')
  return makeTokens(username)
}

export async function mockProfile(accessToken) {
  await new Promise((r) => setTimeout(r, 200))
  const parts = `${accessToken || ''}`.split('.')
  const username = parts[2]
  const user = users.find((u) => u.username === username)
  if (!user) throw new Error('Unauthorized')
  const { password, ...profile } = user
  return profile
}

export async function mockRegisterWithOTP({ username, email, password, first_name, last_name, phone_num, date_of_birth }) {
  await new Promise((r) => setTimeout(r, 300))
  
  if (users.some((u) => u.username === username)) {
    throw new Error('Tên đăng nhập đã tồn tại')
  }
  
  if (users.some((u) => u.email === email)) {
    throw new Error('Email đã được đăng ký')
  }

  const newUser = {
    id: users.length + 1,
    username,
    email,
    password,
    first_name: first_name || '',
    last_name: last_name || '',
    phone_num: phone_num || null,
    date_of_birth: date_of_birth || null,
    role: 'user',
    activated: false,
    is_authenticated: false,
    created_at: new Date().toISOString(),
    updated_at: null
  }
  
  users.push(newUser)
  
  // Generate OTP token and code
  const otpToken = `mock.otp.${username}.${Date.now()}.${Math.random().toString(36).slice(2)}`
  const otpCode = '123456' // Mock OTP code for testing
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
  
  otpTokens.set(otpToken, {
    username,
    otp_code: otpCode,
    expires_at: expiresAt,
    purpose: 'registration'
  })
  
  registrationTokens.set(username, otpToken)
  
  return {
    success: true,
    message: 'Tài khoản đã được tạo. Vui lòng kiểm tra email để xác minh OTP.',
    otp_token: otpToken,
    expires_in: 300,
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      phone_num: newUser.phone_num,
      date_of_birth: newUser.date_of_birth,
      activated: false,
      is_authenticated: false,
      created_at: newUser.created_at,
      updated_at: newUser.updated_at
    }
  }
}

export async function mockVerifyOTP({ otp_code, otp_token, username }) {
  await new Promise((r) => setTimeout(r, 200))
  
  const otpData = otpTokens.get(otp_token)
  
  if (!otpData) {
    throw new Error('Mã OTP không hợp lệ hoặc đã hết hạn')
  }
  
  if (otpData.username !== username) {
    throw new Error('Thông tin xác minh không khớp')
  }
  
  const now = new Date()
  if (now > otpData.expires_at) {
    throw new Error('Mã OTP đã hết hạn')
  }
  
  if (otp_code !== otpData.otp_code) {
    return {
      success: false,
      message: 'Mã OTP không đúng.'
    }
  }
  
  // OTP verification successful
  const user = users.find(u => u.username === username)
  if (user) {
    user.activated = true
  }
  
  // Clean up OTP data
  otpTokens.delete(otp_token)
  registrationTokens.delete(username)
  
  return {
    success: true,
    message: 'Xác minh email thành công! Tài khoản đã được kích hoạt.'
  }
}

export async function mockResendOTP(username) {
  await new Promise((r) => setTimeout(r, 200))
  
  const currentOtpToken = registrationTokens.get(username)
  const user = users.find(u => u.username === username)
  
  if (!user) {
    throw new Error('Người dùng không tồn tại')
  }
  
  if (user.activated) {
    throw new Error('Tài khoản đã được kích hoạt')
  }
  
  // Generate new OTP
  const newOtpToken = `mock.otp.${username}.${Date.now()}.${Math.random().toString(36).slice(2)}`
  const otpCode = '123456'
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000)
  
  otpTokens.set(newOtpToken, {
    username,
    otp_code: otpCode,
    expires_at: expiresAt,
    purpose: 'registration'
  })
  
  // Clean old token
  if (currentOtpToken) {
    otpTokens.delete(currentOtpToken)
  }
  registrationTokens.set(username, newOtpToken)
  
  return {
    success: true,
    message: 'OTP mới đã được gửi đến email của bạn',
    otp_token: newOtpToken,
    expires_in: 300
  }
}

export async function mockCheckOTPStatus(otpToken) {
  await new Promise((r) => setTimeout(r, 100))
  
  const otpData = otpTokens.get(otpToken)
  
  if (!otpData) {
    return {
      valid: false,
      expired: false,
      purpose: null,
      username: null,
      expires_at: null,
      message: 'Mã OTP không tồn tại'
    }
  }
  
  const now = new Date()
  const expired = now > otpData.expires_at
  
  return {
    valid: !expired,
    expired,
    purpose: otpData.purpose,
    username: otpData.username,
    expires_at: otpData.expires_at.toISOString(),
    message: expired ? 'Mã OTP đã hết hạn' : 'OTP token hợp lệ'
  }
}

// Legacy function for backward compatibility
export async function mockRegister({ username, email, password }) {
  const result = await mockRegisterWithOTP({ username, email, password, first_name: '', last_name: '' })
  return { success: true, message: 'Registration successful' }
}

export async function mockDeleteUnactivatedAccount({ username }) {
  await new Promise((r) => setTimeout(r, 200))
  
  // Find the unactivated user
  const userIndex = users.findIndex(u => u.username === username && !u.activated)
  
  if (userIndex === -1) {
    throw new Error('Tài khoản không tồn tại hoặc đã được kích hoạt')
  }
  
  // Remove the unactivated user
  users.splice(userIndex, 1)
  
  // Clean up any OTP tokens associated with this username
  const otpToken = registrationTokens.get(username)
  if (otpToken) {
    otpTokens.delete(otpToken)
    registrationTokens.delete(username)
  }
  
  return {
    success: true,
    message: 'Tài khoản chưa kích hoạt đã được xóa thành công'
  }
}

export async function mockRequestReset({ email }) {
  await new Promise((r) => setTimeout(r, 200))
  // Do nothing, just pretend an email was sent.
  return { ok: true, token: `mock.reset.${Math.random().toString(36).slice(2)}` }
}

export async function mockResetPassword({ token, password }) {
  await new Promise((r) => setTimeout(r, 200))
  // Very naive: set password for first user to demonstrate flow
  const u = users[1] || users[0]
  if (u) u.password = password
  return { ok: true }
}
