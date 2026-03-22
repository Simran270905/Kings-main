import { API_BASE_URL as _BASE } from '../config/api'

// Strip trailing /api if present so we can re-add it consistently
const BASE = _BASE.replace(/\/api$/, '')

const API = `${BASE}/api`

const getAuthHeader = (token) =>
  token ? { Authorization: `Bearer ${token}` } : {}

const handleResponse = async (res) => {
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.message || `HTTP ${res.status}`)
  }
  return data
}

// ─── Products ──────────────────────────────────────────────────────────────
export const productApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return fetch(`${API}/products${query ? `?${query}` : ''}`).then(handleResponse)
  },

  getById: (id) =>
    fetch(`${API}/products/${id}`).then(handleResponse),

  getByCategory: (category, limit = 10) =>
    fetch(`${API}/products/category/${category}?limit=${limit}`).then(handleResponse),

  create: (data, token) =>
    fetch(`${API}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader(token) },
      body: JSON.stringify(data),
    }).then(handleResponse),

  update: (id, data, token) =>
    fetch(`${API}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader(token) },
      body: JSON.stringify(data),
    }).then(handleResponse),

  delete: (id, token) =>
    fetch(`${API}/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(token),
    }).then(handleResponse),

  getStats: (token) =>
    fetch(`${API}/products/stats`, {
      headers: getAuthHeader(token),
    }).then(handleResponse),
}

// ─── Coupons ────────────────────────────────────────────────────────────
export const couponApi = {
  getAll: () =>
    fetch(`${API}/coupons`).then(handleResponse),

  getByCode: (code) =>
    fetch(`${API}/coupons/${code}`).then(handleResponse),

  validate: (data) =>
    fetch(`${API}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  create: (data, token) =>
    fetch(`${API}/coupons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader(token) },
      body: JSON.stringify(data),
    }).then(handleResponse),

  update: (id, data, token) =>
    fetch(`${API}/coupons/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader(token) },
      body: JSON.stringify(data),
    }).then(handleResponse),

  delete: (id, token) =>
    fetch(`${API}/coupons/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(token),
    }).then(handleResponse),
}

// ─── Reviews ────────────────────────────────────────────────────────────
export const reviewApi = {
  getProductReviews: (productId) =>
    fetch(`${API}/reviews/${productId}`).then(handleResponse),

  addReview: (productId, data) =>
    fetch(`${API}/reviews/${productId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  deleteReview: (productId, reviewId) =>
    fetch(`${API}/reviews/${productId}/${reviewId}`, {
      method: 'DELETE',
    }).then(handleResponse),
}

// ─── Auth (Customer) ────────────────────────────────────────────────────────
export const authApi = {
  register: (data) =>
    fetch(`${API}/customers/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  login: (data) =>
    fetch(`${API}/customers/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  getProfile: (token) =>
    fetch(`${API}/customers/profile`, {
      headers: getAuthHeader(token),
    }).then(handleResponse),

  updateProfile: (data, token) =>
    fetch(`${API}/customers/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader(token) },
      body: JSON.stringify(data),
    }).then(handleResponse),

  changePassword: (data, token) =>
    fetch(`${API}/customers/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader(token) },
      body: JSON.stringify(data),
    }).then(handleResponse),
}

// ─── Orders ─────────────────────────────────────────────────────────────────
export const orderApi = {
  create: (data, token) =>
    fetch(`${API}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader(token) },
      body: JSON.stringify(data),
    }).then(handleResponse),

  getAll: (token) =>
    fetch(`${API}/orders`, {
      headers: getAuthHeader(token),
    }).then(handleResponse),

  getById: (id, token) =>
    fetch(`${API}/orders/${id}`, {
      headers: getAuthHeader(token),
    }).then(handleResponse),

  updateStatus: (id, status, token) =>
    fetch(`${API}/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader(token) },
      body: JSON.stringify({ status }),
    }).then(handleResponse),

  getHistory: (token) =>
    fetch(`${API}/customers/orders`, {
      headers: getAuthHeader(token),
    }).then(handleResponse),
}

// ─── Admin Auth ──────────────────────────────────────────────────────────────
export const adminAuthApi = {
  login: (password) =>
    fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    }).then(handleResponse),

  verify: (token) =>
    fetch(`${API}/auth/verify`, {
      headers: getAuthHeader(token),
    }).then(handleResponse),
}

// ─── Payments ────────────────────────────────────────────────────────────────
export const paymentApi = {
  createOrder: (data, token) =>
    fetch(`${API}/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader(token) },
      body: JSON.stringify(data),
    }).then(handleResponse),

  verify: (data, token) =>
    fetch(`${API}/payments/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader(token) },
      body: JSON.stringify(data),
    }).then(handleResponse),
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────
export const wishlistApi = {
  get: (token) =>
    fetch(`${API}/wishlist`, {
      headers: getAuthHeader(token),
    }).then(handleResponse),

  add: (productId, token) =>
    fetch(`${API}/wishlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader(token) },
      body: JSON.stringify({ productId }),
    }).then(handleResponse),

  remove: (productId, token) =>
    fetch(`${API}/wishlist/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeader(token),
    }).then(handleResponse),

  clear: (token) =>
    fetch(`${API}/wishlist`, {
      method: 'DELETE',
      headers: getAuthHeader(token),
    }).then(handleResponse),
}
