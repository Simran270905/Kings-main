import React, { useState } from 'react'
import { useEnhancedOrder } from '../context/EnhancedOrderContext'
import AdminCard from '../layout/AdminCard'
import StatusBadge from '../components/StatusBadge'
import StatCard from '../components/StatCard'
import {
formatOrderDate,
formatOrderTime,
getStatusColor,
formatPrice,
} from '../utils/orderValidation'
import { 
  ShoppingBagIcon, 
  ClipboardDocumentListIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  FunnelIcon,
  CreditCardIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import {
  safeArray,
  safeCustomerName,
  safeCustomerEmail,
  safeCustomerPhone,
  safeOrderAmount,
  safeOrderStatus,
  safeOrderDate,
  logAdminData
} from '../utils/adminSafetyUtils'

const AdminOrders = () => {
  const { orders, fetchOrders, getOrderDetails, updateOrderStatus, updateFilters, resetFilters, stats, loading, lastFetch } = useEnhancedOrder()
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [error, setError] = useState('')
  const [updatingPayment, setUpdatingPayment] = useState(false)

  // Safe data handling
  const safeOrders = safeArray(orders)
  logAdminData('AdminOrders', safeOrders, 'load')

  const filteredOrders = selectedStatus === 'all'
    ? safeOrders
    : safeOrders.filter(o => safeOrderStatus(o) === selectedStatus)

  // ✅ FIXED (async)
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const result = await updateOrderStatus(orderId, newStatus)
      if (!result.success) {
        setError(result.error || 'Failed to update order status')
        setTimeout(() => setError(''), 3000)
      }
    } catch (error) {
      setError('Failed to update order status')
      setTimeout(() => setError(''), 3000)
    }
  }

  // Handle remaining payment update
  const handleMarkRemainingAsPaid = async (orderId) => {
    if (!confirm('Are you sure you want to mark the remaining payment as received?')) {
      return
    }

    setUpdatingPayment(true)
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/orders/${orderId}/remaining-payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      const result = await response.json()
      
      if (result.success) {
        alert('Remaining payment marked as paid successfully!')
        fetchOrders() // Refresh orders to show updated status
      } else {
        alert('Error: ' + (result.message || 'Failed to update payment status'))
      }
    } catch (error) {
      console.error('Error updating remaining payment:', error)
      alert('Error: Failed to update payment status')
    } finally {
      setUpdatingPayment(false)
    }
  }

  // ✅ FIXED (_id instead of orderId)
  const selectedOrder = selectedOrderId
    ? safeOrders.find(o => o._id === selectedOrderId)
    : null

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 mt-2">
            Manage and track all customer orders ({orders.length} total)
            {lastFetch && (
              <span className="block text-xs mt-1">
                Last updated: {lastFetch.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total"
          value={stats.total}
          icon={ShoppingBagIcon}
          iconColor="text-gray-600"
          iconBg="bg-gray-50"
        />

        <StatCard
          title="Pending"
          value={stats.pending}
          icon={ClipboardDocumentListIcon}
          iconColor="text-yellow-600"
          iconBg="bg-yellow-50"
        />

        <StatCard
          title="Processing"
          value={stats.processing}
          icon={ShoppingBagIcon}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />

        <StatCard
          title="Shipped"
          value={stats.shipped}
          icon={TruckIcon}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />

        <StatCard
          title="Delivered"
          value={stats.delivered}
          icon={CheckCircleIcon}
          iconColor="text-green-600"
          iconBg="bg-green-50"
        />

        <StatCard
          title="Cancelled"
          value={stats.cancelled}
          icon={XCircleIcon}
          iconColor="text-red-600"
          iconBg="bg-red-50"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
          {error}
        </div>
      )}

      {/* Filters */}
      <AdminCard>
        <div className="flex items-center gap-2 mb-4">
          <FunnelIcon className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Filter by Status</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
              selectedStatus === 'all'
                ? 'bg-[#ae0b0b] text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Orders ({orders.length})
          </button>

          {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-5 py-2.5 rounded-xl font-semibold capitalize transition-all ${
                selectedStatus === status
                  ? 'bg-[#ae0b0b] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status} ({orders.filter(o => o.status === status).length})
            </button>
          ))}
        </div>
      </AdminCard>

      {/* Table */}
      <AdminCard padding="p-0">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <ClipboardDocumentListIcon className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No orders found</p>
            <p className="text-sm text-gray-400 mt-1">Orders will appear here once customers place them</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer Details</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredOrders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-600">#{String(order._id || 'N/A').slice(-8)}</span>
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {order.customer?.name || `${order.guestInfo?.firstName || ''} ${order.guestInfo?.lastName || ''}`.trim() || 'Guest User'}
                        </p>
                        <p className="text-sm text-gray-500">{order.customer?.email || order.guestInfo?.email || '-'}</p>
                        <p className="text-xs text-gray-400">{order.customer?.phone || order.guestInfo?.mobile || '-'}</p>
                        {order.shiprocketOrderId && (
                          <p className="text-xs text-blue-600 font-medium">Shiprocket ID: {order.shiprocketOrderId}</p>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{formatOrderDate(safeOrderDate(order))}</p>
                        <p className="text-xs text-gray-500">{formatOrderTime(safeOrderDate(order))}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-gray-900">
                        {formatPrice(safeOrderAmount(order))}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={order.paymentStatus || 'pending'} size="sm" />
                      {order.paymentMethod && (
                        <p className="text-xs text-gray-500 mt-1 capitalize">{order.paymentMethod}</p>
                      )}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={safeOrderStatus(order)} />
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedOrderId(selectedOrderId === order._id ? null : order._id)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                      >
                        {selectedOrderId === order._id ? 'Hide' : 'View'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {/* Details */}
      {selectedOrder && (
        <AdminCard>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
            <span className="font-mono text-sm text-gray-500">#{selectedOrder._id}</span>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-600 uppercase mb-2">Customer Information</h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm"><span className="font-medium">Name:</span> {selectedOrder.customer?.name || `${selectedOrder.shippingAddress?.firstName} ${selectedOrder.shippingAddress?.lastName}` || 'Guest User'}</p>
                <p className="text-sm"><span className="font-medium">Email:</span> {selectedOrder.customer?.email || selectedOrder.shippingAddress?.email || '-'}</p>
                <p className="text-sm"><span className="font-medium">Phone:</span> {selectedOrder.customer?.phone || selectedOrder.shippingAddress?.mobile || '-'}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-600 uppercase mb-2">Order Status</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-2">Current Status:</p>
                  <StatusBadge status={selectedOrder.status} size="lg" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {['pending','processing','shipped','delivered','cancelled'].map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(selectedOrder._id, status)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                        selectedOrder.status === status
                          ? 'bg-[#ae0b0b] text-white'
                          : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-[#ae0b0b]'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Plan Information */}
          {selectedOrder.paymentPlan === 'partial' && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-600 uppercase mb-2">
                <CreditCardIcon className="inline h-4 w-4 mr-1" />
                Payment Plan Details
              </h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-blue-600 font-medium uppercase">Payment Method</p>
                    <p className="text-sm font-bold text-blue-900 capitalize">{selectedOrder.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 font-medium uppercase">Payment Plan</p>
                    <p className="text-sm font-bold text-blue-900 capitalize">{selectedOrder.paymentPlan}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium uppercase">Original Amount</p>
                    <p className="text-sm font-bold text-gray-900">{formatPrice(selectedOrder.originalAmount)}</p>
                  </div>
                  {selectedOrder.codCharge > 0 && (
                    <div>
                      <p className="text-xs text-orange-600 font-medium uppercase">COD Charge</p>
                      <p className="text-sm font-bold text-orange-900">{formatPrice(selectedOrder.codCharge)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-green-600 font-medium uppercase">Discount Applied</p>
                    <p className="text-sm font-bold text-green-900">
                      {selectedOrder.discountApplied ? `Yes (${selectedOrder.discountPercent}%)` : 'No'}
                    </p>
                  </div>
                  {selectedOrder.discountApplied && (
                    <>
                      <div>
                        <p className="text-xs text-green-600 font-medium uppercase">Discounted Total</p>
                        <p className="text-sm font-bold text-green-900">{formatPrice(selectedOrder.discountedTotal)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-green-600 font-medium uppercase">Discount Amount</p>
                        <p className="text-sm font-bold text-green-900">-{formatPrice(selectedOrder.paymentMethodDiscount)}</p>
                      </div>
                    </>
                  )}
                  <div>
                    <p className="text-xs text-green-600 font-medium uppercase">Advance Paid ({selectedOrder.advancePercent}%)</p>
                    <p className="text-sm font-bold text-green-900">{formatPrice(selectedOrder.advanceAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-orange-600 font-medium uppercase">Remaining Due ({selectedOrder.remainingPercent}%)</p>
                    <p className="text-sm font-bold text-orange-900">{formatPrice(selectedOrder.remainingAmount)}</p>
                  </div>
                </div>
                
                {/* Final Total */}
                <div className="flex items-center justify-between pt-3 border-t border-blue-200">
                  <div>
                    <p className="text-sm font-bold text-gray-900 uppercase">Final Total</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{formatPrice(selectedOrder.totalAmount)}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-blue-200">
                  <div>
                    <p className="text-xs text-gray-600">Remaining Payment Status:</p>
                    <p className={`text-sm font-bold ${
                      selectedOrder.remainingPaymentStatus === 'paid' 
                        ? 'text-green-600' 
                        : 'text-orange-600'
                    }`}>
                      {selectedOrder.remainingPaymentStatus === 'paid' ? '✓ Paid' : '⏳ Pending'}
                    </p>
                    {selectedOrder.remainingPaymentDate && (
                      <p className="text-xs text-gray-500">
                        Paid on: {new Date(selectedOrder.remainingPaymentDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  
                  {selectedOrder.remainingPaymentStatus === 'pending' && (
                    <button
                      onClick={() => handleMarkRemainingAsPaid(selectedOrder._id)}
                      disabled={updatingPayment}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {updatingPayment ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <CurrencyDollarIcon className="h-4 w-4" />
                          Mark Remaining as Paid
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Customer Details */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-600 uppercase mb-2">Customer Details</h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-sm"><span className="font-medium">Name:</span> {selectedOrder.customer?.name || `${selectedOrder.guestInfo?.firstName || ''} ${selectedOrder.guestInfo?.lastName || ''}`.trim() || 'Guest User'}</p>
              <p className="text-sm"><span className="font-medium">Email:</span> {selectedOrder.customer?.email || selectedOrder.guestInfo?.email || '-'}</p>
              <p className="text-sm"><span className="font-medium">Phone:</span> {selectedOrder.customer?.phone || selectedOrder.guestInfo?.mobile || '-'}</p>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-600 uppercase mb-2">Shipping Address</h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-sm"><span className="font-medium">Street Address:</span> {selectedOrder.guestInfo?.streetAddress || selectedOrder.shippingAddress?.streetAddress || 'N/A'}</p>
              <div className="grid grid-cols-2 gap-4">
                <p className="text-sm"><span className="font-medium">City:</span> {selectedOrder.guestInfo?.city || selectedOrder.shippingAddress?.city || 'N/A'}</p>
                <p className="text-sm"><span className="font-medium">State:</span> {selectedOrder.guestInfo?.state || selectedOrder.shippingAddress?.state || 'N/A'}</p>
              </div>
              <p className="text-sm"><span className="font-medium">ZIP Code:</span> {selectedOrder.guestInfo?.zipCode || selectedOrder.shippingAddress?.zipCode || 'N/A'}</p>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-600 uppercase mb-2">Shipping Information</h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-sm"><span className="font-medium">Shiprocket Order ID:</span> {selectedOrder.shiprocketOrderId || 'N/A'}</p>
              <p className="text-sm"><span className="font-medium">AWB Code:</span> {selectedOrder.awbCode || 'N/A'}</p>
              <p className="text-sm"><span className="font-medium">Courier Name:</span> {selectedOrder.courierName || 'N/A'}</p>
              <p className="text-sm"><span className="font-medium">Tracking Number:</span> {selectedOrder.trackingNumber || 'N/A'}</p>
              {selectedOrder.trackingUrl && (
                <p className="text-sm">
                  <span className="font-medium">Tracking URL:</span> 
                  <a href={selectedOrder.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                    Track Shipment
                  </a>
                </p>
              )}
              <p className="text-sm"><span className="font-medium">Shipping Status:</span> 
                <span className={`ml-1 px-2 py-1 rounded text-xs font-medium ${
                  selectedOrder.shippingStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                  selectedOrder.shippingStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
                  selectedOrder.shippingStatus === 'created' ? 'bg-yellow-100 text-yellow-800' :
                  selectedOrder.shippingStatus === 'pending' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedOrder.shippingStatus?.replace('_', ' ').toUpperCase() || 'N/A'}
                </span>
              </p>
              {selectedOrder.estimatedDelivery && (
                <p className="text-sm"><span className="font-medium">Estimated Delivery:</span> {new Date(selectedOrder.estimatedDelivery).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        </AdminCard>
      )}
    </div>
  )
}

export default AdminOrders
