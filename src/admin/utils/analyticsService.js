/**
 * Analytics Service (PRODUCTION READY)
 * ===================================
 * Fetches analytics from backend instead of localStorage
 */

import { API_BASE_URL } from '../../config/api'

const API_BASE = API_BASE_URL

// 🔐 Get token
const getToken = () => localStorage.getItem('kk_admin_token')

/**
 * Fetch all orders from backend
 */
export const loadOrders = async () => {
  try {
    const res = await fetch(`${API_BASE}/orders`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    })

    const data = await res.json()
    return data.orders || []
  } catch (error) {
    console.error('❌ Error fetching orders:', error)
    return []
  }
}

/**
 * Get dashboard stats directly from backend
 */
export const calculateTotalStats = async () => {
  try {
    const res = await fetch(`${API_BASE}/analytics/stats`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    })

    return await res.json()
  } catch (error) {
    console.error('❌ Stats error:', error)
    return {}
  }
}

/**
 * Monthly sales data
 */
export const getMonthlySalesData = async () => {
  try {
    const res = await fetch(`${API_BASE}/analytics/monthly`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    })

    return await res.json()
  } catch (error) {
    console.error('❌ Monthly error:', error)
    return []
  }
}

/**
 * Daily sales
 */
export const getDailySalesData = async (days = 30) => {
  try {
    const res = await fetch(`${API_BASE}/analytics/daily?days=${days}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    })

    return await res.json()
  } catch (error) {
    console.error('❌ Daily error:', error)
    return []
  }
}

/**
 * Top products
 */
export const getTopProducts = async (limit = 5) => {
  try {
    const res = await fetch(`${API_BASE}/analytics/top-products?limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    })

    return await res.json()
  } catch (error) {
    console.error('❌ Top products error:', error)
    return []
  }
}

/**
 * Orders by status
 */
export const getOrdersByStatus = async () => {
  try {
    const res = await fetch(`${API_BASE}/analytics/status`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    })

    return await res.json()
  } catch (error) {
    console.error('❌ Status error:', error)
    return {}
  }
}

/**
 * Revenue stats
 */
export const getRevenueStats = async () => {
  try {
    const res = await fetch(`${API_BASE}/analytics/revenue`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    })

    return await res.json()
  } catch (error) {
    console.error('❌ Revenue error:', error)
    return {}
  }
}

/**
 * Customer stats
 */
export const getCustomerStats = async () => {
  try {
    const res = await fetch(`${API_BASE}/analytics/customers`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    })

    return await res.json()
  } catch (error) {
    console.error('❌ Customer error:', error)
    return {}
  }
}

/**
 * Recent orders
 */
export const getRecentOrders = async (limit = 10) => {
  try {
    const res = await fetch(`${API_BASE}/orders/recent?limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    })

    return await res.json()
  } catch (error) {
    console.error('❌ Recent orders error:', error)
    return []
  }
}

/**
 * Conversion rate
 */
export const getConversionRate = async () => {
  try {
    const res = await fetch(`${API_BASE}/analytics/conversion`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    })

    return await res.json()
  } catch (error) {
    console.error('❌ Conversion error:', error)
    return 0
  }
}
