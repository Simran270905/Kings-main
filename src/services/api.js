import { API_BASE_URL } from '../config/api'

const buildUrl = (endpoint) => {
  const cleanEndpoint = endpoint.replace(/^\/+/, "");
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

const request = async (endpoint, options = {}) => {
  // Get token from localStorage for persistent authentication
  const token = localStorage.getItem('token') || localStorage.getItem('kk_admin_token') || sessionStorage.getItem('kk_admin_token')

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    },
    signal: AbortSignal.timeout(15000) // 15 second timeout
  }

  const url = buildUrl(endpoint);
  console.log("🌐 API CALL:", url);

  const res = await fetch(url, config)

  if (res.status === 429) {
    throw new Error('Too many requests. Please slow down and try again in a few minutes.')
  }

  const data = await res.json()

  if (!res.ok) {
    // Handle token expiration
    if (res.status === 401 && (data.message === 'Token expired' || data.message?.includes('expired'))) {
      // Clear expired tokens
      localStorage.removeItem('kk_admin_token')
      localStorage.removeItem('token')
      sessionStorage.removeItem('kk_admin_token')
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/admin-login')) {
        window.location.href = '/admin-login'
      }
      
      throw new Error('Session expired. Please login again.')
    }
    
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

// Coupon API methods
export const couponApi = {
  validate: async (couponData) => {
    return await request('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify(couponData)
    })
  },
  
  getAll: async () => {
    return await request('/coupons')
  },
  
  create: async (couponData, token) => {
    return await request('/coupons', {
      method: 'POST',
      body: JSON.stringify(couponData),
      headers: { Authorization: `Bearer ${token}` }
    })
  },
  
  update: async (id, couponData, token) => {
    return await request(`/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(couponData),
      headers: { Authorization: `Bearer ${token}` }
    })
  },
  
  delete: async (id, token) => {
    return await request(`/coupons/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
  }
}

export default api
