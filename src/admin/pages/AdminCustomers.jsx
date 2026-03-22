'use client'

import { useState, useEffect } from 'react'
import AdminCard from '../layout/AdminCard'
import StatCard from '../components/StatCard'
import { API_BASE_URL } from '../../config/api'
import { UsersIcon, MagnifyingGlassIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline'

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem('kk_admin_token')
        const res = await fetch(`${API_BASE_URL}/admin/customers`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setCustomers(data.data || data.customers || [])
      } catch (err) {
        setError(err.message || 'Could not load customers.')
      } finally {
        setLoading(false)
      }
    }
    fetchCustomers()
  }, [])

  const filtered = customers.filter(c =>
    `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(search.toLowerCase())
  )

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
            if (!c.createdAt) return false
            const created = new Date(c.createdAt)
            const monthAgo = new Date()
            monthAgo.setMonth(monthAgo.getMonth() - 1)
            return created >= monthAgo
          }).length}
          icon={UsersIcon}
          iconColor="text-green-600"
          iconBg="bg-green-50"
        />
        <StatCard
          title="Verified Emails"
          value={customers.filter(c => c.email).length}
          icon={EnvelopeIcon}
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
                    <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {c.firstName?.charAt(0)}{c.lastName?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{c.firstName} {c.lastName}</p>
                            <p className="text-sm text-gray-500">ID: {String(c._id || 'N/A').slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-700">{c.email}</span>
                          </div>
                          {c.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <PhoneIcon className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-700">{c.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            }) : '—'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {c.createdAt ? new Date(c.createdAt).toLocaleTimeString('en-IN', { 
                              hour: '2-digit', 
                              minute: '2-digit'
                            }) : ''}
                          </p>
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
