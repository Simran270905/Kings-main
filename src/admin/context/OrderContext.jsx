import React, { createContext, useContext, useState, useEffect } from 'react'
import adminApi from '../utils/adminApiService'
import { useAdminAuth } from './useAdminAuth'

export const OrderContext = createContext()

export const useOrder = () => {
  const context = useContext(OrderContext)
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider')
  }
  return context
}

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [lastFetch, setLastFetch] = useState(null)
  const { setOrderRefreshCallback } = useAdminAuth() || {}

  useEffect(() => {
    // Only fetch orders if admin token exists
    const token = localStorage.getItem('kk_admin_token')
    if (token && token !== 'undefined') {
      fetchOrders()
    }

    // Register refresh callback with AdminAuth
    if (setOrderRefreshCallback) {
      setOrderRefreshCallback(() => fetchOrders)
    }

    // Set up polling for real-time updates (every 30 seconds) - DISABLED for development
    // const interval = setInterval(() => {
    //   const token = localStorage.getItem('kk_admin_token')
    //   if (token && token !== 'undefined') {
    //     fetchOrders(true) // silent fetch
    //   }
    // }, 30000)

    // return () => clearInterval(interval)
  }, [])

  const fetchOrders = async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      
      const data = await adminApi.getOrders()
      const newOrders = data.data?.orders || data.data || data || []

      // Only update if orders have changed (check length and IDs)
      const hasChanged = orders.length !== newOrders.length || 
        !orders.every((order, index) => order._id === newOrders[index]?._id)
      
      if (hasChanged) {
        setOrders(newOrders)
        setLastFetch(new Date())
        console.log(`📋 Orders updated: ${newOrders.length} orders (from real API)`)
      }
    } catch (error) {
      console.error('❌ Error loading orders:', error.message)
      // Don't clear orders on silent fetch errors to prevent UI flicker
      if (!silent) {
        setOrders([])
      }
    } finally {
      if (!silent) setLoading(false)
    }
  }

  // CREATE ORDER (for customers)
  const createOrder = async (orderData) => {
    try {
      console.log('📦 Creating order:', orderData)

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to create order')

      console.log('✅ Order created:', data)

      // Refresh orders if admin is logged in
      const token = localStorage.getItem('kk_admin_token')
      if (token && token !== 'undefined') {
        fetchOrders(true) // silent refresh
      }

      return { success: true, order: data.data }
    } catch (error) {
      console.error('❌ Order creation failed:', error)
      return { success: false, error: error.message }
    }
  }

  // UPDATE STATUS (Admin only)
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const data = await adminApi.updateOrderStatus(orderId, newStatus)

      setOrders(prev =>
        prev.map(o => (o._id === orderId ? data.data : o))
      )

      console.log(`📋 Order ${orderId} status updated to ${newStatus}`)
      return { success: true }
    } catch (error) {
      console.error('❌ Status update failed:', error)
      return { success: false, error: error.message }
    }
  }

  // DELETE ORDER (Admin only)
  const deleteOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('kk_admin_token')
      if (!token) {
        return { success: false, error: 'Admin authentication required' }
      }

      await fetch(`${API_URL}/${orderId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setOrders(prev => prev.filter(o => o._id !== orderId))
      console.log(`🗑️ Order ${orderId} deleted`)
      return { success: true }
    } catch (error) {
      console.error('❌ Delete failed:', error)
      return { success: false, error: error.message }
    }
  }

  // GET STATS
  const getStats = () => ({
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  })

  // Refresh orders (call after login)
  const refreshOrders = () => {
    fetchOrders()
  }

  // Force refresh (manual)
  const forceRefresh = () => {
    console.log('🔄 Force refreshing orders...')
    fetchOrders()
  }

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        lastFetch,
        createOrder,
        updateOrderStatus,
        deleteOrder,
        getStats,
        refreshOrders,
        forceRefresh
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}