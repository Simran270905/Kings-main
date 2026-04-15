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
  const orderId = location.state?.orderId
  const paymentMethod = location.state?.paymentMethod || 'cod'
  const paymentId = location.state?.paymentId
  const amountPaid = location.state?.amountPaid
  const orderData = location.state?.orderData || {}

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
      <div className="relative bg-white p-8 rounded-xl shadow-lg text-center max-w-md overflow-hidden">
        <div className="absolute top-5 left-5 text-3xl animate-bounce"></div>
        <div className="absolute top-5 right-5 text-3xl animate-bounce"></div>

        <h1 className="text-2xl font-bold text-green-600 mb-4">
          Order Placed Successfully!
        </h1>

        <p className="text-gray-600 mb-2">
          Your payment was successful.
        </p>

        <div className="bg-gray-100 rounded-lg p-4 mt-4 text-left">
          <p><strong>Order ID:</strong> {orderId}</p>
          <p><strong>Payment ID:</strong> {paymentId}</p>
        </div>

        <button
          onClick={() => navigate("/shop")}
          className="mt-6 bg-black text-white px-6 py-2 rounded-lg"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  )
}
