import { httpPost, httpGet, apiBase } from '../../services/httpClient'
import { 
  mockRegisterWithOTP, 
  mockVerifyOTP, 
  mockResendOTP, 
  mockCheckOTPStatus,
  mockDeleteUnactivatedAccount 
} from './mockRepo'

const useMock = !apiBase()

/**
 * Register new account with OTP verification
 * @param {Object} userData - User registration data
 * @param {string} userData.username - Username (required)
 * @param {string} userData.email - Email address (required)
 * @param {string} userData.password - Password (required, min 6 chars)
 * @param {string} userData.first_name - First name (required)
 * @param {string} userData.last_name - Last name (required)
 * @param {string} userData.phone_num - Phone number (optional)
 * @param {string} userData.date_of_birth - Date of birth in ISO format (optional)
 * @returns {Promise} Registration response with OTP token
 */
export async function registerWithOTP(userData) {
  // Prepare payload according to API v2.0 specification
  const payload = {
    username: userData.username.trim(),
    email: userData.email.trim().toLowerCase(),
    password: userData.password,
    first_name: userData.first_name.trim(),
    last_name: userData.last_name.trim(),
    ...(userData.phone_num && { phone_num: userData.phone_num.trim() }),
    ...(userData.date_of_birth && { date_of_birth: userData.date_of_birth })
  }

  if (useMock) {
    return mockRegisterWithOTP(payload)
  }

  return httpPost('/auth/register', payload)
}

/**
 * Verify OTP code during registration
 * @param {Object} otpData - OTP verification data
 * @param {string} otpData.otp_code - 6-digit OTP code
 * @param {string} otpData.otp_token - OTP token from registration response
 * @param {string} otpData.username - Username for verification
 * @returns {Promise} OTP verification response
 */
export async function verifyOTP(otpData) {
  if (useMock) {
    return mockVerifyOTP(otpData)
  }

  return httpPost('/auth/register/verify', {
    otp_code: otpData.otp_code.trim(),
    otp_token: otpData.otp_token,
    username: otpData.username.trim()
  })
}

/**
 * Resend OTP for registration
 * @param {string} username - Username for OTP resend
 * @param {string} otpToken - Current OTP token (for auth header)
 * @returns {Promise} Resend OTP response
 */
export async function resendOTP(username, otpToken) {
  if (useMock) {
    return mockResendOTP(username)
  }

  return httpPost('/auth/register/resend', 
    { username: username.trim() },
    {
      headers: {
        'Authorization': `Bearer ${otpToken}`
      }
    }
  )
}

/**
 * Check OTP token status
 * @param {string} otpToken - OTP token to check
 * @returns {Promise} OTP status response
 */
export async function checkOTPStatus(otpToken) {
  if (useMock) {
    return mockCheckOTPStatus(otpToken)
  }

  return httpGet(`/auth/otp/status?otp_token=${encodeURIComponent(otpToken)}`)
}

/**
 * Cancel registration and delete unactivated account
 * @param {string} username - Username of the account to delete
 * @returns {Promise} Cancel registration response
 */
export async function cancelRegistration(username) {
  if (useMock) {
    return mockDeleteUnactivatedAccount({ username })
  }

  return httpPost('/auth/register/cancel', { username: username.trim() })
}

// Legacy function for backward compatibility
export async function register(userData) {
  return registerWithOTP(userData)
}

