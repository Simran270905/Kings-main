import React, { useState, useEffect } from 'react'
import { useCustomerOrder } from '../../context/CustomerOrderContext'
import { useAuth } from '../../context/useAuth'
import { Link } from 'react-router-dom'
import { TruckIcon, CheckCircleIcon, ClockIcon, XCircleIcon, EyeIcon, MapPinIcon } from '@heroicons/react/24/outline'

// Inline formatPrice function to bypass import issues
const formatPrice = (value) => {
  const num = Number(value);
  return `₹${(isNaN(num) ? 0 : num).toLocaleString("en-IN")}`;
};

const getSellingPrice = (item) => {
  const num = Number(item.sellingPrice || item.selling_price || 0);
  return isNaN(num) ? 0 : num;
};

export default function Orders() {
  const { orders, loading, fetchUserOrders, fetchOrderDetails } = useCustomerOrder()
  const { isAuthenticated } = useAuth()
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderDetails, setOrderDetails] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserOrders()
    }
  }, [isAuthenticated])

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />
      case 'shipped':
        return <TruckIcon className="w-5 h-5 text-blue-600" />
      case 'processing':
        return <ClockIcon className="w-5 h-5 text-yellow-600" />
      case 'cancelled':
        return <XCircleIcon className="w-5 h-5 text-red-600" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'shipped':
        return 'bg-blue-100 text-blue-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-indigo-100 text-indigo-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const isOrderActive = (status) => {
    return ['pending', 'confirmed', 'processing', 'shipped'].includes(status)
  }

  const isOrderCompleted = (status) => {
    return status === 'delivered'
  }

  const getOrderProcessStep = (status) => {
    const steps = {
      'pending': 1,
      'confirmed': 2,
      'processing': 3,
      'shipped': 4,
      'delivered': 5,
      'cancelled': 0
    }
    return steps[status] || 1
  }

  const handleOrderClick = async (order) => {
    if (selectedOrder?._id === order._id) {
      setSelectedOrder(null)
      setOrderDetails(null)
    } else {
      setSelectedOrder(order)
      setDetailsLoading(true)
      const details = await fetchOrderDetails(order._id)
      setOrderDetails(details)
      setDetailsLoading(false)
    }
  }

  const OrderTracking = ({ order }) => {
    const trackingOrder = orderDetails && orderDetails._id === order._id ? orderDetails : order

    if (!trackingOrder.trackingUrl && trackingOrder.shippingStatus !== 'created') {
      return (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Tracking information will be available once the order is shipped.</p>
        </div>
      )
    }

    return (
      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <TruckIcon className="w-5 h-5 text-blue-600" />
          <h4 className="font-semibold text-blue-900">Shipping Information</h4>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className={`font-medium ${trackingOrder.shippingStatus === 'created' ? 'text-green-600' : 'text-yellow-600'}`}>
              {trackingOrder.shippingStatus === 'created' ? 'Shipped' : 'Pending'}
            </span>
          </div>

          {trackingOrder.trackingNumber && (
            <div className="flex justify-between">
              <span className="text-gray-600">Tracking Number:</span>
              <span className="font-mono font-medium">{trackingOrder.trackingNumber}</span>
            </div>
          )}

          {trackingOrder.trackingUrl && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Track Package:</span>
              <a
                href={trackingOrder.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-medium underline"
              >
                Track on Shiprocket
              </a>
            </div>
          )}

          {trackingOrder.trackingInfo && (
            <div className="mt-3 p-3 bg-white rounded border">
              <p className="text-xs text-gray-500 mb-1">Latest Update:</p>
              <p className="text-sm font-medium">{trackingOrder.trackingInfo.current_status || 'In transit'}</p>
              {trackingOrder.trackingInfo.etd && (
                <p className="text-xs text-gray-600">Expected: {new Date(trackingOrder.trackingInfo.etd).toLocaleDateString()}</p>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ae0b0b] mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading your orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-2">Track your orders and view order history</p>
        </div>

        {!orders || orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
            <TruckIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">When you place an order, it will appear here.</p>
            <Link
              to="/shop"
              className="inline-block px-6 py-3 bg-[#ae0b0b] text-white font-semibold rounded-xl hover:bg-[#8f0a0a] transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            {/* Current Process Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">📦 Current Orders in Process</h2>
              <div className="space-y-4">
                {orders.filter(order => isOrderActive(order.status)).map((order) => (
                  <div key={order._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#ae0b0b] rounded-xl flex items-center justify-center text-white font-bold">
                            {order.items?.length || 0}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Order #{order._id.slice(-8)}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                          {order.paymentStatus && (
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                              {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                            </span>
                          )}
                          <button
                            onClick={() => handleOrderClick(order)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Order Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                          <span>Order Progress</span>
                          <span>Step {getOrderProcessStep(order.status)} of 5</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-[#ae0b0b] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(getOrderProcessStep(order.status) / 5) * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span className={getOrderProcessStep(order.status) >= 1 ? 'text-[#ae0b0b]' : 'text-gray-400'}>Order Placed</span>
                          <span className={getOrderProcessStep(order.status) >= 2 ? 'text-[#ae0b0b]' : 'text-gray-400'}>Confirmed</span>
                          <span className={getOrderProcessStep(order.status) >= 3 ? 'text-[#ae0b0b]' : 'text-gray-400'}>Processing</span>
                          <span className={getOrderProcessStep(order.status) >= 4 ? 'text-[#ae0b0b]' : 'text-gray-400'}>Shipped</span>
                          <span className={getOrderProcessStep(order.status) >= 5 ? 'text-[#ae0b0b]' : 'text-gray-400'}>Delivered</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                        <span>Total: ₹{(order.totalAmount || 0).toLocaleString('en-IN')}</span>
                        <span>Payment: {order.paymentMethod?.toUpperCase()}</span>
                      </div>

                      {selectedOrder?._id === order._id && (
                        <div className="border-t border-gray-100 pt-4">
                          {detailsLoading ? (
                            <div className="text-center py-4">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#ae0b0b] mx-auto"></div>
                              <p className="text-sm text-gray-600 mt-2">Loading order details...</p>
                            </div>
                          ) : (
                            <>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">Order Items</h4>
                                  <div className="space-y-2">
                                    {order.items?.map((item, idx) => (
                                      <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                        <img
                                          src={item.image || '/placeholder.jpg'}
                                          alt={item.name}
                                          className="w-12 h-12 object-cover rounded-lg"
                                        />
                                        <div className="flex-1">
                                          <p className="font-medium text-sm">{item.name}</p>
                                          <p className="text-xs text-gray-600">Qty: {item.quantity} × {formatPrice(getSellingPrice(item))}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">Shipping Address</h4>
                                  <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-start gap-2">
                                      <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                                      <div className="text-sm">
                                        <p className="font-medium">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
                                        <p>{order.shippingAddress?.streetAddress}</p>
                                        <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
                                        <p>{order.shippingAddress?.mobile}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <OrderTracking order={order} />
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {orders.filter(order => isOrderActive(order.status)).length === 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
                  <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders in process</h3>
                  <p className="text-gray-600">Your current orders will appear here once placed.</p>
                </div>
              )}
            </div>

            {/* Order History Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">📚 Order History</h2>
              <div className="space-y-4">
                {orders.filter(order => isOrderCompleted(order.status) || order.status === 'cancelled').map((order) => (
                  <div key={order._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden opacity-75">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-400 rounded-xl flex items-center justify-center text-white font-bold">
                            {order.items?.length || 0}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Order #{order._id.slice(-8)}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                          {order.paymentStatus && (
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                              {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                            </span>
                          )}
                          <button
                            onClick={() => handleOrderClick(order)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                        <span>Total: ₹{(order.totalAmount || 0).toLocaleString('en-IN')}</span>
                        <span>Payment: {order.paymentMethod?.toUpperCase()}</span>
                      </div>

                      {selectedOrder?._id === order._id && (
                        <div className="border-t border-gray-100 pt-4">
                          {detailsLoading ? (
                            <div className="text-center py-4">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#ae0b0b] mx-auto"></div>
                              <p className="text-sm text-gray-600 mt-2">Loading order details...</p>
                            </div>
                          ) : (
                            <>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">Order Items</h4>
                                  <div className="space-y-2">
                                    {order.items?.map((item, idx) => (
                                      <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                        <img
                                          src={item.image || '/placeholder.jpg'}
                                          alt={item.name}
                                          className="w-12 h-12 object-cover rounded-lg opacity-75"
                                        />
                                        <div className="flex-1">
                                          <p className="font-medium text-sm">{item.name}</p>
                                          <p className="text-xs text-gray-600">Qty: {item.quantity} × {formatPrice(getSellingPrice(item))}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">Shipping Address</h4>
                                  <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-start gap-2">
                                      <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                                      <div className="text-sm">
                                        <p className="font-medium">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
                                        <p>{order.shippingAddress?.streetAddress}</p>
                                        <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
                                        <p>{order.shippingAddress?.mobile}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <OrderTracking order={order} />
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {orders.filter(order => isOrderCompleted(order.status) || order.status === 'cancelled').length === 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
                  <CheckCircleIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No order history yet</h3>
                  <p className="text-gray-600">Your completed orders will appear here.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}