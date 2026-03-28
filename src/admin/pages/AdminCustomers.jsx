import { useState, useEffect } from 'react'
import { useOrder } from '../context/OrderContext'
import AdminCard from '../layout/AdminCard'
import StatCard from '../components/StatCard'
import { UsersIcon, MagnifyingGlassIcon, EnvelopeIcon, PhoneIcon, ShoppingBagIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline'
import {
  safeArray,
  safeString,
  safeNumber,
  safeCurrency,
  safeDate,
  extractCustomersFromOrders,
  logAdminData
} from '../utils/adminSafetyUtils'

const AdminCustomers = () => {
  const { orders, loading } = useOrder()
  const [customers, setCustomers] = useState([])
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  // Safe rendering check
  if (!orders) {
    return (
      <AdminCard>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ae0b0b]"></div>
        </div>
      </AdminCard>
    )
  }

  // Extract customers from orders when orders change
  useEffect(() => {
    console.log("AdminCustomers - Orders received:", orders)
    
    if (Array.isArray(orders) && orders.length > 0) {
      console.log("AdminCustomers - Processing orders:", orders.length)
      
      // Extract customers from orders
      const extractedCustomers = extractCustomersFromOrders(orders)
      setCustomers(extractedCustomers)
      logAdminData('AdminCustomers', extractedCustomers, 'extracted')
    } else {
      console.log("AdminCustomers - No orders available")
      setCustomers([])
    }
  }, [orders])

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer => {
    const searchLower = search.toLowerCase()
    return (
      safeString(customer.name).toLowerCase().includes(searchLower) ||
      safeString(customer.email).toLowerCase().includes(searchLower) ||
      safeString(customer.phone).toLowerCase().includes(searchLower)
    )
  })

  // Calculate customer stats
  const totalCustomers = customers.length
  const totalOrders = orders.length
  const avgOrdersPerCustomer = totalCustomers > 0 ? (totalOrders / totalCustomers).toFixed(1) : 0

  console.log("AdminCustomers - Final customers:", customers)
  console.log("AdminCustomers - Stats:", {
    totalCustomers,
    totalOrders,
    avgOrdersPerCustomer
  })

  // Loading state
  if (loading) {
    return (
      <AdminCard>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ae0b0b]"></div>
        </div>
      </AdminCard>
    )
  }

  // Error state
  if (error) {
    return (
      <AdminCard>
        <div className="text-center py-12">
          <UsersIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Customers</h3>
          <p className="text-gray-500">{error}</p>
        </div>
      </AdminCard>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-500 mt-2">View and manage all registered customers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Customers"
          value={totalCustomers}
          icon={UsersIcon}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Total Orders"
          value={totalOrders}
          icon={ShoppingBagIcon}
          iconColor="text-green-600"
          iconBg="bg-green-50"
        />
        <StatCard
          title="Avg Orders/Customer"
          value={avgOrdersPerCustomer}
          icon={ArrowTrendingUpIcon}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
      </div>

      <AdminCard>
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ae0b0b] focus:border-transparent"
          />
        </div>
      </AdminCard>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-12 h-12 border-4 border-[#ae0b0b] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <AdminCard>
          <div className="p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl">
            <p className="font-medium">{error}</p>
          </div>
        </AdminCard>
      )}

      {!loading && !error && (
        <AdminCard padding="p-0">
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <UsersIcon className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium mb-2">No customers found</p>
              <p className="text-sm text-gray-400">Try adjusting your search</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredCustomers.map(c => (
                    <tr key={c._id || c.email || c.phone} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {safeString(c.name).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{safeString(c.name)}</p>
                            <p className="text-sm text-gray-500">
                              {c.totalOrders || 0} order{(c.totalOrders || 0) !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-700">{safeString(c.email)}</span>
                          </div>
                          {c.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <PhoneIcon className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-700">{safeString(c.phone)}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-900">{safeDate(c.lastOrder || c.createdAt)}</p>
                          <p className="text-gray-500">{safeCurrency(c.totalSpent)}</p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminCard>
      )}
    </div>
  )
}

export default AdminCustomers
