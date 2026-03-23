import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../../context/useCart'
import { useCustomerOrder } from '../../context/CustomerOrderContext'
import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { CreditCardIcon, BanknotesIcon, DevicePhoneMobileIcon, TicketIcon } from '@heroicons/react/24/outline'
import { API_BASE_URL } from '../../../config/api'
import { couponApi } from '../../../services/apiService'

const API_URL = API_BASE_URL

// Load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function Payment({ deliveryAddress: propDeliveryAddress, clearCart: propClearCart }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { cartItems, totalPrice, clearCart } = useCart()
  const { user } = useContext(AuthContext)
  const { fetchUserOrders, createOrder } = useCustomerOrder()
  
  // Get delivery address from props or checkout state
  const [deliveryAddress] = useState(propDeliveryAddress || location.state?.deliveryAddress || {})
  
  const [selectedMethod, setSelectedMethod] = useState('')
  const [loading, setLoading] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [discount, setDiscount] = useState(0)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [error, setError] = useState(null)
  const [paymentDetails, setPaymentDetails] = useState({
    upiId: '',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  })

  // Reset coupon when cart changes
  useEffect(() => {
    setCouponCode('')
    setAppliedCoupon(null)
    setDiscount(0)
  }, [cartItems, totalPrice])

  const paymentMethods = [
    {
      id: 'razorpay',
      name: 'Online Payment',
      icon: CreditCardIcon,
      description: 'Credit Card, Debit Card, UPI, NetBanking'
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

    if (appliedCoupon) {
      toast.error('A coupon is already applied. Remove it first to apply a different one.')
      return
    }

    setValidatingCoupon(true)
    try {
      const response = await couponApi.validate({
        code: couponCode.toUpperCase(),
        userId: user?._id,
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
    setError(null)

    if (!selectedMethod) {
      setError('Please select a payment method')
      toast.error('Please select a payment method')
      return
    }

    // Validate delivery address
    if (!deliveryAddress.firstName || !deliveryAddress.lastName || !deliveryAddress.mobile || 
        !deliveryAddress.streetAddress || !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.zipCode) {
      setError('Please complete your delivery address')
      toast.error('Please complete your delivery address')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Please login to continue')
      }

      // Create order data
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.id || item._id,
          name: item.title || item.name,
          price: item.price || 0, // This should already be the correct price from cart
          originalPrice: item.originalPrice || item.price || 0,
          discountPercentage: item.discountPercentage || 0,
          isOnSale: item.isOnSale || false,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          image: item.image || item.images?.[0] || '',
          subtotal: (item.price || 0) * item.quantity
        })),
        shippingAddress: {
          firstName: deliveryAddress.firstName,
          lastName: deliveryAddress.lastName,
          email: deliveryAddress.email || user?.email || '',
          mobile: deliveryAddress.mobile,
          streetAddress: deliveryAddress.streetAddress,
          city: deliveryAddress.city,
          state: deliveryAddress.state,
          zipCode: deliveryAddress.zipCode
        },
        subtotal: totalPrice,
        discount: discount,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        totalAmount: finalAmount,
        paymentMethod: selectedMethod
      }

      if (selectedMethod === 'cod') {
        // For COD, directly create order
        const result = await createOrder(orderData, propClearCart || clearCart)
        if (result.success) {
          toast.success('Order placed successfully! You will pay on delivery.')
          navigate('/order-success', { state: { orderId: result.order._id || result.order.id, paymentMethod: selectedMethod } })
        } else {
          setError(result.error || 'Failed to create order. Please try again.')
        }
      } else if (selectedMethod === 'razorpay') {
        // Process Razorpay payment
        await processRazorpayPayment(orderData, token)
      }
    } catch (error) {
      console.error('Payment error:', error)
      setError(error.message || 'Payment failed. Please try again.')
      toast.error(error.message || 'Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const processRazorpayPayment = async (orderData, token) => {
    try {
      // Step 1: Create Razorpay order
      const orderResponse = await fetch(`${API_URL}/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: orderData.totalAmount,
          currency: 'INR',
          receipt: `order-${Date.now()}`
        })
      })

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json()
        throw new Error(errorData.message || 'Failed to create payment order')
      }

      const orderResult = await orderResponse.json()
      const { razorpayOrderId, paymentId } = orderResult.data

      // Step 2: Load Razorpay script
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        throw new Error('Failed to load payment gateway. Please try again.')
      }

      // Step 3: Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || orderResult.data.key_id,
        amount: orderData.totalAmount * 100, // Convert to paise
        currency: 'INR',
        name: 'KKings Jewellery',
        description: `Order for ${orderData.items.length} items`,
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            // Step 4: Verify payment and create order
            const verifyResponse = await fetch(`${API_URL}/payments/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                cartItems: orderData.items,
                customer: orderData.shippingAddress,
                totalAmount: orderData.totalAmount
              })
            })

            if (!verifyResponse.ok) {
              const errorData = await verifyResponse.json()
              throw new Error(errorData.message || 'Payment verification failed')
            }

            const verifyResult = await verifyResponse.json()
            
            // Clear cart and navigate to success
            if (propClearCart) {
              propClearCart()
            } else {
              clearCart()
            }

            toast.success('Payment successful! Your order has been placed.')
            navigate('/order-success', { 
              state: { 
                orderId: verifyResult.data.order._id, 
                paymentMethod: 'razorpay',
                paymentId: verifyResult.data.paymentId
              } 
            })
          } catch (error) {
            console.error('Payment verification error:', error)
            setError('Payment verification failed. Please contact support.')
            toast.error('Payment verification failed. Please contact support.')
          }
        },
        prefill: {
          name: `${orderData.shippingAddress.firstName} ${orderData.shippingAddress.lastName}`,
          email: orderData.shippingAddress.email,
          contact: orderData.shippingAddress.mobile
        },
        notes: {
          address: `${orderData.shippingAddress.streetAddress}, ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} - ${orderData.shippingAddress.zipCode}`,
          order_type: 'Jewellery Purchase'
        },
        theme: {
          color: '#ae0b0b'
        },
        modal: {
          ondismiss: function() {
            setLoading(false)
            toast.error('Payment cancelled. You can try again.')
          }
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error('Razorpay processing error:', error)
      throw error
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
              <div key={index} className="flex flex-col gap-1 text-sm">
                <div className="flex justify-between">
                  <span>{item.title || item.name} x {item.quantity}</span>
                  <span>₹{(item.selling_price || item.price) * item.quantity}</span>
                </div>
                {item.selectedSize && (
                  <div className="text-xs text-gray-500">
                    Size: {item.selectedSize}
                  </div>
                )}
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
              {error && (
                <div className="mt-2 text-red-600 font-medium">
                  {error}
                </div>
              )}
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
              const selected = selectedMethod === method.id
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`p-4 border-2 rounded-lg text-left transition-all shadow-sm ${
                    selected
                      ? 'border-[#ae0b0b] bg-[#ffe9e9] text-[#950000]' 
                      : 'border-gray-200 bg-white text-gray-900 hover:border-[#ae0b0b] hover:text-[#ae0b0b]'
                  }`}
                >
                  <Icon className={`h-8 w-8 mb-2 ${selected ? 'text-[#ae0b0b]' : 'text-[#ae0b0b]'}`} />
                  <h3 className="font-bold text-lg">{method.name}</h3>
                  <p className="text-sm font-medium">{method.description}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/checkout?step=1')}
            className="flex-1 border border-[#ae0b0b] text-[#ae0b0b] py-3 rounded-md font-semibold hover:bg-[#ffeaeb] transition-colors"
          >
            ← Back to Checkout
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
