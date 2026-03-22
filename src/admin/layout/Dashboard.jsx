'use client'

import { useProduct } from '../../customer/context/ProductContext'
import { useCart } from '../../customer/context/useCart'
import { useOrder } from '../context/OrderContext'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'

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
  calculateTotalStats,
  getRevenueStats,
} from '../utils/analyticsUtils'

export default function Dashboard() {
  const { products } = useProduct()
  const { cartItems } = useCart()
  const { orders } = useOrder()

  const orderStats = useMemo(() => calculateTotalStats(orders), [orders])
  const revenueStats = useMemo(() => getRevenueStats(orders), [orders])

  const totalProducts = products.length

  // ✅ FIXED: use backend order revenue
  const totalRevenue = revenueStats.totalRevenue || 0

  const pendingOrders = orderStats.pendingOrders || 0

  // ✅ FIXED: stock from sizes
  const lowStockProducts = useMemo(() => {
    return products.filter(p =>
      p.sizes?.some(s => s.stock <= 5)
    ).length
  }, [products])

  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString('en-IN')}`
  }

  const recentProducts = products.slice(-5).reverse()

  return (
    <div className="p-6 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-2">
          Welcome back! Here's what's happening with your store.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/admin/products">
          <StatCard
            title="Total Products"
            value={totalProducts}
            change="+0%"
            changeType="increase"
            icon={ShoppingBagIcon}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
          />
        </Link>

        <Link to="/admin/analytics">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            change={`${revenueStats.revenueGrowth > 0 ? '+' : ''}${revenueStats.revenueGrowth || 0}%`}
            changeType={revenueStats.revenueGrowth > 0 ? 'increase' : 'decrease'}
            icon={CurrencyDollarIcon}
            iconColor="text-[#ae0b0b]"
            iconBg="bg-red-50"
          />
        </Link>

        <Link to="/admin/orders">
          <StatCard
            title="Pending Orders"
            value={pendingOrders}
            change={pendingOrders > 0 ? 'Needs attention' : 'All clear'}
            changeType={pendingOrders > 0 ? 'decrease' : 'increase'}
            icon={ClipboardDocumentListIcon}
            iconColor="text-purple-600"
            iconBg="bg-purple-50"
          />
        </Link>

        <Link to="/admin/products">
          <StatCard
            title="Low Stock Alert"
            value={lowStockProducts}
            change={lowStockProducts > 0 ? 'Action required' : 'All good'}
            changeType={lowStockProducts > 0 ? 'decrease' : 'increase'}
            icon={ExclamationTriangleIcon}
            iconColor="text-orange-600"
            iconBg="bg-orange-50"
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
                        (product.sizes?.reduce((a, s) => a + s.stock, 0) || 0) <= 5
                          ? 'bg-red-50 text-red-700'
                          : 'bg-green-50 text-green-700'
                      }`}>
                        {product.sizes?.reduce((a, s) => a + s.stock, 0) ?? 'N/A'}
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
