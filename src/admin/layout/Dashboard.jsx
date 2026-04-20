import React, { useState, useEffect } from 'react'
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
  
  // Calculate metrics from context data
  const metrics = React.useMemo(() => {
    if (!orders || !products || ordersLoading || productsLoading) {
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
    
    // Calculate total revenue from orders
    const totalRevenue = ordersArray.reduce((sum, order) => {
      return sum + (order.totalAmount || 0)
    }, 0)
    
    // Calculate payment-based stats
    const paidOrders = ordersArray.filter(order => {
      const paymentStatus = order.paymentStatus || 'pending'
      return paymentStatus === 'paid'
    }).length
    
    const pendingPaymentOrders = ordersArray.filter(order => {
      const paymentStatus = order.paymentStatus || 'pending'
      return paymentStatus !== 'paid'
    }).length
    
    // Calculate pending orders (status-based)
    const pendingOrders = ordersArray.filter(order => {
      const status = order.status || 'pending'
      return status === 'pending'
    }).length
    
    // Calculate unique users
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
      return sum + (getTotalStock ? getTotalStock(product) : 0)
    }, 0)
  }, [products, getTotalStock])
  
  const lowStockProducts = React.useMemo(() => {
    return getLowStockCount ? getLowStockCount() : 0
  }, [getLowStockCount])

  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString('en-IN')}`
  }

  const isLoading = productsLoading || ordersLoading

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              refreshProducts()
              fetchOrders()
            }}
            disabled={isLoading}
            className="px-4 py-2 bg-[#ae0b0b] text-white rounded-lg hover:bg-[#8f0a0a] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ArrowTrendingUpIcon className="h-4 w-4" />
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ae0b0b] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/admin/products">
              <AdminCard>
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Products</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.totalProducts}</p>
                  </div>
                  <div className="text-blue-600">
                    <ChartBarIcon className="h-6 w-6" />
                  </div>
                </div>
              </AdminCard>
            </Link>

            <Link to="/admin/products">
              <AdminCard>
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Stock</p>
                    <p className="text-2xl font-bold text-gray-900">{totalStock}</p>
                  </div>
                  <div className="text-orange-600">
                    <ChartBarIcon className="h-6 w-6" />
                  </div>
                </div>
              </AdminCard>
            </Link>

            <Link to="/admin/products">
              <AdminCard>
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Low Stock Items</p>
                    <p className="text-2xl font-bold text-gray-900">{lowStockProducts}</p>
                  </div>
                  <div className="text-red-600">
                    <ChartBarIcon className="h-6 w-6" />
                  </div>
                </div>
              </AdminCard>
            </Link>

            <Link to="/admin/analytics">
              <AdminCard>
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalRevenue)}</p>
                  </div>
                  <div className="text-green-600">
                    <CurrencyDollarIcon className="h-6 w-6" />
                  </div>
                </div>
              </AdminCard>
            </Link>

            <Link to="/admin/orders">
              <AdminCard>
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.totalOrders}</p>
                  </div>
                  <div className="text-purple-600">
                    <ShoppingBagIcon className="h-6 w-6" />
                  </div>
                </div>
              </AdminCard>
            </Link>

            <Link to="/admin/customers">
              <AdminCard>
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.totalUsers}</p>
                  </div>
                  <div className="text-indigo-600">
                    <UsersIcon className="h-6 w-6" />
                  </div>
                </div>
              </AdminCard>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <AdminButton 
                href="/admin/upload" 
                variant="primary" 
                icon={PlusCircleIcon}
                className="justify-start text-left h-14"
              >
                Add New Product
              </AdminButton>

              <AdminButton 
                href="/admin/products" 
                variant="secondary" 
                icon={ShoppingBagIcon}
                className="justify-start text-left h-14"
              >
                Manage Products
              </AdminButton>

              <AdminButton 
                href="/admin/analytics" 
                variant="secondary" 
                icon={ChartBarIcon}
                className="justify-start text-left h-14"
              >
                View Analytics
              </AdminButton>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
