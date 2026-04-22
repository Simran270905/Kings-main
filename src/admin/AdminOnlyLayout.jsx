import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAdminAuth } from './context/AdminAuthContext'
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
  DocumentTextIcon,
  PencilSquareIcon,
  TicketIcon,
    EnvelopeIcon,
    StarIcon,
} from '@heroicons/react/24/outline'

const AdminOnlyLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { logoutAdmin } = useAdminAuth()

  const adminMenuItems = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBagIcon },
        { name: 'Products', href: '/admin/products', icon: ShoppingBagIcon },
    { name: 'Add Product', href: '/admin/upload', icon: PlusCircleIcon },
    { name: 'Categories', href: '/admin/categories', icon: DocumentTextIcon },
    { name: 'Brands', href: '/admin/brands', icon: TicketIcon },
    { name: 'Coupons', href: '/admin/coupons', icon: TicketIcon },
    { name: 'Reviews', href: '/admin/reviews', icon: StarIcon },
    { name: 'Contact Messages', href: '/admin/contact-messages', icon: EnvelopeIcon },
    { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
    { name: 'Reports', href: '/admin/reports', icon: ChartBarIcon },
    { name: 'Customers', href: '/admin/customers', icon: UsersIcon },
    { name: 'Pages', href: '/admin/pages', icon: DocumentTextIcon },
    { name: 'CMS: Home', href: '/admin/cms/home', icon: PencilSquareIcon },
    { name: 'CMS: Footer', href: '/admin/cms/footer', icon: PencilSquareIcon },
    { name: 'CMS: Our Story', href: '/admin/cms/our-story', icon: PencilSquareIcon },
    { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
  ]

  const isActive = href =>
    href === '/admin'
      ? location.pathname === href
      : location.pathname.startsWith(href)

  /**
   * Handle admin logout
   * Clears token and redirects to admin login page
   */
  const handleLogout = () => {
    const result = logoutAdmin()
    if (result.success) {
      navigate('/admin-login')
    }
  }

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Logo */}
      <div className="p-6 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#ae0b0b] to-[#8f0a0a] rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">KK</span>
          </div>
          <div>
            <span className="text-xl font-bold text-gray-900 block">Admin Panel</span>
            <span className="text-xs text-gray-500">Manage your store</span>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {adminMenuItems.map(item => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  group flex items-center gap-3 px-4 py-3 rounded-xl
                  transition-all duration-200 font-medium
                  ${
                    active
                      ? 'bg-[#ae0b0b] text-white shadow-lg transform scale-[1.02]'
                      : 'text-gray-700 hover:bg-white hover:shadow-md'
                  }
                `}
              >
                <Icon className={`h-5 w-5 ${
                  active ? 'text-white' : 'text-gray-500 group-hover:text-[#ae0b0b]'
                }`} />
                <span className="text-sm">{item.name}</span>
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 bg-white border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          <span className="text-sm">Logout</span>
        </button>
        
        {/* Branding */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 text-center leading-relaxed">
            Powered by<br />
            <span className="font-medium text-gray-500">KKings_Jewellery</span>
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="h-screen bg-gray-100 flex">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-gray-200 shadow-xl
          transform transition-transform duration-300 ease-in-out h-full
          lg:translate-x-0 lg:static lg:h-full
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {renderSidebarContent()}
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Mobile header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Bars3Icon className="h-6 w-6 text-gray-700" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#ae0b0b] to-[#8f0a0a] rounded-xl flex items-center justify-center">
              <span className="font-bold text-white">KK</span>
            </div>
            <span className="font-bold text-lg text-gray-900">Admin</span>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminOnlyLayout
