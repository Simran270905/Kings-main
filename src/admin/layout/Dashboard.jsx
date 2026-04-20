import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'

import { useAnalytics } from '../hooks/useRealAnalytics'
import {
  ShoppingBagIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  PlusCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

import AdminCard from './AdminCard'
import AdminButton from './AdminButton'
import { calculateDashboardStats, formatCurrency } from '../../utils/dashboardUtils'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStock: 0,
    totalOrders: 0,
    processingOrders: 0,
    deliveredOrders: 0,
    averageOrderValue: 0,
    recentProducts: []
  })

  // Fetch dashboard data from API
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem('kk_admin_token')
      if (!token) {
        throw new Error('No admin token found')
      }

      const response = await fetch('/api/admin/dashboard?v=' + Date.now(), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setDashboardData(result.data)
        console.log('✅ Dashboard data updated:', result.data)
      } else {
        throw new Error(result.message || 'Failed to fetch dashboard data')
      }
    } catch (err) {
      console.error('❌ Error fetching dashboard data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing dashboard data...')
      console.log('🔍 About to call fetchDashboardData...')
      fetchDashboardData()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [fetchDashboardData])

  // Format currency
  const formatCurrencyValue = (amount) => {
    return formatCurrency(amount)
  }

  // Handle manual refresh
  const handleRefresh = async () => {
    await fetchDashboardData()
  }

  // Handle error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Dashboard</h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleRefresh}
              className="bg-red-100 text-red-800 px-4 py-2 rounded-md hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 bg-[#ae0b0b] text-white rounded-lg hover:bg-[#8f0a0a] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ArrowTrendingUpIcon className="h-4 w-4" />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ae0b0b] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <AdminCard title="Total Revenue" value={formatCurrencyValue(dashboardData.totalRevenue)} icon={CurrencyDollarIcon} trend={null} color="text-green-600" />
            <AdminCard title="Total Orders" value={dashboardData.totalOrders} icon={ShoppingBagIcon} trend={null} color="text-blue-600" />
            <AdminCard title="Pending Orders" value={dashboardData.pendingOrders} icon={ShoppingBagIcon} trend={null} color="text-yellow-600" />
            <AdminCard title="Total Products" value={dashboardData.totalProducts} icon={ShoppingBagIcon} trend={null} color="text-indigo-600" />
            <AdminCard title="Low Stock Items" value={dashboardData.lowStock} icon={ShoppingBagIcon} trend={null} color="text-red-600" />
            <AdminCard title="Processing Orders" value={dashboardData.processingOrders} icon={ShoppingBagIcon} trend={null} color="text-blue-600" />
            <AdminCard title="Delivered Orders" value={dashboardData.deliveredOrders} icon={ShoppingBagIcon} trend={null} color="text-green-600" />
            <AdminCard title="Avg Order Value" value={formatCurrencyValue(dashboardData.averageOrderValue)} icon={CurrencyDollarIcon} trend={null} color="text-purple-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="col-span-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Analytics</h3>
              <div className="bg-white rounded-lg shadow p-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Revenue:</span>
                  <span className="font-medium text-green-600">{formatCurrencyValue(dashboardData.totalRevenue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Order Value:</span>
                  <span className="font-medium">{formatCurrencyValue(dashboardData.averageOrderValue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Conversion Rate:</span>
                  <span className="font-medium text-blue-600">
                    {dashboardData.totalOrders > 0 ? ((dashboardData.deliveredOrders / dashboardData.totalOrders) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Low Stock Alert:</span>
                  <span className={`font-medium ${dashboardData.lowStock > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {dashboardData.lowStock > 0 ? `${dashboardData.lowStock} items need restock` : 'All items in stock'}
                  </span>
                </div>
              </div>
            </div>

            <div className="col-span-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Products</h3>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {dashboardData.recentProducts?.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {dashboardData.recentProducts.map((product, index) => (
                      <div key={product._id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="h-12 w-12 rounded-lg object-cover"
                            onError={(e) => {
                              e.target.src = '/placeholder-product.jpg'
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-sm text-gray-500">{formatCurrencyValue(product.price)}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                product.stock <= 5 
                                  ? 'bg-red-100 text-red-800' 
                                  : product.stock <= 10 
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                Stock: {product.stock}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    No recent products found
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <AdminButton variant="primary" icon={PlusCircleIcon} className="justify-start text-left h-14">Add New Product</AdminButton>
              <AdminButton href="/admin/products" variant="secondary" icon={ShoppingBagIcon} className="justify-start text-left h-14">Manage Products</AdminButton>
              <AdminButton href="/admin/orders" variant="secondary" icon={ShoppingBagIcon} className="justify-start text-left h-14">View Orders</AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
