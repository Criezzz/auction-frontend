const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')

let getAccessTokenHook = null
let onUnauthorizedHook = null

export function setAuthHandlers({ getAccessToken, onUnauthorized } = {}) {
  getAccessTokenHook = getAccessToken || null
  onUnauthorizedHook = onUnauthorized || null
}

async function request(path, { method = 'GET', headers = {}, retry = true, ...rest } = {}) {
  const url = base ? `${base}${path}` : path
  const token = getAccessTokenHook ? await getAccessTokenHook() : null
  
  // Debug logging
  console.log('🌐 API Request:', {
    method,
    url,
    headers: {
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: rest.body
  })
  
  const res = await fetch(url, {
    method,
    credentials: 'include', // Quan trọng: Cho phép gửi cookies/credentials
    headers: {
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...rest,
  })

  if (res.status === 401 && retry && onUnauthorizedHook) {
    const refreshed = await onUnauthorizedHook().catch(() => false)
    if (refreshed) {
      return request(path, { method, headers, retry: false, ...rest })
    }
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    const err = new Error(`HTTP ${res.status} ${res.statusText} ${text}`.trim())
    err.status = res.status
    throw err
  }
  const ct = res.headers.get('content-type') || ''
  return ct.includes('application/json') ? res.json() : res.text()
}

export function httpGet(path, opts) {
  return request(path, { method: 'GET', ...opts })
}

export function httpPost(path, body, opts = {}) {
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
  return request(path, {
    method: 'POST',
    body: isFormData ? body : JSON.stringify(body ?? {}),
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(opts.headers || {}),
    },
    ...opts,
  })
}

export function apiBase() {
  return base
}
