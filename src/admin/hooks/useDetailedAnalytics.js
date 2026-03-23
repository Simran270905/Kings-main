import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../../config/api'

export const useDetailedAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    monthlyData: [],
    topProducts: [],
    recentOrders: [],
    revenueStats: {
      thisMonthRevenue: 0,
      lastMonthRevenue: 0,
      revenueGrowth: 0
    },
    loading: true,
    error: null
  })

  const fetchAnalytics = async () => {
    try {
      setAnalytics(prev => ({ ...prev, loading: true, error: null }))
      
      // Get basic stats
      const statsResponse = await fetch(`${API_BASE_URL}/orders/stats`)
      const statsData = await statsResponse.json()
      
      if (!statsResponse.ok || !statsData.success) {
        throw new Error(statsData.message || 'Failed to fetch stats')
      }
      
      const stats = statsData.data
      
      // Debug logging to understand the data structure
      console.log('🔍 Live Server Data Structure:', {
        fullResponse: statsData,
        stats: stats,
        revenue: stats.revenue,
        totalOrders: stats.total,
        paymentStatus: stats.paymentStatus,
        delivered: stats.delivered,
        hasPaymentStatus: !!stats.paymentStatus,
        hasPaidOrders: !!(stats.paymentStatus?.paid)
      })
      
      // Calculate additional metrics with safe checks
      const paidOrders = stats.paymentStatus?.paid || 0
      const averageOrderValue = paidOrders > 0 
        ? Math.round(stats.revenue / paidOrders)
        : stats.delivered > 0 
          ? Math.round(stats.revenue / stats.delivered) // Fallback to delivered orders
          : 0
      
      const conversionRate = stats.total > 0
        ? ((stats.delivered / stats.total) * 100).toFixed(1)
        : '0.0'
      
      // Mock monthly data (since backend doesn't provide it yet)
      const monthlyData = [
        { month: 'Oct 2025', orders: stats.total * 0.2, revenue: stats.revenue * 0.15 },
        { month: 'Nov 2025', orders: stats.total * 0.25, revenue: stats.revenue * 0.2 },
        { month: 'Dec 2025', orders: stats.total * 0.3, revenue: stats.revenue * 0.25 },
        { month: 'Jan 2026', orders: stats.total * 0.15, revenue: stats.revenue * 0.2 },
        { month: 'Feb 2026', orders: stats.total * 0.1, revenue: stats.revenue * 0.2 },
      ]
      
      setAnalytics({
        totalRevenue: stats.revenue || 0,
        totalOrders: stats.total || 0,
        totalCustomers: stats.total || 0, // Approximation
        averageOrderValue,
        conversionRate: parseFloat(conversionRate),
        monthlyData,
        topProducts: [], // Would need separate API call
        recentOrders: [], // Would need separate API call
        revenueStats: {
          thisMonthRevenue: stats.revenue * 0.6, // Approximation
          lastMonthRevenue: stats.revenue * 0.4, // Approximation
          revenueGrowth: 50 // Approximation
        },
        loading: false,
        error: null
      })
      
      console.log('📊 Detailed Analytics Updated:', {
        revenue: stats.revenue,
        totalOrders: stats.total,
        deliveredOrders: stats.delivered,
        paidOrders: paidOrders,
        averageOrderValue,
        source: 'Live Backend API'
      })
      
    } catch (error) {
      console.error('❌ Analytics fetch error:', error)
      setAnalytics(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }))
    }
  }

  useEffect(() => {
    fetchAnalytics()
    
    // Poll every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000)
    return () => clearInterval(interval)
  }, [])

  const refresh = () => {
    console.log('🔄 Refreshing detailed analytics...')
    fetchAnalytics()
  }

  return {
    ...analytics,
    refresh
  }
}
