import React, { useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { CheckCircleIcon, ShoppingBagIcon, UserCircleIcon, TruckIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline'
import PriceDisplay from '../../components/Shared/PriceDisplay.jsx'
import confetti from 'canvas-confetti'

// Format price function
const formatPrice = (value) => {
  const num = Number(value);
  return `Rs.${(isNaN(num) ? 0 : num).toLocaleString("en-IN")}`;
};

export default function OrderSuccess() {
  const location = useLocation()
  const navigate = useNavigate()
  
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

  // Confetti animation effect
  useEffect(() => {
    // Prevent multiple triggers
    if (sessionStorage.getItem("confettiShown")) return;

    sessionStorage.setItem("confettiShown", "true");

    // Initial burst
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 }
    });

    // Continuous smaller bursts
    const duration = 3000;
    const end = Date.now() + duration;

    const interval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval);
        return;
      }

      confetti({
        particleCount: 30,
        spread: 70,
        origin: {
          x: Math.random(),
          y: Math.random() - 0.2
        }
      });
    }, 300);

    return () => clearInterval(interval);
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center px-4 py-12 relative">
      <div className="relative bg-white p-8 rounded-xl shadow-lg text-center max-w-lg overflow-hidden">
        <div className="absolute top-5 left-5 text-3xl animate-bounce">🎊</div>
        <div className="absolute top-5 right-5 text-3xl animate-bounce">🎉</div>

        <h1 className="text-2xl font-bold text-green-600 mb-4">
          🎉 Order Placed Successfully!
        </h1>

        <p className="text-gray-600 mb-4">
          Thank you for your order! Your payment was successful and your order is being processed.
        </p>

        {/* Order Information */}
        <div className="bg-gray-100 rounded-lg p-4 mt-4 text-left">
          <h3 className="font-semibold text-gray-800 mb-3">📦 Order Information</h3>
          <p><strong>Order ID:</strong> <span className="font-mono text-sm">{orderId}</span></p>
          <p><strong>Payment ID:</strong> <span className="font-mono text-sm">{paymentId}</span></p>
          <p><strong>Payment Method:</strong> {paymentMethod === 'razorpay' ? 'Online Payment' : 'Cash on Delivery'}</p>
          {amountPaid && (
            <p><strong>Amount Paid:</strong> {formatPrice(amountPaid)}</p>
          )}
        </div>

        {/* Shipping & Tracking Information */}
        <div className="bg-blue-50 rounded-lg p-4 mt-4 text-left">
          <h3 className="font-semibold text-blue-800 mb-3">🚚 Shipping & Tracking</h3>
          <p className="text-sm text-blue-600 mb-2">
            <strong>Estimated Delivery:</strong> {getEstimatedDelivery()}
          </p>
          
          {shiprocketOrderId && (
            <p className="text-sm">
              <strong>Shiprocket Order ID:</strong> <span className="font-mono">{shiprocketOrderId}</span>
            </p>
          )}
          
          {shiprocketShipmentId && (
            <p className="text-sm">
              <strong>Shipment ID:</strong> <span className="font-mono">{shiprocketShipmentId}</span>
            </p>
          )}
          
          {awbCode && (
            <p className="text-sm">
              <strong>AWB Code:</strong> <span className="font-mono">{awbCode}</span>
            </p>
          )}
          
          <p className="text-xs text-gray-600 mt-2">
            💡 Save this information for tracking your order status
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          {orderId && (
            <button
              onClick={() => navigate(`/orders/track/${orderId}`)}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              📍 Track Your Order
            </button>
          )}
          
          <button
            onClick={() => navigate("/shop")}
            className="w-full bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            🛍️ Continue Shopping
          </button>
        </div>

        {/* Important Information */}
        <div className="mt-6 text-xs text-gray-500 space-y-1">
          <p>📧 Order confirmation sent to your registered email</p>
          <p>🔍 Use your Order ID to track shipment status anytime</p>
          <p>📞 For support, contact us with your Order ID</p>
        </div>
      </div>
    </div>
  )
}
