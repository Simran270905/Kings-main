import React, { useState, useEffect, useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../../../context/useCart'
import { AuthContext } from '../../../context/AuthContext'
import { useCustomerOrder } from '../../../context/CustomerOrderContext'
import toast from 'react-hot-toast'
import { API_BASE_URL } from '../../../config/api.js'

// Helpers
const formatPrice = (value) => {
  const num = Number(value)
  return `Rs${(isNaN(num) ? 0 : num).toLocaleString("en-IN")}`
}

const getSellingPrice = (item) => Number(item.sellingPrice || item.selling_price || 0) || 0
const getQuantity = (item) => Number(item.quantity) || 1

const API_URL = API_BASE_URL

// Razorpay loader
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

// Payment options
const paymentOptions = [
  { 
    id: "upi", 
    label: "UPI", 
    description: "Pay using Google Pay, PhonePe, etc.",
    icon: "UPI"
  },
  { 
    id: "netbanking", 
    label: "Net Banking", 
    description: "All major banks supported",
    icon: "Bank"
  },
  { 
    id: "card", 
    label: "Credit/Debit Card", 
    description: "Visa, MasterCard, RuPay",
    icon: "Card"
  },
  { 
    id: "cod", 
    label: "Cash on Delivery", 
    description: "Pay when order arrives",
    icon: "Cash"
  }
];

const COD_CHARGE = 50; // Additional charge for COD

export default function Payment({ deliveryAddress: propDeliveryAddress, clearCart: propClearCart }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { cartItems, totalPrice, clearCart } = useCart()
  const { user } = useContext(AuthContext)
  const { createOrder } = useCustomerOrder()

  const [deliveryAddress] = useState(propDeliveryAddress || location.state?.deliveryAddress || {})
  const [selectedMethod, setSelectedMethod] = useState('')
  const [loading, setLoading] = useState(false)

  // Calculate total amount with COD charge
  const finalAmount = totalPrice + (selectedMethod === 'cod' ? COD_CHARGE : 0)

  const handlePayment = async () => {
    if (!selectedMethod) return toast.error('Select payment method')

    const token = localStorage.getItem('token')
    if (!token) return toast.error('Login required')

    const orderData = {
      items: cartItems.map(item => ({
        productId: item.id || item._id,
        name: item.title || item.name,
        price: getSellingPrice(item),
        quantity: getQuantity(item)
      })),
      totalAmount: finalAmount,
      paymentMethod: selectedMethod
    }

    try {
      setLoading(true)

      if (selectedMethod === 'cod') {
        const res = await createOrder(orderData)
        if (res?.success) {
          toast.success('Order placed')
          clearCart()
          navigate('/order-success')
        }
      } else {
        await processRazorpayPayment(orderData, token)
      }

    } catch (err) {
      toast.error(err.message || 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  const processRazorpayPayment = async (orderData, token) => {
    const res = await fetch(`${API_URL}/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ amount: orderData.totalAmount })
    })

    const data = await res.json()

    const loaded = await loadRazorpayScript()
    if (!loaded) return toast.error('Razorpay failed to load')

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: orderData.totalAmount * 100,
      currency: 'INR',
      name: 'KKings Jewellery',
      order_id: data.data.razorpayOrderId,
      handler: async (response) => {
        toast.success('Payment successful')
        clearCart()
        navigate('/order-success')
      }
    };

    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ffffff] via-[#fffaf3] to-[#fdf6ec] p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Payment</h1>
        
        {/* Payment Methods */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Payment Method</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentOptions.map((method) => (
              <div
                key={method.id}
                onClick={() => {
                  setSelectedMethod(method.id)
                  console.log("Selected Payment Method:", method.id)
                }}
                className={`
                  border-2 rounded-xl p-4 cursor-pointer transition-all duration-200
                  ${selectedMethod === method.id 
                    ? 'border-[#ae0b0b] bg-[#fdf6ec]' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-600">{method.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{method.label}</h3>
                    <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center">
                    {selectedMethod === method.id && (
                      <div className="w-3 h-3 bg-[#ae0b0b] rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COD Charge Warning */}
        {selectedMethod === 'cod' && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-yellow-600 text-xs">!</span>
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Additional COD charge applied
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Extra amount of {formatPrice(COD_CHARGE)} will be added to your total
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="mb-8 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            {selectedMethod === 'cod' && (
              <div className="flex justify-between text-yellow-600">
                <span>COD Charge</span>
                <span>+ {formatPrice(COD_CHARGE)}</span>
              </div>
            )}
            <div className="border-t pt-3">
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total Amount</span>
                <span>{formatPrice(finalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={loading || !selectedMethod}
          className={`
            w-full py-4 rounded-xl font-bold transition-all duration-200
            ${loading || !selectedMethod
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-[#ae0b0b] text-white hover:bg-[#8f0a0a] active:scale-[0.98]'
            }
          `}
        >
          {loading ? 'Processing...' : `Pay ${formatPrice(finalAmount)}`}
        </button>
      </div>
    </div>
  )
}
