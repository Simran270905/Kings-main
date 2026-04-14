import { useState, useEffect } from 'react'
import { API_BASE_URL } from '@config/api.js'

export const useAnalytics = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    revenue: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    loading: true,
    error: null
  })

  const fetchStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: null }))
      
      // Use the backend API directly - this has the correct revenue calculation
      const response = await fetch(`${API_BASE_URL}/orders/stats`)
      
      if (!response) {
        throw new Error('No response from server')
      }
      
      const data = await response.json()
      
      if (!data) {
        throw new Error('Invalid response from server')
      }
      
      if (response.ok && data.success) {
        setStats({
          totalOrders: data.data.total || 0,
          revenue: data.data.revenue || 0,
          pendingOrders: data.data.pending || 0,
          processingOrders: data.data.processing || 0,
          shippedOrders: data.data.shipped || 0,
          deliveredOrders: data.data.delivered || 0,
          cancelledOrders: data.data.cancelled || 0,
          loading: false,
          error: null
        })
        
        console.log('📊 Analytics updated from backend:', {
          revenue: data.data.revenue,
          totalOrders: data.data.total,
          paymentStatus: data.data.paymentStatus || 'Not available',
          deliveredOrders: data.data.delivered,
          source: 'Backend API'
        })
      } else {
        throw new Error(data.message || 'Failed to fetch stats')
      }
    } catch (error) {
      console.error('❌ Analytics fetch error:', error)
      setStats(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }))
    }
  }

  useEffect(() => {
    fetchStats()
    
    // Poll every 30 seconds for real-time updates
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const refresh = () => {
    fetchStats()
  }

  return {
    ...stats,
    refresh
  }
}
