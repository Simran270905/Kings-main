import { API_BASE_URL } from '../config/api.js'
import { enhancedApiService } from './apiErrorHandler.js'

const getAuthHeader = (token) =>
  token ? { Authorization: `Bearer ${token}` } : {}

console.log('🔧 API Service using URL:', API_BASE_URL)

// ─── Products ──────────────────────────────────────────────────────────────
export const productApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return enhancedApiService.request(`${API_BASE_URL}/products${query ? `?${query}` : ''}`)
  },

  getById: (id) =>
    enhancedApiService.request(`${API_BASE_URL}/products/${id}`),

  getByCategory: (category, limit = 10) =>
    enhancedApiService.request(`${API_BASE_URL}/products/category/${category}?limit=${limit}`),

  create: (data, token) =>
    enhancedApiService.request(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { ...getAuthHeader(token) },
      body: JSON.stringify(data),
    }),

  update: (id, data, token) =>
    enhancedApiService.request(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: { ...getAuthHeader(token) },
      body: JSON.stringify(data),
    }),

  delete: (id, token) =>
    enhancedApiService.request(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(token),
    }),

  getStats: () =>
    enhancedApiService.request(`${API_BASE_URL}/products/stats`)
}

// ─── Coupons ────────────────────────────────────────────────────────────
export const couponApi = {
  getAll: () =>
    enhancedApiService.request(`${API_BASE_URL}/coupons`),

  getByCode: (code) =>
    fetch(`${API_BASE_URL}/coupons/${code}`).then(handleResponse),

  validate: (data) =>
    fetch(`${API_BASE_URL}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  create: (data, token) =>
    fetch(`${API_BASE_URL}/coupons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader(token) },
      body: JSON.stringify(data),
    }).then(handleResponse),

  update: (id, data, token) =>
    fetch(`${API_BASE_URL}/coupons/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader(token) },
      body: JSON.stringify(data),
    }).then(handleResponse),

  delete: (id, token) =>
    fetch(`${API_BASE_URL}/coupons/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(token),
    }).then(handleResponse),
}

// ─── Reviews ────────────────────────────────────────────────────────────
export const reviewApi = {
  getProductReviews: (productId) =>
    fetch(`${API_BASE_URL}/reviews/${productId}`).then(handleResponse),

  addReview: (productId, data) =>
    fetch(`${API_BASE_URL}/reviews/${productId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  deleteReview: (productId, reviewId) =>
    fetch(`${API_BASE_URL}/reviews/${productId}/${reviewId}`, {
      method: 'DELETE',
    }).then(handleResponse),
}

// ─── Auth (Customer) ────────────────────────────────────────────────────────
export const authApi = {
  register: (data) =>
    fetch(`${API_BASE_URL}/customers/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  login: (data) =>
    fetch(`${API_BASE_URL}/customers/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  getProfile: (token) =>
    fetch(`${API_BASE_URL}/customers/profile`, {
      headers: getAuthHeader(token),
    }).then(handleResponse),

  updateProfile: (data, token) =>
    fetch(`${API_BASE_URL}/customers/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader(token) },
      body: JSON.stringify(data),
    }).then(handleResponse),

  changePassword: (data, token) =>
    fetch(`${API_BASE_URL}/customers/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader(token) },
      body: JSON.stringify(data),
    }).then(handleResponse),
}

// ─── Orders ─────────────────────────────────────────────────────────────────
export const orderApi = {
  create: (data, token) =>
    fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader(token) },
      body: JSON.stringify(data),
    }).then(handleResponse),

  getAll: (token) =>
    fetch(`${API_BASE_URL}/orders`, {
      headers: getAuthHeader(token),
    }).then(handleResponse),

  getById: (id, token) =>
    fetch(`${API_BASE_URL}/orders/${id}`, {
      headers: getAuthHeader(token),
    }).then(handleResponse),

  updateStatus: (id, status, token) =>
    fetch(`${API_BASE_URL}/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader(token) },
      body: JSON.stringify({ status }),
    }).then(handleResponse),

  getHistory: (token) =>
    fetch(`${API_BASE_URL}/customers/orders`, {
      headers: getAuthHeader(token),
    }).then(handleResponse),
}

// ─── Admin Auth ──────────────────────────────────────────────────────────────
export const adminAuthApi = {
  login: (password) =>
    fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    }).then(handleResponse),

  verify: (token) =>
    fetch(`${API_BASE_URL}/admin/verify`, {
      headers: getAuthHeader(token),
    }).then(handleResponse),
}

// ─── Payments ────────────────────────────────────────────────────────────────
export const paymentApi = {
  createOrder: (data, token) =>
    fetch(`${API_BASE_URL}/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader(token) },
      body: JSON.stringify(data),
    }).then(handleResponse),

  verify: (data, token) =>
    fetch(`${API_BASE_URL}/payments/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader(token) },
      body: JSON.stringify(data),
    }).then(handleResponse),
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────
export const wishlistApi = {
  get: (token) =>
    fetch(`${API_BASE_URL}/wishlist`, {
      headers: getAuthHeader(token),
    }).then(handleResponse),

  add: (productId, token) =>
    fetch(`${API_BASE_URL}/wishlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader(token) },
      body: JSON.stringify({ productId }),
    }).then(handleResponse),

  remove: (productId, token) =>
    fetch(`${API_BASE_URL}/wishlist/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeader(token),
    }).then(handleResponse),

  clear: (token) =>
    fetch(`${API_BASE_URL}/wishlist`, {
      method: 'DELETE',
      headers: getAuthHeader(token),
    }).then(handleResponse),
}
