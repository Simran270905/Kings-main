import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../../context/useCart'
import { useCustomerOrder } from '../../context/CustomerOrderContext'
import toast from 'react-hot-toast'
import { CreditCardIcon, BanknotesIcon, DevicePhoneMobileIcon, TicketIcon } from '@heroicons/react/24/outline'
import { API_BASE_URL } from '../../../config/api'
import { couponApi } from '../../../services/apiService'

const API_URL = API_BASE_URL

export default function Payment({ deliveryAddress: propDeliveryAddress }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { cartItems, totalPrice, clearCart } = useCart()
  const { fetchUserOrders } = useCustomerOrder()
  
  // Get delivery address from props or checkout state
  const [deliveryAddress] = useState(propDeliveryAddress || location.state?.deliveryAddress || {})
  
  const [selectedMethod, setSelectedMethod] = useState('')
  const [loading, setLoading] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [discount, setDiscount] = useState(0)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [paymentDetails, setPaymentDetails] = useState({
    upiId: '',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  })

  const paymentMethods = [
    {
      id: 'upi',
      name: 'UPI',
      icon: DevicePhoneMobileIcon,
      description: 'Pay using UPI apps'
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCardIcon,
      description: 'Visa, Mastercard, Rupay'
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      icon: BanknotesIcon,
      description: 'Pay when you receive'
    }
  ]

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code')
      return
    }

    setValidatingCoupon(true)
    try {
      const response = await couponApi.validate({
        code: couponCode.toUpperCase(),
        orderAmount: totalPrice
      })

      if (response.success) {
        setAppliedCoupon(response.data)
        setDiscount(response.data.discountAmount)
        toast.success(`Coupon applied! You saved ₹${response.data.discountAmount}`)
      }
    } catch (error) {
      toast.error(error.message || 'Invalid coupon code')
      setAppliedCoupon(null)
      setDiscount(0)
    } finally {
      setValidatingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setCouponCode('')
    setAppliedCoupon(null)
    setDiscount(0)
    toast.success('Coupon removed')
  }

  const finalAmount = totalPrice - discount

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast.error('Please select a payment method')
      return
    }

    setLoading(true)
    
    try {
      // Create order data
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.id || item._id,
          name: item.title || item.name,
          price: item.selling_price || item.price,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          image: item.images?.[0] || '',
          subtotal: (item.selling_price || item.price) * item.quantity
        })),
        shippingAddress: deliveryAddress,
        subtotal: totalPrice,
        discount: discount,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        totalAmount: finalAmount,
        paymentMethod: selectedMethod
      }

      if (selectedMethod === 'cod') {
        // For COD, directly create order
        const headers = {
          'Content-Type': 'application/json',
        }
        
        const token = localStorage.getItem('token')
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        const orderResponse = await fetch(`${API_URL}/orders`, {
          method: 'POST',
          headers,
          body: JSON.stringify(orderData)
        })

        if (orderResponse.ok) {
          const order = await orderResponse.json()
          toast.success('Order placed successfully! You will pay on delivery.')
          clearCart()
          // Refresh user orders
          if (localStorage.getItem('token')) {
            fetchUserOrders()
          }
          navigate('/order-success', { state: { orderId: order.data._id, paymentMethod: selectedMethod } })
        } else {
          toast.error('Failed to create order. Please try again.')
        }
      } else {
        // For UPI/Card, create Razorpay order first
        const razorpayResponse = await fetch(`${API_URL}/payments/create-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: totalPrice,
            orderId: `order-${Date.now()}`
          })
        })

        if (razorpayResponse.ok) {
          const razorpayOrder = await razorpayResponse.json()
          
          // Initialize Razorpay
          const options = {
            key: razorpayOrder.data.key_id,
            amount: totalPrice * 100, // Convert to paise
            currency: "INR",
            name: "KKings Jewellery",
            description: "Purchase",
            order_id: razorpayOrder.data.razorpayOrderId,
            handler: async function (response) {
              // Verify payment and create order
              const verifyResponse = await fetch(`${API_URL}/payments/verify`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  cartItems: orderData.items,
                  customer: orderData.customer,
                  totalAmount: totalPrice
                })
              })

              if (verifyResponse.ok) {
                const result = await verifyResponse.json()
                toast.success('Payment successful! Order placed.')
                clearCart()
                navigate('/order-success', { state: { orderId: result.data.order._id, paymentMethod: selectedMethod } })
              } else {
                toast.error('Payment verification failed. Please contact support.')
              }
            },
            prefill: {
              name: deliveryAddress.firstName + ' ' + deliveryAddress.lastName,
              contact: deliveryAddress.mobile
            },
            theme: {
              color: "#ae0b0b"
            }
          }

          const rzp = new window.Razorpay(options)
          rzp.open()
        } else {
          toast.error('Failed to initialize payment. Please try again.')
        }
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <button
            onClick={() => navigate('/shop')}
            className="bg-[#ae0b0b] text-white px-6 py-3 rounded-md hover:bg-[#8a0909]"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Payment</h1>

        {/* Order Summary */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2">
            {cartItems.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{item.title || item.name} x {item.quantity}</span>
                <span>₹{(item.selling_price || item.price) * item.quantity}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{totalPrice}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({appliedCoupon?.code}):</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total Amount:</span>
                <span className="text-[#ae0b0b]">₹{finalAmount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Coupon Code Section */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg mb-8 border border-yellow-200">
          <div className="flex items-center gap-2 mb-4">
            <TicketIcon className="h-6 w-6 text-yellow-600" />
            <h2 className="text-xl font-semibold">Have a Coupon Code?</h2>
          </div>
          
          {!appliedCoupon ? (
            <div className="flex gap-3">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#ae0b0b] uppercase"
              />
              <button
                onClick={handleApplyCoupon}
                disabled={validatingCoupon}
                className="px-6 py-2.5 bg-[#ae0b0b] text-white rounded-lg hover:bg-[#8f0a0a] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {validatingCoupon ? 'Validating...' : 'Apply'}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                  ✓
                </div>
                <div>
                  <p className="font-semibold text-green-800">Coupon Applied: {appliedCoupon.code}</p>
                  <p className="text-sm text-green-600">You saved ₹{discount}</p>
                </div>
              </div>
              <button
                onClick={handleRemoveCoupon}
                className="text-red-600 hover:text-red-700 font-medium text-sm"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Delivery Address */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>
          <div className="text-sm space-y-1">
            <p>{deliveryAddress.firstName} {deliveryAddress.lastName}</p>
            <p>{deliveryAddress.streetAddress}</p>
            <p>{deliveryAddress.city}, {deliveryAddress.state} - {deliveryAddress.zipCode}</p>
            <p>📱 {deliveryAddress.mobile}</p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Select Payment Method</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {paymentMethods.map((method) => {
              const Icon = method.icon
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedMethod === method.id
                      ? 'border-[#ae0b0b] bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-8 w-8 mb-2 text-[#ae0b0b]" />
                  <h3 className="font-semibold">{method.name}</h3>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Payment Details Form */}
        {selectedMethod && selectedMethod !== 'cod' && (
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {selectedMethod === 'upi' ? 'UPI Details' : 'Card Details'}
            </h2>
            
            {selectedMethod === 'upi' && (
              <div>
                <label className="block text-sm font-medium mb-2">UPI ID</label>
                <input
                  type="text"
                  value={paymentDetails.upiId}
                  onChange={(e) => setPaymentDetails(prev => ({ ...prev, upiId: e.target.value }))}
                  placeholder="yourupi@upi"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ae0b0b]"
                />
              </div>
            )}

            {selectedMethod === 'card' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Card Number</label>
                  <input
                    type="text"
                    value={paymentDetails.cardNumber}
                    onChange={(e) => setPaymentDetails(prev => ({ ...prev, cardNumber: e.target.value }))}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ae0b0b]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Cardholder Name</label>
                  <input
                    type="text"
                    value={paymentDetails.cardName}
                    onChange={(e) => setPaymentDetails(prev => ({ ...prev, cardName: e.target.value }))}
                    placeholder="John Doe"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ae0b0b]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Expiry Date</label>
                    <input
                      type="text"
                      value={paymentDetails.expiryDate}
                      onChange={(e) => setPaymentDetails(prev => ({ ...prev, expiryDate: e.target.value }))}
                      placeholder="MM/YY"
                      maxLength="5"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ae0b0b]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">CVV</label>
                    <input
                      type="text"
                      value={paymentDetails.cvv}
                      onChange={(e) => setPaymentDetails(prev => ({ ...prev, cvv: e.target.value }))}
                      placeholder="123"
                      maxLength="3"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ae0b0b]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/checkout?step=2')}
            className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-md hover:bg-gray-50"
          >
            Back to Checkout
          </button>
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-[#ae0b0b] text-white py-4 rounded-lg font-semibold text-lg hover:bg-[#8a0909] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Processing...' : `Pay ₹${finalAmount}`}
          </button>
        </div>
      </div>
    </div>
  )
}
