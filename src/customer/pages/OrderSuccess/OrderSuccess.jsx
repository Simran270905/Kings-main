import React from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { CheckCircleIcon, ShoppingBagIcon, UserCircleIcon } from '@heroicons/react/24/outline'

export default function OrderSuccess() {
  const location = useLocation()
  const navigate = useNavigate()
  const orderId = location.state?.orderId
  const paymentMethod = location.state?.paymentMethod || 'cod'

  const paymentText = paymentMethod === 'cod'
    ? 'Cash on Delivery (Pay when you receive your parcel)'
    : paymentMethod === 'upi'
    ? 'UPI Payment (Transaction completed)' : 'Card Payment (Transaction completed)'

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-10 text-center">

          {/* Animated check */}
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
            <CheckCircleIcon className="h-14 w-14 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h1>
          <p className="text-gray-500 text-sm mb-6">
            Thank you for shopping with KKings Jewellery. Your order has been confirmed.
          </p>

          {orderId && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Order ID</p>
              <p className="font-mono font-bold text-gray-900 text-sm">{String(orderId).slice(-12) || orderId}</p>
            </div>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Payment Method</p>
            <p className="text-sm font-medium text-gray-800">{paymentText}</p>
          </div>

          <div className="space-y-3">
            <Link
              to="/shop"
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#ae0b0b] text-white font-bold rounded-xl hover:bg-[#8f0a0a] transition-colors shadow-lg shadow-[#ae0b0b]/20"
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

          <p className="mt-6 text-xs text-gray-400">
            A confirmation email will be sent to your registered address.
          </p>
        </div>
      </div>
    </div>
  )
}
