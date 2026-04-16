import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { 
  CheckCircleIcon, 
  ShoppingBagIcon, 
  UserCircleIcon, 
  TruckIcon, 
  ClockIcon, 
  MapPinIcon,
  SparklesIcon,
  GiftIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'
import PriceDisplay from '../../components/Shared/PriceDisplay.jsx'
import confetti from 'canvas-confetti'

// Format price function
const formatPrice = (value) => {
  const num = Number(value);
  return `Rs.${(isNaN(num) ? 0 : num).toLocaleString("en-IN")}`;
};

// Order status timeline
const getOrderTimeline = (status) => {
  const timeline = [
    { status: 'placed', label: 'Order Placed', completed: true, icon: CheckCircleIcon },
    { status: 'confirmed', label: 'Order Confirmed', completed: status === 'confirmed' || status === 'processing' || status === 'shipped' || status === 'delivered', icon: CheckCircleIcon },
    { status: 'processing', label: 'Processing', completed: status === 'processing' || status === 'shipped' || status === 'delivered', icon: TruckIcon },
    { status: 'shipped', label: 'Shipped', completed: status === 'shipped' || status === 'delivered', icon: TruckIcon },
    { status: 'delivered', label: 'Delivered', completed: status === 'delivered', icon: GiftIcon }
  ];
  return timeline;
};

export default function OrderSuccess() {
  const location = useLocation()
  const navigate = useNavigate()
  const [showDetails, setShowDetails] = useState(false)
  const [orderStatus, setOrderStatus] = useState('confirmed')
  
  // Try to get data from state first, then from URL params
  const orderId = location.state?.orderId || new URLSearchParams(location.search).get('orderId')
  const paymentMethod = location.state?.paymentMethod || new URLSearchParams(location.search).get('paymentMethod') || 'cod'
  const paymentId = location.state?.paymentId || new URLSearchParams(location.search).get('paymentId')
  const amountPaid = location.state?.amountPaid || new URLSearchParams(location.search).get('amountPaid')
  const orderData = location.state?.orderData || {}
  
  // Extract Shiprocket details from orderData
  const shiprocketOrderId = orderData.shipping?.shiprocketOrderId
  const shiprocketShipmentId = orderData.shipping?.shiprocketShipmentId
  const awbCode = orderData.shipping?.awbCode
  const trackingUrl = orderData.shipping?.trackingUrl
  
  // Extract customer and order details
  const customerEmail = orderData.guestInfo?.email || orderData.customer?.email || 'your email'
  const customerName = orderData.guestInfo ? `${orderData.guestInfo.firstName} ${orderData.guestInfo.lastName}` : 'Guest Customer'
  const orderItems = orderData.items || []
  const orderTotal = orderData.totalAmount || amountPaid || 0
  const orderStatusText = orderData.status || 'confirmed'
  
  // Update order status based on data
  useEffect(() => {
    if (orderData.status) {
      setOrderStatus(orderData.status)
    }
  }, [orderData.status])

  // Enhanced confetti animation effect
  useEffect(() => {
    // Prevent multiple triggers
    if (sessionStorage.getItem("confettiShown")) return;

    sessionStorage.setItem("confettiShown", "true");

    // Multiple celebration bursts
    const celebrationBursts = async () => {
      // Initial grand burst
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']
      });

      // Side bursts
      await new Promise(resolve => setTimeout(resolve, 500));
      confetti({
        particleCount: 100,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#10b981', '#3b82f6']
      });
      
      confetti({
        particleCount: 100,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#f59e0b', '#ef4444']
      });

      // Continuous smaller bursts
      const duration = 4000;
      const end = Date.now() + duration;
      const interval = setInterval(() => {
        if (Date.now() > end) {
          clearInterval(interval);
          return;
        }

        confetti({
          particleCount: 40,
          spread: 70,
          origin: {
            x: Math.random(),
            y: Math.random() - 0.2
          },
          colors: ['#10b981', '#3b82f6', '#f59e0b']
        });
      }, 300);
    };

    celebrationBursts();
  }, []);
  
  const paymentText = paymentMethod === 'cod'
    ? 'Cash on Delivery (Pay when you receive your parcel)'
    : paymentMethod === 'razorpay'
    ? 'Online Payment via Razorpay (Transaction completed)'
    : paymentMethod === 'upi'
    ? 'UPI Payment (Transaction completed)' 
    : 'Card Payment (Transaction completed)'

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 flex items-center justify-center px-4 py-12 relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 text-4xl animate-bounce opacity-20">🎊</div>
        <div className="absolute top-20 right-20 text-3xl animate-bounce opacity-20 delay-100">🎉</div>
        <div className="absolute bottom-20 left-20 text-3xl animate-bounce opacity-20 delay-200">✨</div>
        <div className="absolute bottom-10 right-10 text-4xl animate-bounce opacity-20 delay-300">�</div>
      </div>

      <div className="relative bg-white p-8 rounded-2xl shadow-2xl text-center max-w-2xl w-full overflow-hidden border border-green-200 success-card">
        {/* Success header with animation */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 celebration-bounce">
            <CheckCircleIcon className="w-12 h-12 text-green-600 success-pulse" />
          </div>
          <h1 className="text-3xl font-bold text-green-600 mb-2 animate-fade-in">
            🎉 Order Placed Successfully!
          </h1>
          <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
            <SparklesIcon className="w-5 h-5 animate-sparkle" />
            <span className="text-lg font-medium">Thank you for your order!</span>
            <SparklesIcon className="w-5 h-5 animate-sparkle" />
          </div>
          <p className="text-gray-600">
            Your payment was successful and your order is being processed with care.
          </p>
        </div>

        {/* Order Information Card */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mt-6 text-left border border-green-200 animate-slide-up delay-100">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBagIcon className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-800 text-lg">Order Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-3">
              <p className="text-sm text-gray-500 mb-1">Order ID</p>
              <p className="font-mono text-sm font-bold text-green-600">{orderId || 'N/A'}</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-sm text-gray-500 mb-1">Payment Method</p>
              <p className="font-medium text-gray-800">
                {paymentMethod === 'razorpay' ? '💳 Online Payment' : '💰 Cash on Delivery'}
              </p>
            </div>
            {paymentId && (
              <div className="bg-white rounded-lg p-3">
                <p className="text-sm text-gray-500 mb-1">Payment ID</p>
                <p className="font-mono text-sm text-gray-600">{paymentId}</p>
              </div>
            )}
            {amountPaid && (
              <div className="bg-white rounded-lg p-3">
                <p className="text-sm text-gray-500 mb-1">Amount Paid</p>
                <p className="font-bold text-lg text-green-600">{formatPrice(amountPaid)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Status Timeline */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mt-6 text-left border border-blue-200 animate-slide-up delay-200">
          <div className="flex items-center gap-2 mb-4">
            <TruckIcon className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-800 text-lg">Order Status</h3>
          </div>
          
          <div className="space-y-3">
            {getOrderTimeline(orderStatus).map((step, index) => {
              const Icon = step.icon
              return (
                <div key={step.status} className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    step.completed ? 'bg-green-100' : 'bg-gray-200'
                  }`}>
                    <Icon className={`w-4 h-4 ${
                      step.completed ? 'text-green-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${
                      step.completed ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </p>
                  </div>
                  {step.completed && (
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                  )}
                </div>
              )
            })}
          </div>
          
          <div className="mt-4 bg-white rounded-lg p-3">
            <p className="text-sm text-blue-600 mb-1">
              <strong>Estimated Delivery:</strong> {getEstimatedDelivery()}
            </p>
            <p className="text-xs text-gray-600">
              📦 We'll send you updates at {customerEmail}
            </p>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mt-6 text-left border border-purple-200 animate-slide-up delay-300">
          <div className="flex items-center gap-2 mb-4">
            <UserCircleIcon className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-800 text-lg">Customer Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-3">
              <p className="text-sm text-gray-500 mb-1">Customer Name</p>
              <p className="font-medium text-gray-800">{customerName}</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-sm text-gray-500 mb-1">Email</p>
              <p className="font-medium text-gray-800 flex items-center gap-1">
                <EnvelopeIcon className="w-4 h-4" />
                {customerEmail}
              </p>
            </div>
          </div>
        </div>

        {/* Order Items Summary */}
        {orderItems.length > 0 && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 mt-6 text-left border border-yellow-200 animate-slide-up delay-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <GiftIcon className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-gray-800 text-lg">Order Items</h3>
              </div>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                {showDetails ? 'Hide Details' : 'Show Details'}
              </button>
            </div>
            
            <div className="bg-white rounded-lg p-3">
              <p className="text-sm text-gray-500 mb-2">Order Summary</p>
              <p className="font-medium text-gray-800">{orderItems.length} items • Total: {formatPrice(orderTotal)}</p>
              
              {showDetails && (
                <div className="mt-3 space-y-2">
                  {orderItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{item.name}</span>
                      <span className="font-medium">{formatPrice(item.price)} × {item.quantity}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 space-y-3 animate-scale-in delay-500">
          {orderId && (
            <button
              onClick={() => navigate(`/orders/track/${orderId}`)}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <TruckIcon className="w-5 h-5" />
              Track Your Order
            </button>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/shop")}
              className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-3 rounded-xl hover:from-gray-900 hover:to-black transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <ShoppingBagIcon className="w-4 h-4" />
              Continue Shopping
            </button>
            
            <button
              onClick={() => navigate("/contact")}
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <PhoneIcon className="w-4 h-4" />
              Contact Support
            </button>
          </div>
        </div>

        {/* Important Information */}
        <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200 animate-fade-in delay-500">
          <div className="flex items-center gap-2 mb-3">
            <EnvelopeIcon className="w-4 h-4 text-green-600" />
            <h4 className="font-medium text-gray-800">Important Information</h4>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Order confirmation sent to {customerEmail}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Use your Order ID to track shipment status anytime</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>For support, contact us with your Order ID: {orderId}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
