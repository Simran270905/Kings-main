/**
 * Analytics Storage (PRODUCTION VERSION)
 * =====================================
 * Replaces localStorage with backend APIs
 */

import { API_BASE_URL } from '../../config/api'

const API_BASE = API_BASE_URL

// 🔐 Auth token
const getToken = () => localStorage.getItem('kk_admin_token')

/**
 * Record a sale (called after order success / Razorpay success)
 */
export const recordSale = async (order) => {
  try {
    const res = await fetch(`${API_BASE}/analytics/record-sale`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify(order)
    })

    const data = await res.json()
    return data.success
  } catch (error) {
    console.error('❌ Error recording sale:', error)
    return false
  }
}

/**
 * Dashboard stats
 */
export const getDashboardStats = async () => {
  try {
    const res = await fetch(`${API_BASE}/analytics/dashboard`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    })

    return await res.json()
  } catch (error) {
    console.error('❌ Dashboard stats error:', error)
    return {
      totalSales: 0,
      totalRevenue: 0,
      totalOrders: 0,
      totalProductsSold: 0,
      averageOrderValue: 0,
      todaySales: 0,
      todayRevenue: 0,
      monthSales: 0,
      monthRevenue: 0
    }
  }
}

/**
 * Revenue trend
 */
export const getRevenueTrend = async (days = 30) => {
  try {
    const res = await fetch(`${API_BASE}/analytics/revenue-trend?days=${days}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    })

    return await res.json()
  } catch (error) {
    console.error('❌ Revenue trend error:', error)
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
 * Monthly sales
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
    console.error('❌ Monthly data error:', error)
    return []
  }
}

/**
 * Get all sales (admin only)
 */
export const getAllSales = async () => {
  try {
    const res = await fetch(`${API_BASE}/analytics/all-sales`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    })

    return await res.json()
  } catch (error) {
    console.error('❌ All sales error:', error)
    return []
  }
}

/**
 * Clear analytics (admin reset)
 */
export const clearAnalyticsData = async () => {
  try {
    const res = await fetch(`${API_BASE}/analytics/clear`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    })

    const data = await res.json()
    return data.success
  } catch (error) {
    console.error('❌ Clear analytics error:', error)
    return false
  }
}

/**
 * Analytics info
 */
export const getAnalyticsInfo = async () => {
  try {
    const res = await fetch(`${API_BASE}/analytics/info`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    })

    return await res.json()
  } catch (error) {
    console.error('❌ Analytics info error:', error)
    return {
      version: '2.0',
      createdAt: null,
      totalSales: 0,
      storageSize: 0
    }
  }
}
