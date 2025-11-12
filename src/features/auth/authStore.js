const STORAGE_KEY = 'auth.tokens.v1'

let tokens = null
try {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) tokens = JSON.parse(raw)
} catch {}

const subs = new Set()

export function getTokens() {
  return tokens
}

export function getAccessToken() {
  return tokens?.access_token || null
}

export function setTokens(next) {
  tokens = next
  try {
    if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {}
  subs.forEach((fn) => fn(tokens))
}

export function clearTokens() {
  setTokens(null)
}

export function subscribe(fn) {
  subs.add(fn)
  return () => subs.delete(fn)
}

