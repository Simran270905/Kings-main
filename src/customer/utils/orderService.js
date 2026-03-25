import { API_BASE_URL } from '@config/api.js'

/**
 * Customer Order Service
 * Handles order operations for authenticated customers
 */

const API_URL = `${API_BASE_URL}/users`

// Fetch user's orders
export const fetchUserOrders = async (status = 'all', page = 1, limit = 10) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Authentication required')
    }

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })

    if (status !== 'all') {
      params.append('status', status)
    }

    const res = await fetch(`${API_URL}/orders?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Failed to fetch orders')

    return {
      success: true,
      orders: data.data?.orders || data.data || [],
      pagination: data.data?.pagination || {}
    }
  } catch (error) {
    console.error('❌ Error fetching user orders:', error)
    return { success: false, error: error.message, orders: [] }
  }
}

// Get single order details
export const fetchUserOrderById = async (orderId) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Authentication required')
    }

    const res = await fetch(`${API_URL}/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Failed to fetch order')

    return { success: true, order: data.data || data }
  } catch (error) {
    console.error('❌ Error fetching order details:', error)
    return { success: false, error: error.message }
  }
}