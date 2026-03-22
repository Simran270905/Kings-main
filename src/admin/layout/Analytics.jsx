'use client'

import { useState, useMemo } from 'react'
import { useProduct } from '../../customer/context/ProductContext'
import { useOrder } from '../context/OrderContext'
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
} from '@heroicons/react/24/outline'
import {
  calculateTotalStats,
  getMonthlySalesData,
  getTopProducts,
  getRevenueStats,
  getCustomerStats,
  getRecentOrders,
  getConversionRate,
} from '../utils/analyticsUtils'

const TrendingUpIcon = ArrowUpIcon
const TrendingDownIcon = ArrowDownIcon

export default function Analytics() {
  const { products } = useProduct()
  const { orders } = useOrder()

  const [timeRange, setTimeRange] = useState('30days')
  const [selectedMetric, setSelectedMetric] = useState('revenue')

  const allStats = useMemo(() => calculateTotalStats(orders), [orders])
  const revenueStats = useMemo(() => getRevenueStats(orders), [orders])
  const monthlyData = useMemo(() => getMonthlySalesData(orders), [orders])
  const topProducts = useMemo(() => getTopProducts(5, orders), [orders])
  const customerStats = useMemo(() => getCustomerStats(orders), [orders])

  const analytics = useMemo(() => {
    return {
      totalProducts: products.length,
      totalOrders: allStats.totalOrders,
      totalRevenue: allStats.totalRevenue,
      averageOrderValue: allStats.averageOrderValue,
      recentOrders: getRecentOrders(7, orders).length, // ✅ FIXED
      recentRevenue: revenueStats.totalRevenue,
      monthlyData,
      conversionRate: parseFloat(getConversionRate(orders)),
      pendingOrders: allStats.pendingOrders,
      processingOrders: allStats.processingOrders,
      shippedOrders: allStats.shippedOrders,
      deliveredOrders: allStats.deliveredOrders,
      cancelledOrders: allStats.cancelledOrders,
      uniqueCustomers: customerStats.uniqueCustomers,
      topProducts,
      revenueGrowth: revenueStats.revenueGrowth
    }
  }, [orders, allStats, revenueStats, monthlyData, customerStats, topProducts, products])

  const chartData = useMemo(() => {
    return monthlyData.map(month => ({
      month: month.month.split(' ')[0],
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
