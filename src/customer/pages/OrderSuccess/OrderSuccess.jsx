import React from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { CheckCircleIcon, ShoppingBagIcon, UserCircleIcon, TruckIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline'

export default function OrderSuccess() {
  const location = useLocation()
  const navigate = useNavigate()
  const orderId = location.state?.orderId
  const paymentMethod = location.state?.paymentMethod || 'cod'
  const orderData = location.state?.orderData || {}
  
  const paymentText = paymentMethod === 'cod'
    ? 'Cash on Delivery (Pay when you receive your parcel)'
    : paymentMethod === 'upi'
    ? 'UPI Payment (Transaction completed)' : 'Card Payment (Transaction completed)'

  const getOrderStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Order confirmed, awaiting processing'
      case 'confirmed': return 'Order confirmed, being processed'
      case 'processing': return 'Order being processed'
      case 'shipped': return 'Order shipped, on the way!'
      case 'delivered': return 'Order delivered successfully'
      default: return 'Order placed successfully'
    }
  }

  const getEstimatedDelivery = () => {
    if (paymentMethod === 'cod') {
      return '5-7 working days'
    } else {
      return '3-5 working days'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-10 text-center">

          {/* Animated check */}
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
            <CheckCircleIcon className="h-14 w-14 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-500 text-sm mb-6">
            Thank you for shopping with KKings Jewellery. Your order has been confirmed.
          </p>

          {/* Order Details */}
          {orderId && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Order ID</p>
              <p className="font-mono font-bold text-gray-900 text-sm">{String(orderId).slice(-12) || orderId}</p>
            </div>
          )}

          {/* Payment Method */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Payment Method</p>
            <p className="text-sm font-medium text-gray-800">{paymentText}</p>
          </div>

          {/* Order Status */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <ClockIcon className="h-5 w-5 text-blue-600" />
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Current Status</p>
            </div>
            <p className="text-sm font-medium text-gray-800">{getOrderStatusText(orderData.status || 'confirmed')}</p>
          </div>

          {/* Shipping Info */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TruckIcon className="h-5 w-5 text-green-600" />
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">Shipping Information</p>
            </div>
            <p className="text-sm font-medium text-gray-800 mb-1">Estimated Delivery: {getEstimatedDelivery()}</p>
            <p className="text-xs text-gray-600">You'll receive tracking details once your order is shipped</p>
          </div>

          {/* Shipping Address */}
          {orderData.shippingAddress && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <MapPinIcon className="h-5 w-5 text-gray-600" />
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Delivery Address</p>
              </div>
              <div className="text-sm text-gray-700">
                <p className="font-medium">{orderData.shippingAddress.firstName} {orderData.shippingAddress.lastName}</p>
                <p>{orderData.shippingAddress.streetAddress}</p>
                <p>{orderData.shippingAddress.city}, {orderData.shippingAddress.state} - {orderData.shippingAddress.zipCode}</p>
                <p>{orderData.shippingAddress.mobile}</p>
              </div>
            </div>
          )}

          {/* Order Summary */}
          {orderData.totalAmount && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Order Summary</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Items:</span>
                <span className="font-medium">{orderData.items?.length || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-bold text-gray-900">₹{orderData.totalAmount?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              to="/account/orders"
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#ae0b0b] text-white font-bold rounded-xl hover:bg-[#8f0a0a] transition-colors shadow-lg shadow-[#ae0b0b]/20"
            >
              <TruckIcon className="h-5 w-5" />
              Track Your Order
            </Link>
            <Link
              to="/shop"
              className="flex items-center justify-center gap-2 w-full py-3.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              <ShoppingBagIcon className="h-5 w-5" />
              Continue Shopping
            </Link>
            <Link
              to="/account"
              className="flex items-center justify-center gap-2 w-full py-3.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              <UserCircleIcon className="h-5 w-5" />
              My Account
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-6 space-y-2">
            <p className="text-xs text-gray-400">
              📧 A confirmation email will be sent to your registered address.
            </p>
            <p className="text-xs text-gray-400">
              📱 You can track your order status in "My Orders" section.
            </p>
            {paymentMethod === 'cod' && (
              <p className="text-xs text-gray-400">
                💰 Please keep the exact amount ready for delivery.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
