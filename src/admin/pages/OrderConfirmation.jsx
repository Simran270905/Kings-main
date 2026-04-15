import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  CheckCircleIcon, 
  TruckIcon, 
  ClockIcon, 
  DocumentDuplicateIcon,
  EnvelopeIcon,
  PhoneIcon,
  ArrowLeftIcon,
  RefreshIcon
} from '@heroicons/react/24/outline'
import AdminCard from '../layout/AdminCard'
import StatusBadge from '../components/StatusBadge'
import { API_BASE_URL } from '@config/api.js'
import toast from 'react-hot-toast'

export default function OrderConfirmation() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [orderDetails, setOrderDetails] = useState(null)
  const [shiprocketStatus, setShiprocketStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails()
      fetchShiprocketStatus()
    }
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('kk_admin_token')
      
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
      const token = localStorage.getItem('kk_admin_token')
      
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/shipment`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setShiprocketStatus(data.data || data)
      }
    } catch (error) {
      console.log('Shiprocket status not available yet:', error.message)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await Promise.all([fetchOrderDetails(), fetchShiprocketStatus()])
    setRefreshing(false)
    toast.success('Order data refreshed')
  }

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard!`)
  }

  const formatPrice = (amount) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN')}`
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

  const createShiprocketShipment = async () => {
    try {
      const token = localStorage.getItem('kk_admin_token')
      
      const response = await fetch(`${API_BASE_URL}/shiprocket/create-shipment/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast.success('Shipment created successfully on Shiprocket')
        fetchShiprocketStatus() // Refresh shipment status
      } else {
        throw new Error('Failed to create shipment')
      }
    } catch (error) {
      console.error('Error creating Shiprocket shipment:', error)
      toast.error('Failed to create shipment on Shiprocket')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ae0b0b] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order confirmation...</p>
        </div>
      </div>
    )
  }

  if (!orderDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <DocumentDuplicateIcon className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">Unable to load order details</p>
          <button
            onClick={() => navigate('/admin/orders')}
            className="inline-flex items-center px-6 py-3 bg-[#ae0b0b] text-white font-medium rounded-lg hover:bg-[#8f0a0a]"
          >
            Back to Orders
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/orders')}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Orders
          </button>
          
          <h1 className="text-2xl font-bold text-gray-900">Order Confirmation</h1>
        </div>
        
        <button
          onClick={refreshData}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <RefreshIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Order Status Card */}
      <AdminCard>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Order Status</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => copyToClipboard(orderId, 'Order ID')}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <DocumentDuplicateIcon className="h-4 w-4" />
              Copy Order ID
            </button>
            <StatusBadge status={orderDetails.status} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column - Order Details */}
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
                {orderDetails.paymentStatus || 'Paid'}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Order Status</p>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-600">
                <ClockIcon className="h-4 w-4 mr-1" />
                {orderDetails.status || 'Processing'}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Total Amount</p>
              <p className="font-bold text-lg text-gray-900">
                {formatPrice(orderDetails.totalAmount)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Payment Method</p>
              <p className="font-medium text-gray-900">
                {orderDetails.paymentMethod === 'razorpay' ? 'Online Payment (Razorpay)' : 
                 orderDetails.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Transaction ID</p>
              <p className="font-mono text-sm text-gray-900">
                {orderDetails.razorpayPaymentId || 'N/A'}
              </p>
            </div>
          </div>

          {/* Right Column - Customer Details */}
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Customer Name</p>
              <p className="font-medium text-gray-900">
                {orderDetails.customer?.firstName} {orderDetails.customer?.lastName}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Email</p>
              <p className="font-medium text-gray-900">
                {orderDetails.customer?.email}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Phone</p>
              <p className="font-medium text-gray-900">
                {orderDetails.customer?.mobile}
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
          </div>
        </div>
      </AdminCard>

      {/* Shiprocket Integration */}
      <AdminCard>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Shiprocket Integration</h2>
          {!shiprocketStatus?.shipmentId && (
            <button
              onClick={createShiprocketShipment}
              className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              Create Shipment
            </button>
          )}
        </div>

        {shiprocketStatus ? (
          <div className="space-y-4">
            {shiprocketStatus.status === 'not_created' ? (
              <div className="text-center py-8">
                <TruckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Shipment not yet created</p>
                <p className="text-sm text-gray-500">
                  Click "Create Shipment" to initiate shipping through Shiprocket
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Shipment ID</p>
                    <p className="font-mono font-medium text-gray-900">
                      {shiprocketStatus.shipmentId || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">AWB Number</p>
                    <p className="font-mono font-medium text-gray-900">
                      {shiprocketStatus.trackingNumber || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Shipping Status</p>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getShippingStatusColor(shiprocketStatus.status)}`}>
                      <TruckIcon className="h-4 w-4 mr-1" />
                      {shiprocketStatus.status || 'Processing'}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {shiprocketStatus.trackingUrl && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Tracking Link</p>
                      <a
                        href={shiprocketStatus.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <TruckIcon className="h-4 w-4 mr-1" />
                        Track on Shiprocket
                      </a>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Estimated Delivery</p>
                    <p className="font-medium text-gray-900">
                      {shiprocketStatus.estimatedDelivery ? 
                        new Date(shiprocketStatus.estimatedDelivery).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Not available'
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Order Items</p>
                    <p className="font-medium text-gray-900">
                      {orderDetails.items?.length || 0} items
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading shipment information...</p>
          </div>
        )}
      </AdminCard>

      {/* Action Buttons */}
      <AdminCard>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => window.open(shiprocketStatus?.trackingUrl, '_blank')}
            disabled={!shiprocketStatus?.trackingUrl}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <TruckIcon className="h-5 w-5" />
            Track on Shiprocket
          </button>
          
          <button
            onClick={() => navigate(`/admin/orders/edit/${orderId}`)}
            className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <DocumentDuplicateIcon className="h-5 w-5" />
            Edit Order
          </button>
        </div>
      </AdminCard>
    </div>
  )
}
