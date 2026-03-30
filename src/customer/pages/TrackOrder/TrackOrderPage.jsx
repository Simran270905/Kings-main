import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { MagnifyingGlassIcon, TruckIcon, HomeIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function TrackOrderPage() {
  const navigate = useNavigate()
  const [orderId, setOrderId] = useState('')
  const [loading, setLoading] = useState(false)

  const handleTrackOrder = async (e) => {
    e.preventDefault()
    
    if (!orderId.trim()) {
      toast.error('Please enter your Order ID')
      return
    }

    setLoading(true)
    
    // Navigate to tracking page
    navigate(`/orders/track/${orderId.trim()}`)
    
    setLoading(false)
  }

  const handleOrderIdChange = (e) => {
    const value = e.target.value.toUpperCase()
    setOrderId(value)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Main Content */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <TruckIcon className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Track Your Order
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Enter your Order ID to get real-time updates on your shipment status and delivery progress.
          </p>
        </div>

        {/* Tracking Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <form onSubmit={handleTrackOrder} className="space-y-6">
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

            <button
              type="submit"
              disabled={loading || !orderId.trim()}
              className="w-full bg-[#ae0b0b] text-white font-bold py-4 rounded-xl hover:bg-[#8f0a0a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Tracking...
                </>
              ) : (
                <>
                  Track Order
                  <ArrowRightIcon className="h-5 w-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 mb-3">Need Help?</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• Check your email for the Order ID sent after purchase</p>
            <p>• Order ID is usually in format: ORDXXXXXXXXX</p>
            <p>• Make sure you're entering the complete Order ID</p>
            <p>• Contact support if you're still having trouble finding your Order ID</p>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-sm text-blue-700">
              For immediate assistance, email us at{' '}
              <a href="mailto:support@kkingsjewellery.com" className="font-medium text-blue-900 hover:underline">
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
