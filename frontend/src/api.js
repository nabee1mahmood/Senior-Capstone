/**
 * API client for the backend.
 * Set VITE_API_URL for production or non-default backend locations.
 */
const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  const text = await res.text()
  const data = text ? (() => { try { return JSON.parse(text) } catch { return {} } })() : {}
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`)
  }
  return data
}

export async function login(email, password) {
  return request('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function createAccount(email, password) {
  return request('/api/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function fetchDeviceOverview(userId) {
  return request(`/api/users/${userId}/devices/overview`)
}

export async function fetchAlertHistory(userId, limit = 25) {
  return request(`/api/users/${userId}/alerts?limit=${limit}`)
}

export async function fetchDeviceReadings(userId, deviceId, limit = 60) {
  return request(`/api/users/${userId}/devices/${deviceId}/readings?limit=${limit}`)
}

export async function fetchProfile(userId) {
  return request(`/api/users/${userId}/profile`)
}

export async function patchProfile(userId, body) {
  return request(`/api/users/${userId}/profile`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export async function patchPassword(userId, body) {
  return request(`/api/users/${userId}/password`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}
