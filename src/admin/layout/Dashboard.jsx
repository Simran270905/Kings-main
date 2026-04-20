import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'

import { useAnalytics } from '../hooks/useRealAnalytics'
import { API_BASE_URL } from '../../config/api'
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

      const response = await fetch(`${API_BASE_URL}/admin/dashboard?v=${Date.now()}`, {
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600 text-lg">Welcome back! Here's what's happening with your store.</p>
        </div>

        <div className="flex items-center">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-6 py-3 bg-[#ae0b0b] text-white rounded-lg hover:bg-[#8f0a0a] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md transition-all duration-200"
          >
            <ArrowTrendingUpIcon className="h-5 w-5" />
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
          {/* Stats Cards - Modern SaaS Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrencyValue(dashboardData.totalRevenue)}</p>
              </div>
              <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.totalOrders}</p>
              </div>
              <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.totalProducts}</p>
              </div>
              <ShoppingBagIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">Processing Orders</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.processingOrders}</p>
              </div>
              <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">Delivered Orders</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.deliveredOrders}</p>
              </div>
              <ShoppingBagIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-2">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrencyValue(dashboardData.averageOrderValue)}</p>
              </div>
              <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Analytics */}
            <div className="col-span-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Analytics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium">Total Revenue:</span>
                  <span className="font-bold text-green-600 text-lg">{formatCurrencyValue(dashboardData.totalRevenue)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium">Average Order Value:</span>
                  <span className="font-bold text-purple-600 text-lg">{formatCurrencyValue(dashboardData.averageOrderValue)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium">Conversion Rate:</span>
                  <span className="font-bold text-blue-600 text-lg">
                    {dashboardData.totalOrders > 0 ? ((dashboardData.deliveredOrders / dashboardData.totalOrders) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-gray-600 font-medium">Low Stock Alert:</span>
                  <span className={`font-bold text-lg ${dashboardData.lowStock > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {dashboardData.lowStock > 0 ? `${dashboardData.lowStock} items need restock` : 'All items in stock'}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Products */}
            <div className="col-span-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Products</h3>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {dashboardData.recentProducts?.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {dashboardData.recentProducts.map((product, index) => (
                      <div key={product._id} className="p-4 hover:bg-gray-50 transition-colors duration-200">
                        <div className="flex items-center space-x-4">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="h-16 w-16 rounded-xl object-cover shadow-sm"
                            onError={(e) => {
                              e.target.src = '/placeholder-product.jpg'
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-semibold text-gray-900 truncate mb-2">{product.name}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-gray-700">{formatCurrencyValue(product.price)}</span>
                              <span className={`text-sm px-3 py-2 rounded-full font-semibold ${
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
                  <div className="p-8 text-center text-gray-500">
                    <div className="text-gray-400 mb-2">No recent products found</div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons - Bottom Section */}
            <div className="mt-8 flex flex-wrap gap-4">
              <AdminButton variant="primary" icon={PlusCircleIcon} className="h-11 px-5 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md transition-all duration-200">Add New Product</AdminButton>
              <AdminButton href="/admin/products" variant="secondary" icon={ShoppingBagIcon} className="h-11 px-5 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 shadow-md transition-all duration-200">Manage Products</AdminButton>
              <AdminButton href="/admin/orders" variant="secondary" icon={ShoppingBagIcon} className="h-11 px-5 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 shadow-md transition-all duration-200">View Orders</AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
