import React from 'react'
import { Link } from 'react-router-dom'

// Force new build for Vercel deployment
import { useAdminProduct } from '../context/AdminProductContext'
import { useCart } from '../../context/useCart'
import { useEnhancedOrder } from '../context/EnhancedOrderContext'
import { useAnalytics } from '../hooks/useRealAnalytics'
import { API_BASE_URL } from '@config/api.js'
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

export default function Dashboard() {
  const { products, loading: productsLoading, getTotalStock, getLowStockCount, refreshProducts } = useAdminProduct()
  const { orders, loading: ordersLoading, fetchOrders } = useEnhancedOrder()
  const analytics = useAnalytics()
  
  const metrics = React.useMemo(() => {
    if (!orders || !products || ordersLoading === undefined || productsLoading === undefined) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalUsers: 0,
        totalProducts: 0,
        paidOrders: 0,
        pendingPaymentOrders: 0
      }
    }
    
    const ordersArray = Array.isArray(orders) ? orders : []
    const productsArray = Array.isArray(products) ? products : []
    
    const totalRevenue = ordersArray.reduce((sum, order) => {
      return sum + (order.totalAmount || 0)
    }, 0)
    
    const paidOrders = ordersArray.filter(order => {
      const paymentStatus = order.paymentStatus || 'pending'
      return paymentStatus === 'paid'
    }).length
    
    const pendingPaymentOrders = ordersArray.filter(order => {
      const paymentStatus = order.paymentStatus || 'pending'
      return paymentStatus !== 'paid'
    }).length
    
    const pendingOrders = ordersArray.filter(order => {
      const status = order.status || 'pending'
      return status === 'pending'
    }).length
    
    const uniqueUsers = new Set()
    ordersArray.forEach(order => {
      const email = order.customer?.email || order.shippingAddress?.email
      if (email) uniqueUsers.add(email)
    })
    
    return {
      totalRevenue,
      totalOrders: ordersArray.length,
      pendingOrders,
      totalUsers: uniqueUsers.size,
      totalProducts: productsArray.length,
      paidOrders,
      pendingPaymentOrders
    }
  }, [orders, products, ordersLoading, productsLoading])
  
  const totalStock = React.useMemo(() => {
    const productsArray = Array.isArray(products) ? products : []
    return productsArray.reduce((sum, product) => {
      return sum + (getTotalStock && typeof getTotalStock === 'function' ? getTotalStock(product) : 0)
    }, 0)
  }, [products, getTotalStock])
  
  const lowStockProducts = React.useMemo(() => {
    return getLowStockCount && typeof getLowStockCount === 'function' ? getLowStockCount() : 0
  }, [getLowStockCount])

  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString('en-IN')}`
  }

  const isLoading = productsLoading || ordersLoading

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              if (refreshProducts && typeof refreshProducts === 'function') refreshProducts()
              if (fetchOrders && typeof fetchOrders === 'function') fetchOrders()
            }}
            disabled={isLoading}
            className="px-4 py-2 bg-[#ae0b0b] text-white rounded-lg hover:bg-[#8f0a0a] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ArrowTrendingUpIcon className="h-4 w-4" />
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ae0b0b] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <AdminCard title="Total Revenue" value={formatCurrency(metrics.totalRevenue)} icon={CurrencyDollarIcon} trend={null} color="text-green-600" />
            <AdminCard title="Total Orders" value={metrics.totalOrders} icon={ShoppingBagIcon} trend={null} color="text-blue-600" />
            <AdminCard title="Pending Orders" value={metrics.pendingOrders} icon={ShoppingBagIcon} trend={null} color="text-yellow-600" />
            <AdminCard title="Total Users" value={metrics.totalUsers} icon={UsersIcon} trend={null} color="text-purple-600" />
            <AdminCard title="Total Products" value={metrics.totalProducts} icon={ShoppingBagIcon} trend={null} color="text-indigo-600" />
            <AdminCard title="Total Stock" value={totalStock} icon={ShoppingBagIcon} trend={null} color="text-teal-600" />
            <AdminCard title="Low Stock Products" value={lowStockProducts} icon={ShoppingBagIcon} trend={null} color="text-red-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AdminCard className="col-span-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Analytics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Order Value:</span>
                  <span className="font-medium">{formatCurrency(metrics.totalOrders > 0 ? metrics.totalRevenue / metrics.totalOrders : 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Paid Orders:</span>
                  <span className="font-medium text-green-600">{metrics.paidOrders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pending Payment:</span>
                  <span className="font-medium text-yellow-600">{metrics.pendingPaymentOrders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">System Status:</span>
                  <span className="font-medium text-green-600">Operational</span>
                </div>
                <span className="font-medium">{formatCurrency(metrics.totalOrders > 0 ? metrics.totalRevenue / metrics.totalOrders : 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Paid Orders:</span>
                <span className="font-medium text-green-600">{metrics.paidOrders}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending Payment:</span>
                <span className="font-medium text-yellow-600">{metrics.pendingPaymentOrders}</span>
              </div>
            </div>
          </AdminCard>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <AdminButton 
              variant="primary" 
              icon={PlusCircleIcon}
              className="justify-start text-left h-14"
            />
              Add New Product
            </AdminButton>

            <AdminButton 
              href="/admin/products" 
              variant="secondary" 
              icon={ShoppingBagIcon}
              className="justify-start text-left h-14"
            />
              Manage Products
            </AdminButton>

            <AdminButton 
              href="/admin/analytics" 
              variant="secondary" 
              icon={ChartBarIcon}
              className="justify-start text-left h-14"
            />
              View Analytics
            </AdminButton>
          </div>
        </div>
      </>
    )}
  </div>
)
