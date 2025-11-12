import { httpPost, apiBase } from '../../services/httpClient'
import { mockRegister } from './mockRepo'

const useMock = !apiBase()

export async function register({ username, email, password }) {
  if (useMock) return mockRegister({ username, email, password })
  return httpPost('/auth/register', { username, email, password })
}

