import { useAdminProduct } from '../context/AdminProductContext'
import { useCart } from '../../context/useCart'
import { useOrder } from '../context/OrderContext'
import { useAnalytics } from '../hooks/useRealAnalytics'
import { useMemo, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE_URL } from '@config/api.js'

import {
  ShoppingBagIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  PlusCircleIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

import AdminCard from './AdminCard'
import AdminButton from './AdminButton'
import StatCard from '../components/StatCard'
import {
  safeArray,
  safeString,
  safeNumber,
  safeCurrency,
  safeOrderAmount,
  safeOrderStatus,
  safeCustomerEmail,
  logAdminData,
  safeAdminFetch
} from '../utils/adminSafetyUtils'

// Simple loader component
const Loader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ae0b0b] mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading dashboard...</p>
    </div>
  </div>
)

export default function Dashboard() {
  // ✅ ALL HOOKS MUST BE AT TOP LEVEL
  const { products, loading: productsLoading, getTotalStock, getLowStockCount, refreshProducts } = useAdminProduct()
  const { orders, loading: ordersLoading, refreshOrders } = useOrder()
  const analytics = useAnalytics()
  
  // ✅ Add loading state for initial data load
  const [loading, setLoading] = useState(true)
  
  // ✅ Add error state for error handling
  const [error, setError] = useState(null)
  
  // Add recent products state
  const [recentProducts, setRecentProducts] = useState([])
  const [recentProductsLoading, setRecentProductsLoading] = useState(true)
  
  // ✅ Calculate metrics from context data (only when data is available)
  const metrics = useMemo(() => {
    // Only calculate if we have data
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
    
    // Only calculate if we have actual data
    
    // Calculate total revenue from orders
    const totalRevenue = ordersArray.reduce((sum, order) => {
      return sum + (order.totalAmount || 0);
    }, 0);
    
    // Calculate payment-based stats
    const paidOrders = ordersArray.filter(order => {
      const paymentStatus = order.paymentStatus || 'pending';
      return paymentStatus === 'paid';
    }).length;
    
    const pendingPaymentOrders = ordersArray.filter(order => {
      const paymentStatus = order.paymentStatus || 'pending';
      return paymentStatus !== 'paid';
    }).length;
    
    // Calculate pending orders (status-based)
    const pendingOrdersCount = ordersArray.filter(order => {
      const status = order.status || 'pending';
      return status === 'pending';
    }).length;
    
    // Calculate unique users
    const uniqueUsers = new Set();
    ordersArray.forEach(order => {
      const email = order.customer?.email || order.shippingAddress?.email;
      if (email) uniqueUsers.add(email);
    });
    
        
    return {
      totalRevenue,
      totalOrders: ordersArray.length,
      pendingOrders: pendingOrdersCount,
      totalUsers: uniqueUsers.size,
      totalProducts: productsArray.length,
      paidOrders,
      pendingPaymentOrders
    }
  }, [orders, products, ordersLoading, productsLoading])
  
  // ✅ Update loading state when data is ready
  useEffect(() => {
    if (!ordersLoading && !productsLoading && !recentProductsLoading) {
      setLoading(false)
    }
  }, [ordersLoading, productsLoading, recentProductsLoading])
  
  // ✅ Combined loading state
  const isLoading = loading || ordersLoading || productsLoading || recentProductsLoading
  
  // Fallback data in case analytics fails
  const fallbackData = {
    revenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    loading: false,
    error: null,
    refresh: () => {}
  }
  
  // Use analytics data or fallback
  const safeAnalytics = analytics || fallbackData

  // Memoize calculations to prevent flickering
  const totalProducts = useMemo(() => {
    return metrics.totalProducts
  }, [metrics.totalProducts])
  
  const totalStock = useMemo(() => {
    const productsArray = Array.isArray(products) ? products : []
    return productsArray.reduce((sum, product) => {
      return sum + getTotalStock(product)
    }, 0)
  }, [products, getTotalStock])
  
  const lowStockProducts = useMemo(() => {
    return getLowStockCount
  }, [products, getLowStockCount])

  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString('en-IN')}`
  }

  // REAL-TIME CALCULATIONS
  // Fetch recent products separately for better performance
  useEffect(() => {
    const fetchRecentProducts = async () => {
      try {
        setRecentProductsLoading(true)
        const token = localStorage.getItem('kk_admin_token')
        if (!token) {
          console.log('No admin token found for recent products')
          return
        }

        // Try dedicated recent products endpoint first
        let response = await fetch(`${API_BASE_URL}/products/recent`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        let data, products

        if (response.ok) {
          data = await response.json()
          products = data.data || data || []
        } else {
          // Fallback to main products endpoint with limit
          response = await fetch(`${API_BASE_URL}/products?limit=5`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (!response.ok) {
            throw new Error('Failed to fetch recent products')
          }

          data = await response.json()
          products = data.data?.products || data.products || data.data || data || []
        }

        setRecentProducts(Array.isArray(products) ? products.slice(0, 5) : [])
      } catch (error) {
        console.error('Dashboard - Error fetching recent products:', error)
        setRecentProducts([])
      } finally {
        setRecentProductsLoading(false)
      }
    }

    fetchRecentProducts()
  }, [])

  // Auto-refresh recent products when products are updated
  useEffect(() => {
    const handleProductUpdate = () => {
      setTimeout(() => {
        const fetchRecentProducts = async () => {
          try {
            const token = localStorage.getItem('kk_admin_token')
            if (!token) return

            // Try dedicated recent products endpoint first
            let response = await fetch(`${API_BASE_URL}/products/recent`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            })

            let data, products

            if (response.ok) {
              data = await response.json()
              products = data.data || data || []
            } else {
              // Fallback to main products endpoint with limit
              response = await fetch(`${API_BASE_URL}/products?limit=5`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              })

              if (response.ok) {
                data = await response.json()
                products = data.data?.products || data.products || data.data || data || []
              }
            }

            setRecentProducts(Array.isArray(products) ? products.slice(0, 5) : [])
          } catch (error) {
            console.error('Dashboard - Error refreshing recent products:', error)
          }
        }
        fetchRecentProducts()
      }, 500) // Small delay to ensure database is updated
    }

    window.addEventListener('adminProductUpdated', handleProductUpdate)
    return () => window.removeEventListener('adminProductUpdated', handleProductUpdate)
  }, [])
  
  const pendingOrdersCount = useMemo(() => {
    const ordersArray = Array.isArray(orders) ? orders : []
    return ordersArray.filter(order => safeOrderStatus(order) === 'pending').length
  }, [orders])
  
  const totalUsersCount = useMemo(() => {
    const uniqueUsers = new Map()
    
    const ordersArray = Array.isArray(orders) ? orders : []
    ordersArray.forEach(order => {
      const email = safeCustomerEmail(order)
      if (email && email !== 'N/A') {
        uniqueUsers.set(email, {
          name: order.customer?.name || 'Unknown',
          email: email,
          phone: order.customer?.phone || 'N/A'
        })
      }
    })
    
    return uniqueUsers.size
  }, [orders])
  
  const processingOrders = useMemo(() => {
    const ordersArray = Array.isArray(orders) ? orders : []
    return ordersArray.filter(order => safeOrderStatus(order) === 'processing').length
  }, [orders])
  
  const shippedOrders = useMemo(() => {
    const ordersArray = Array.isArray(orders) ? orders : []
    return ordersArray.filter(order => safeOrderStatus(order) === 'shipped').length
  }, [orders])
  
  const deliveredOrders = useMemo(() => {
    const ordersArray = Array.isArray(orders) ? orders : []
    return ordersArray.filter(order => safeOrderStatus(order) === 'delivered').length
  }, [orders])
  
  const cancelledOrders = useMemo(() => {
    const ordersArray = Array.isArray(orders) ? orders : []
    return ordersArray.filter(order => safeOrderStatus(order) === 'cancelled').length
  }, [orders])
  
  
  // ✅ Show loader while loading
  if (isLoading) {
    return <Loader />
  }

  // ✅ Add loading check for products (AFTER all hooks)
  if (!products || products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ae0b0b] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-2">
              Welcome back! Here's what's happening with your store.
            </p>
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={() => {
              // Refresh contexts
              refreshProducts()
              refreshOrders()
            }}
            disabled={isLoading}
            className="px-4 py-2 bg-[#ae0b0b] text-white rounded-lg hover:bg-[#8f0a0a] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ArrowTrendingUpIcon className="h-4 w-4" />
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        
        {/* Debug Info */}
        {import.meta.env.DEV && (
          <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
            <div>Real-time Revenue: ₹{metrics.totalRevenue}</div>
            <div>Total Orders: {metrics.totalOrders}</div>
            <div>Total Users: {metrics.totalUsers}</div>
            <div>Delivered Orders: {deliveredOrders}</div>
            <div>Pending Orders: {metrics.pendingOrders}</div>
            <div>Total Products: {metrics.totalProducts}</div>
            {error && <div className="text-red-600">Error: {error}</div>}
          </div>
        )}
        
        {/* Error Display */}
        {error && !import.meta.env.DEV && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">Unable to fetch latest data. Showing cached information.</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <Link to="/admin/products">
          <StatCard
            title="Total Products"
            value={metrics.totalProducts}
            change="+0%"
            changeType="increase"
            icon={ShoppingBagIcon}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
          />
        </Link>

        <Link to="/admin/products">
          <StatCard
            title="Total Stock"
            value={totalStock}
            change={lowStockProducts > 0 ? `${lowStockProducts} low stock` : 'All good'}
            changeType={lowStockProducts > 0 ? 'decrease' : 'increase'}
            icon={ChartBarIcon}
            iconColor="text-orange-600"
            iconBg="bg-orange-50"
          />
        </Link>

        <Link to="/admin/analytics">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(metrics.totalRevenue)}
            change="From paid orders"
            changeType="increase"
            icon={CurrencyDollarIcon}
            iconColor="text-[#ae0b0b]"
            iconBg="bg-red-50"
          />
        </Link>

        <Link to="/admin/orders">
          <StatCard
            title="Pending Orders"
            value={metrics.pendingOrders}
            change={metrics.pendingOrders > 0 ? 'Needs attention' : 'All clear'}
            changeType={metrics.pendingOrders > 0 ? 'decrease' : 'increase'}
            icon={ClipboardDocumentListIcon}
            iconColor="text-purple-600"
            iconBg="bg-purple-50"
          />
        </Link>

        <Link to="/admin/customers">
          <StatCard
            title="Total Users"
            value={metrics.totalUsers}
            change="Registered customers"
            changeType="increase"
            icon={UsersIcon}
            iconColor="text-green-600"
            iconBg="bg-green-50"
          />
        </Link>
      </div>

      {/* Quick Actions */}
      <AdminCard>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
      </AdminCard>

      {/* Recent Products */}
      <AdminCard>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Products</h2>
          <Link to="/admin/products" className="text-sm font-semibold text-[#ae0b0b] hover:text-[#8f0a0a]">
            View all →
          </Link>
        </div>

        {recentProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <ShoppingBagIcon className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No products yet</p>
            <AdminButton href="/admin/upload" className="mt-4" size="sm">
              Add your first product
            </AdminButton>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-y border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Stock
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {recentProducts.map(product => (
                  <tr key={product._id || product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.title || product.name}
                            className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                            <ShoppingBagIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">{product.title || product.name}</p>
                          <p className="text-sm text-gray-500">ID: {String(product._id || product.id || 'N/A').slice(-6)}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                        {product.category}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-gray-900">
                        ₹{(product.price || 0).toLocaleString('en-IN')}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                        getTotalStock(product) <= 5
                          ? 'bg-red-50 text-red-700'
                          : 'bg-green-50 text-green-700'
                      }`}>
                        {getTotalStock(product)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

    </div>
  )
}
