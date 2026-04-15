import React, { useState, useEffect } from 'react'
import { useEnhancedOrder } from '../context/EnhancedOrderContext'
import AdminCard from '../layout/AdminCard'
import AdminButton from '../layout/AdminButton'

import {
  ShoppingBagIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'

export default function PaymentTrackingEnhanced() {
  const {
    orders,
    loading,
    fetchOrders,
    getOrderDetails,
    updateOrderStatus,
    stats
  } = useEnhancedOrder()

  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderDetails, setOrderDetails] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)

  // Filter state
  const [filters, setFilters] = useState({
    status: "all",
    paymentStatus: "all",
    paymentMethod: "all",
    page: 1,
    limit: 10,
    startDate: "",
    endDate: ""
  })

  // Safe rendering check
  if (!orders) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Loading orders...</p>
        </div>
      </div>
    )
  }

  // Calculate payment tracking metrics directly from orders
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
  const paidOrders = orders.filter(o => o.paymentStatus === 'paid').length
  const pendingOrders = orders.filter(o => o.paymentStatus !== 'paid').length

  console.log("PaymentTracking - Orders:", orders)
  console.log("PaymentTracking - Metrics:", {
    totalOrders,
    totalRevenue,
    paidOrders,
    pendingOrders
  })

  // Filter orders based on current filters
  const filteredOrders = orders.filter((order) => {
    const statusMatch = filters?.status === "all" || order.status === filters?.status
    const paymentStatusMatch = filters?.paymentStatus === "all" || order.paymentStatus === filters?.paymentStatus
    const paymentMethodMatch = filters?.paymentMethod === "all" || order.paymentMethod === filters?.paymentMethod
    
    return statusMatch && paymentStatusMatch && paymentMethodMatch
  })

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
    console.log(`Filter ${field} changed to:`, value)
  }

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: "all",
      paymentStatus: "all",
      paymentMethod: "all",
      page: 1,
      limit: 10,
      startDate: "",
      endDate: ""
    })
  }

  // Update filters
  const updateFilters = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }))
  }

  // Handle order details
  const handleViewDetails = async (orderId) => {
    try {
      setDetailsLoading(true)
      const order = await getOrderDetails(orderId)
      setOrderDetails(order)
      setSelectedOrder(order)
    } catch (error) {
      console.error('Failed to fetch order details:', error)
    } finally {
      setDetailsLoading(false)
    }
  }

  // Handle COD payment marking
  const handleMarkCODAsPaid = async (orderId) => {
    try {
      await markCODOrderAsPaid(orderId, {
        notes: 'Cash collected manually by admin'
      })
      
      // Show success message
      alert('COD order marked as paid successfully!')
    } catch (error) {
      console.error('Failed to mark COD order as paid:', error)
      alert('Failed to mark COD order as paid. Please try again.')
    }
  }

  // Handle export
  const handleExport = () => {
    try {
      exportPaymentReports({
        ...filters,
        startDate: filters.startDate || '',
        endDate: filters.endDate || ''
      })
    } catch (error) {
      console.error('Failed to export reports:', error)
      alert('Failed to export reports. Please try again.')
    }
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  // Get payment status badge color
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'refunded': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Get payment method badge color
  const getPaymentMethodColor = (method) => {
    switch (method) {
      case 'razorpay': return 'bg-blue-100 text-blue-800'
      case 'cod': return 'bg-yellow-100 text-yellow-800'
      case 'upi': return 'bg-purple-100 text-purple-800'
      case 'card': return 'bg-green-100 text-green-800'
      case 'netbanking': return 'bg-indigo-100 text-indigo-800'
      case 'wallet': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Get order status color
  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-indigo-100 text-indigo-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'refunded': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Get payment mode display
  const getPaymentModeDisplay = (order) => {
    if (order.paymentDetails) {
      const details = order.paymentDetails
      if (details.razorpayMethod === 'upi') {
        return `UPI: ${details.razorpayVPA || 'N/A'}`
      } else if (details.razorpayMethod === 'card') {
        return `Card: ${details.razorpayCardId ? '••••' + details.razorpayCardId.slice(-4) : 'N/A'}`
      } else if (details.razorpayMethod === 'netbanking') {
        return `Net Banking: ${details.razorpayBank || 'N/A'}`
      } else if (details.razorpayMethod === 'wallet') {
        return `Wallet: ${details.razorpayWallet || 'N/A'}`
      }
      return details.razorpayMethod?.toUpperCase() || 'N/A'
    }
    return order.paymentMethod?.toUpperCase() || 'N/A'
  }

  // Get comprehensive payment details
  const getPaymentDetails = (order) => {
    const details = []
    
    // Razorpay IDs
    if (order.razorpayPaymentId) {
      details.push(`Payment ID: ${order.razorpayPaymentId}`)
    }
    if (order.razorpayOrderId) {
      details.push(`Order ID: ${order.razorpayOrderId}`)
    }
    
    // Payment method details
    if (order.paymentDetails) {
      const pd = order.paymentDetails
      if (pd.razorpayMethod) {
        details.push(`Method: ${pd.razorpayMethod.toUpperCase()}`)
      }
      if (pd.razorpayVPA) {
        details.push(`UPI VPA: ${pd.razorpayVPA}`)
      }
      if (pd.razorpayWallet) {
        details.push(`Wallet: ${pd.razorpayWallet}`)
      }
      if (pd.razorpayBank) {
        details.push(`Bank: ${pd.razorpayBank}`)
      }
      if (pd.razorpayCardId) {
        details.push(`Card: ••••${pd.razorpayCardId.slice(-4)}`)
      }
      if (pd.razorpayAmount) {
        details.push(`Amount: ₹${pd.razorpayAmount}`)
      }
      if (pd.razorpayFee) {
        details.push(`Fee: ₹${pd.razorpayFee}`)
      }
      if (pd.razorpayTax) {
        details.push(`Tax: ₹${pd.razorpayTax}`)
      }
      if (pd.razorpayAcquirer) {
        details.push(`Acquirer: ${pd.razorpayAcquirer}`)
      }
      if (pd.razorpayStatus) {
        details.push(`Status: ${pd.razorpayStatus.toUpperCase()}`)
      }
      if (pd.razorpayCaptured) {
        details.push(`Captured: Yes`)
      }
    }
    
    return details.length > 0 ? details : ['N/A']
  }

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Enhanced Payment Tracking System</h1>
        <p className="text-gray-500 mt-2">Track all payment methods with comprehensive Razorpay details</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminCard>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-600">Total Orders</div>
            <div className="text-2xl font-bold text-gray-900">{totalOrders}</div>
          </div>
        </AdminCard>
        
        <AdminCard>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-600">Total Revenue</div>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
          </div>
        </AdminCard>
        
        <AdminCard>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-600">Paid Orders</div>
            <div className="text-2xl font-bold text-green-600">{paidOrders}</div>
          </div>
        </AdminCard>
        
        <AdminCard>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-600">Pending Orders</div>
            <div className="text-2xl font-bold text-yellow-600">{pendingOrders}</div>
          </div>
        </AdminCard>
      </div>

      {/* Filters */}
      <AdminCard>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ae0b0b] focus:border-transparent"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ae0b0b] focus:border-transparent"
              value={filters.paymentStatus}
              onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
            >
              <option value="">All Payment Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ae0b0b] focus:border-transparent"
              value={filters.paymentMethod}
              onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
            >
              <option value="">All Methods</option>
              <option value="cod">Cash on Delivery</option>
              <option value="razorpay">Razorpay</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="netbanking">Net Banking</option>
              <option value="wallet">Wallet</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <AdminButton onClick={() => fetchOrders()}>
              <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
              Search
            </AdminButton>
            
            <AdminButton onClick={() => handleExport()}>
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export
            </AdminButton>
            
            <AdminButton onClick={() => resetFilters()}>
              <ArrowTrendingUpIcon className="h-4 w-4 mr-2" />
              Reset
            </AdminButton>
          </div>
        </div>
      </AdminCard>

      {/* Enhanced Orders Table */}
      <AdminCard>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Paid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Razorpay ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Mode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order._id.toString().slice(-8).toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{order.userId?.name || 'Guest'}</div>
                    <div className="text-xs text-gray-400">{order.customer?.email || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentMethodColor(order.paymentMethod)}`}>
                      {order.paymentMethod?.toUpperCase() || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus?.toUpperCase() || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(order.amountPaid)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="text-xs">
                      <div className="font-mono text-blue-600">
                        {order.razorpayPaymentId || order.razorpayOrderId || 'N/A'}
                      </div>
                      {order.paymentDetails?.razorpayOrderId && (
                        <div className="text-gray-400">
                          Order: {order.paymentDetails.razorpayOrderId}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="text-xs">
                      {getPaymentModeDisplay(order)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.paymentDate ? formatDate(order.paymentDate) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getOrderStatusColor(order.status)}`}>
                      {order.status?.toUpperCase() || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(order._id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <MagnifyingGlassIcon className="h-4 w-4" />
                      </button>
                      
                      {order.paymentMethod === 'cod' && order.paymentStatus !== 'paid' && (
                        <button
                          onClick={() => handleMarkCODAsPaid(order._id)}
                          className="text-green-600 hover:text-green-900 ml-2"
                          title="Mark as Paid"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                        </button>
                      )}
                      
                      <button
                        className="text-red-600 hover:text-red-900"
                        title="More Actions"
                        onClick={() => console.log('Order actions for:', order._id)}
                      >
                        <XCircleIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">
            Showing {filteredOrders.length} of {totalOrders} orders
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
              disabled={filters.page <= 1}
              onClick={() => updateFilters({ page: parseInt(filters.page) - 1 })}
            >
              Previous
            </button>
            <button
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
              disabled={filteredOrders.length < filters.limit}
              onClick={() => updateFilters({ page: parseInt(filters.page) + 1 })}
            >
              Next
            </button>
          </div>
        </div>
      </AdminCard>

      {/* Enhanced Order Details Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
          onClick={() => setSelectedOrder(null)}
        >
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Enhanced Order Details - #{selectedOrder._id?.toString().slice(-8).toUpperCase()}
              </h3>
              
              {detailsLoading ? (
                <div className="flex justify-center py-8">
                  <ClockIcon className="h-8 w-8 text-gray-400 animate-spin" />
                  <span className="ml-2">Loading...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-2">Customer Information</h4>
                    <div className="bg-gray-50 p-3 rounded">
                      <p><span className="font-medium">Name:</span> {selectedOrder.customer?.firstName} {selectedOrder.customer?.lastName}</p>
                      <p><span className="font-medium">Email:</span> {selectedOrder.customer?.email}</p>
                      <p><span className="font-medium">Mobile:</span> {selectedOrder.customer?.mobile}</p>
                      <p><span className="font-medium">Address:</span> {selectedOrder.shippingAddress?.streetAddress}, {selectedOrder.shippingAddress?.city}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-2">Payment Information</h4>
                    <div className="bg-gray-50 p-3 rounded space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Payment Method:</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentMethodColor(selectedOrder.paymentMethod)}`}>
                          {selectedOrder.paymentMethod?.toUpperCase() || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Payment Status:</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                          {selectedOrder.paymentStatus?.toUpperCase() || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Amount Paid:</span>
                        <span className="text-green-600">{formatCurrency(selectedOrder.amountPaid)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Total Amount:</span>
                        <span className="text-gray-900">{formatCurrency(selectedOrder.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Payment Date:</span>
                        <span>{selectedOrder.paymentDate ? formatDate(selectedOrder.paymentDate) : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-2">Razorpay Payment Details</h4>
                    <div className="bg-gray-50 p-3 rounded space-y-2">
                      {getPaymentDetails(selectedOrder).map((detail, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          {detail}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-2">Order Items</h4>
                    <div className="bg-gray-50 p-3 rounded max-h-48 overflow-y-auto">
                      {selectedOrder.items?.map((item, index) => (
                        <div key={index} className="flex justify-between py-2 border-b border-gray-200 last:border-0">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">{item.quantity} x ₹{item.price}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(item.subtotal)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // Auto-refresh data every 15 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders()
    }, 15000) // 15 seconds

    return () => clearInterval(interval)
  }, [fetchOrders])
}
