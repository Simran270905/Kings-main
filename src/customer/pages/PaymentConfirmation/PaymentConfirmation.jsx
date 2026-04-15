import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { CheckCircleIcon, TruckIcon, ClockIcon, DocumentDuplicateIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { API_BASE_URL } from '@config/api.js'

export default function PaymentConfirmation() {
  const location = useLocation()
  const navigate = useNavigate()
  const [orderDetails, setOrderDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [shiprocketStatus, setShiprocketStatus] = useState(null)

  // Get order data from location state
  const orderId = location.state?.orderId
  const paymentId = location.state?.paymentId
  const amountPaid = location.state?.amountPaid
  const paymentMethod = location.state?.paymentMethod

  useEffect(() => {
    if (!orderId) {
      toast.error('No order ID found. Redirecting to home...')
      setTimeout(() => navigate('/'), 3000)
      return
    }

    // Fetch complete order details from backend
    fetchOrderDetails()
    fetchShiprocketStatus()
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch order details')
      }

      const data = await response.json()
      if (data.success) {
        setOrderDetails(data.order || data.data)
      } else {
        throw new Error(data.message || 'Failed to load order details')
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
      toast.error('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  const fetchShiprocketStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/shipment`, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setShiprocketStatus(data.data || data)
      }
    } catch (error) {
      console.log('Shiprocket status not available yet:', error.message)
      // Don't show error - shipment might not be created yet
    }
  }

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard!`)
  }

  const formatPrice = (amount) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN')}`
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'text-blue-600 bg-blue-50'
      case 'processing': return 'text-yellow-600 bg-yellow-50'
      case 'shipped': return 'text-purple-600 bg-purple-50'
      case 'delivered': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getShippingStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'created': return 'text-blue-600 bg-blue-50'
      case 'manifested': return 'text-yellow-600 bg-yellow-50'
      case 'in-transit': return 'text-purple-600 bg-purple-50'
      case 'delivered': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment confirmation...</p>
        </div>
      </div>
    )
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <DocumentDuplicateIcon className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">Unable to load order details</p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircleIcon className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Confirmed!</h1>
          <p className="text-gray-600 text-lg">
            Thank you for your purchase. Your order has been successfully placed and confirmed.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
            <button
              onClick={() => copyToClipboard(orderId, 'Order ID')}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <DocumentDuplicateIcon className="h-4 w-4" />
              Copy Order ID
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Order ID</p>
                <p className="font-mono font-bold text-lg text-gray-900">
                  {String(orderId).slice(-12).toUpperCase()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Payment Status</p>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-600">
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Paid Successfully
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Order Status</p>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(orderDetails.status)}`}>
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {orderDetails.status || 'Processing'}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Amount Paid</p>
                <p className="font-bold text-lg text-gray-900">
                  {formatPrice(amountPaid || orderDetails.totalAmount)}
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Payment Method</p>
                <p className="font-medium text-gray-900">
                  {paymentMethod === 'razorpay' ? 'Online Payment (Razorpay)' : 
                   paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Transaction ID</p>
                <p className="font-mono text-sm text-gray-900">
                  {paymentId || 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Order Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(orderDetails.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Estimated Delivery</p>
                <p className="font-medium text-gray-900">
                  {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Information */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Shipping Information</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Delivery Address</h3>
              <div className="space-y-2 text-sm">
                <p className="font-medium">
                  {orderDetails.shippingAddress?.firstName} {orderDetails.shippingAddress?.lastName}
                </p>
                <p>{orderDetails.shippingAddress?.streetAddress}</p>
                <p>
                  {orderDetails.shippingAddress?.city}, {orderDetails.shippingAddress?.state} - {orderDetails.shippingAddress?.zipCode}
                </p>
                <p>{orderDetails.shippingAddress?.mobile}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Shipment Status</h3>
              {shiprocketStatus ? (
                <div className="space-y-3">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getShippingStatusColor(shiprocketStatus.status)}`}>
                    <TruckIcon className="h-4 w-4 mr-1" />
                    {shiprocketStatus.status || 'Processing'}
                  </div>
                  
                  {shiprocketStatus.trackingUrl && (
                    <a
                      href={shiprocketStatus.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      <TruckIcon className="h-4 w-4 mr-1" />
                      Track on Shiprocket
                    </a>
                  )}

                  {shiprocketStatus.trackingNumber && (
                    <div className="text-sm">
                      <p className="text-gray-500">AWB Number:</p>
                      <p className="font-mono font-medium">{shiprocketStatus.trackingNumber}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  <p className="mb-2">Shipment details will be available soon.</p>
                  <p>Your order is being processed and will be shipped shortly.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6">
          <div className="text-center">
            <h3 className="font-semibold text-blue-900 mb-3">Need Help?</h3>
            <p className="text-blue-700 mb-4">
              If you have any questions about your order, our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="mailto:support@kkingsjewellery.com"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
              >
                <EnvelopeIcon className="h-4 w-4" />
                Email Support
              </a>
              <a
                href="tel:+919876543210"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
              >
                <PhoneIcon className="h-4 w-4" />
                Call Support
              </a>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={`/orders/track/${orderId}`}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <TruckIcon className="h-5 w-5" />
            Track Your Order
          </Link>
          <Link
            to="/shop"
            className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
