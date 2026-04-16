import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../../../context/useCart'
import { useProduct } from '../../../context/ProductContext'
import { useCustomerOrder } from '../../../context/CustomerOrderContext'
import { 
  CreditCardIcon, 
  InformationCircleIcon,
  BanknotesIcon,
  CreditCardIcon as CardIcon,
  WalletIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { API_BASE_URL } from '../../../config/api.js'

// Helpers
const formatPrice = (value) => {
  const num = Number(value)
  console.log('💰 formatPrice called with:', value, typeof value)
  // If value is in paise (>= 10000), convert to rupees
  const displayValue = num >= 10000 ? num / 100 : num
  console.log('💰 formatPrice displaying:', displayValue)
  return `Rs${(isNaN(displayValue) ? 0 : displayValue).toLocaleString("en-IN")}`
}

const getSellingPrice = (item) => Number(item.sellingPrice || item.selling_price || 0) || 0
const getQuantity = (item) => Number(item.quantity) || 1
const safeNum = (value, fallback = 0) => {
  const num = Number(value);
  return isNaN(num) ? fallback : num;
};

const API_URL = API_BASE_URL
const COD_CHARGE = 150

// Payment Method Icon Component
function PaymentMethodIcon({ method }) {
  const iconClass = "w-6 h-6 text-gray-600"
  
  switch(method) {
    case 'upi':
      return <WalletIcon className={iconClass} />
    case 'netbanking':
      return <BanknotesIcon className={iconClass} />
    case 'card':
      return <CardIcon className={iconClass} />
    case 'cod':
      return <CurrencyDollarIcon className={iconClass} />
    default:
      return <CreditCardIcon className={iconClass} />
  }
}

// Payment options with proper icons
const paymentOptions = [
  { 
    id: "upi", 
    label: "UPI", 
    description: "Pay using Google Pay, PhonePe, Paytm, etc.",
    icon: "upi"
  },
  { 
    id: "netbanking", 
    label: "Net Banking", 
    description: "Secure payment via all major banks",
    icon: "netbanking"
  },
  { 
    id: "card", 
    label: "Credit/Debit Card", 
    description: "Visa, MasterCard, RuPay, American Express",
    icon: "card"
  },
  { 
    id: "cod", 
    label: "Cash on Delivery", 
    description: "Pay when your order is delivered",
    icon: "cod"
  }
];

// PaymentPlanSelector Component
function PaymentPlanSelector({ 
  selectedPlan, 
  onPlanChange, 
  totalAmount, 
  paymentMethod,
  paymentCalculation,
  disabled = false 
}) {
  const handlePlanChange = (plan) => {
    if (!disabled) {
      onPlanChange(plan)
    }
  }

  // Payment methods that require full payment only
  const fullPaymentOnlyMethods = ['upi', 'netbanking', 'card']
  // Payment methods that default to partial payment but allow both options
  const partialPaymentDefaultMethods = ['cod']
  const shouldHidePartialPayment = paymentMethod && fullPaymentOnlyMethods.includes(paymentMethod)
  // Never hide full payment - allow both options for COD
  const shouldHideFullPayment = false

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <CreditCardIcon className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Payment Plan</h3>
      </div>

      <div className="space-y-3">
        {/* Full Payment Option - Hidden for COD */}
        {!shouldHideFullPayment && (
          <div
          className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
            selectedPlan === 'full'
              ? 'border-[#ae0b0b] bg-[#ffe9e9] text-[#950000]'
              : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => handlePlanChange('full')}
        >
          <div className="flex items-center">
            <div className="flex items-center h-5">
              <input
                type="radio"
                name="paymentPlan"
                value="full"
                checked={selectedPlan === 'full'}
                onChange={() => handlePlanChange('full')}
                disabled={disabled}
                className="h-4 w-4 text-[#ae0b0b] focus:ring-[#ae0b0b] border-gray-300"
              />
            </div>
            <div className="ml-3 flex-1">
              <label className="font-medium cursor-pointer">
                Full Payment
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Pay the complete amount now
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">{formatPrice(paymentCalculation.finalAmount)}</p>
              <p className="text-xs text-gray-500">One-time payment</p>
              {paymentCalculation.hasDiscount && !partialPaymentDefaultMethods.includes(paymentMethod) && (
                <p className="text-xs text-green-600">10% discount applied</p>
              )}
              {paymentCalculation.hasCODCharge && (
                <p className="text-xs text-orange-600">+Rs{safeNum(paymentCalculation.codCharge)} COD charge</p>
              )}
            </div>
          </div>
        </div>
        )}

        {/* Partial Payment Option - Hidden for UPI, Net Banking, Card */}
        {!shouldHidePartialPayment && (
          <div
            className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectedPlan === 'partial'
                ? 'border-[#ae0b0b] bg-[#ffe9e9] text-[#950000]'
                : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => handlePlanChange('partial')}
          >
          <div className="flex items-center">
            <div className="flex items-center h-5">
              <input
                type="radio"
                name="paymentPlan"
                value="partial"
                checked={selectedPlan === 'partial'}
                onChange={() => handlePlanChange('partial')}
                disabled={disabled}
                className="h-4 w-4 text-[#ae0b0b] focus:ring-[#ae0b0b] border-gray-300"
              />
            </div>
            <div className="ml-3 flex-1">
              <label className="font-medium cursor-pointer">
                Partial Payment - Pay {paymentCalculation.advancePercent || 10}% now, {paymentCalculation.remainingPercent || 90}% later
              </label>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pay Now ({paymentCalculation.advancePercent}%):</span>
                  <span className="font-medium text-green-600">{formatPrice(paymentCalculation.advanceAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pay Later ({paymentCalculation.remainingPercent}%):</span>
                  <span className="font-medium text-orange-600">{formatPrice(paymentCalculation.remainingAmount)}</span>
                </div>
                {paymentCalculation.hasCODCharge && (
                  <p className="text-xs text-orange-600 mt-1">Includes Rs{safeNum(paymentCalculation.codCharge)} COD charge</p>
                )}
              </div>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Partial Payment Info Note - Hidden for UPI, Net Banking, Card */}
      {selectedPlan === 'partial' && !shouldHidePartialPayment && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Pay just 10% now, rest 90% later!</p>
              <ul className="space-y-1 text-blue-700">
                <li>Remaining amount must be paid before your order is shipped</li>
                <li>For COD: Pay 10% now + ₹150 COD charge, 90% later (no discount)</li>
                <li>You will receive a payment reminder for the remaining amount</li>
                <li>Order processing begins after advance payment confirmation</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Full Payment Note */}
      {selectedPlan === 'full' && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <InformationCircleIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-800">
              <p className="font-medium mb-1">Benefits of Full Payment:</p>
              <ul className="space-y-1 text-green-700">
                <li>10% instant discount on UPI/Net Banking/Card payments</li>
                <li>Order processing starts immediately</li>
                <li>No additional payment steps required</li>
                <li>Faster order fulfillment</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Razorpay loader
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      console.log('Razorpay already loaded')
      resolve(true)
      return
    }
    
    console.log('Loading Razorpay script...')
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    
    script.onload = () => {
      console.log('Razorpay script loaded successfully')
      resolve(true)
    }
    
    script.onerror = () => {
      console.error('Failed to load Razorpay script')
      resolve(false)
    }
    
    document.body.appendChild(script)
  })
}

