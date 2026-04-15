import { useState, useEffect } from 'react'
import { useAdminProduct } from '../context/AdminProductContext'
import useRealAnalytics from '../hooks/useRealAnalytics'
import AdminCard from './AdminCard'
import AdminButton from './AdminButton'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'

import {
  ChartBarIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'

const TrendingUpIcon = ArrowUpIcon
const TrendingDownIcon = ArrowDownIcon

export default function Analytics() {
  const { products } = useAdminProduct()
  const analytics = useRealAnalytics()

  const [timeRange, setTimeRange] = useState('30days')
  const [selectedMetric, setSelectedMetric] = useState('revenue')
  const [chartData, setChartData] = useState([])
  const [topProducts, setTopProducts] = useState([])

  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString('en-IN')}`
  }

  const formatNumber = (num) => {
    return (num || 0).toLocaleString('en-IN')
  }

  // Fetch chart data when component mounts or time range changes
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const data = await analytics.getChartData('daily', 30)
        setChartData(data)
      } catch (error) {
        console.error('Failed to fetch chart data:', error)
      }
    }

    fetchChartData()
  }, [timeRange, analytics.getChartData])

  // Fetch top products
  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const products = await analytics.getTopProducts()
        setTopProducts(products)
      } catch (error) {
        console.error('Failed to fetch top products:', error)
      }
    }

    fetchTopProducts()
  }, [analytics.getTopProducts])

  // Real pie data from analytics
  const pieData = [
    { name: 'Delivered', value: analytics.data.deliveredOrders, color: '#10b981' },
    { name: 'Processing', value: analytics.data.processingOrders, color: '#3b82f6' },
    { name: 'Pending', value: analytics.data.pendingOrders, color: '#f59e0b' },
    { name: 'Cancelled', value: analytics.data.cancelledOrders, color: '#ef4444' },
  ].filter(item => item.value > 0)

  // Debug logging
  console.log('📊 Analytics Page Data (Real API):', {
    revenue: analytics.data.revenue,
    totalOrders: analytics.data.totalOrders,
    deliveredOrders: analytics.data.deliveredOrders,
    totalUsers: analytics.data.totalUsers,
    loading: analytics.loading,
    error: analytics.error,
    chartDataPoints: chartData.length,
    topProductsCount: topProducts.length,
    source: 'Backend API'
  })

  if (analytics.loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ae0b0b] mx-auto mb-4"></div>
            <p className="text-gray-500">Loading analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  if (analytics.error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading analytics</h3>
              <p className="mt-1 text-sm text-red-700">{analytics.error}</p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={analytics.refresh}
              className="bg-red-100 text-red-800 px-4 py-2 rounded text-sm font-medium hover:bg-red-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-2">
            Detailed insights into your business performance
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ae0b0b] focus:border-transparent"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="365days">Last year</option>
          </select>
          
          <button
            onClick={analytics.refresh}
            disabled={analytics.loading}
            className="px-4 py-2 bg-[#ae0b0b] text-white rounded-lg hover:bg-[#8f0a0a] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ArrowTrendingUpIcon className="h-4 w-4" />
            {analytics.loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Debug Info */}
      {import.meta.env.DEV && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Debug Information (Real API)</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <div>Revenue (Backend): ₹{analytics.data.revenue}</div>
            <div>Total Orders: {analytics.data.totalOrders}</div>
            <div>Total Users: {analytics.data.totalUsers}</div>
            <div>Average Order Value: ₹{analytics.data.avgOrderValue}</div>
            <div>Delivered Orders: {analytics.data.deliveredOrders}</div>
            <div>Pending Orders: {analytics.data.pendingOrders}</div>
            <div>Data Source: Backend Admin API</div>
            <div>Last Fetch: {analytics.lastFetch?.toLocaleString()}</div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.data.revenue)}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-green-600">From paid orders</span>
              </div>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </AdminCard>

        <AdminCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.data.totalOrders)}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-500">All time</span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </AdminCard>

        <AdminCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.data.avgOrderValue)}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-500">Per order</span>
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </AdminCard>

        <AdminCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.data.totalUsers)}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-500">Registered</span>
              </div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <UsersIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <AdminCard>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Bar dataKey="revenue" fill="#ae0b0b" />
            </BarChart>
          </ResponsiveContainer>
        </AdminCard>

        {/* Order Status Pie Chart */}
        <AdminCard>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </AdminCard>
      </div>

      {/* Daily Sales Table */}
      <AdminCard>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Sales (Last 30 Days)</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customers
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {chartData.slice(-10).reverse().map((day, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {new Date(day.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatNumber(day.orders)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(day.revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatNumber(day.customers)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>

      {/* Top Selling Products */}
      <AdminCard>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Units Sold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topProducts.slice(0, 10).map((product, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatNumber(product.totalQuantity)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(product.totalRevenue)}
                  </td>
                </tr>
              ))}
              {topProducts.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                    No product data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  )
}
