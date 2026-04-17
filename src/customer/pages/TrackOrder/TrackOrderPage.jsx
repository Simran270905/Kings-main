import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { MagnifyingGlassIcon, TruckIcon, HomeIcon, ArrowRightIcon, PhoneIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import safeFetch from '../../../utils/safeFetch.js'

export default function TrackOrderPage() {
  const navigate = useNavigate()
  const [orderId, setOrderId] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [trackingMethod, setTrackingMethod] = useState('orderId') // 'orderId' or 'phone'
  const [orders, setOrders] = useState([])
  const [showResults, setShowResults] = useState(false)

  const handleTrackOrder = async (e) => {
    e.preventDefault()
    
    if (trackingMethod === 'orderId') {
      if (!orderId.trim()) {
        toast.error('Please enter your Order ID')
        return
      }

      setLoading(true)
      
      // Navigate to tracking page
      navigate(`/orders/track/${orderId.trim()}`)
      
      setLoading(false)
    } else {
      // Phone number tracking
      if (!phoneNumber.trim()) {
        toast.error('Please enter your phone number')
        return
      }

      setLoading(true)
      
      try {
        const apiUrl = import.meta.env.VITE_API_URL
        // Remove all non-digit characters and spaces from phone number
        const cleanPhone = phoneNumber.replace(/\D/g, '').replace(/\s/g, '')
        const url = `${apiUrl}/orders/track-by-phone?phone=${encodeURIComponent(cleanPhone)}`
        
        console.log('🔍 Environment VITE_API_URL:', apiUrl)
        console.log('🔍 TrackOrder API URL:', url)
        console.log('🔍 Original phone number:', phoneNumber.trim())
        console.log('🔍 Clean phone number:', cleanPhone)
        console.log('🔍 Encoded phone:', encodeURIComponent(cleanPhone))
        
        const response = await safeFetch.fetch(url)
        
        console.log('🔍 API Response:', response)
        
        if (response.success) {
          setOrders(response.data.orders)
          setShowResults(true)
          
          if (response.data.orders.length === 0) {
            toast.error('No orders found for this phone number')
          }
        } else {
          toast.error(response.message || 'Failed to track orders')
        }
      } catch (error) {
        console.error('Error tracking orders:', error)
        toast.error('Failed to track orders. Please try again.')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleOrderIdChange = (e) => {
    const value = e.target.value.toUpperCase()
    setOrderId(value)
  }

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '') // Only allow digits
    if (value.length <= 10) {
      setPhoneNumber(value)
    }
  }

  const formatPhoneNumber = (phone) => {
    if (phone.length === 10) {
      return `${phone.slice(0, 5)} ${phone.slice(5)}`
    }
    return phone
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Confirmed' },
      processing: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Processing' },
      shipped: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Shipped' },
      delivered: { bg: 'bg-green-100', text: 'text-green-800', label: 'Delivered' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
      refunded: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Refunded' }
    }
    
    const config = statusConfig[status] || statusConfig.pending
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'Paid' },
      failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Failed' },
      refunded: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Refunded' }
    }
    
    const config = statusConfig[status] || statusConfig.pending
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <HomeIcon className="h-5 w-5" />
              Back to Home
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Track Your Order</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Main Content */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <TruckIcon className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Track Your Order
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Track your order using Order ID or Phone number to get real-time updates on your shipment status.
          </p>
        </div>

        {/* Tracking Method Tabs */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setTrackingMethod('orderId')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                trackingMethod === 'orderId'
                  ? 'text-[#ae0b0b] border-b-2 border-[#ae0b0b] bg-red-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <MagnifyingGlassIcon className="h-5 w-5 inline mr-2" />
              Track by Order ID
            </button>
            <button
              onClick={() => setTrackingMethod('phone')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                trackingMethod === 'phone'
                  ? 'text-[#ae0b0b] border-b-2 border-[#ae0b0b] bg-red-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <PhoneIcon className="h-5 w-5 inline mr-2" />
              Track by Phone Number
            </button>
          </div>

          {/* Tracking Form */}
          <div className="p-8">
            <form onSubmit={handleTrackOrder} className="space-y-6">
              {trackingMethod === 'orderId' ? (
                <div>
                  <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-2">
                    Order ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="orderId"
                      name="orderId"
                      value={orderId}
                      onChange={handleOrderIdChange}
                      placeholder="Enter your Order ID (e.g., ORD123456789)"
                      className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ae0b0b] focus:border-transparent text-lg font-mono"
                      required
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    You can find your Order ID in your confirmation email or order details.
                  </p>
                </div>
              ) : (
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PhoneIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formatPhoneNumber(phoneNumber)}
                      onChange={handlePhoneChange}
                      placeholder="Enter your 10-digit phone number"
                      className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ae0b0b] focus:border-transparent text-lg"
                      maxLength={12} // Including space
                      required
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Enter the phone number used when placing your order.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || (trackingMethod === 'orderId' ? !orderId.trim() : !phoneNumber.trim())}
                className="w-full bg-[#ae0b0b] text-white font-bold py-4 rounded-xl hover:bg-[#8f0a0a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    {trackingMethod === 'orderId' ? 'Tracking...' : 'Searching...'}
                  </>
                ) : (
                  <>
                    {trackingMethod === 'orderId' ? 'Track Order' : 'Search Orders'}
                    <ArrowRightIcon className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Phone Tracking Results */}
        {showResults && trackingMethod === 'phone' && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {orders.length > 0 ? `Found ${orders.length} Order${orders.length > 1 ? 's' : ''}` : 'No Orders Found'}
            </h2>
            
            {orders.length > 0 ? (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.orderId} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    {/* Order Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order ID: {order.orderId}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(order.orderDate)}
                        </p>
                      </div>
                      <div className="flex gap-2 mt-2 md:mt-0">
                        {getStatusBadge(order.status)}
                        {getPaymentStatusBadge(order.paymentStatus)}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Ordered Items</h4>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                            <div className="flex items-center gap-3">
                              {item.image && (
                                <img 
                                  src={item.image} 
                                  alt={item.name}
                                  className="w-12 h-12 object-cover rounded-lg"
                                />
                              )}
                              <div>
                                <p className="font-medium text-gray-900">{item.name}</p>
                                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">₹{item.price}</p>
                              <p className="text-sm text-gray-600">₹{item.subtotal}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Amount Breakdown */}
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Amount Breakdown</h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="font-medium">₹{order.amountBreakdown.subtotal}</span>
                        </div>
                        {order.amountBreakdown.tax > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tax:</span>
                            <span className="font-medium">₹{order.amountBreakdown.tax}</span>
                          </div>
                        )}
                        {order.amountBreakdown.shippingCost > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Shipping:</span>
                            <span className="font-medium">₹{order.amountBreakdown.shippingCost}</span>
                          </div>
                        )}
                        {order.amountBreakdown.codCharge > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">COD Charge:</span>
                            <span className="font-medium">₹{order.amountBreakdown.codCharge}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200">
                          <span>Total:</span>
                          <span className="text-[#ae0b0b]">₹{order.amountBreakdown.total}</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment & Shipping Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Payment Information</h4>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            Method: <span className="font-medium text-gray-900">{order.paymentMethod.toUpperCase()}</span>
                          </p>
                          <p className="text-sm text-gray-600">
                            Status: {getPaymentStatusBadge(order.paymentStatus)}
                          </p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Shipping Information</h4>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            Status: <span className="font-medium text-gray-900">{order.shippingStatus}</span>
                          </p>
                          {order.trackingNumber && (
                            <p className="text-sm text-gray-600">
                              Tracking: <span className="font-medium text-gray-900">{order.trackingNumber}</span>
                            </p>
                          )}
                          {order.trackingUrl && (
                            <a
                              href={order.trackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              Track Shipment →
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <MagnifyingGlassIcon className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-2">No orders found for this phone number</p>
                <p className="text-sm text-gray-500">
                  Please check the phone number and try again, or contact support for assistance.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="font-bold text-red-900 mb-3">Need Help?</h3>
          <div className="space-y-2 text-sm text-red-800">
            <p>• Check your email for Order ID sent after purchase</p>
            <p>• Order ID is usually in format: ORDXXXXXXXXX</p>
            <p>• Make sure you're entering the complete Order ID</p>
            <p>• Contact support if you're still having trouble finding your Order ID</p>
          </div>
          <div className="mt-4 pt-4 border-t border-red-200">
            <p className="text-sm text-red-700">
              For immediate assistance, email us at{' '}
              <a href="mailto:support@kkingsjewellery.com" className="font-medium text-red-900 hover:underline">
                support@kkingsjewellery.com
              </a>
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/account/orders"
            className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:shadow-md transition-shadow"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
              <TruckIcon className="h-6 w-6 text-gray-600" />
            </div>
            <h3 className="font-medium text-gray-900">My Orders</h3>
            <p className="text-sm text-gray-600 mt-1">View all your orders</p>
          </Link>

          <Link
            to="/shop"
            className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:shadow-md transition-shadow"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
              <MagnifyingGlassIcon className="h-6 w-6 text-gray-600" />
            </div>
            <h3 className="font-medium text-gray-900">Continue Shopping</h3>
            <p className="text-sm text-gray-600 mt-1">Browse our products</p>
          </Link>

          <Link
            to="/account"
            className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:shadow-md transition-shadow"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
              <HomeIcon className="h-6 w-6 text-gray-600" />
            </div>
            <h3 className="font-medium text-gray-900">My Account</h3>
            <p className="text-sm text-gray-600 mt-1">Manage your account</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
