import React, { createContext, useContext, useState, useEffect } from 'react'
import adminApi from '../utils/adminApiService'

export const EnhancedOrderContext = createContext({
  orders: [],
  loading: false,
  error: null,
  stats: null,
  refreshOrders: () => {},
  updateOrderStatus: () => {},
  bulkUpdateOrders: () => {},
  getOrderStats: () => null,
  searchOrders: () => [],
  filterOrders: () => []
})

export const useEnhancedOrder = () => {
  const context = useContext(EnhancedOrderContext)
  if (!context) {
    throw new Error('useEnhancedOrder must be used within an EnhancedOrderProvider')
  }
  return context
}

export const EnhancedOrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [lastFetch, setLastFetch] = useState(null)
  const [initialized, setInitialized] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    paymentMethod: '',
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    paymentStatusBreakdown: {},
    paymentMethodBreakdown: {}
  })

  // Fetch orders with enhanced payment details
  const fetchOrders = async (silent = false) => {
    // Prevent duplicate calls
    if (loading && !silent) return
    
    try {
      if (!silent) setLoading(true)
      
      // Use adminApi for authenticated requests
      const data = await adminApi.getOrders()
      
      if (data.success) {
        const newOrders = Array.isArray(data.data?.orders) ? data.data.orders : 
                        Array.isArray(data.data) ? data.data : []
        
        // Enhanced orders now have customer objects, not userId
        // So we don't need to populate anything - the customer data is already included
        const hasChanged = orders.length !== newOrders.length || 
          !orders.every((order, index) => order._id === newOrders[index]?._id)
        
        if (hasChanged) {
          setOrders(newOrders)
          setStats({
            totalOrders: newOrders.length,
            totalRevenue: newOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
            paymentStatusBreakdown: {
              paid: newOrders.filter(o => o.paymentStatus === 'paid').length,
              pending: newOrders.filter(o => o.paymentStatus === 'pending').length,
              failed: newOrders.filter(o => o.paymentStatus === 'failed').length,
              refunded: newOrders.filter(o => o.paymentStatus === 'refunded').length
            }
          })
          setLastFetch(new Date())
          console.log(`📋 Enhanced Orders updated: ${newOrders.length} orders (using real API)`)
        }
      }
    } catch (error) {
      console.error('Enhanced orders fetch error:', error.message)
      
      // BUG 4: Stop retrying on session expired error
      if (error.message?.includes('Session expired') || 
          error.message?.includes('login again')) {
        console.log('Session expired - clearing token and stopping retries')
        localStorage.removeItem('kk_admin_token')
        if (!silent) {
          setOrders([])
          setLoading(false)
        }
        return // Don't retry
      }
      
      if (!silent) {
        setOrders([])
        setLoading(false)
      }
    } finally {
      if (!silent) setLoading(false)
    }
  }

  // Fetch single order details
  const getOrderDetails = async (orderId) => {
    try {
      const data = await adminApi.getOrder(orderId)
      
      if (data.success) {
        return data.data
      } else {
        throw new Error(data.message || 'Failed to fetch order')
      }
    } catch (error) {
      console.error('❌ Order details fetch error:', error.message)
      throw error
    }
  }

  // Update order status
  const updateOrderStatus = async (orderId, status) => {
    try {
      const data = await adminApi.updateOrderStatus(orderId, status)

      if (data.success) {
        // Update the specific order in the list
        setOrders(prev =>
          prev.map(o => o._id === orderId ? { ...o, status } : o)
        )
        
        // Update stats
        await fetchOrders(true)
        
        console.log(`Order status updated: ${orderId} -> ${status}`)
        return { success: true }
      } else {
        throw new Error(data.message || 'Failed to update order status')
      }
    } catch (error) {
      console.error('Order status update error:', error.message)
      return { success: false, error: error.message }
    }
  }

  // Mark COD order as paid
  const markCODOrderAsPaid = async (orderId, options = {}) => {
    try {
      const data = await adminApi.markCODOrderAsPaid(orderId, options)

      if (data.success) {
        // Update the specific order in the list
        setOrders(prev =>
          prev.map(o => o._id === orderId ? { ...o, ...data.data } : o)
        )
        
        // Update stats
        await fetchOrders(true)
        
        console.log(`COD order marked as paid: ${orderId}`)
        return data.data
      } else {
        throw new Error(data.message || 'Failed to mark COD order as paid')
      }
    } catch (error) {
      console.error('COD payment marking error:', error.message)
      throw error
    }
  }

  // Update filters
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 })) // Reset to page 1 when filters change
  }

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: '',
      paymentStatus: '',
      paymentMethod: '',
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
  }

  // Export payment reports
  const exportPaymentReports = async (exportOptions = {}) => {
    try {
      // TODO: Implement export when enhanced backend is deployed
      console.log('Export functionality will be available when backend is updated')
      alert('Export functionality will be available after backend deployment')
    } catch (error) {
      console.error('❌ Export error:', error.message)
      throw error
    }
  }

  // Initial fetch and polling - FIXED: Prevent duplicate calls
  useEffect(() => {
    if (initialized) return // Prevent multiple initializations
    
    const token = localStorage.getItem('kk_admin_token')
    if (token && token !== 'undefined') {
      setInitialized(true)
      fetchOrders()
    }
  }, [])

  // Refetch when filters change - FIXED: Only after initialization
  useEffect(() => {
    if (!initialized) return // Wait for initialization first
    
    const token = localStorage.getItem('kk_admin_token')
    if (token && token !== 'undefined') {
      fetchOrders(true) // Silent fetch for filter changes
    }
  }, [filters, initialized])

  // Auto-refresh orders every 30 seconds for real-time updates
  useEffect(() => {
    if (!initialized) return // Wait for initialization first
    
    const token = localStorage.getItem('kk_admin_token')
    if (!token || token === 'undefined') return

    // Set up polling interval
    const interval = setInterval(() => {
      fetchOrders(true) // Silent fetch every 30 seconds
    }, 30000) // 30 seconds

    // Cleanup interval on unmount
    return () => clearInterval(interval)
  }, [initialized])

  return (
    <EnhancedOrderContext.Provider
      value={{
        orders,
        loading,
        lastFetch,
        filters,
        stats,
        fetchOrders,
        getOrderDetails,
        updateOrderStatus,
        markCODOrderAsPaid,
        updateFilters,
        resetFilters,
        exportPaymentReports
      }}
    >
      {children}
    </EnhancedOrderContext.Provider>
  )
}

export default EnhancedOrderProvider
