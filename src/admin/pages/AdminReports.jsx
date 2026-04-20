import { useState, useEffect, useMemo } from 'react'
import { API_BASE_URL } from '../../config/api.js'
import AdminCard from '../layout/AdminCard'
import AdminButton from '../layout/AdminButton'
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
  ShoppingBagIcon,
  CurrencyDollarIcon,
  UsersIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'

const COLORS = ['#ae0b0b', '#b91c1c', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']

// Helper function for API calls - Same as Analytics
const fetchReportsData = async (endpoint, options = {}) => {
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

export default function AdminReports() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeRange, setTimeRange] = useState('30')
  const [selectedPeriod, setSelectedPeriod] = useState('revenue')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  
  // Reports data - Using Shared Analytics Service
  const [summary, setSummary] = useState({
    stats: {
      revenue: 0,
      orders: 0,
      avgOrder: 0,
      totalSold: 0
    },
    users: 0
  })
  
  const [salesTrend, setSalesTrend] = useState([])
  const [ordersChart, setOrdersChart] = useState([])
  const [categoryStats, setCategoryStats] = useState([])
  const [topProducts, setTopProducts] = useState([])

  // Format currency
  const formatCurrency = (amount) => `Rs.${(amount || 0).toLocaleString('en-IN')}`

  // Fetch comprehensive reports data using Shared Service
  const fetchReportsData = async () => {
    try {
      const params = new URLSearchParams()
      params.append('range', timeRange)

      console.log(' Fetching reports via SHARED SERVICE...')
      const response = await fetchReportsData(`/admin/reports/summary?${params}`)
      
      if (response.success) {
        const data = response.data
        console.log(' Reports data received from shared service:', data)
        
        // Update all reports data
        setSummary(data)
        setSalesTrend(data.salesTrend || [])
        setOrdersChart(data.ordersChart || [])
        setCategoryStats(data.categoryStats || [])
        setLastUpdated(data.lastUpdated)
        
        console.log(' Reports updated successfully via shared service')
      } else {
        throw new Error(response.message || 'Failed to fetch reports')
      }
    } catch (err) {
      console.error('Error fetching reports:', err)
      setError(err.message || 'Failed to fetch reports data')
    }
  }

  // Fetch sales trend data
  const fetchSalesTrend = async (metric = 'revenue') => {
    try {
      const params = new URLSearchParams()
      params.append('range', timeRange)
      params.append('metric', metric)

      const response = await fetchReportsData(`/admin/reports/sales-trend?${params}`)
      
      if (response.success) {
        setSalesTrend(response.data.salesTrend || [])
      }
    } catch (err) {
      console.error('Error fetching sales trend:', err)
    }
  }

  // Fetch category distribution
  const fetchCategoryDistribution = async () => {
    try {
      const params = new URLSearchParams()
      params.append('range', timeRange)

      const response = await fetchReportsData(`/admin/reports/categories?${params}`)
      
      if (response.success) {
        setCategoryStats(response.data.categoryStats || [])
      }
    } catch (err) {
      console.error('Error fetching category distribution:', err)
    }
  }

  // Fetch orders chart
  const fetchOrdersChart = async () => {
    try {
      const params = new URLSearchParams()
      params.append('range', timeRange)

      const response = await fetchReportsData(`/admin/reports/orders-chart?${params}`)
      
      if (response.success) {
        setOrdersChart(response.data.ordersChart || [])
      }
    } catch (err) {
      console.error('Error fetching orders chart:', err)
    }
  }

  // Export functionality using Shared Service
  const downloadCSV = async () => {
    try {
      const params = new URLSearchParams()
      params.append('range', timeRange)
      params.append('format', 'csv')

      const response = await fetch(`/api/admin/reports/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('kk_admin_token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)

        const a = document.createElement("a")
        a.href = url
        a.download = `orders-report-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        console.log(' CSV export completed')
      } else {
        throw new Error('Failed to export data')
      }
    } catch (err) {
      console.error('Export error:', err)
      alert('Failed to export data. Please try again.')
    }
  }

  // Fetch all reports data
  const fetchAllReports = async () => {
    setLoading(true)
    setError(null)
    try {
      await Promise.all([
        fetchReportsData(),
        fetchSalesTrend(selectedPeriod),
        fetchCategoryDistribution(),
        fetchOrdersChart()
      ])
    } catch (err) {
      setError('Failed to fetch reports data')
      console.error('Error fetching reports:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle period change
  useEffect(() => {
    if (salesTrend.length > 0) {
      fetchSalesTrend(selectedPeriod)
    }
  }, [selectedPeriod, timeRange])

  // Initial data fetch
  useEffect(() => {
    fetchAllReports()
  }, [timeRange])

  // Auto-refresh for real-time updates
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      console.log(' Auto-refreshing reports...')
      fetchAllReports()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, timeRange])

  // Chart data for selected period
  const chartData = useMemo(() => {
    return salesTrend.map(item => ({
      name: item._id,
      value: selectedPeriod === 'revenue' ? item.revenue : 
             selectedPeriod === 'orders' ? item.orders : 
             selectedPeriod === 'itemsSold' ? item.itemsSold : 0
    }))
  }, [salesTrend, selectedPeriod])

  // Bar chart data
  const barChartData = useMemo(() => {
    return [
      {
        name: 'Revenue',
        revenue: summary.stats.revenue || 0,
        orders: summary.stats.orders || 0
      }
    ]
  }, [summary.stats])

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Admin Reports
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-sm text-gray-500">
              {lastUpdated && `Last updated: ${new Date(lastUpdated).toLocaleString()}`}
            </span>
            <span className="text-sm text-green-600 font-medium">
              Orders as Single Source of Truth
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
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
          <AdminButton 
            variant="secondary"
            onClick={fetchAllReports}
            disabled={loading}
          >
            <ArrowTrendingUpIcon className="h-4 w-4 mr-2" />
            {loading ? 'Refreshing...' : 'Refresh'}
          </AdminButton>
          <AdminButton 
            variant="secondary"
            onClick={downloadCSV}
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export CSV
          </AdminButton>
        </div>
      </div>

      {/* Stats Cards - From Orders */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AdminCard>
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.stats.revenue)}</p>
              <p className="text-xs text-green-600 mt-1">From Orders</p>
            </div>
            <CurrencyDollarIcon className="h-6 w-6 text-[#ae0b0b]" />
          </div>
        </AdminCard>
        
        <AdminCard>
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold">{summary.stats.orders}</p>
              <p className="text-xs text-blue-600 mt-1">Valid Orders</p>
            </div>
            <ShoppingBagIcon className="h-6 w-6 text-[#ae0b0b]" />
          </div>
        </AdminCard>
        
        <AdminCard>
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Order</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.stats.avgOrder)}</p>
              <p className="text-xs text-purple-600 mt-1">Revenue/Orders</p>
            </div>
            <ChartBarIcon className="h-6 w-6 text-[#ae0b0b]" />
          </div>
        </AdminCard>
        
        <AdminCard>
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sold</p>
              <p className="text-2xl font-bold">{summary.stats.totalSold.toLocaleString()}</p>
              <p className="text-xs text-orange-600 mt-1">Items Sold</p>
            </div>
            <UsersIcon className="h-6 w-6 text-[#ae0b0b]" />
          </div>
        </AdminCard>
      </div>

      {/* Line Chart - Sales Trend */}
      <AdminCard>
        <div className="flex justify-between mb-4">
          <h2 className="font-semibold">Sales Trends (Orders Data)</h2>
          <div className="flex gap-2">
            <AdminButton
              size="sm"
              variant={selectedPeriod === 'revenue' ? 'primary' : 'secondary'}
              onClick={() => setSelectedPeriod('revenue')}
            >
              Revenue
            </AdminButton>
            <AdminButton
              size="sm"
              variant={selectedPeriod === 'orders' ? 'primary' : 'secondary'}
              onClick={() => setSelectedPeriod('orders')}
            >
              Orders
            </AdminButton>
            <AdminButton
              size="sm"
              variant={selectedPeriod === 'itemsSold' ? 'primary' : 'secondary'}
              onClick={() => setSelectedPeriod('itemsSold')}
            >
              Items Sold
            </AdminButton>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          {chartData.length > 0 ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => 
                selectedPeriod === 'revenue' ? formatCurrency(value) : value
              } />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#ae0b0b"
                strokeWidth={3}
                name={selectedPeriod === 'revenue' ? 'Revenue' : 
                      selectedPeriod === 'orders' ? 'Orders' : 'Items Sold'}
              />
            </LineChart>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-gray-400 text-sm">No data available</div>
                <div className="text-xs text-gray-400 mt-1">Chart will appear when orders are available</div>
              </div>
            </div>
          )}
        </ResponsiveContainer>
      </AdminCard>

      {/* Bar + Pie Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <AdminCard>
          <h2 className="mb-4 font-semibold">Order Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#ae0b0b" />
            </BarChart>
          </ResponsiveContainer>
        </AdminCard>

        <AdminCard>
          <h2 className="mb-4 font-semibold">Category Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            {categoryData.length > 0 ? (
              <PieChart>
                <Pie 
                  data={categoryData} 
                  dataKey="value" 
                  outerRadius={100}
                >
                  {categoryData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-gray-400 text-sm">No category data available</div>
                  <div className="text-xs text-gray-400 mt-1">Check orders and products</div>
                </div>
              </div>
            )}
          </ResponsiveContainer>
        </AdminCard>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      {error && (
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchAllReports}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  )
}
