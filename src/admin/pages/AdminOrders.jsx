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
  FunnelIcon
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Shipping Address</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Amount</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Order Status</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Shiprocket Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">AWB / Courier</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Tracking</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order Date</th>
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
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-900">
                          {order.guestInfo?.city || order.shippingAddress?.city || 'N/A'}, 
                          {order.guestInfo?.state || order.shippingAddress?.state || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500">{order.guestInfo?.zipCode || order.shippingAddress?.zipCode || 'N/A'}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-900">{order.items?.length || 0} items</p>
                        <p className="text-xs text-gray-500 truncate">{order.items?.[0]?.name || 'N/A'}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-gray-900">
                        {formatPrice(safeOrderAmount(order))}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        order.paymentStatus === 'completed' || order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                        order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {(order.paymentStatus || 'N/A').toUpperCase()}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={safeOrderStatus(order)} />
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        order.shippingStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.shippingStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.shippingStatus === 'created' ? 'bg-yellow-100 text-yellow-800' :
                        order.shippingStatus === 'pending' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.shippingStatus?.replace('_', ' ').toUpperCase() || 'NOT CREATED'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-900">{order.awbCode || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{order.courierName || 'N/A'}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      {order.trackingUrl ? (
                        <button
                          onClick={() => window.open(order.trackingUrl, '_blank')}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
                        >
                          Track
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-900">{formatOrderDate(safeOrderDate(order))}</p>
                        <p className="text-xs text-gray-500">{formatOrderTime(safeOrderDate(order))}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedOrderId(selectedOrderId === order._id ? null : order._id)}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded transition-colors mr-1"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleStatusChange(order._id, 'cancelled')}
                        className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded transition-colors"
                      >
                        Cancel
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

          
          {/* Order Items */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-600 uppercase mb-2">Ordered Items</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              {selectedOrder.items?.map((item, index) => (
                <div key={index} className="flex items-center gap-4 py-3 border-b border-gray-200 last:border-b-0">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatPrice(item.subtotal)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Amount Breakdown */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-600 uppercase mb-2">Amount Breakdown</h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Subtotal:</span>
                <span className="text-sm font-medium">{formatPrice(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Shipping:</span>
                <span className="text-sm font-medium">{formatPrice(selectedOrder.shippingCost || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Discount:</span>
                <span className="text-sm font-medium text-red-600">-{formatPrice(selectedOrder.discount || 0)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-300">
                <span className="text-sm font-semibold text-gray-900">Total:</span>
                <span className="text-sm font-bold text-gray-900">{formatPrice(selectedOrder.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-600 uppercase mb-2">Payment Information</h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Payment Method:</span>
                <span className="text-sm font-medium capitalize">{selectedOrder.paymentMethod || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Payment Status:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  selectedOrder.paymentStatus === 'completed' || selectedOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                  selectedOrder.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  selectedOrder.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {(selectedOrder.paymentStatus || 'N/A').toUpperCase()}
                </span>
              </div>
              {selectedOrder.paymentId && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Payment ID:</span>
                  <span className="text-sm font-medium font-mono">{selectedOrder.paymentId}</span>
                </div>
              )}
              {selectedOrder.paidAt && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Paid At:</span>
                  <span className="text-sm font-medium">{new Date(selectedOrder.paidAt).toLocaleString()}</span>
                </div>
              )}
              {selectedOrder.couponCode && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Coupon Applied:</span>
                  <span className="text-sm font-medium">{selectedOrder.couponCode} (-{formatPrice(selectedOrder.discount || 0)})</span>
                </div>
              )}
            </div>
          </div>

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

          {/* Admin Notes */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-600 uppercase mb-2">Admin Notes</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Add internal notes about this order..."
                defaultValue={selectedOrder.notes || ''}
              />
              <button className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                Save Notes
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors">
              <TruckIcon className="h-4 w-4" />
              Sync Shiprocket Status
            </button>
          </div>
        </AdminCard>
      )}
    </div>
  )
}

export default AdminOrders
