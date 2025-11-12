import { httpPost, apiBase } from '../../services/httpClient'
import { mockRequestReset, mockResetPassword } from './mockRepo'

const useMock = !apiBase()

export async function requestPasswordReset({ email }) {
  if (useMock) return mockRequestReset({ email })
  return httpPost('/auth/reset/request', { email })
}

export async function resetPassword({ token, password }) {
  if (useMock) return mockResetPassword({ token, password })
  return httpPost('/auth/reset/confirm', { token, password })
}

