import React, { useState, useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../../../context/useCart'
import { AuthContext } from '../../../context/AuthContext'
import { useCustomerOrder } from '../../../context/CustomerOrderContext'
import { CreditCardIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { API_BASE_URL } from '../../../config/api.js'

// Helpers
const formatPrice = (value) => {
  const num = Number(value)
  return `Rs${(isNaN(num) ? 0 : num).toLocaleString("en-IN")}`
}

const getSellingPrice = (item) => Number(item.sellingPrice || item.selling_price || 0) || 0
const getQuantity = (item) => Number(item.quantity) || 1
const safeNum = (value, fallback = 0) => {
  const num = Number(value);
  return isNaN(num) ? fallback : num;
};

const API_URL = API_BASE_URL
const COD_CHARGE = 50

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

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <CreditCardIcon className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Payment Plan</h3>
      </div>

      <div className="space-y-3">
        {/* Full Payment Option */}
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
              {paymentCalculation.hasDiscount && (
                <p className="text-xs text-green-600">10% discount applied</p>
              )}
              {paymentCalculation.hasCODCharge && (
                <p className="text-xs text-orange-600">+Rs{safeNum(paymentCalculation.codCharge)} COD charge</p>
              )}
            </div>
          </div>
        </div>

        {/* Partial Payment Option */}
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
      </div>

      {/* Partial Payment Info Note */}
      {selectedPlan === 'partial' && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Pay just 10% now, rest 90% later!</p>
              <ul className="space-y-1 text-blue-700">
                <li>Remaining amount must be paid before your order is shipped</li>
                <li>For UPI/Netbanking: 10% discount applies first, then 10/90 split</li>
                <li>For COD/Card: No discount, direct 10/90 split on original amount</li>
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
                <li>Eligible for 10% prepaid discount on UPI/NetBanking</li>
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
  const { createOrder } = useCustomerOrder()

  const [deliveryAddress] = useState(propDeliveryAddress || location.state?.deliveryAddress || {})
  const [selectedMethod, setSelectedMethod] = useState('')
  const [paymentPlan, setPaymentPlan] = useState('full')
  const [loading, setLoading] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')

  // Calculate cart total manually if totalPrice is undefined
  const calculateCartTotal = () => {
    // Try to use totalPrice from context first
    if (typeof totalPrice === 'number' && !isNaN(totalPrice) && totalPrice > 0) {
      console.log('Using totalPrice from context:', totalPrice)
      return totalPrice
    }
    
    // Fallback: calculate from cart items
    console.log('Calculating from cart items:', cartItems)
    if (!cartItems || cartItems.length === 0) {
      console.log('Cart is empty, returning 0')
      return 0
    }
    
    const total = cartItems.reduce((sum, item) => {
      const price = getSellingPrice(item)
      const quantity = getQuantity(item)
      console.log(`Item: ${item.name || item.title}, Price: ${price}, Quantity: ${quantity}`)
      return sum + (price * quantity)
    }, 0)
    
    console.log('Calculated cart total:', total)
    return total
  }

  const cartTotal = calculateCartTotal()
  console.log('Payment Debug - cartTotal:', cartTotal, 'totalPrice:', totalPrice, 'cartItems length:', cartItems?.length)

  // Test: if cartTotal is still 0, use a test amount to see if UI works
  const displayTotal = cartTotal > 0 ? cartTotal : 1000
  console.log('Using displayTotal:', displayTotal)

  // Coupon validation and application
  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code')
      return
    }

    setCouponLoading(true)
    setCouponError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/coupons/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
    
    console.log('Payment Calculation - baseAmount:', baseAmount, 'selectedMethod:', selectedMethod, 'paymentPlan:', paymentPlan)
    
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
        toast.success(paymentPlan === 'partial' ? 'Advance payment successful!' : 'Payment successful!')
        clearCart()
        navigate('/order-success')
      },
      modal: {
        ondismiss: function() {
          toast.error('Payment cancelled')
        }
      }
    };

    const rzp = new window.Razorpay(options)
    rzp.open()
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

        {/* Coupon Section */}
        <div className="mb-8 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Coupon Code</h2>
          <div className="space-y-4">
            {appliedCoupon ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-sm font-bold">%</span>
                    </div>
                    <div>
                      <p className="font-medium text-green-800">{appliedCoupon.code}</p>
                      <p className="text-sm text-green-600">
                        {appliedCoupon.discountType === 'percentage' 
                          ? `${appliedCoupon.discountValue}% discount applied` 
                          : `Rs${appliedCoupon.discountValue} discount applied`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value)
                    setCouponError('')
                  }}
                  placeholder="Enter coupon code"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#ae0b0b] focus:ring-1 focus:ring-[#ae0b0b] focus:ring-opacity-50"
                />
                <button
                  onClick={validateCoupon}
                  disabled={couponLoading}
                  className="px-6 py-2 bg-[#ae0b0b] text-white rounded-lg font-medium hover:bg-[#8f0a0a] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {couponLoading ? 'Validating...' : 'Apply'}
                </button>
              </div>
            )}
            
            {couponError && (
              <p className="text-red-600 text-sm">{couponError}</p>
            )}
            
            <div className="text-sm text-gray-500">
              <p>Enter a valid coupon code to get discount on your order.</p>
              <p>Coupons can be percentage-based or fixed amount discounts.</p>
            </div>
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
          />
        )}

        {/* Order Summary */}
        <div className="mb-8 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Purchase Summary</h2>
          
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
          {loading ? 'Processing...' : `Pay ${formatPrice(paymentPlan === 'partial' ? paymentCalculation.advanceAmount : paymentCalculation.finalAmount)}`}
        </button>
      </div>
    </div>
  )
}