export default function Payment({ deliveryAddress: propDeliveryAddress, clearCart: propClearCart }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { cartItems, totalPrice, clearCart } = useCart()
  const { createOrder } = useCustomerOrder()

  const [deliveryAddress] = useState(propDeliveryAddress || location.state?.deliveryAddress || {})
  const [selectedMethod, setSelectedMethod] = useState('')
  const [paymentPlan, setPaymentPlan] = useState('full')

  // Payment methods that require full payment only
  const fullPaymentOnlyMethods = ['upi', 'netbanking', 'card']
  
  // Payment methods that default to partial payment but allow both options
  const partialPaymentDefaultMethods = ['cod']

  // Auto-set payment plan when payment method changes
  const handlePaymentMethodChange = (method) => {
    setSelectedMethod(method)
    if (fullPaymentOnlyMethods.includes(method)) {
      setPaymentPlan('full')
    } else if (partialPaymentDefaultMethods.includes(method)) {
      setPaymentPlan('partial') // Default to partial for COD
    }
  }

  // Check if partial payment should be hidden
  const shouldHidePartialPayment = selectedMethod && fullPaymentOnlyMethods.includes(selectedMethod)
  
  // Check if full payment should be hidden (never hide for COD - allow both options)
  const shouldHideFullPayment = false // Allow full payment for all methods
  const [loading, setLoading] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')

  // Calculate cart total manually if totalPrice is undefined
  const calculateCartTotal = () => {
    // Try to use totalPrice from context first
    if (typeof totalPrice === 'number' && !isNaN(totalPrice) && totalPrice > 0) {
      return totalPrice
    }
    
    // Fallback: calculate from cart items
    if (!cartItems || cartItems.length === 0) {
      return 0
    }
    
    const total = cartItems.reduce((sum, item) => {
      const price = getSellingPrice(item)
      const quantity = getQuantity(item)
      return sum + (price * quantity)
    }, 0)
    
    return total
  }

  const cartTotal = calculateCartTotal()
  const displayTotal = cartTotal > 0 ? cartTotal : 1000

  // Coupon validation and application
  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code')
      return
    }

    setCouponLoading(true)
    setCouponError('')

    try {
      // Guest checkout - no token required
      const response = await fetch(`${API_URL}/coupons/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          totalAmount: displayTotal
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setAppliedCoupon(data.coupon)
        setCouponError('')
        toast.success(`Coupon applied: ${data.coupon.discountType === 'percentage' ? data.coupon.discountValue + '%' : 'Rs' + data.coupon.discountValue} off`)
      } else {
        setCouponError(data.message || 'Invalid coupon code')
        setAppliedCoupon(null)
      }
    } catch (error) {
      setCouponError('Failed to validate coupon')
      setAppliedCoupon(null)
    } finally {
      setCouponLoading(false)
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
    toast.info('Coupon removed')
  }

  // Calculate discount from applied coupon
  const getCouponDiscount = () => {
    if (!appliedCoupon) return 0
    
    if (appliedCoupon.discountType === 'percentage') {
      return displayTotal * (appliedCoupon.discountValue / 100)
    } else {
      return appliedCoupon.discountValue
    }
  }

  // Payment calculation logic
  const calculatePayment = () => {
    let baseAmount = displayTotal // Use displayTotal instead of cartTotal
    let hasDiscount = false
    let discountAmount = 0
    let hasCODCharge = selectedMethod === 'cod'
    let codCharge = hasCODCharge ? COD_CHARGE : 0
    
    // Apply coupon discount first
    const couponDiscount = getCouponDiscount()
    if (couponDiscount > 0) {
      hasDiscount = true
      discountAmount += couponDiscount
      baseAmount -= couponDiscount
    }
    
    // Apply 10% discount for UPI/NetBanking on full payment
    if (paymentPlan === 'full' && (selectedMethod === 'upi' || selectedMethod === 'netbanking')) {
      hasDiscount = true
      const prepaidDiscount = baseAmount * 0.1
      discountAmount += prepaidDiscount
      baseAmount *= 0.9
    }
    
    // Add COD charge
    if (hasCODCharge) {
      baseAmount += codCharge
    }
    
    const finalAmount = baseAmount
    
    // For partial payment
    const advancePercent = 10
    const remainingPercent = 90
    const advanceAmount = finalAmount * (advancePercent / 100)
    const remainingAmount = finalAmount * (remainingPercent / 100)
    
    return {
      finalAmount,
      advanceAmount,
      remainingAmount,
      advancePercent,
      remainingPercent,
      hasDiscount,
      discountAmount,
      hasCODCharge,
      codCharge,
      couponDiscount
    }
  }
  
  const paymentCalculation = calculatePayment()

  const handlePayment = async () => {
    // ADDED: Enhanced validation with better error messages
    if (!selectedMethod) {
      toast.error('Please select a payment method to continue', {
        duration: 4000,
        position: 'top-center'
      })
      return
    }

    // ✅ REMOVED LOGIN REQUIREMENT - GUEST CHECKOUT
    // No token required for guest checkout

    const orderData = {
      items: cartItems.map(item => ({
        productId: item.id || item._id,
        name: item.title || item.name,
        price: getSellingPrice(item),
        purchasePrice: item.purchasePrice || 0, // Include purchase price for profit calculation
        quantity: getQuantity(item)
      })),
      totalAmount: paymentPlan === 'partial' ? paymentCalculation.advanceAmount : paymentCalculation.finalAmount,
      paymentMethod: selectedMethod,
      paymentPlan: paymentPlan,
      remainingAmount: paymentPlan === 'partial' ? paymentCalculation.remainingAmount : 0,
      coupon: appliedCoupon ? {
        code: appliedCoupon.code,
        discountType: appliedCoupon.discountType,
        discountValue: appliedCoupon.discountValue,
        discountAmount: paymentCalculation.couponDiscount
      } : null,
      discountAmount: paymentCalculation.discountAmount
    }

    try {
      setLoading(true)

      // For COD with partial payment, use Razorpay for advance payment
      if (selectedMethod === 'cod' && paymentPlan === 'partial') {
        console.log('🚀 COD Partial Payment - Using Razorpay for advance payment')
        await processRazorpayPayment(orderData)
      } else if (selectedMethod === 'cod' && paymentPlan === 'full') {
        // COD with full payment - create order directly (no advance payment needed)
        const res = await createOrder(orderData)
        if (res?.success) {
          // ADDED: Enhanced success message
          toast.success('Order placed successfully! Your order will be delivered soon.', {
            duration: 5000,
            position: 'top-center'
          })
          clearCart()
          
          // Navigate to OrderSuccess with order data
          const orderIdForNavigation = res.orderId || res.order?._id || res.order?.orderNumber
          console.log('🚀 COD Full Payment Navigating with:', { orderId: orderIdForNavigation })
          
          try {
            navigate('/order-success', {
              state: {
                orderId: orderIdForNavigation,
                paymentId: null,
                paymentMethod: 'cod',
                amountPaid: orderData.totalAmount,
                orderData: res.order || {}
              }
            })
            
            // Fallback for COD as well
            setTimeout(() => {
              const params = new URLSearchParams({
                orderId: orderIdForNavigation,
                paymentMethod: 'cod',
                amountPaid: orderData.totalAmount
              })
              window.location.href = `/order-success?${params.toString()}`
            }, 2000)
          } catch (error) {
            console.error('COD Navigation error:', error)
            const params = new URLSearchParams({
              orderId: orderIdForNavigation,
              paymentMethod: 'cod',
              amountPaid: orderData.totalAmount
            })
            window.location.href = `/order-success?${params.toString()}`
          }
        } else {
          throw new Error(res?.message || 'Failed to place order')
        }
      } else {
        // For other payment methods (UPI, Net Banking, Card)
        await processRazorpayPayment(orderData)
      }

    } catch (err) {
      // ✅ FIXED: No login redirect since auth system is removed
      // For all errors, show error message but don't redirect
      console.error('Payment error:', err)
      toast.error(err.message || 'Payment failed. Please try again.', {
        duration: 5000,
        position: 'top-center'
      })
    } finally {
      setLoading(false)
    }
  }

  const processRazorpayPayment = async (orderData) => {
    try {
      // ✅ REMOVED TOKEN DEPENDENCY - GUEST CHECKOUT
      const response = await fetch(`${API_URL}/payments/create-razorpay-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // ✅ NO AUTH HEADER NEEDED FOR GUEST CHECKOUT
        },
        body: JSON.stringify(orderData)
      })

      console.log('🔍 Razorpay order creation response:', response.status, response.ok)

      if (response.ok) {
        const orderDataResponse = await response.json()
        
        console.log('BACKEND RESPONSE DEBUG ===')
        console.log('Order Response:', orderDataResponse)
        
        // Handle direct Razorpay order response
        if (orderDataResponse.id) {
          // This is a direct Razorpay order object
          console.log('Direct Razorpay order received:', orderDataResponse.id)
        } else if (orderDataResponse.success) {
          // This is a wrapped response
          console.log('Wrapped response received')
        } else {
          console.error('Invalid response format:', orderDataResponse)
          throw new Error('Invalid response from server')
        }
      
      // Use direct Razorpay order response
      const razorpayOrder = orderDataResponse.id ? orderDataResponse : orderDataResponse.data
      
      console.log('Backend Amount (paise):', razorpayOrder.amount)
      console.log('Backend Amount (Rs):', razorpayOrder.amount / 100)

      const loaded = await loadRazorpayScript()
      if (!loaded) {
        console.error('Razorpay failed to load')
        return toast.error('Razorpay failed to load. Please refresh and try again.')
      }

      console.log('=== RAZORPAY INITIALIZATION DEBUG ===')
      console.log('Window.Razorpay available:', !!window.Razorpay)
      console.log('Razorpay Key ID:', import.meta.env.VITE_RAZORPAY_KEY_ID)
      console.log('Amount from backend (paise):', razorpayOrder.amount)
      console.log('Currency:', razorpayOrder.currency)
      console.log('Order ID:', razorpayOrder.id)
      
      // Check if Razorpay is available
      if (!window.Razorpay) {
        console.error('Razorpay object not available after loading script')
        return toast.error('Razorpay not available. Please refresh and try again.')
      }
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount, // Already in paise from backend
        currency: razorpayOrder.currency || 'INR',
        name: 'KKings Jewellery',
        description: `Payment for ${orderData.items.length} items`,
        order_id: razorpayOrder.id,
        prefill: {
          name: deliveryAddress?.firstName && deliveryAddress?.lastName ? `${deliveryAddress.firstName} ${deliveryAddress.lastName}` : deliveryAddress?.name || '',
          email: deliveryAddress?.email || '',
          contact: deliveryAddress?.mobile || deliveryAddress?.phone || ''
        },
        notes: {
          paymentPlan: orderData.paymentPlan,
          paymentMethod: selectedMethod,
          address: JSON.stringify(deliveryAddress)
        },
        handler: async (response) => {
          console.log('=== RAZORPAY PAYMENT SUCCESS ===')
          console.log('Payment response:', response)
          
          // Verify payment on backend
          const verifyRes = await fetch(`${API_URL}/payments/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              customer: {
                firstName: deliveryAddress?.firstName || '',
                lastName: deliveryAddress?.lastName || '',
                email: deliveryAddress?.email || '',
                mobile: deliveryAddress?.mobile || deliveryAddress?.phone || '',
                streetAddress: deliveryAddress?.streetAddress || '',
                city: deliveryAddress?.city || '',
                state: deliveryAddress?.state || '',
                zipCode: deliveryAddress?.zipCode || ''
              },
              cartItems: orderData.items,
              totalAmount: orderData.totalAmount,
              orderData: orderData
            })
          })

          const verifyData = await verifyRes.json()
          
          console.log(' PAYMENT VERIFICATION RESPONSE:', verifyData)
          console.log(' RESPONSE STATUS:', verifyRes.status)
          console.log(' RESPONSE OK:', verifyRes.ok)
          
          if (verifyData.success) {
            // ADDED: Enhanced success messages
            const successMessage = paymentPlan === 'partial' 
              ? 'Advance payment successful! You will be notified for the remaining payment.'
              : 'Payment successful! Your order has been confirmed.'
            
            toast.success(successMessage, {
              duration: 5000,
              position: 'top-center'
            })
            clearCart()
            
            // Pass order data to OrderSuccess page
            const orderData = verifyData.order || verifyData.data?.order || verifyData.data || {}
            console.log('📦 Order data for navigation:', orderData)
            console.log('📦 Order data keys:', Object.keys(orderData))
            console.log('📦 Order ID fields:', {
              orderId: orderData.orderId,
              _id: orderData._id,
              orderNumber: orderData.orderNumber
            })
            
            const orderIdForNavigation = orderData.orderId || orderData._id || orderData.orderNumber
            const paymentIdForNavigation = orderData.razorpayPaymentId || orderData.payment?.razorpayPaymentId || orderData.paymentId
            
            console.log('🚀 Navigating with:', {
              orderId: orderIdForNavigation,
              paymentId: paymentIdForNavigation
            })
            
            // Try React Router navigation first
            try {
              navigate('/order-success', {
                state: {
                  orderId: orderIdForNavigation,
                  paymentId: paymentIdForNavigation,
                  paymentMethod: 'razorpay',
                  amountPaid: orderData.totalAmount || orderData.total,
                  orderData: orderData
                }
              })
              
              // Fallback: If React Router doesn't work within 2 seconds, use window.location
              setTimeout(() => {
                const params = new URLSearchParams({
                  orderId: orderIdForNavigation,
                  paymentId: paymentIdForNavigation,
                  paymentMethod: 'razorpay',
                  amountPaid: orderData.totalAmount || orderData.total
                })
                window.location.href = `/order-success?${params.toString()}`
              }, 2000)
            } catch (error) {
              console.error('Navigation error:', error)
              // Immediate fallback
              const params = new URLSearchParams({
                orderId: orderIdForNavigation,
                paymentId: paymentIdForNavigation,
                paymentMethod: 'razorpay',
                amountPaid: orderData.totalAmount || orderData.total
              })
              window.location.href = `/order-success?${params.toString()}`
            }
          } else {
            toast.error('Payment verification failed. Please contact support.', {
              duration: 5000,
              position: 'top-center'
            })
          }
        },
        modal: {
          ondismiss: function() {
            console.log('Razorpay modal dismissed')
            toast.error('Payment cancelled')
          },
          escape: false,
          backdropclose: false
        },
        theme: {
          color: '#ae0b0b'
        }
      };

      console.log('Creating Razorpay instance with options:', options)
      
      try {
        console.log('About to create Razorpay instance...')
        console.log('Options key:', options.key)
        console.log('Options amount:', options.amount)
        
        // SAFETY CHECK: Ensure Razorpay is loaded
        if (!window.Razorpay) {
          toast.error("Razorpay not loaded")
          return
        }
        
        // Create Razorpay instance
        const rzp = new window.Razorpay(options)
        
        // SAFETY CHECK: Ensure instance has open method
        if (!rzp || typeof rzp.open !== "function") {
          throw new Error("Razorpay failed to initialize")
        }
        
        console.log('Opening Razorpay checkout...')
        rzp.open()
        console.log('Razorpay checkout opened')
      } catch (error) {
        console.error('Error creating Razorpay instance:', error)
        toast.error('Failed to open payment gateway. Please try again.')
      }
    }
  } catch (error) {
    console.error('Payment processing error:', error)
    toast.error(error.message || 'Payment failed. Please try again.')
  }
}

  // Handle empty cart (only show empty cart if no items, not if total is 0)
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#ffffff] via-[#fffaf3] to-[#fdf6ec] p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">Cart</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Add some items to your cart before proceeding to payment.</p>
            <button
              onClick={() => navigate('/shop')}
              className="bg-[#ae0b0b] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#8f0a0a] transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ffffff] via-[#fffaf3] to-[#fdf6ec] p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Payment</h1>
        
        {/* Payment Methods Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <CreditCardIcon className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Select Payment Method</h2>
          </div>
          
          {/* Validation Error Message */}
          {!selectedMethod && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <InformationCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-800">Please select a payment method to continue</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentOptions.map((method) => (
              <div
                key={method.id}
                onClick={() => handlePaymentMethodChange(method.id)}
                className={`
                  // ADDED: Enhanced payment method card UI
                  relative border-2 rounded-xl p-5 cursor-pointer transition-all duration-200 group
                  ${selectedMethod === method.id 
                    ? 'border-[#ae0b0b] bg-[#fdf6ec] shadow-lg transform scale-[1.02]' 
                    : 'border-gray-200 bg-white hover:border-[#ae0b0b] hover:shadow-md hover:transform hover:scale-[1.01]'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  {/* ADDED: Better icon container */}
                  <div className={`
                    w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-200
                    ${selectedMethod === method.id 
                      ? 'bg-[#ae0b0b] text-white' 
                      : 'bg-gray-100 text-gray-600 group-hover:bg-[#fdf6ec] group-hover:text-[#ae0b0b]'
                    }
                  `}>
                    <PaymentMethodIcon method={method.icon} />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className={`
                      font-semibold text-gray-900 mb-1
                      ${selectedMethod === method.id ? 'text-[#ae0b0b]' : ''}
                    `}>
                      {method.label}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{method.description}</p>
                    
                    {/* ADDED: Selection indicator */}
                    {selectedMethod === method.id && (
                      <div className="flex items-center gap-1 mt-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs font-medium text-green-600">Selected</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* ADDED: Radio button for accessibility */}
                <div className="absolute top-4 right-4">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={selectedMethod === method.id}
                    onChange={() => handlePaymentMethodChange(method.id)}
                    className="w-4 h-4 text-[#ae0b0b] focus:ring-[#ae0b0b] focus:ring-2 focus:ring-offset-2 border-gray-300"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coupon Section */}
        <div className="mb-8 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <CurrencyDollarIcon className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Coupon Code</h2>
          </div>
          
          <div className="space-y-4">
            {appliedCoupon ? (
              // ADDED: Enhanced applied coupon display
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-lg font-bold">%</span>
                    </div>
                    <div>
                      <p className="font-medium text-green-800">{appliedCoupon.code}</p>
                      <p className="text-sm text-green-600">
                        {appliedCoupon.discountType === 'percentage' 
                          ? `${appliedCoupon.discountValue}% discount applied` 
                          : `Rs${appliedCoupon.discountValue} discount applied`}
                      </p>
                      <p className="text-xs text-green-500 mt-1">Successfully applied to your order</p>
                    </div>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="px-3 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md text-sm font-medium transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              // ADDED: Enhanced coupon input section
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value)
                        setCouponError('')
                      }}
                      placeholder="Enter coupon code"
                      className={`
                        // ADDED: Enhanced input styling
                        w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:border-[#ae0b0b] focus:ring-2 focus:ring-[#ae0b0b] focus:ring-opacity-20 transition-all duration-200
                        ${couponError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
                      `}
                    />
                    {/* ADDED: Input helper icon */}
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <button
                    onClick={validateCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className={`
                      // ADDED: Enhanced button styling
                      px-6 py-3 bg-[#ae0b0b] text-white rounded-lg font-medium transition-all duration-200
                      ${couponLoading 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-[#8f0a0a] hover:shadow-lg hover:transform hover:scale-[1.02] active:scale-[0.98]'
                      }
                      ${!couponCode.trim() ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    {couponLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent border-r-transparent animate-spin"></div>
                        Validating...
                      </span>
                    ) : 'Apply'}
                  </button>
                </div>
                
                {/* ADDED: Enhanced error display */}
                {couponError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <InformationCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0" />
                      <p className="text-sm text-red-800">{couponError}</p>
                    </div>
                  </div>
                )}
                
                {/* ADDED: Help text */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <InformationCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Coupon Tips:</p>
                      <ul className="space-y-1 text-blue-700">
                        <li>• Check for valid coupon codes on our website</li>
                        <li>• Some coupons have minimum order requirements</li>
                        <li>• Percentage coupons apply to subtotal</li>
                        <li>• Fixed amount coupons subtract directly</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Plan Selector */}
        {selectedMethod && (
          <PaymentPlanSelector
            selectedPlan={paymentPlan}
            onPlanChange={setPaymentPlan}
            totalAmount={cartTotal}
            paymentMethod={selectedMethod}
            paymentCalculation={paymentCalculation}
            disabled={(shouldHidePartialPayment && paymentPlan === 'full') || (shouldHideFullPayment && paymentPlan === 'partial')}
          />
        )}

        {/* Order Summary */}
        <div className="mb-8 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <CreditCardIcon className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Purchase Summary</h2>
          </div>
          
          {/* Delivery Address */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Delivery Address</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              {deliveryAddress ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-900">
                    {deliveryAddress.firstName && deliveryAddress.lastName 
                      ? `${deliveryAddress.firstName} ${deliveryAddress.lastName}` 
                      : deliveryAddress.name || 'Guest'}
                  </p>
                  {deliveryAddress.streetAddress && (
                    <p className="text-sm text-gray-600">{deliveryAddress.streetAddress}</p>
                  )}
                  {(deliveryAddress.city || deliveryAddress.state || deliveryAddress.zipCode) && (
                    <p className="text-sm text-gray-600">
                      {[deliveryAddress.city, deliveryAddress.state, deliveryAddress.zipCode]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  )}
                  {deliveryAddress.mobile && (
                    <p className="text-sm text-gray-600">Phone: {deliveryAddress.mobile}</p>
                  )}
                  {deliveryAddress.email && (
                    <p className="text-sm text-gray-600">Email: {deliveryAddress.email}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No delivery address provided</p>
              )}
            </div>
          </div>

          {/* Items List */}
          <div className="mb-6 space-y-3">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Items ({cartItems?.length || 0})</h3>
            {cartItems?.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">{item.name?.charAt(0) || 'P'}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.name || item.title}</p>
                    <p className="text-xs text-gray-500">Qty: {getQuantity(item)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatPrice(getSellingPrice(item) * getQuantity(item))}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Price Breakdown */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Price Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal ({cartItems?.length || 0} items)</span>
                <span className="font-medium">{formatPrice(displayTotal)}</span>
              </div>
              
              {paymentCalculation.hasDiscount && (
                <>
                  {paymentCalculation.couponDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Coupon Discount ({appliedCoupon?.code})</span>
                      <span className="font-medium text-green-600">-{formatPrice(paymentCalculation.couponDiscount)}</span>
                    </div>
                  )}
                  {(paymentPlan === 'full' && (selectedMethod === 'upi' || selectedMethod === 'netbanking')) && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Prepaid Discount (10%)</span>
                      <span className="font-medium text-green-600">-{formatPrice(paymentCalculation.discountAmount - paymentCalculation.couponDiscount)}</span>
                    </div>
                  )}
                </>
              )}
              
              {paymentCalculation.hasCODCharge && (
                <div className="flex justify-between text-sm">
                  <span className="text-yellow-600">Cash on Delivery Charge</span>
                  <span className="font-medium text-yellow-600">+{formatPrice(paymentCalculation.codCharge)}</span>
                </div>
              )}
              
              <div className="border-t border-gray-200 pt-2 mt-2">
                {paymentPlan === 'partial' ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Amount Due Now ({paymentCalculation.advancePercent}%)</span>
                      <span className="text-lg font-bold text-green-600">{formatPrice(paymentCalculation.advanceAmount)}</span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-sm text-gray-600">Remaining Amount ({paymentCalculation.remainingPercent}%)</span>
                      <span className="text-sm font-medium text-orange-600">{formatPrice(paymentCalculation.remainingAmount)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Amount</span>
                    <span className="text-lg font-bold text-gray-900">{formatPrice(paymentCalculation.finalAmount)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Payment Method Info */}
          {selectedMethod && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Payment Method</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium capitalize">{selectedMethod}</span>
                <span>·</span>
                <span>{paymentPlan === 'full' ? 'Full Payment' : 'Partial Payment (10%/90%)'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Pay Button */}
        <div className="space-y-3">
          {/* ADDED: Final validation message */}
          {!selectedMethod && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <InformationCircleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                <p className="text-sm text-yellow-800">Please select a payment method to proceed with payment</p>
              </div>
            </div>
          )}
          
          {/* ADDED: Enhanced pay button */}
          <button
            onClick={handlePayment}
            disabled={loading || !selectedMethod}
            className={`
              // ADDED: Enhanced button styling with loading states
              w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 relative overflow-hidden
              ${loading || !selectedMethod
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-300'
                : 'bg-gradient-to-r from-[#ae0b0b] to-[#8f0a0a] text-white hover:from-[#8f0a0a] hover:to-[#7d0808] hover:shadow-xl hover:transform hover:scale-[1.02] active:scale-[0.98] border border-transparent'
              }
            `}
          >
            {loading ? (
              // ADDED: Loading state with spinner
              <span className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent border-r-transparent animate-spin"></div>
                <span>Processing Payment...</span>
              </span>
            ) : (
              // ADDED: Enhanced payment amount display
              <span className="flex items-center justify-center gap-2">
                <span>
                  {paymentPlan === 'partial' ? 'Pay Advance' : 'Pay Now'}
                </span>
                <span className="font-bold text-xl">
                  {formatPrice(paymentPlan === 'partial' ? paymentCalculation.advanceAmount : paymentCalculation.finalAmount)}
                </span>
                <span className="text-sm opacity-75">
                  ({selectedMethod ? selectedMethod.toUpperCase() : 'SELECT METHOD'})
                </span>
              </span>
            )}
          </button>
          
          {/* ADDED: Security and trust indicators */}
          <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Safe Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
