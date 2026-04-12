// Utility functions for analytics (backend-ready)

/**
 * Format currency
 */
export const formatCurrency = (amount) => {
  return `₹${(amount || 0).toLocaleString()}`
}

/**
 * Calculate trend percentage
 */
export const formatTrend = (current, previous) => {
  if (!previous || previous === 0) {
    return { change: '+0%', trend: 'up' }
  }

  const change = ((current - previous) / previous * 100).toFixed(1)

  return {
    change: `${change > 0 ? '+' : ''}${change}%`,
    trend: change > 0 ? 'up' : 'down'
  }
}

/**
 * Calculate analytics from REAL orders (from backend)
 */
export const calculateAnalyticsFromOrders = (orders = [], products = []) => {
  const completedOrders = orders.filter(o => o.status === 'delivered' || o.status === 'completed')

  const totalRevenue = completedOrders.reduce(
    (sum, order) => sum + (order.totalAmount || 0),
    0
  )

  const totalOrders = completedOrders.length

  const averageOrderValue =
    totalOrders > 0 ? totalRevenue / totalOrders : 0

  // Monthly grouping
  const monthlyData = {}

  completedOrders.forEach(order => {
    const date = new Date(order.createdAt)

    const month = date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    })

    if (!monthlyData[month]) {
      monthlyData[month] = { orders: 0, revenue: 0 }
    }

    monthlyData[month].orders += 1
    monthlyData[month].revenue += order.totalAmount || 0
  })

  const monthlyArray = Object.entries(monthlyData).map(([month, data]) => ({
    month,
    ...data,
  }))

  // Last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const recentOrders = completedOrders.filter(
    o => new Date(o.createdAt) > sevenDaysAgo
  )

  const recentRevenue = recentOrders.reduce(
    (sum, order) => sum + (order.totalAmount || 0),
    0
  )

  return {
    totalProducts: products.length,
    totalOrders,
    totalRevenue,
    averageOrderValue,
    recentOrders: recentOrders.length,
    recentRevenue,
    monthlyData: monthlyArray,
    conversionRate:
      products.length > 0
        ? ((totalOrders / products.length) * 100).toFixed(1)
        : 0,
  }
}
