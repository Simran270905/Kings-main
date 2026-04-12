import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { CheckCircleIcon, ClockIcon, TruckIcon, MapPinIcon, CubeIcon, HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'
<<<<<<< HEAD
import { API_BASE_URL } from '../../../config/api.js'
=======
import { API_BASE_URL } from '@config/api.js'
>>>>>>> 4969c802b413d50e828a9e734372265fe263f995

// Inline formatPrice function to bypass import issues
const formatPrice = (value) => {
  const num = Number(value);
  return `₹${(isNaN(num) ? 0 : num).toLocaleString("en-IN")}`;
};

const API_URL = API_BASE_URL

const orderStatuses = [
  {
    id: 'pending',
    label: 'Order Confirmed',
    description: 'Your order has been received and confirmed',
    icon: CheckCircleIcon,
    color: 'blue'
  },
  {
    id: 'processing',
    label: 'Processing',
    description: 'Your order is being prepared for shipment',
    icon: CubeIcon,
    color: 'yellow'
  },
  {
    id: 'shipped',
    label: 'Shipped',
    description: 'Your order is on the way',
    icon: TruckIcon,
    color: 'purple'
  },
  {
    id: 'delivered',
    label: 'Delivered',
    description: 'Your order has been delivered successfully',
    icon: CheckCircleIcon,
    color: 'green'
  }
]

const getStatusIndex = (status) => {
  const statusOrder = ['pending', 'processing', 'shipped', 'delivered']
  return statusOrder.indexOf(status)
}

const getStatusColor = (color) => {
  const colors = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-600',
      icon: 'text-blue-500',
      solid: 'bg-blue-500'
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-600',
      icon: 'text-yellow-500',
      solid: 'bg-yellow-500'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-600',
      icon: 'text-purple-500',
      solid: 'bg-purple-500'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-600',
      icon: 'text-green-500',
      solid: 'bg-green-500'
    },
    gray: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-400',
      icon: 'text-gray-400',
      solid: 'bg-gray-400'
    }
  }
  return colors[color] || colors.gray
}

export default function OrderTrack() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [orderData, setOrderData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!orderId) {
      setError('Order ID is required')
      setLoading(false)
      return
    }

    fetchOrderTracking()
  }, [orderId])

  const fetchOrderTracking = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_URL}/orders/track/${orderId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Order not found. Please check your Order ID.')
        } else {
          throw new Error('Failed to fetch order details. Please try again.')
        }
      }

      const result = await response.json()
      
      if (result.success) {
        setOrderData(result.data)
      } else {
        throw new Error(result.message || 'Failed to load order details')
      }
    } catch (error) {
      console.error('Error fetching order tracking:', error)
      setError(error.message)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const currentStatusIndex = orderData ? getStatusIndex(orderData.status) : -1

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ae0b0b] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4">
              <ClockIcon className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/orders/track')}
                className="w-full bg-[#ae0b0b] text-white font-semibold py-3 rounded-xl hover:bg-[#8f0a0a] transition-colors"
              >
                Try Another Order ID
              </button>
              <Link
                to="/"
                className="block w-full border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Back
            </button>
            <h1 className="text-xl font-bold text-gray-900">Order Tracking</h1>
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <HomeIcon className="h-5 w-5" />
              Home
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Order ID */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Order ID</p>
              <p className="font-mono font-bold text-lg text-gray-900">
                #{String(orderData.orderId).slice(-12).toUpperCase()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-500">Placed on</p>
              <p className="text-sm text-gray-900">{formatDate(orderData.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Order Status</h2>
          
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-6 top-12 bottom-12 w-0.5 bg-gray-200"></div>
            
            {/* Status Steps */}
            <div className="space-y-8">
              {orderStatuses.map((status, index) => {
                const isActive = index <= currentStatusIndex
                const isCurrent = index === currentStatusIndex
                const colors = getStatusColor(isActive ? status.color : 'gray')
                const Icon = status.icon

                return (
                  <div key={status.id} className="relative flex items-start gap-4">
                    {/* Status Icon */}
                    <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${colors.border} ${colors.bg} ${isActive ? colors.solid : 'bg-gray-300'}`}>
                      {isActive ? (
                        <CheckCircleSolid className="h-6 w-6 text-white" />
                      ) : (
                        <Icon className={`h-6 w-6 ${colors.icon}`} />
                      )}
                    </div>
                    
                    {/* Status Content */}
                    <div className={`flex-1 pb-8 ${isCurrent ? '' : 'opacity-60'}`}>
                      <h3 className={`font-bold text-lg ${isCurrent ? colors.text : 'text-gray-600'}`}>
                        {status.label}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">{status.description}</p>
                      
                      {isCurrent && orderData.updatedAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          Updated: {formatDate(orderData.updatedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Order Details</h2>
          
          {/* Items */}
          <div className="space-y-3 mb-4">
            {orderData.items.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity || 1}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Total */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-600">Order Total:</span>
              <PriceDisplay 
                sellingPrice={orderData.discountedTotal || orderData.totalAmount}
                originalPrice={orderData.originalAmount}
                discount={orderData.discountPercent || 0}
                showOriginalPrice={!!orderData.originalAmount && orderData.originalAmount > (orderData.discountedTotal || orderData.totalAmount)}
                showDiscountBadge={!!orderData.discountPercent}
              />
            </div>
            {orderData.paymentPlan === 'partial' && (
              <>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-medium text-gray-600">Advance Paid:</span>
                  <span className="font-medium text-green-600">₹{(orderData.advanceAmount || 0).toLocaleString('en-IN')} ✅</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-medium text-gray-600">Remaining:</span>
                  <span className="font-medium text-orange-600">
                    ₹{(orderData.remainingAmount || 0).toLocaleString('en-IN')} 
                    {orderData.remainingPaymentStatus === 'paid' ? ' ✅ Paid' : ' (Pending)'}
                  </span>
                </div>
              </>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Payment Method: {orderData.paymentMethod?.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Delivery Address</h2>
          
          <div className="space-y-2">
            <p className="font-medium text-gray-900">
              {orderData.shippingAddress.firstName} {orderData.shippingAddress.lastName}
            </p>
            <p className="text-gray-600">{orderData.shippingAddress.streetAddress}</p>
            <p className="text-gray-600">
              {orderData.shippingAddress.city}, {orderData.shippingAddress.state} - {orderData.shippingAddress.zipCode}
            </p>
            <p className="text-gray-600">📱 {orderData.shippingAddress.mobile}</p>
          </div>
        </div>

        {/* Tracking Information */}
        {orderData.trackingNumber && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Tracking Information</h2>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Tracking Number</p>
                <p className="font-mono font-bold text-gray-900">{orderData.trackingNumber}</p>
              </div>
              
              {orderData.trackingUrl && (
                <a
                  href={orderData.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#ae0b0b] hover:text-[#8f0a0a] font-medium"
                >
                  <TruckIcon className="h-4 w-4" />
                  Track on Courier Website
                </a>
              )}
              
              {orderData.estimatedDelivery && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Estimated Delivery</p>
                  <p className="text-gray-900">
                    {new Date(orderData.estimatedDelivery).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/orders/track')}
            className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Track Another Order
          </button>
          <Link
            to="/shop"
            className="flex-1 bg-[#ae0b0b] text-white font-semibold py-3 rounded-xl hover:bg-[#8f0a0a] transition-colors text-center"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
