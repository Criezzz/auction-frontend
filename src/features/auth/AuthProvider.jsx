import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getTokens, setTokens, subscribe } from './authStore'
import { signIn as apiSignIn, signOut as apiSignOut, fetchProfile, refreshToken } from './api'

const AuthCtx = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('idle') // idle | loading | authed | error

  const loadProfile = useCallback(async () => {
    try {
      setStatus('loading')
      const me = await fetchProfile()
      setUser(me)
      setStatus('authed')
    } catch (e) {
      setUser(null)
      setStatus('idle')
    }
  }, [])

  // initial token refresh/profile
  useEffect(() => {
    const unsub = subscribe(() => {})
    ;(async () => {
      if (getTokens()) {
        try {
          await refreshToken().catch(() => {}) // try refresh silently
          await loadProfile()
        } catch {}
      }
    })()
    return () => unsub()
  }, [loadProfile])

  const signIn = useCallback(async (creds) => {
    const tokens = await apiSignIn(creds)
    setTokens(tokens)
    await loadProfile()
    return tokens
  }, [loadProfile])

  const signOut = useCallback(() => {
    apiSignOut()
    setUser(null)
    setStatus('idle')
  }, [])

  return (
    <AuthCtx.Provider value={{ user, status, signIn, signOut }}>
      {children}
    </AuthCtx.Provider>
  )
}

export function useAuth() {
  return useContext(AuthCtx)
}

