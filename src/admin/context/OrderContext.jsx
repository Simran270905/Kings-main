import React, { createContext, useContext, useState, useEffect } from 'react'
import adminApi from '../utils/adminApiService'
import { useAdminAuth } from './useAdminAuth.jsx'
import { extractData, extractPagination, logApiCall, logApiResponse } from '../../utils/dataExtractionHelper.js'
import { API_BASE_URL } from '../../config/api.js'

export const OrderContext = createContext({
  orders: [],
  loading: false,
  error: null,
  pagination: null,
  fetchOrders: () => {},
  createOrder: () => {},
  updateOrder: () => {},
  deleteOrder: () => {},
  getOrderById: () => null,
  updateOrderStatus: () => {},
  setFilters: () => {},
  setPage: () => {}
})

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
  const [error, setError] = useState(null)
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

  // ✅ FETCH ALL ORDERS (with standardized data extraction)
  const fetchOrders = async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      
      logApiCall('/orders', 'GET')
      const data = await adminApi.getOrders()
      logApiResponse('/orders', data)
      
      // ✅ Use standardized data extraction
      const newOrders = extractData(data)
      console.log("📊 Extracted orders:", newOrders)
      console.log("📊 Extracted orders type:", typeof newOrders)
      console.log("📊 Extracted orders isArray:", Array.isArray(newOrders))
      console.log("📊 Extracted orders length:", newOrders?.length)
      const pagination = extractPagination(data)
      
      // ✅ Always update orders, even if empty
      const hasChanged = orders.length !== newOrders.length || 
        !orders.every((order, index) => order._id === newOrders[index]?._id)
      
      if (hasChanged || newOrders.length === 0) {
        setOrders(newOrders)
        setLastFetch(new Date())
        console.log(`📋 Orders updated: ${newOrders.length} orders (from real API)`)
      } else {
        console.log("📋 Orders unchanged, skipping update")
      }
    } catch (error) {
      console.error('❌ Error loading orders:', error.message)
      setError(error.message)
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
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to create order')

      console.log('✅ Order created:', data)

      // Refresh orders if admin is logged in
      const adminToken = localStorage.getItem('kk_admin_token')
      if (adminToken && adminToken !== 'undefined') {
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

      await fetch(`${API_BASE_URL}/orders/${orderId}`, {
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
  const getStats = () => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => {
      return sum + (o.totalAmount || 0);
    }, 0);
    const paidOrders = orders.filter(o => o.paymentStatus === 'paid').length;
    const pendingOrders = orders.filter(o => o.paymentStatus !== 'paid').length;
    
    // Status-based stats
    const pendingStatusOrders = orders.filter(o => o.status === 'pending').length;
    const processingOrders = orders.filter(o => o.status === 'processing').length;
    const shippedOrders = orders.filter(o => o.status === 'shipped').length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;

    return {
      total: totalOrders,
      totalRevenue,
      paidOrders,
      pendingOrders,
      pending: pendingStatusOrders,
      processing: processingOrders,
      shipped: shippedOrders,
      delivered: deliveredOrders,
      cancelled: cancelledOrders
    };
  }

  // Refresh orders (call after login)
  const refreshOrders = () => {
    fetchOrders()
  }

  // Force refresh (manual)
  const forceRefresh = () => {
    fetchOrders()
  }

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        error,
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

// Default export for better Fast Refresh compatibility
export default OrderProvider