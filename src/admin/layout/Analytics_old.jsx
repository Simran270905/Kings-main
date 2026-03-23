'use client'

import { useState } from 'react'
import { useProduct } from '../../customer/context/ProductContext'
import { useDetailedAnalytics } from '../hooks/useDetailedAnalytics'
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
  const { products } = useProduct()
  const analytics = useDetailedAnalytics()

  const [timeRange, setTimeRange] = useState('30days')
  const [selectedMetric, setSelectedMetric] = useState('revenue')

  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString('en-IN')}`
  }

  const formatNumber = (num) => {
    return (num || 0).toLocaleString('en-IN')
  }

  const pieData = [
    { name: 'Delivered', value: analytics.totalOrders * 0.5, color: '#10b981' },
    { name: 'Processing', value: analytics.totalOrders * 0.3, color: '#3b82f6' },
    { name: 'Pending', value: analytics.totalOrders * 0.15, color: '#f59e0b' },
    { name: 'Cancelled', value: analytics.totalOrders * 0.05, color: '#ef4444' },
  ].filter(item => item.value > 0)

  // Debug logging
  console.log('📊 Analytics Page Data:', {
    revenue: analytics.totalRevenue,
    totalOrders: analytics.totalOrders,
    loading: analytics.loading,
    error: analytics.error,
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
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Debug Information</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <div>Revenue (Backend): ₹{analytics.totalRevenue}</div>
            <div>Total Orders: {analytics.totalOrders}</div>
            <div>Average Order Value: ₹{analytics.averageOrderValue}</div>
            <div>Conversion Rate: {analytics.conversionRate}%</div>
            <div>Data Source: Backend API</div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.totalRevenue)}</p>
              <div className="flex items-center mt-2">
                {analytics.revenueStats.revenueGrowth > 0 ? (
                  <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm ${analytics.revenueStats.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analytics.revenueStats.revenueGrowth > 0 ? '+' : ''}{analytics.revenueStats.revenueGrowth}%
                </span>
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
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.totalOrders)}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-500">Lifetime</span>
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
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.averageOrderValue)}</p>
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
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.conversionRate}%</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-500">Delivered / Total</span>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
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

      {/* Monthly Sales Table */}
      <AdminCard>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Sales</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Order Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.monthlyData.map((month, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {month.month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatNumber(Math.round(month.orders))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(month.revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(month.orders > 0 ? month.revenue / month.orders : 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  )
}
      value: selectedMetric === 'revenue'
        ? month.revenue || 0
        : month.orders || 0
    }))
  }, [monthlyData, selectedMetric])

  const categoryData = useMemo(() => {
    const categories = {}
    products.forEach(product => {
      if (product.category) {
        categories[product.category] = (categories[product.category] || 0) + 1
      }
    })
    return Object.entries(categories).map(([name, value]) => ({ name, value }))
  }, [products])

  const COLORS = ['#ae0b0b', '#b91c1c', '#f59e0b', '#10b981', '#3b82f6']

  const formatCurrency = (amount) => `₹${(amount || 0).toLocaleString()}`

  const statCards = useMemo(() => [
    {
      title: 'Total Products',
      value: products.length,
      change: '+0%',
      trend: 'up',
      icon: ShoppingBagIcon,
      color: 'text-blue-600'
    },
    {
      title: 'Total Orders',
      value: analytics.totalOrders,
      change: '+15%',
      trend: 'up',
      icon: UsersIcon,
      color: 'text-green-600'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(analytics.totalRevenue),
      change: `${analytics.revenueGrowth > 0 ? '+' : ''}${analytics.revenueGrowth}%`,
      trend: analytics.revenueGrowth > 0 ? 'up' : 'down',
      icon: CurrencyDollarIcon,
      color: 'text-[#ae0b0b]'
    },
    {
      title: 'Avg Order Value',
      value: formatCurrency(analytics.averageOrderValue),
      change: '+5%',
      trend: 'up',
      icon: ChartBarIcon,
      color: 'text-purple-600'
    }
  ], [analytics, products])

  const recentActivity = useMemo(() => {
    return getRecentOrders(10, orders).map(order => ({
      id: order._id || order.orderId,
      title: `Order #${String(order._id || order.orderId || 'N/A').slice(-6)}`,
      description: `${order.shippingAddress?.firstName || 'Customer'} - ${formatCurrency(order.totalAmount)}`,
      time: new Date(order.createdAt).toLocaleDateString(),
      status: order.status || 'pending'
    }))
  }, [orders])

  // ✅ FIXED STOCK CALCULATION
  const lowStockCount = useMemo(() => {
    return products.filter(p =>
      p.sizes?.some(s => s.stock <= 5)
    ).length
  }, [products])

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-gray-600">Track your store performance</p>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
          </select>

          <AdminButton variant="secondary">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Export
          </AdminButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon
          const TrendIcon = stat.trend === 'up' ? TrendingUpIcon : TrendingDownIcon

          return (
            <AdminCard key={i} hover>
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-semibold">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendIcon className="h-4 w-4 mr-1" />
                    <span>{stat.change}</span>
                  </div>
                </div>
                <Icon className="h-6 w-6" />
              </div>
            </AdminCard>
          )
        })}
      </div>

      {/* Low Stock */}
      <AdminCard>
        <h3 className="text-sm text-gray-600">Low Stock Items</h3>
        <p className="text-2xl font-bold">{lowStockCount}</p>
      </AdminCard>
    </div>
  )
}
