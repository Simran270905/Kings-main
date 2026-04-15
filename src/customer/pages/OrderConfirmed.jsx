import React, { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { CheckCircleIcon, ShoppingBagIcon, TruckIcon, MapPinIcon, CreditCardIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
import { api } from '../../config/api.js'

export default function OrderConfirmed() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const orderId = searchParams.get('orderId')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!orderId) {
      setError('Order ID not found')
      setLoading(false)
      return
    }

    const fetchOrderDetails = async () => {
      try {
        const response = await api.get(`/payment/orders/${orderId}`)
        setOrder(response.data.order)
      } catch (err) {
        setError('Failed to load order details')
        console.error('Error fetching order:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderId])

  const formatPrice = (value) => {
    const num = Number(value)
    return `Rs.${(isNaN(num) ? 0 : num).toLocaleString("en-IN")}`
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId)
    alert('Order ID copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-4 w-20 h-20 mx-auto mb-4">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'We couldn\'t find your order details.'}</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#ae0b0b] text-white font-semibold rounded-lg hover:bg-[#8f0a0a] transition-colors"
          >
            <ShoppingBagIcon className="h-5 w-5" />
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircleIcon className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Order is Confirmed!</h1>
          <p className="text-gray-600">Thank you for shopping with KKings Jewellery</p>
        </div>

        {/* Order ID */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Order ID</p>
              <p className="text-2xl font-bold text-gray-900">{orderId}</p>
            </div>
            <button
              onClick={copyOrderId}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Copy
            </button>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatPrice(item.price)}</p>
                  <p className="text-sm text-gray-500">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping:</span>
              <span className="font-medium">{formatPrice(order.shippingCharge)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span className="font-medium">-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
              <span>Total:</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CreditCardIcon className="h-4 w-4" />
              <span>Payment Method: {order.payment.method}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Status: {order.payment.status}</span>
            </div>
            {order.payment.razorpayPaymentId && (
              <div className="text-sm text-gray-600 mt-1">
                Transaction ID: {order.payment.razorpayPaymentId}
              </div>
            )}
            {order.payment.paidAt && (
              <div className="text-sm text-gray-600 mt-1">
                Paid on: {formatDate(order.payment.paidAt)}
              </div>
            )}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
          <div className="flex items-start gap-3">
            <MapPinIcon className="h-5 w-5 text-gray-400 mt-1" />
            <div>
              <p className="font-medium text-gray-900">{order.customer.name}</p>
              <p className="text-gray-600">{order.customer.address.line1}</p>
              {order.customer.address.line2 && (
                <p className="text-gray-600">{order.customer.address.line2}</p>
              )}
              <p className="text-gray-600">
                {order.customer.address.city}, {order.customer.address.state} - {order.customer.address.pincode}
              </p>
              <p className="text-gray-600">{order.customer.address.country}</p>
              <p className="text-gray-600 mt-2">Phone: {order.customer.phone}</p>
              <p className="text-gray-600">Email: {order.customer.email}</p>
            </div>
          </div>
        </div>

        {/* Tracking Information */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Track Your Order</h2>
          <div className="flex items-center gap-3">
            <TruckIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-gray-600">
                {order.shipping.awbCode ? (
                  <>
                    Your order has been shipped with {order.shipping.courierName}
                    <br />
                    AWB: {order.shipping.awbCode}
                  </>
                ) : (
                  'Your order is being processed for shipment. You will receive tracking details once your order is shipped.'
                )}
              </p>
              {order.shipping.trackingUrl && (
                <a
                  href={order.shipping.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <TruckIcon className="h-4 w-4" />
                  Track Package
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Confirmation Email Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <EnvelopeIcon className="h-5 w-5 text-blue-600 mt-1" />
            <div>
              <h3 className="font-medium text-blue-900 mb-1">Confirmation Email Sent</h3>
              <p className="text-blue-700 text-sm">
                A confirmation email has been sent to {order.customer.email} with your order details and tracking information.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to={`/orders/track/${orderId}`}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#ae0b0b] text-white font-semibold rounded-lg hover:bg-[#8f0a0a] transition-colors"
          >
            <TruckIcon className="h-5 w-5" />
            Track Your Order
          </Link>
          <Link
            to="/shop"
            className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ShoppingBagIcon className="h-5 w-5" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
