const BASE_URL = import.meta.env.VITE_API_URL || '/api'

async function request(method, path, body) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }
  if (body) options.body = JSON.stringify(body)

  const res = await fetch(`${BASE_URL}${path}`, options)
  const data = await res.json()

  if (!res.ok || !data.success) {
    throw new Error(data.error || `Request failed (${res.status})`)
  }
  return data
}

// ── User API ──────────────────────────────────────────────
export const api = {
  /** Register a new user tracker */
  createUser: (payload) => request('POST', '/users', payload),

  /** Fetch all accounts for a telegram ID */
  getAccounts: (telegramId) => request('GET', `/accounts/${telegramId}`),

  /** Fetch user profile + live stats */
  getUser: (userId) => request('GET', `/users/${userId}`),

  /** Fetch recent submissions */
  getSubmissions: (userId) => request('GET', `/users/${userId}/submissions`),

  /** Toggle WhatsApp notifications on/off */
  toggleNotifications: (userId) => request('POST', `/users/${userId}/toggle-notifications`),

  /** Delete a user tracker */
  deleteUser: (userId) => request('DELETE', `/users/${userId}`),

  /** Fetch global recent feed */
  getFeed: () => request('GET', '/feed'),

  /** Health check */
  health: () => request('GET', '/health'),
}
