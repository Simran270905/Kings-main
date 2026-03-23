'use client'

import { useState, useEffect, useMemo } from 'react'
import useRealAnalytics from '../hooks/useRealAnalytics'
import { useProduct } from '../../customer/context/ProductContext'
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
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'

export default function AdminReports() {
  const { products } = useProduct()
  const analytics = useRealAnalytics()

  const [timeRange, setTimeRange] = useState('30days')
  const [selectedPeriod, setSelectedPeriod] = useState('revenue')
  const [chartData, setChartData] = useState([])

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

  // � Line Chart Data
  const lineChartData = useMemo(() => {
    if (!chartData.length) return []

    return chartData.map((d) => ({
      month: new Date(d.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      revenue: d.revenue || 0,
      orders: d.orders || 0,
    }))
  }, [chartData])

  // 📊 Bar Chart Data
  const barChartData = useMemo(() => {
    return chartData.slice(-6)
  }, [chartData])

  // 📊 Category Distribution
  const categoryData = useMemo(() => {
    const categories = {}

    products.forEach((p) => {
      if (p.category) {
        categories[p.category] = (categories[p.category] || 0) + 1
      }
    })

    return Object.entries(categories).map(([name, value]) => ({
      name,
      value,
    }))
  }, [products])

  const COLORS = ['#ae0b0b', '#b91c1c', '#f59e0b', '#10b981', '#3b82f6']

  const formatCurrency = (amount) =>
    `₹${(amount || 0).toLocaleString('en-IN')}`

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Admin Reports
          </h1>
          <p className="mt-2 text-gray-600">
            Real-time analytics from your store
          </p>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
          </select>

          <AdminButton 
            variant="secondary"
            onClick={analytics.refresh}
            disabled={analytics.loading}
          >
            <ArrowTrendingUpIcon className="h-4 w-4 mr-2" />
            {analytics.loading ? 'Refreshing...' : 'Refresh'}
          </AdminButton>

          <AdminButton variant="secondary">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Export
          </AdminButton>
        </div>
      </div>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <AdminCard>
          <h3 className="text-sm font-medium text-gray-800 mb-2">Debug Information (Real API)</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <div>Revenue (Backend): ₹{analytics.data.revenue || 0}</div>
            <div>Total Orders: {analytics.data.totalOrders || 0}</div>
            <div>Average Order Value: ₹{analytics.data.avgOrderValue || 0}</div>
            <div>Delivered Orders: {analytics.data.deliveredOrders || 0}</div>
            <div>Total Users: {analytics.data.totalUsers || 0}</div>
            <div>Data Source: Backend Admin API</div>
            <div>Loading: {analytics.loading ? 'Yes' : 'No'}</div>
            {analytics.error && <div className="text-red-600">Error: {analytics.error}</div>}
          </div>
        </AdminCard>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            title: 'Revenue',
            value: formatCurrency(analytics.data.revenue),
            icon: CurrencyDollarIcon,
          },
          {
            title: 'Orders',
            value: analytics.data.totalOrders || 0,
            icon: ShoppingBagIcon,
          },
          {
            title: 'Avg Order',
            value: formatCurrency(analytics.data.avgOrderValue),
            icon: ChartBarIcon,
          },
          {
            title: 'Users',
            value: analytics.data.totalUsers || 0,
            icon: UsersIcon,
          },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <AdminCard key={i}>
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <Icon className="h-6 w-6 text-[#ae0b0b]" />
              </div>
            </AdminCard>
          )
        })}
      </div>

      {/* Line Chart */}
      <AdminCard>
        <div className="flex justify-between mb-4">
          <h2 className="font-semibold">Sales Trends</h2>

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
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={lineChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey={selectedPeriod}
              stroke="#ae0b0b"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </AdminCard>

      {/* Bar + Pie */}
      <div className="grid md:grid-cols-2 gap-6">
        <AdminCard>
          <h2 className="mb-4 font-semibold">Orders</h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="#ae0b0b" />
            </BarChart>
          </ResponsiveContainer>
        </AdminCard>

        <AdminCard>
          <h2 className="mb-4 font-semibold">Categories</h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" outerRadius={100}>
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </AdminCard>
      </div>
    </div>
  )
}
