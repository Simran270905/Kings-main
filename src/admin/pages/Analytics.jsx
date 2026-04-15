import React, { useState, useEffect } from 'react'
import { api } from '../../config/api.js'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UsersIcon,
  TruckIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280']

const Analytics = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeRange, setTimeRange] = useState('30days')
  const [groupBy, setGroupBy] = useState('day')
  
  // Analytics data
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    paidOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
    avgOrderValue: 0,
    totalItemsSold: 0,
    newCustomers: 0
  })
  
  const [revenueChart, setRevenueChart] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [orderStatusBreakdown, setOrderStatusBreakdown] = useState([])
  const [shippingPerformance, setShippingPerformance] = useState({
    avgDeliveryDays: 0,
    onTimeDeliveryRate: 0,
    returnRate: 0,
    courierBreakdown: []
  })

  // Format price
  const formatPrice = (value) => {
    const num = Number(value)
    return `Rs.${(isNaN(num) ? 0 : num).toLocaleString("en-IN")}`
  }

  // Format percentage
  const formatPercentage = (value) => {
    return `${Number(value).toFixed(1)}%`
  }

  // Get date range based on timeRange
  const getDateRange = () => {
    const now = new Date()
    const ranges = {
      '7days': { from: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), to: now },
      '30days': { from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), to: now },
      '90days': { from: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), to: now },
      'custom': { from: null, to: null }
    }
    return ranges[timeRange] || ranges['30days']
  }

  // Fetch analytics summary
  const fetchSummary = async () => {
    try {
      const { from, to } = getDateRange()
      const params = new URLSearchParams()
      if (from) params.append('from', from.toISOString())
      if (to) params.append('to', to.toISOString())

      const response = await api.get(`/admin/analytics/summary?${params}`)
      setSummary(response.data.summary)
    } catch (err) {
      console.error('Error fetching summary:', err)
    }
  }

  // Fetch revenue chart
  const fetchRevenueChart = async () => {
    try {
      const { from, to } = getDateRange()
      const params = new URLSearchParams()
      params.append('groupBy', groupBy)
      if (from) params.append('from', from.toISOString())
      if (to) params.append('to', to.toISOString())

      const response = await api.get(`/admin/analytics/revenue-chart?${params}`)
      setRevenueChart(response.data.chartData)
    } catch (err) {
      console.error('Error fetching revenue chart:', err)
    }
  }

  // Fetch top products
  const fetchTopProducts = async () => {
    try {
      const { from, to } = getDateRange()
      const params = new URLSearchParams()
      params.append('limit', 10)
      if (from) params.append('from', from.toISOString())
      if (to) params.append('to', to.toISOString())

      const response = await api.get(`/admin/analytics/top-products?${params}`)
      setTopProducts(response.data.topProducts)
    } catch (err) {
      console.error('Error fetching top products:', err)
    }
  }

  // Fetch order status breakdown
  const fetchOrderStatusBreakdown = async () => {
    try {
      const { from, to } = getDateRange()
      const params = new URLSearchParams()
      if (from) params.append('from', from.toISOString())
      if (to) params.append('to', to.toISOString())

      const response = await api.get(`/admin/analytics/order-status-breakdown?${params}`)
      setOrderStatusBreakdown(response.data.breakdown)
    } catch (err) {
      console.error('Error fetching order status breakdown:', err)
    }
  }

  // Fetch shipping performance
  const fetchShippingPerformance = async () => {
    try {
      const { from, to } = getDateRange()
      const params = new URLSearchParams()
      if (from) params.append('from', from.toISOString())
      if (to) params.append('to', to.toISOString())

      const response = await api.get(`/admin/analytics/shipping-performance?${params}`)
      setShippingPerformance(response.data.shippingPerformance)
    } catch (err) {
      console.error('Error fetching shipping performance:', err)
    }
  }

  // Export analytics data
  const exportAnalytics = async () => {
    try {
      const { from, to } = getDateRange()
      const params = new URLSearchParams()
      if (from) params.append('from', from.toISOString())
      if (to) params.append('to', to.toISOString())

      const response = await api.get(`/admin/analytics/export?${params}`, {
        responseType: 'blob'
      })

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `analytics-${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError('Failed to export analytics data')
      console.error('Error exporting analytics:', err)
    }
  }

  // Fetch all analytics data
  const fetchAllAnalytics = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchSummary(),
        fetchRevenueChart(),
        fetchTopProducts(),
        fetchOrderStatusBreakdown(),
        fetchShippingPerformance()
      ])
      setError(null)
    } catch (err) {
      setError('Failed to fetch analytics data')
      console.error('Error fetching analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllAnalytics()
  }, [timeRange, groupBy])

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
          </select>
          <button
            onClick={exportAnalytics}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchAllAnalytics}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(summary.totalRevenue)}</p>
                </div>
                <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.totalOrders}</p>
                </div>
                <ShoppingBagIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(summary.avgOrderValue)}</p>
                </div>
                <ArrowTrendingUpIcon className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">New Customers</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.newCustomers}</p>
                </div>
                <UsersIcon className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Revenue Over Time</h2>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatPrice(value)} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" name="Revenue" />
                <Line type="monotone" dataKey="orders" stroke="#10B981" name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Status Breakdown */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status Breakdown</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={orderStatusBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percentage }) => `${status}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {orderStatusBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top Products */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h2>
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div key={product._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="font-semibold text-gray-500">#{index + 1}</span>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.unitsSold} units sold</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatPrice(product.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Shipping Performance */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-500">Avg Delivery Days</p>
                <p className="text-2xl font-bold text-gray-900">{shippingPerformance.avgDeliveryDays}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">On-Time Delivery Rate</p>
                <p className="text-2xl font-bold text-green-600">{formatPercentage(shippingPerformance.onTimeDeliveryRate)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Return Rate</p>
                <p className="text-2xl font-bold text-red-600">{formatPercentage(shippingPerformance.returnRate)}</p>
              </div>
            </div>
            
            {shippingPerformance.courierBreakdown.length > 0 && (
              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-3">Courier Performance</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Courier
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Shipments
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Avg Days
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {shippingPerformance.courierBreakdown.map((courier, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900">{courier._id}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{courier.shipments}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{courier.avgDays.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Analytics
