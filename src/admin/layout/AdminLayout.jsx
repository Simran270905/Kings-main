import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'
import {
  ShoppingBagIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  ChartPieIcon,
  DocumentTextIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'

export default function AdminLayout() {
  const { isAdmin, loading } = useAdminAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ae0b0b] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
            </div>
            <p className="text-gray-600">Please log in to access the admin panel.</p>
            <Link 
              to="/admin/login" 
              className="mt-4 inline-flex items-center px-4 py-2 bg-[#ae0b0b] text-white rounded-md hover:bg-[#8f0a0a] transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar - Fixed Left */}
      <div className="w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 bg-[#ae0b0b]">
            <h1 className="text-white text-xl font-bold">KK Admin</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <Link
              to="/admin"
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive('/admin') 
                  ? 'bg-[#ae0b0b] text-white' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <ChartPieIcon className="mr-3 h-5 w-5" />
              Dashboard
            </Link>

            <Link
              to="/admin/orders"
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive('/admin/orders') 
                  ? 'bg-[#ae0b0b] text-white' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <ShoppingBagIcon className="mr-3 h-5 w-5" />
              Orders
            </Link>

            <Link
              to="/admin/products"
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive('/admin/products') 
                  ? 'bg-[#ae0b0b] text-white' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <DocumentTextIcon className="mr-3 h-5 w-5" />
              Products
            </Link>

            <Link
              to="/admin/pages"
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive('/admin/pages') 
                  ? 'bg-[#ae0b0b] text-white' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <DocumentTextIcon className="mr-3 h-5 w-5" />
              Pages
            </Link>

            <Link
              to="/admin/analytics"
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive('/admin/analytics') 
                  ? 'bg-[#ae0b0b] text-white' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <ChartBarIcon className="mr-3 h-5 w-5" />
              Analytics
            </Link>

            <Link
              to="/admin/customers"
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive('/admin/customers') 
                  ? 'bg-[#ae0b0b] text-white' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <UsersIcon className="mr-3 h-5 w-5" />
              Customers
            </Link>

            <Link
              to="/admin/settings"
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive('/admin/settings') 
                  ? 'bg-[#ae0b0b] text-white' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Cog6ToothIcon className="mr-3 h-5 w-5" />
              Settings
            </Link>
          </nav>

          {/* Bottom Actions */}
          <div className="mt-auto p-4 border-t border-gray-200">
            <Link
              to="/"
              className="flex items-center px-4 py-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
              View Store
            </Link>
            
            <button
              onClick={() => {
                localStorage.removeItem('kk_admin_token')
                window.location.href = '/admin/login'
              }}
              className="flex items-center px-4 py-3 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors w-full"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area - Right */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Welcome back!</span>
                <span>•</span>
                <span>KKINGS Admin Panel</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
