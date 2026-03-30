import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SearchIcon, TruckIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function TrackOrderInput() {
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
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
          <TruckIcon className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="font-bold text-blue-900">Track Your Order</h3>
          <p className="text-sm text-blue-700">Enter your Order ID for real-time updates</p>
        </div>
      </div>
      
      <form onSubmit={handleTrackOrder} className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={orderId}
            onChange={handleOrderIdChange}
            placeholder="Order ID (e.g., ORD123456789)"
            className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading || !orderId.trim()}
          className="px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Track
            </>
          ) : (
            'Track'
          )}
        </button>
      </form>
      
      <p className="text-xs text-blue-600 mt-2">
        Find your Order ID in confirmation email
      </p>
    </div>
  )
}
