// 📊 Real Analytics Hook - Connected to backend admin analytics
import { useState, useEffect, useCallback } from 'react'
import adminApi from '../utils/adminApiService'

export const useAnalytics = () => {
  const [data, setData] = useState({
    revenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    avgOrderValue: 0,
    repeatCustomers: 0,
    totalCustomers: 0
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastFetch, setLastFetch] = useState(null)

  // Fetch analytics data from backend
  const fetchAnalytics = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      setError(null)

      let analyticsData

      // First try to get comprehensive admin analytics
      try {
        console.log('🔄 Fetching admin analytics with params:', { 
          range: '30', 
          period: 'daily',
          validate: 'false',
          strictPopulate: 'false'
        });
        
        analyticsData = await adminApi.getAnalytics({ 
          range: '30', 
          period: 'daily',
          validate: 'false',
          strictPopulate: 'false'
        })
        
        console.log('✅ Admin analytics response:', analyticsData);
      } catch (adminAnalyticsError) {
        console.error('❌ Admin analytics failed:', adminAnalyticsError.message)
        console.error('Full error:', adminAnalyticsError)
        
        // Fallback to public stats endpoint
        try {
          const statsData = await adminApi.getOrderStats()
          
          if (!statsData) {
            throw new Error('No response from stats API')
          }
          
          if (statsData.success) {
            // Transform public stats to match admin analytics format
            analyticsData = {
              success: true,
              data: {
                summary: {
                  totalRevenue: statsData.data.revenue || 0,
                  totalOrders: statsData.data.total || 0,
                  totalCustomers: 0, // Not available in public stats
                  avgOrderValue: statsData.data.paymentStatus?.paid > 0 
                    ? Math.round(statsData.data.revenue / statsData.data.paymentStatus.paid) 
                    : statsData.data.delivered > 0
                      ? Math.round(statsData.data.revenue / statsData.data.delivered)
                      : 0,
                  totalProductsSold: 0, // Not available in public stats
                  repeatCustomers: 0, // Not available in public stats
                },
                statusBreakdown: {
                  pending: statsData.data.pending || 0,
                  processing: statsData.data.processing || 0,
                  shipped: statsData.data.shipped || 0,
                  delivered: statsData.data.delivered || 0,
                  cancelled: statsData.data.cancelled || 0,
                },
                paymentStatusBreakdown: statsData.data.paymentStatus || {},
                dateData: {}, // Not available in public stats
                topSellingProducts: [], // Not available in public stats
                recentOrders: [], // Not available in public stats
              }
            }
          }
        } catch (statsError) {
          console.error('❌ Both admin and public analytics failed:', statsError.message)
          throw new Error('Failed to fetch analytics from all available endpoints')
        }
      }

      if (analyticsData && analyticsData.success) {
        const summary = analyticsData.data?.summary || {}
        const statusBreakdown = analyticsData.data?.statusBreakdown || {}
        
        // Calculate metrics from real data
        const processedData = {
          revenue: summary.totalRevenue || 0,
          totalOrders: summary.totalOrders || 0,
          totalUsers: summary.totalCustomers || 0,
          pendingOrders: statusBreakdown.pending || 0,
          processingOrders: statusBreakdown.processing || 0,
          shippedOrders: statusBreakdown.shipped || 0,
          deliveredOrders: statusBreakdown.delivered || 0,
          cancelledOrders: statusBreakdown.cancelled || 0,
          totalProducts: 0, // Will be fetched separately
          lowStockProducts: 0, // Will be fetched separately
          avgOrderValue: summary.avgOrderValue || 0,
          repeatCustomers: summary.repeatCustomers || 0,
          totalCustomers: summary.totalCustomers || 0
        }

        // Get product stats
        try {
          const productStats = await adminApi.getProductStats()
          if (productStats.success) {
            processedData.totalProducts = productStats.data?.totalProducts || 0
            processedData.lowStockProducts = productStats.data?.lowStockProducts || 0
          }
        } catch (productError) {
          console.warn('Failed to fetch product stats:', productError.message)
        }

        setData(processedData)
        setLastFetch(new Date())
        
        console.log('📊 Analytics loaded from backend:', {
          revenue: processedData.revenue,
          orders: processedData.totalOrders,
          customers: processedData.totalCustomers,
          source: analyticsData.data?.dateData ? 'admin API' : 'public stats API'
        })
      }
    } catch (err) {
      console.error('❌ Analytics fetch error:', err.message)
      setError(err.message)
      
      // Set fallback values
      setData(prev => ({
        ...prev,
        revenue: 0,
        totalOrders: 0,
        pendingOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0
      }))
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  // Refresh function
  const refresh = useCallback(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  // Get chart data
  const getChartData = useCallback(async (period = 'daily', days = 30) => {
    try {
      // Try admin analytics first for chart data
      try {
        const analyticsData = await adminApi.getAnalytics({ 
          range: days.toString(), 
          period,
          validate: 'false',
          strictPopulate: 'false'
        })
        
        if (analyticsData.success) {
          const dateData = analyticsData.data?.dateData || {}
          
          // Transform for charts
          const chartData = Object.entries(dateData)
            .map(([date, data]) => {
              console.log(`📊 Chart data for ${date}:`, data);
              return {
                date,
                orders: data.orders || 0,
                revenue: data.revenue || 0,
                customers: data.customers || 0,
                avgOrderValue: data.avgOrderValue || 0
              };
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .reverse() // Most recent first

          return chartData
        }
      } catch (adminError) {
        console.warn('⚠️ Admin chart data failed, using fallback:', adminError.message)
      }

      // Fallback: return empty array instead of mock data
      console.warn('⚠️ Admin chart data failed and no fallback available')
      return []
    } catch (error) {
      console.error('❌ Chart data fetch error:', error.message)
      return []
    }
  }, [data])

  // Get top selling products
  const getTopProducts = useCallback(async () => {
    try {
      // Try admin analytics first
      try {
        const analyticsData = await adminApi.getAnalytics()
        
        if (analyticsData.success) {
          return analyticsData.data?.topSellingProducts || []
        }
      } catch (adminError) {
        console.warn('⚠️ Admin top products failed, using fallback:', adminError.message)
      }

      // Fallback: return empty array (top products not available in public stats)
      return []
    } catch (error) {
      console.error('❌ Top products fetch error:', error.message)
      return []
    }
  }, [])

  // Get revenue validation
  const validateRevenue = useCallback(async () => {
    try {
      // Try admin analytics first
      try {
        const validation = await adminApi.validateRevenue()
        
        if (validation.success) {
          return validation.data
        }
      } catch (adminError) {
        console.warn('⚠️ Admin revenue validation failed, not available in fallback:', adminError.message)
      }

      // Fallback: return null (revenue validation not available in public stats)
      return null
    } catch (error) {
      console.error('❌ Revenue validation error:', error.message)
      return null
    }
  }, [])

  return {
    data,
    loading,
    error,
    lastFetch,
    refresh,
    fetchAnalytics,
    getChartData,
    getTopProducts,
    validateRevenue
  }
}

export default useAnalytics
