import { useState, useEffect } from 'react'
import AdminCard from '../layout/AdminCard'
import StatCard from '../components/StatCard'
import { API_BASE_URL } from '@config/api.js'
import { UsersIcon, MagnifyingGlassIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline'
import {
  safeArray,
  safeString,
  safeNumber,
  safeCurrency,
  safeDate,
  extractCustomersFromOrders,
  logAdminData,
  safeApiResponse
} from '../utils/adminSafetyUtils'

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchCustomersAndOrders = async () => {
      setLoading(true)
      setError('')
      
      try {
        // Fetch orders to extract customers
        const token = localStorage.getItem('kk_admin_token')
        
        const ordersResponse = await fetch(`${API_BASE_URL}/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json()
          console.log("AdminCustomers - Orders API Response:", ordersData)
          // Fix: Extract from nested structure { success, data: { orders: [] } }
          const ordersArray = safeArray(ordersData.data?.data?.orders || ordersData.data?.orders || ordersData.orders || ordersData.data || ordersData)
          console.log("AdminCustomers - Orders extracted:", ordersArray)
          
          // ✅ TASK 1 & 3: Prevent overwriting with empty data
          if (Array.isArray(ordersArray) && ordersArray.length > 0) {
            console.log("AdminCustomers - Setting orders:", ordersArray.length)
            setOrders(ordersArray)
            
            // Extract customers from orders
            const extractedCustomers = extractCustomersFromOrders(ordersArray)
            setCustomers(extractedCustomers)
            logAdminData('AdminCustomers', extractedCustomers, 'extracted')
          } else {
            console.log("AdminCustomers - Skipping orders update: empty array")
          }
        } else {
          // Fallback: try direct customers API
          const customersResponse = await fetch(`${API_BASE_URL}/admin/customers`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          
          if (customersResponse.ok) {
            const customersData = await customersResponse.json()
            console.log("AdminCustomers - Customers API Response:", customersData)
            // Fix: Extract from nested structure
            const customersArray = safeArray(customersData.data?.data?.customers || customersData.data?.customers || customersData.customers || customersData.data || customersData)
            console.log("AdminCustomers - Customers extracted:", customersArray)
            
            // ✅ TASK 1 & 3: Prevent overwriting with empty data
            if (Array.isArray(customersArray) && customersArray.length > 0) {
              console.log("AdminCustomers - Setting customers:", customersArray.length)
              setCustomers(customersArray)
              logAdminData('AdminCustomers', customersArray, 'direct')
            } else {
              console.log("AdminCustomers - Skipping customers update: empty array")
            }
          } else {
            throw new Error('Unable to fetch customer data')
          }
        }
        
      } catch (err) {
        console.error('AdminCustomers Error:', err)
        setError(err.message || 'Could not load customers.')
        logAdminData('AdminCustomers', err, 'error')
      } finally {
        setLoading(false)
      }
    }
    
    fetchCustomersAndOrders()
  }, [])

  const filtered = customers.filter(c => {
    const searchString = `${safeString(c.name)} ${safeString(c.email)} ${safeString(c.phone)}`.toLowerCase()
    return searchString.includes(search.toLowerCase())
  })

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-500 mt-2">View and manage all registered customers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Customers"
          value={customers.length}
          icon={UsersIcon}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Active This Month"
          value={customers.filter(c => {
            const lastOrder = c.lastOrder || c.createdAt
            if (!lastOrder) return false
            const created = new Date(lastOrder)
            const monthAgo = new Date()
            monthAgo.setMonth(monthAgo.getMonth() - 1)
            return created >= monthAgo
          }).length}
          icon={UsersIcon}
          iconColor="text-green-600"
          iconBg="bg-green-50"
        />
        <StatCard
          title="Total Spent"
          value={safeCurrency(customers.reduce((sum, c) => sum + safeNumber(c.totalSpent), 0))}
          icon={UsersIcon}
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
          {filtered.length === 0 ? (
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
                  {filtered.map(c => (
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
