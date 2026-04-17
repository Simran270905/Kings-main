import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MagnifyingGlassIcon, TruckIcon, PhoneIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function TrackOrderInput() {
  const navigate = useNavigate()
  const [orderId, setOrderId] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [trackingMethod, setTrackingMethod] = useState('orderId') // 'orderId' or 'phone'
  const [loading, setLoading] = useState(false)

  const handleTrackOrder = async (e) => {
    e.preventDefault()
    
    if (trackingMethod === 'orderId') {
      if (!orderId.trim()) {
        toast.error('Please enter your Order ID')
        return
      }
    } else {
      if (!phoneNumber.trim()) {
        toast.error('Please enter your phone number')
        return
      }
    }

    setLoading(true)
    
    // Navigate to tracking page with method and data
    if (trackingMethod === 'orderId') {
      navigate(`/track-order`)
    } else {
      // Navigate to track-order page with phone number pre-filled
      navigate(`/track-order?phone=${encodeURIComponent(phoneNumber.trim())}`)
    }
    
    setLoading(false)
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

  return (
    <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
          <TruckIcon className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <h3 className="font-bold text-red-900">Track Your Order</h3>
          <p className="text-sm text-red-700">Track by Order ID or Phone Number</p>
        </div>
      </div>
      
      {/* Tracking Method Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setTrackingMethod('orderId')}
          className={`flex-1 py-2 px-3 text-center font-medium text-sm transition-colors ${
            trackingMethod === 'orderId'
              ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <MagnifyingGlassIcon className="h-4 w-4 inline mr-2" />
          Track by Order ID
        </button>
        <button
          onClick={() => setTrackingMethod('phone')}
          className={`flex-1 py-2 px-3 text-center font-medium text-sm transition-colors ${
            trackingMethod === 'phone'
              ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <PhoneIcon className="h-4 w-4 inline mr-2" />
          Track by Phone
        </button>
      </div>
      
      <form onSubmit={handleTrackOrder} className="space-y-4">
        {trackingMethod === 'orderId' ? (
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={orderId}
                onChange={handleOrderIdChange}
                placeholder="Order ID (e.g., ORD123456789)"
                className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || !orderId.trim()}
              className="w-full bg-red-600 text-white font-medium py-2.5 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Track
                </>
              ) : (
                'Track Order'
              )}
            </button>
          </div>
        ) : (
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PhoneIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="Enter your 10-digit phone number"
                className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                maxLength={10}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || !phoneNumber.trim()}
              className="w-full bg-red-600 text-white font-medium py-2.5 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Search
                </>
              ) : (
                'Search Orders'
              )}
            </button>
          </div>
        )}
      </form>
      
      <p className="text-xs text-red-600 mt-2">
        {trackingMethod === 'orderId' 
          ? 'Find your Order ID in confirmation email'
          : 'Enter the phone number used when placing your order'
        }
      </p>
    </div>
  )
}
