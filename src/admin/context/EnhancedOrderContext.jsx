import React, { createContext, useContext, useState, useEffect } from 'react'
import adminApi from '../utils/adminApiService'

export const EnhancedOrderContext = createContext()

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
    try {
      // Use adminApi for authenticated requests
      const data = await adminApi.getOrders()
      
      if (data.success) {
        const newOrders = Array.isArray(data.data?.orders) ? data.data.orders : 
                        Array.isArray(data.data) ? data.data : []
        
        // Only update if orders have changed
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
            },
            paymentMethodBreakdown: {
              cod: newOrders.filter(o => o.paymentMethod === 'cod').length,
              razorpay: newOrders.filter(o => o.paymentMethod === 'razorpay').length,
              card: newOrders.filter(o => o.paymentMethod === 'card').length,
              upi: newOrders.filter(o => o.paymentMethod === 'upi').length
            }
          })
          setLastFetch(new Date())
          console.log(`📋 Enhanced Orders updated: ${newOrders.length} orders (using real API)`)
        }
      }
    } catch (error) {
      console.error('❌ Enhanced orders fetch error:', error.message)
      if (!silent) {
        setOrders([])
        setLoading(false)
      }
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
        
        console.log(`💰 COD order marked as paid: ${orderId}`)
        return data.data
      } else {
        throw new Error(data.message || 'Failed to mark COD order as paid')
      }
    } catch (error) {
      console.error('❌ COD payment marking error:', error.message)
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

  // Initial fetch and polling
  useEffect(() => {
    const token = localStorage.getItem('kk_admin_token')
    if (token && token !== 'undefined') {
      fetchOrders()
    }

    // Poll every 30 seconds for real-time updates
    const interval = setInterval(() => {
      const token = localStorage.getItem('kk_admin_token')
      if (token && token !== 'undefined') {
        fetchOrders(true) // silent fetch
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  // Refetch when filters change
  useEffect(() => {
    const token = localStorage.getItem('kk_admin_token')
    if (token && token !== 'undefined') {
      fetchOrders()
    }
  }, [filters])

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
