// Simple in-memory mock backend for auth flows
const users = [
  {
    id: 1,
    username: 'admin',
    password: 'admin',
    first_name: 'Admin',
    last_name: 'User',
    email: 'admin@example.com',
    role: 'ADMIN',
  },
  {
    id: 2,
    username: 'user',
    password: 'user',
    first_name: 'Sample',
    last_name: 'User',
    email: 'user@example.com',
    role: 'USER',
  },
]

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

export async function mockRegister({ username, email, password }) {
  await new Promise((r) => setTimeout(r, 300))
  if (users.some((u) => u.username === username)) throw new Error('Username already exists')
  users.push({
    id: users.length + 1,
    username,
    password,
    first_name: '',
    last_name: '',
    email,
    role: 'USER',
  })
  return { ok: true }
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
