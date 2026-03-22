/**
 * Order Service Layer — Real Backend
 * ==================================
 * All calls go directly to the Express backend API.
 */

import { API_BASE_URL } from '../../config/api'

const API_BASE = `${API_BASE_URL}/orders`

const getToken = () => localStorage.getItem('kk_admin_token')

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`
})

// ============================================================================
// LOAD ORDERS
// ============================================================================

export const loadOrders = async () => {
  try {
    const res = await fetch(API_BASE, { headers: authHeaders() })
    const data = await res.json()
    return data.data?.orders || data.data || []
  } catch (error) {
    console.error('❌ Load orders failed:', error)
    return []
  }
}

// ============================================================================
// SAVE ORDERS (bulk upsert — kept for compatibility)
// ============================================================================

export const saveOrders = async () => {
  return true
}

// ============================================================================
// CREATE ORDER
// ============================================================================

export const createOrder = async (orderData) => {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(orderData)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Create order failed')
  return data.data
}

// ============================================================================
// UPDATE ORDER STATUS
// ============================================================================

export const updateOrderStatus = async (orderId, newStatus) => {
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
  if (!validStatuses.includes(newStatus)) throw new Error('Invalid status')

  const res = await fetch(`${API_BASE}/${orderId}/status`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ status: newStatus })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Update status failed')
  return data.data
}

// ============================================================================
// GET HELPERS
// ============================================================================

export const getOrderById = (orderId, orders) => {
  return orders.find(o => String(o.orderId) === String(orderId)) || null
}

export const getOrdersByCustomer = (customerId, orders) => {
  return orders.filter(o => o.shippingAddress?.mobile === customerId)
}

export const getOrdersByStatus = (status, orders) => {
  return orders.filter(o => o.status === status)
}

// ============================================================================
// VALIDATION
// ============================================================================

export const validateOrder = (order) => {
  if (!order.orderId) return { valid: false, error: 'Order ID required' }
  if (!order.items?.length) return { valid: false, error: 'Items required' }
  if (!order.shippingAddress) return { valid: false, error: 'Address required' }
  if (typeof order.totals?.total !== 'number') {
    return { valid: false, error: 'Invalid total' }
  }

  return { valid: true }
}

// ============================================================================
// STATS (🔥 FIXED)
// ============================================================================

export const getOrderStats = (orders) => {
  const stats = {
    total: orders.length,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
  }

  orders.forEach(order => {
    stats[order.status] = (stats[order.status] || 0) + 1

    // 🔥 ONLY COUNT DELIVERED
    if (order.status === 'delivered') {
      stats.totalRevenue += order.totals?.total || 0
    }
  })

  stats.averageOrderValue =
    stats.delivered > 0
      ? Math.round(stats.totalRevenue / stats.delivered)
      : 0

  return stats
}

// ============================================================================
// RECENT ORDERS
// ============================================================================

export const getRecentOrders = (orders, limit = 10) => {
  return [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit)
}

// ============================================================================
// FORMAT FOR UI
// ============================================================================

export const formatOrderForDisplay = (order) => {
  return {
    orderId: order.orderId,
    date: new Date(order.createdAt).toLocaleDateString(),
    time: new Date(order.createdAt).toLocaleTimeString(),
    customer: order.shippingAddress
      ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`
      : 'Unknown',
    phone: order.shippingAddress?.mobile || 'N/A',
    itemCount: order.items?.length || 0,
    total: order.totals?.total || 0,
    status: order.status || 'unknown',
    items: order.items || [],
  }
}
