/**
 * Order API Layer — Real Backend
 * ==============================================
 * All calls go directly to the Express backend API.
 */

import { API_BASE_URL } from '../../config/api'

const API_BASE = `${API_BASE_URL}/orders`

const getToken = () => localStorage.getItem('kk_admin_token')

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`
})

// ========================
// FETCH ALL ORDERS
// ========================
export const fetchOrdersApi = async () => {
  try {
    const res = await fetch(API_BASE, { headers: authHeaders() })
    const data = await res.json()
    return data.data?.orders || data.data || []
  } catch (err) {
    console.error('❌ Fetch orders failed:', err)
    return []
  }
}

// ========================
// FETCH SINGLE ORDER
// ========================
export const fetchOrderByIdApi = async (orderId) => {
  try {
    const res = await fetch(`${API_BASE}/${orderId}`, { headers: authHeaders() })
    const data = await res.json()
    return data.data || null
  } catch (err) {
    console.error('❌ Fetch order failed:', err)
    return null
  }
}

// ========================
// CREATE ORDER
// ========================
export const createOrderApi = async (orderData) => {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(orderData)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Create order failed')
  return data.data
}

// ========================
// UPDATE STATUS
// ========================
export const updateOrderStatusApi = async (orderId, newStatus) => {
  const valid = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
  if (!valid.includes(newStatus)) throw new Error('Invalid status')

  const res = await fetch(`${API_BASE}/${orderId}/status`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ status: newStatus })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Update status failed')
  return data.data
}

// ========================
// UPDATE ORDER
// ========================
export const updateOrderApi = async (orderId, updates) => {
  const res = await fetch(`${API_BASE}/${orderId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(updates)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Update order failed')
  return data.data
}

// ========================
// DELETE ORDER
// ========================
export const deleteOrderApi = async (orderId) => {
  const res = await fetch(`${API_BASE}/${orderId}`, {
    method: 'DELETE',
    headers: authHeaders()
  })
  if (!res.ok) throw new Error('Delete order failed')
  return true
}

// ========================
// FILTER HELPERS
// ========================
export const fetchOrdersByStatusApi = async (status) => {
  const orders = await fetchOrdersApi()
  return orders.filter(o => o.status === status)
}

export const fetchOrdersByCustomerApi = async (phone) => {
  const orders = await fetchOrdersApi()
  return orders.filter(o => o.customer?.mobile === phone)
}

// ========================
// STATS
// ========================
export const fetchOrderStatsApi = async () => {
  try {
    const res = await fetch(`${API_BASE}/stats`, { headers: authHeaders() })
    const data = await res.json()
    return data.data || {}
  } catch (err) {
    console.error('❌ Fetch stats failed:', err)
    return {}
  }
}
