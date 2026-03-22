import { API_BASE_URL } from '../config/api'

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token') || localStorage.getItem('kk_admin_token')

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, config)

  if (res.status === 429) {
    throw new Error('Too many requests. Please slow down and try again in a few minutes.')
  }

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`)
  }

  return data
}

export const api = {
  get: (endpoint, headers = {}) => request(endpoint, { method: 'GET', headers }),
  post: (endpoint, body, headers = {}) =>
    request(endpoint, { method: 'POST', body: JSON.stringify(body), headers }),
  put: (endpoint, body, headers = {}) =>
    request(endpoint, { method: 'PUT', body: JSON.stringify(body), headers }),
  patch: (endpoint, body, headers = {}) =>
    request(endpoint, { method: 'PATCH', body: JSON.stringify(body), headers }),
  delete: (endpoint, headers = {}) => request(endpoint, { method: 'DELETE', headers })
}

export default api
