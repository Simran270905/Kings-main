import React, { useState, useEffect } from 'react'
import { API_BASE_URL } from '../../config/api.js'
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

// Helper function for API calls
const fetchAnalytics = async (endpoint, options = {}) => {
  const token = localStorage.getItem('kk_admin_token')
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  return response.json()
}

const Analytics = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeRange, setTimeRange] = useState('30')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  
  // Analytics data - REVAMPED with Orders as Single Source of Truth
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    totalSold: 0,
    uniqueCustomers: 0,
    daysRange: 30
  })
  
  const [dailySales, setDailySales] = useState([])
  const [revenueTrend, setRevenueTrend] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [statusStats, setStatusStats] = useState([])
  const [stockStats, setStockStats] = useState({
    inStock: 0,
    outOfStock: 0,
    lowStock: 0,
    totalProducts: 0
  })
  const [paymentMethods, setPaymentMethods] = useState([])

  // Format price
  const formatPrice = (value) => {
    const num = Number(value)
    return `Rs.${(isNaN(num) ? 0 : num).toLocaleString("en-IN")}`
  }

  // Format percentage
  const formatPercentage = (value) => {
    return `${Number(value).toFixed(1)}%`
  }

  // Fetch comprehensive analytics from REVAMPED API
  const fetchComprehensiveAnalytics = async () => {
    try {
      const params = new URLSearchParams()
      params.append('range', timeRange)
      params.append('period', 'daily')

      console.log(' Fetching comprehensive analytics from Orders API...')
      const response = await fetchAnalytics(`/admin/analytics?${params}`)
      
      if (response.success) {
        const data = response.data
        console.log(' Analytics data received:', data)
        
        // Update all analytics data with correct field mappings
        setSummary({
          totalRevenue: data.summary.totalRevenue || 0,
          totalOrders: data.summary.totalOrders || 0,
          avgOrderValue: data.summary.avgOrderValue || 0,
          totalSold: data.summary.totalProductsSold || 0, // Map totalProductsSold to totalSold
          uniqueCustomers: data.summary.totalCustomers || 0, // Map totalCustomers to uniqueCustomers
          daysRange: data.summary.daysRange || 30
        })
        
        // Convert dateData object to array for charts
        const dailySalesArray = Object.entries(data.dateData || {}).map(([date, values]) => ({
          _id: date,
          ...values
        }))
        setDailySales(dailySalesArray)
        
        setRevenueTrend(dailySalesArray) // Use same data for revenue trend
        
        // Map topSellingProducts to expected format
        const mappedTopProducts = (data.topSellingProducts || []).map(product => ({
          productId: product.productId,
          name: product.name,
          unitsSold: product.totalQuantity, // Map totalQuantity to unitsSold
          revenue: product.totalRevenue,
          currentStock: 0 // This would need to be fetched from products if needed
        }))
        setTopProducts(mappedTopProducts)
        
        // Convert statusBreakdown object to array for pie chart
        const statusStatsArray = Object.entries(data.statusBreakdown || {}).map(([status, count]) => ({
          _id: status,
          count: count
        }))
        setStatusStats(statusStatsArray)
        
        // Map stock data correctly
        setStockStats({
          inStock: data.stock?.inStock || 0,
          outOfStock: data.stock?.outOfStock || 0,
          lowStock: data.stock?.lowStock || 0,
          totalProducts: data.stock?.totalProducts || 0
        })
        
        // Convert paymentMethods object to array format
        const paymentMethodsArray = Object.entries(data.paymentMethods || {}).map(([method, count]) => ({
          _id: method,
          count: count,
          revenue: data.revenueByPaymentStatus?.[method] || 0
        }))
        setPaymentMethods(paymentMethodsArray)
        setLastUpdated(data.lastUpdated)
        
        console.log(' Analytics updated successfully')
      } else {
        throw new Error(response.message || 'Failed to fetch analytics')
      }
    } catch (err) {
      console.error('Error fetching comprehensive analytics:', err)
      setError(err.message || 'Failed to fetch analytics data')
    }
  }

  // Export analytics data (from Orders)
  const exportAnalytics = async () => {
    try {
      const params = new URLSearchParams()
      params.append('range', timeRange)

      const response = await fetchAnalytics(`/admin/analytics/export?${params}`, {
        responseType: 'blob'
      })

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `analytics-${new Date().toISOString().split('T')[0]}-orders.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError('Failed to export analytics data')
      console.error('Error exporting analytics:', err)
    }
  }

  // Fetch all analytics data (REVAMPED)
  const fetchAllAnalytics = async () => {
    setLoading(true)
    setError(null)
    try {
      await fetchComprehensiveAnalytics()
    } catch (err) {
      setError('Failed to fetch analytics data')
      console.error('Error fetching analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllAnalytics()
  }, [timeRange])

  // Auto-refresh for real-time updates
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      console.log(' Auto-refreshing analytics...')
      fetchComprehensiveAnalytics()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, timeRange])

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-sm text-gray-500">
              {lastUpdated && `Last updated: ${new Date(lastUpdated).toLocaleString()}`}
            </span>
            <span className="text-sm text-green-600 font-medium">
              Orders as Single Source of Truth
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoRefresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="autoRefresh" className="text-sm text-gray-600">
              Auto-refresh (30s)
            </label>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <button
            onClick={fetchAllAnalytics}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ChartBarIcon className="h-4 w-4" />
            Refresh
          </button>
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
          {/* KPI Cards - Orders as Single Source of Truth */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(summary.totalRevenue)}</p>
                  <p className="text-xs text-green-600 mt-1">From Orders</p>
                </div>
                <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.totalOrders}</p>
                  <p className="text-xs text-blue-600 mt-1">Paid Orders</p>
                </div>
                <ShoppingBagIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(summary.avgOrderValue)}</p>
                  <p className="text-xs text-purple-600 mt-1">Revenue/Orders</p>
                </div>
                <ArrowTrendingUpIcon className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Sold</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.totalSold.toLocaleString()}</p>
                  <p className="text-xs text-orange-600 mt-1">Items Sold</p>
                </div>
                <TruckIcon className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Customers</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.uniqueCustomers}</p>
                  <p className="text-xs text-indigo-600 mt-1">Unique</p>
                </div>
                <UsersIcon className="h-8 w-8 text-indigo-600" />
              </div>
            </div>
          </div>

          {/* Revenue Chart - From Orders */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Daily Sales & Revenue (Orders)</h2>
              <span className="text-sm text-green-600">Last {summary.daysRange} days</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailySales.map(item => ({
                date: item._id,
                revenue: item.revenue || 0,
                orders: item.orders || 0,
                itemsSold: item.customers || 0 // Use customers as itemsSold proxy
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? formatPrice(value) : value,
                    name === 'revenue' ? 'Revenue' : name === 'orders' ? 'Orders' : 'Items Sold'
                  ]} 
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" name="Revenue" strokeWidth={2} />
                <Line type="monotone" dataKey="orders" stroke="#10B981" name="Orders" strokeWidth={2} />
                <Line type="monotone" dataKey="itemsSold" stroke="#F59E0B" name="Items Sold" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Status Breakdown - From Orders */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status Breakdown</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusStats.map(stat => ({
                      name: stat._id || 'Unknown',
                      value: stat.count
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top Products - From Orders */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h2>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {topProducts.map((product, index) => (
                  <div key={product.productId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="font-semibold text-gray-500">#{index + 1}</span>
                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                      <ShoppingBagIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.unitsSold || 0} units sold</p>
                      <p className="text-xs text-green-600">Stock: {product.currentStock || 0}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatPrice(product.revenue || 0)}</p>
                      <p className="text-xs text-blue-600">{product.unitsSold > 0 ? formatPrice((product.revenue || 0) / product.unitsSold) : formatPrice(0)}/unit</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stock Analytics & Payment Methods */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stock Analytics */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Stock Analytics</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-500">In Stock</p>
                  <p className="text-2xl font-bold text-green-600">{stockStats.inStock}</p>
                  <p className="text-xs text-gray-600">Available</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-500">Low Stock</p>
                  <p className="text-2xl font-bold text-yellow-600">{stockStats.lowStock}</p>
                  <p className="text-xs text-gray-600">&lt; 5 items</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-500">Out of Stock</p>
                  <p className="text-2xl font-bold text-red-600">{stockStats.outOfStock}</p>
                  <p className="text-xs text-gray-600">0 items</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-500">Total Products</p>
                  <p className="text-2xl font-bold text-blue-600">{stockStats.totalProducts}</p>
                  <p className="text-xs text-gray-600">Active</p>
                </div>
              </div>
              
              {/* Stock Status Pie Chart */}
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'In Stock', value: stockStats.inStock },
                      { name: 'Low Stock', value: stockStats.lowStock },
                      { name: 'Out of Stock', value: stockStats.outOfStock }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#10B981" />
                    <Cell fill="#F59E0B" />
                    <Cell fill="#EF4444" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Payment Methods */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h2>
              <div className="space-y-3">
                {paymentMethods.map((method, index) => (
                  <div key={method._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        method._id === 'cod' ? 'bg-yellow-500' :
                        method._id === 'razorpay' ? 'bg-blue-500' :
                        method._id === 'upi' ? 'bg-green-500' :
                        'bg-gray-500'
                      }`}></div>
                      <div>
                        <p className="font-medium text-gray-900 capitalize">
                          {method._id === 'cod' ? 'Cash on Delivery' :
                           method._id === 'razorpay' ? 'Razorpay' :
                           method._id === 'upi' ? 'UPI' :
                           method._id}
                        </p>
                        <p className="text-sm text-gray-500">{method.count} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatPrice(method.revenue)}</p>
                      <p className="text-xs text-gray-500">
                        {method.count > 0 ? formatPrice(method.revenue / method.count) : formatPrice(0)} avg
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Analytics
