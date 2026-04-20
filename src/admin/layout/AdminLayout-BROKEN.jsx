import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  HomeIcon,
  ShoppingBagIcon,
  PlusCircleIcon,
  ChartBarIcon,
  UsersIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  TagIcon,
  FolderIcon,
  DocumentTextIcon,
  ReceiptPercentIcon,
  ChevronDownIcon,
  ListBulletIcon,
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '../context/useAdminAuth'

const NAV_GROUPS = [
  {
    label: null,
    items: [
      { name: 'Dashboard', href: '/admin', icon: HomeIcon, exact: true },
    ]
  },
  {
    label: 'Products',
    icon: ShoppingBagIcon,
    groupKey: 'products',
    items: [
      { name: 'Manage Products', href: '/admin/products', icon: ListBulletIcon },
      { name: 'Add Product', href: '/admin/upload', icon: PlusCircleIcon },
    ]
  },
  {
    label: 'Categories',
    icon: FolderIcon,
    groupKey: 'categories',
    items: [
      { name: 'Manage Categories', href: '/admin/categories', icon: ListBulletIcon },
      { name: 'Add Category', href: '/admin/categories', icon: PlusCircleIcon },
    ]
  },
  {
    label: 'Brands',
    icon: TagIcon,
    groupKey: 'brands',
    items: [
      { name: 'Manage Brands', href: '/admin/brands', icon: ListBulletIcon },
      { name: 'Add Brand', href: '/admin/brands', icon: PlusCircleIcon },
    ]
  },
  {
    label: 'Sales',
    icon: ReceiptPercentIcon,
    groupKey: 'sales',
    items: [
      { name: 'Orders', href: '/admin/orders', icon: ShoppingBagIcon },
      { name: 'Coupons', href: '/admin/coupons', icon: TagIcon },
      { name: 'Customers', href: '/admin/customers', icon: UsersIcon },
    ]
  },
  {
    label: 'Analytics',
    icon: ChartBarIcon,
    groupKey: 'analytics',
    items: [
      { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
      { name: 'Reports', href: '/admin/reports', icon: DocumentTextIcon },
    ]
  },
  {
    label: 'Content (CMS)',
    icon: DocumentTextIcon,
    groupKey: 'cms',
    items: [
      { name: 'Home Page', href: '/admin/cms/home', icon: HomeIcon },
      { name: 'Footer', href: '/admin/cms/footer', icon: DocumentTextIcon },
      { name: 'Our Story', href: '/admin/cms/our-story', icon: DocumentTextIcon },
      { name: 'Pages', href: '/admin/pages', icon: DocumentTextIcon },
    ]
  },
  {
    label: null,
    items: [
      { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
    ]
  },
]

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [openGroups, setOpenGroups] = useState(['products', 'categories', 'brands'])
  const location = useLocation()
  const navigate = useNavigate()
  const { logoutAdmin } = useAdminAuth()

  const handleLogout = () => {
    logoutAdmin()
    navigate('/')
  }

  const isActive = (href, exact = false) => {
    if (!href) return false
    if (exact) return location.pathname === href
    return location.pathname.startsWith(href)
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
                window.location.pathname === '/admin' || window.location.pathname === '/admin/' 
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
                window.location.pathname.startsWith('/admin/orders')
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
                window.location.pathname.startsWith('/admin/products')
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
                window.location.pathname.startsWith('/admin/pages')
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
                window.location.pathname.startsWith('/admin/analytics')
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
                window.location.pathname.startsWith('/admin/customers')
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
                window.location.pathname.startsWith('/admin/settings')
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
              <Squares2X2Icon className="mr-3 h-5 w-5" />
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
              View Store →
            </a>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
