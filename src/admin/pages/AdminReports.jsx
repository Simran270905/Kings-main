'use client'

import { useState, useEffect, useMemo } from 'react'
import { API_BASE_URL } from '../../config/api'
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
} from '@heroicons/react/24/outline'

export default function AdminReports() {
  const { products } = useProduct()

  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [timeRange, setTimeRange] = useState('30days')
  const [selectedPeriod, setSelectedPeriod] = useState('revenue')

  // 🔥 FETCH ANALYTICS FROM BACKEND
  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError('')

      const token = localStorage.getItem('kk_admin_token')

      if (!token) {
        throw new Error('Admin not authenticated')
      }

      const res = await fetch(
        `${API_BASE_URL}/analytics?range=${timeRange}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!res.ok) {
        throw new Error('Failed to fetch analytics')
      }

      const data = await res.json()

      setAnalytics(data)
    } catch (err) {
      console.error('❌ Analytics error:', err)
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // 📊 Line Chart Data
  const lineChartData = useMemo(() => {
    if (!analytics?.monthlyData) return []

    return analytics.monthlyData.map((m) => ({
      month: m.month,
      revenue: m.revenue || 0,
      orders: m.orders || 0,
    }))
  }, [analytics])

  // 📊 Bar Chart Data
  const barChartData = useMemo(() => {
    if (!analytics?.monthlyData) return []
    return analytics.monthlyData.slice(-6)
  }, [analytics])

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

  // 🔄 Loading State
  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500">
        Loading analytics...
      </div>
    )
  }

  // ❌ Error State
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <AdminButton onClick={fetchAnalytics}>Retry</AdminButton>
      </div>
    )
  }

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

          <AdminButton variant="secondary">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Export
          </AdminButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            title: 'Revenue',
            value: formatCurrency(analytics?.totalRevenue),
            icon: CurrencyDollarIcon,
          },
          {
            title: 'Orders',
            value: analytics?.totalOrders || 0,
            icon: ShoppingBagIcon,
          },
          {
            title: 'Avg Order',
            value: formatCurrency(analytics?.averageOrderValue),
            icon: ChartBarIcon,
          },
          {
            title: 'Products Sold',
            value: analytics?.totalProductsSold || 0,
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
