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
  }

  const isGroupActive = (group) =>
    group.items?.some(item => isActive(item.href, item.exact))

  const toggleGroup = (key) => {
    setOpenGroups(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const currentPageName = () => {
    for (const group of NAV_GROUPS) {
      for (const item of group.items || []) {
        if (isActive(item.href, item.exact)) return item.name
      }
    }
    return 'Admin Dashboard'
  }

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between h-16 px-5 border-b border-gray-100">
        <Link to="/admin" className="flex items-center gap-2.5" onClick={() => setSidebarOpen(false)}>
          <div className="w-8 h-8 bg-[#ae0b0b] rounded-lg flex items-center justify-center text-white font-bold text-sm">KK</div>
          <div>
            <div className="text-sm font-bold text-gray-900">Admin Panel</div>
            <div className="text-[10px] text-gray-400">Manage your store</div>
          </div>
        </Link>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600">
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {NAV_GROUPS.map((group, gi) => {
          if (!group.label) {
            return group.items.map(item => {
              const Icon = item.icon
              const active = isActive(item.href, item.exact)
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active ? 'bg-[#ae0b0b] text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-[#ae0b0b]'
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {item.name}
                </Link>
              )
            })
          }

          const GroupIcon = group.icon
          const isOpen = openGroups.includes(group.groupKey)
          const groupActive = isGroupActive(group)

          return (
            <div key={group.groupKey}>
              <button
                onClick={() => toggleGroup(group.groupKey)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  groupActive && !isOpen
                    ? 'bg-red-50 text-[#ae0b0b]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <GroupIcon className="h-4 w-4 flex-shrink-0" />
                  {group.label}
                </div>
                <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="ml-3 pl-3 border-l-2 border-gray-100 mt-0.5 space-y-0.5">
                  {group.items.map(item => {
                    const Icon = item.icon
                    const active = isActive(item.href, item.exact)
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                          active ? 'bg-[#ae0b0b] text-white font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-[#ae0b0b]'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                        {item.name}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-[#b91c1c] transition-colors"
        >
          <ArrowRightOnRectangleIcon className="h-4 w-4" />
          Logout
        </button>
        <p className="text-[10px] text-center text-gray-300 mt-3">Powered by<br />KKings_Jewellery</p>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-60 bg-white border-r border-gray-100 fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-60 bg-white shadow-2xl flex flex-col transform transition-transform duration-300 lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <SidebarContent />
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-60">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100 h-14 flex items-center px-4 sm:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 mr-3">
            <Bars3Icon className="h-5 w-5" />
          </button>
          <div className="flex items-center justify-between flex-1">
            <h1 className="text-sm font-semibold text-gray-700 hidden sm:block">{currentPageName()}</h1>
            <a href="http://localhost:5173" className="text-xs font-semibold text-[#ae0b0b] hover:opacity-80 ml-auto">
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
