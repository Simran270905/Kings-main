import React, { useState, useEffect, useRef, useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../../context/useCart'
import { useOrder } from '../../context/useOrder'
import { AuthContext } from '../../context/AuthContext'
import { useCustomerOrder } from '../../context/CustomerOrderContext'
import { ShieldCheckIcon, LockClosedIcon, CreditCardIcon, TruckIcon, DevicePhoneMobileIcon, BanknotesIcon, TicketIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { API_BASE_URL } from '@config/api.js'
import { couponApi } from '../../../services/apiService'
import { calculateTotalDiscount, getDiscountBadgeText, calculatePartialPayment, getPaymentPlanBadgeText } from '../../../utils/discountCalculator.js'
import PaymentPlanSelector from './PaymentPlanSelector.jsx'
import PriceDisplay from '../Shared/PriceDisplay.jsx'

// Inline formatPrice functions to bypass import issues
const formatPrice = (value) => {
  const num = Number(value);
  return `₹${(isNaN(num) ? 0 : num).toLocaleString("en-IN")}`;
};

const getSellingPrice = (item) => {
  const num = Number(item.sellingPrice || item.selling_price || 0);
  return isNaN(num) ? 0 : num;
};

const getOriginalPrice = (item) => {
  const num = Number(item.originalPrice || item.original_price || 0);
  return isNaN(num) ? 0 : num;
};

const getQuantity = (item) => {
  const num = Number(item.quantity);
  return isNaN(num) ? 1 : num;
};

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

  // Payment plan state
  const [paymentPlan, setPaymentPlan] = useState('full')

  // Calculate payment amounts using new logic (10/90 split with discount consideration)
  const paymentCalculation = calculatePartialPayment(totalPrice, selectedMethod, paymentPlan)
  
  // For partial payments, use advance amount for payment processing
  const paymentAmount = paymentCalculation.payNowAmount
  const finalAmount = paymentCalculation.payNowAmount

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
      description: 'Credit Card, Debit Card, NetBanking, UPI',
      badge: 'Secure'
    },
    {
      id: 'upi',
      name: 'UPI Payment',
      icon: DevicePhoneMobileIcon,
      description: 'Google Pay, PhonePe, Paytm & more',
      badge: 'Instant'
    },
    {
      id: 'netbanking',
      name: 'NetBanking',
      icon: CreditCardIcon,
      description: 'Direct Bank Transfer'
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

    // ✅ ADDED: Check if user is logged in
    if (!user || !user._id) {
      toast.error('Please login to apply coupon')
      return
    }

    setValidatingCoupon(true)
    try {
      console.log('🔍 DEBUG: Applying coupon with data:', {
        code: couponCode.toUpperCase(),
        userId: user._id,
        orderAmount: totalPrice
      })

      const response = await couponApi.validate({
        code: couponCode.toUpperCase(),
        userId: user._id,
        orderAmount: totalPrice
      })

      if (response && response.success) {
        setAppliedCoupon(response.data)
        setDiscount(response.data.discountAmount)
        toast.success(`Coupon applied! You saved ₹${response.data.discountAmount}`)
      }
    } catch (error) {
      console.error('❌ DEBUG: Coupon validation error:', error)
      
      // ✅ ENHANCED: Specific error messages
      if (error.message.includes('Invalid coupon code')) {
        toast.error('Invalid coupon code')
      } else if (error.message.includes('already used')) {
        toast.error('You have already used this coupon')
      } else if (error.message.includes('expired')) {
        toast.error('Coupon has expired')
      } else if (error.message.includes('Minimum order amount')) {
        toast.error(error.message)
      } else if (error.message.includes('404')) {
        toast.error('Coupon not found')
      } else if (error.message.includes('Network') || error.message.includes('fetch')) {
        toast.error('Network error. Please try again')
      } else {
        toast.error(error.message || 'Invalid coupon code')
      }
      
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
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to proceed with payment');
        setLoading(false);
        return;
      }
      
      console.log("Payment proceeding with token:", token);

      // Create order data
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.id || item._id,
          name: item.title || item.name,
          price: getSellingPrice(item), // Use safe selling price
          originalPrice: getOriginalPrice(item),
          discountPercentage: item.discountPercentage || 0,
          isOnSale: item.isOnSale || false,
          quantity: getQuantity(item),
          selectedSize: item.selectedSize,
          image: item.image || item.images?.[0] || '',
          subtotal: getSellingPrice(item) * getQuantity(item)
        })),
        // Add customer data directly for better storage
        user: {
          name: `${deliveryAddress.firstName} ${deliveryAddress.lastName}`,
          email: deliveryAddress.email || user?.email || '',
          phone: deliveryAddress.mobile
        },
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
        totalAmount: paymentCalculation.finalAmount, // ✅ UPDATED: Use final amount with COD charge and discount
        paymentMethod: selectedMethod,
        upiId: paymentDetails.upiId || null,
        // Add payment plan information
        paymentPlan: paymentPlan,
        advanceAmount: paymentPlan === 'partial' ? paymentCalculation.advanceAmount : null,
        remainingAmount: paymentPlan === 'partial' ? paymentCalculation.remainingAmount : null,
        // ✅ NEW: Add COD charge and discount breakdown
        originalAmount: paymentCalculation.originalAmount,
        codCharge: paymentCalculation.codCharge,
        discountApplied: paymentCalculation.hasDiscount,
        discountPercent: paymentCalculation.hasDiscount ? 10 : 0,
        discountAmount: paymentCalculation.discountAmount,
        advancePercent: paymentPlan === 'partial' ? 10 : null,
        remainingPercent: paymentPlan === 'partial' ? 90 : null,
        remainingPaymentStatus: paymentPlan === 'partial' ? 'pending' : null
      }

      if (selectedMethod === 'cod') {
        // For COD, directly create order
        console.log('🚀 Creating COD order with data:', orderData)
        try {
          const result = await createOrder(orderData, propClearCart || clearCart)
          console.log('📦 COD order result:', result)
          if (result && result.success) {
            toast.success('Order placed successfully! You will pay on delivery.')
            navigate('/order-success', { state: { orderId: result.order._id || result.order.id, paymentMethod: selectedMethod } })
          } else {
            console.error('❌ COD order failed:', result.error)
            setError(result.error || 'Failed to create order. Please try again.')
            toast.error(result.error || 'Failed to create order. Please try again.')
          }
        } catch (error) {
          console.error('❌ COD order error:', error)
          setError(error.message || 'Failed to create order. Please try again.')
          toast.error(error.message || 'Failed to create order. Please try again.')
        }
      } else if (selectedMethod === 'upi') {
        // For UPI, create order directly (no payment gateway)
        console.log('📱 Creating UPI order with data:', orderData)
        try {
          const result = await createOrder(orderData, propClearCart || clearCart)
          console.log('📦 UPI order result:', result)
          if (result && result.success) {
            toast.success('Order placed successfully! Please complete UPI payment.')
            navigate('/order-success', { state: { orderId: result.order._id || result.order.id, paymentMethod: selectedMethod, upiId: paymentDetails.upiId } })
          } else {
            console.error('❌ UPI order failed:', result.error)
            setError(result.error || 'Failed to create order. Please try again.')
            toast.error(result.error || 'Failed to create order. Please try again.')
          }
        } catch (error) {
          console.error('❌ UPI order error:', error)
          setError(error.message || 'Failed to create order. Please try again.')
          toast.error(error.message || 'Failed to create order. Please try again.')
        }
      } else if (selectedMethod === 'netbanking') {
        // For NetBanking, create order directly (no payment gateway)
        console.log('🏦 Creating NetBanking order with data:', orderData)
        try {
          const result = await createOrder(orderData, propClearCart || clearCart)
          console.log('📦 NetBanking order result:', result)
          if (result && result.success) {
            toast.success('Order placed successfully! Please complete NetBanking payment.')
            navigate('/order-success', { state: { orderId: result.order._id || result.order.id, paymentMethod: selectedMethod } })
          } else {
            console.error('❌ NetBanking order failed:', result.error)
            setError(result.error || 'Failed to create order. Please try again.')
            toast.error(result.error || 'Failed to create order. Please try again.')
          }
        } catch (error) {
          console.error('❌ NetBanking order error:', error)
          setError(error.message || 'Failed to create order. Please try again.')
          toast.error(error.message || 'Failed to create order. Please try again.')
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
          amount: paymentCalculation.finalAmount, // ✅ UPDATED: Use final amount with COD charge and discount
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
        amount: paymentCalculation.finalAmount * 100, // ✅ UPDATED: Use final amount with COD charge and discount
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
                totalAmount: paymentCalculation.finalAmount // ✅ UPDATED: Use final amount with COD charge and discount
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
                  <span>{item.title || item.name} x {getQuantity(item)}</span>
                  <PriceDisplay 
                    sellingPrice={getSellingPrice(item) * getQuantity(item)}
                    originalPrice={getOriginalPrice(item) * getQuantity(item)}
                    discount={item.discountPercentage || 0}
                    showOriginalPrice={!!getOriginalPrice(item)}
                    showDiscountBadge={!!(item.discountPercentage || 0)}
                  />
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
                <PriceDisplay 
                  sellingPrice={totalPrice}
                  originalPrice={null}
                  discount={0}
                  showOriginalPrice={false}
                  showDiscountBadge={false}
                />
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({appliedCoupon?.code}):</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              {paymentCalculation.hasDiscount && (
                <div className="flex justify-between text-green-600">
                  <span>Discount (10%):</span>
                  <span>-₹{paymentCalculation.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              {paymentCalculation.hasCODCharge && (
                <div className="flex justify-between text-orange-600">
                  <span>COD Charge:</span>
                  <span>+₹{paymentCalculation.codCharge.toLocaleString('en-IN')}</span>
                </div>
              )}
              {paymentCalculation.hasCODCharge && (
                <div className="text-xs text-gray-500 mt-1">
                  {paymentCalculation.codMessage}
                </div>
              )}
              {paymentPlan === 'partial' && (
                <>
                  <div className="flex justify-between text-blue-600">
                    <span>Pay Now (10%):</span>
                    <span>₹{paymentCalculation.advanceAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-orange-600">
                    <span>Pay Later (90%):</span>
                    <span>₹{paymentCalculation.remainingAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Remaining amount to be paid before shipping
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span>Item Total:</span>
                <PriceDisplay 
                  sellingPrice={paymentCalculation.originalAmount}
                  originalPrice={null}
                  discount={0}
                  showOriginalPrice={false}
                  showDiscountBadge={false}
                />
              </div>
              {paymentPlan === 'full' && (
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total Payable:</span>
                  <PriceDisplay 
                    sellingPrice={paymentCalculation.finalAmount}
                    originalPrice={paymentCalculation.originalAmount}
                    discount={paymentCalculation.hasDiscount ? 10 : 0}
                    showOriginalPrice={paymentCalculation.hasDiscount}
                    showDiscountBadge={false}
                  />
                </div>
              )}
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
          
          {/* Discount Badge */}
          {paymentCalculation.hasDiscount && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg">
                  🎉
                </div>
                <div>
                  <p className="font-bold text-green-800 text-lg">🎉 Extra 10% OFF on UPI/Netbanking!</p>
                  <p className="text-green-600">You saved ₹{paymentCalculation.discountAmount} on this order</p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Plan Badge */}
          {paymentPlan === 'partial' && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg">
                  💳
                </div>
                <div>
                  <p className="font-bold text-blue-800 text-lg">💳 Pay just 10% now, rest 90% later!</p>
                  <p className="text-blue-600">Pay ₹{paymentCalculation.advanceAmount.toLocaleString('en-IN')} now, ₹{paymentCalculation.remainingAmount.toLocaleString('en-IN')} later</p>
                </div>
              </div>
            </div>
          )}

        {/* Payment Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {paymentMethods.map((method) => {
            const Icon = method.icon
            const selected = selectedMethod === method.id
            return (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`relative p-4 border-2 rounded-lg text-left transition-all ${
                  selected
                    ? 'border-[#ae0b0b] bg-[#fffaf3] shadow-md'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <Icon className="h-6 w-6 text-[#ae0b0b] mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{method.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                  </div>
                  {method.badge && (
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      method.badge === 'Secure' 
                        ? 'bg-green-100 text-green-800' 
                        : method.badge === 'Instant'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {method.badge}
                    </span>
                  )}
                </div>
                {selected && (
                  <div className="absolute top-2 right-2">
                    <div className="w-4 h-4 bg-[#ae0b0b] rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            )
          })}
        </div>

{/* UPI/NetBanking Payment Details */}
{(selectedMethod === 'razorpay' || selectedMethod === 'upi' || selectedMethod === 'netbanking') && (
  <div className="bg-gray-50 p-6 rounded-lg mb-8">
    <h2 className="text-xl font-semibold mb-4">
      {selectedMethod === 'netbanking' ? 'NetBanking Payment Details' : 'UPI Payment Details'}
    </h2>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {selectedMethod === 'netbanking' ? 'Account Number (Optional)' : 'UPI ID (Optional)'}
        </label>
        <input
          type="text"
          value={paymentDetails.upiId}
          onChange={(e) => setPaymentDetails(prev => ({ ...prev, upiId: e.target.value }))}
          placeholder={selectedMethod === 'netbanking' ? 'Enter your account number' : 'Enter your UPI ID (e.g., 9876543210@upi)'}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ae0b0b]"
        />
        <p className="text-xs text-gray-500 mt-1">
          {selectedMethod === 'netbanking' 
            ? 'Enter your account number for direct bank transfer (optional)'
            : 'Enter your UPI ID for direct UPI payment (optional)'
          }
        </p>
      </div>
      {selectedMethod === 'upi' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">UPI Payment Instructions:</h4>
                  <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Enter your UPI ID above (optional)</li>
                    <li>Click "Pay Now" to create your order</li>
                    <li>You will receive order details with payment link</li>
                    <li>Complete payment using any UPI app</li>
                  </ol>
                </div>
              )}
              {selectedMethod === 'netbanking' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">NetBanking Payment Instructions:</h4>
                  <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Enter your account number above (optional)</li>
                    <li>Click "Pay Now" to create your order</li>
                    <li>You will receive order details with payment details</li>
                    <li>Complete payment using your bank\'s net banking portal</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Trust Badges & Security */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Trusted Payments</h3>
            <p className="text-sm text-gray-600">Your payment information is encrypted and secure</p>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-6">
            {/* Razorpay Badge */}
            <div className="flex flex-col items-center">
              <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm mb-1">
                Powered by Razorpay
              </div>
              <p className="text-xs text-gray-500">PCI DSS Compliant</p>
            </div>

            {/* Security Indicators */}
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="h-6 w-6 text-green-600" />
              <span className="text-sm text-gray-700">256-bit SSL</span>
            </div>

            <div className="flex items-center space-x-2">
              <LockClosedIcon className="h-6 w-6 text-green-600" />
              <span className="text-sm text-gray-700">Encrypted</span>
            </div>

            {/* Payment Methods */}
            <div className="flex items-center space-x-2">
              <CreditCardIcon className="h-6 w-6 text-blue-600" />
              <span className="text-sm text-gray-700">All Cards</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              KKings Jewellery follows all RBI guidelines for digital payments. 
              Your transactions are 100% secure and protected.
            </p>
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
            {loading ? 'Processing...' : `Pay ₹${finalAmount.toLocaleString('en-IN')}`}
          </button>
        </div>
      </div>
    </div>
  </div>
  )
}
