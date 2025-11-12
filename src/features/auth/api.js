import { httpPost, httpGet, apiBase, setAuthHandlers } from '../../services/httpClient'
import { getAccessToken, setTokens, clearTokens } from './authStore'
import { mockSignIn, mockRefresh, mockProfile } from './mockRepo'

const useMock = !apiBase()

export async function signIn({ username, password }) {
  if (useMock) {
    const tokens = await mockSignIn({ username, password })
    setTokens(tokens)
    return tokens
  }
  const tokens = await httpPost('/auth/login', { username, password })
  setTokens(tokens)
  return tokens
}

export async function refreshToken() {
  const current = JSON.parse(localStorage.getItem('auth.tokens.v1') || 'null')
  if (!current?.refresh_token) throw new Error('No refresh token')
  if (useMock) {
    const tokens = await mockRefresh(current.refresh_token)
    setTokens(tokens)
    return true
  }
  const tokens = await httpPost('/auth/refresh', { refresh_token: current.refresh_token })
  setTokens(tokens)
  return true
}

export async function fetchProfile() {
  if (useMock) {
    const me = await mockProfile(getAccessToken())
    return me
  }
  return await httpGet('/auth/me')
}

export function signOut() {
  clearTokens()
}

// Register handlers so the http client can attach tokens and refresh automatically
setAuthHandlers({
  getAccessToken,
  onUnauthorized: refreshToken,
})

