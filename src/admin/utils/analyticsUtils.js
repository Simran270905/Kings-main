/**
 * analyticsUtils.js — Synchronous analytics computed from orders array
 * Used by Dashboard.jsx and Analytics.jsx which already have orders in state.
 */

export const calculateTotalStats = (orders = []) => {
  const delivered = orders.filter(o => o.status === 'delivered')
  const totalRevenue = delivered.reduce((sum, o) => sum + (o.totalAmount || o.totals?.total || 0), 0)
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthOrders = delivered.filter(o => new Date(o.createdAt) >= monthStart)
  const monthRevenue = monthOrders.reduce((sum, o) => sum + (o.totalAmount || o.totals?.total || 0), 0)

  return {
    totalOrders: orders.length,
    totalRevenue,
    averageOrderValue: delivered.length > 0 ? Math.round(totalRevenue / delivered.length) : 0,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    processingOrders: orders.filter(o => o.status === 'processing').length,
    shippedOrders: orders.filter(o => o.status === 'shipped').length,
    deliveredOrders: delivered.length,
    cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
    monthOrders: monthOrders.length,
    monthRevenue,
  }
}

export const getRevenueStats = (orders = []) => {
  const delivered = orders.filter(o => o.status === 'delivered')
  const totalRevenue = delivered.reduce((sum, o) => sum + (o.totalAmount || o.totals?.total || 0), 0)

  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const thisMonthRevenue = delivered
    .filter(o => new Date(o.createdAt) >= thisMonthStart)
    .reduce((sum, o) => sum + (o.totalAmount || o.totals?.total || 0), 0)

  const lastMonthRevenue = delivered
    .filter(o => {
      const d = new Date(o.createdAt)
      return d >= lastMonthStart && d < thisMonthStart
    })
    .reduce((sum, o) => sum + (o.totalAmount || o.totals?.total || 0), 0)

  const revenueGrowth = lastMonthRevenue > 0
    ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
    : 0

  return { totalRevenue, thisMonthRevenue, lastMonthRevenue, revenueGrowth }
}

export const getMonthlySalesData = (orders = []) => {
  const months = {}
  orders.forEach(o => {
    const d = new Date(o.createdAt)
    const key = d.toLocaleString('default', { month: 'short', year: 'numeric' })
    if (!months[key]) months[key] = { month: key, orders: 0, revenue: 0 }
    months[key].orders += 1
    if (o.status === 'delivered') {
      months[key].revenue += o.totalAmount || o.totals?.total || 0
    }
  })
  return Object.values(months).slice(-6)
}

export const getTopProducts = (limit = 5, orders = []) => {
  const productMap = {}
  orders.forEach(o => {
    (o.items || []).forEach(item => {
      const id = item._id || item.id || item.name
      if (!productMap[id]) productMap[id] = { name: item.name || item.title, sales: 0, revenue: 0 }
      productMap[id].sales += item.quantity || 1
      productMap[id].revenue += (item.price || 0) * (item.quantity || 1)
    })
  })
  return Object.values(productMap)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, limit)
}

export const getCustomerStats = (orders = []) => {
  const emails = new Set(orders.map(o => o.customer?.email || o.shippingAddress?.email).filter(Boolean))
  return { uniqueCustomers: emails.size, totalOrders: orders.length }
}

export const getRecentOrders = (limit = 10, orders = []) => {
  return [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit)
}

export const getConversionRate = (orders = []) => {
  const total = orders.length
  const completed = orders.filter(o => o.status === 'delivered').length
  return total > 0 ? ((completed / total) * 100).toFixed(1) : '0.0'
}
