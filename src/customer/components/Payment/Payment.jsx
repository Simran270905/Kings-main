import React, { useState, useEffect, useContext } from 'react'
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
  const [paymentPlan, setPaymentPlan] = useState('full')
  const [loading, setLoading] = useState(false)

  // Debug: Check what totalPrice contains
  console.log('Payment Debug - totalPrice:', totalPrice)
  console.log('Payment Debug - cartItems:', cartItems)

  // Payment calculation logic
  const calculatePayment = () => {
    let baseAmount = Number(totalPrice) || 0
    let hasDiscount = false
    let discountAmount = 0
    let hasCODCharge = selectedMethod === 'cod'
    let codCharge = hasCODCharge ? COD_CHARGE : 0
    
    // Debug: Log calculation inputs
    console.log('Payment Calculation - baseAmount:', baseAmount, 'selectedMethod:', selectedMethod, 'paymentPlan:', paymentPlan)
    
    // Apply 10% discount for UPI/NetBanking on full payment
    if (paymentPlan === 'full' && (selectedMethod === 'upi' || selectedMethod === 'netbanking')) {
      hasDiscount = true
      discountAmount = baseAmount * 0.1
      baseAmount = baseAmount * 0.9
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
      codCharge
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
      remainingAmount: paymentPlan === 'partial' ? paymentCalculation.remainingAmount : 0
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

        {/* Payment Plan Selector */}
        {selectedMethod && (
          <PaymentPlanSelector
            selectedPlan={paymentPlan}
            onPlanChange={setPaymentPlan}
            totalAmount={totalPrice}
            paymentMethod={selectedMethod}
            paymentCalculation={paymentCalculation}
          />
        )}

        {/* Order Summary */}
        <div className="mb-8 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            
            {paymentCalculation.hasDiscount && (
              <div className="flex justify-between text-green-600">
                <span>10% Prepaid Discount</span>
                <span>- {formatPrice(paymentCalculation.discountAmount)}</span>
              </div>
            )}
            
            {paymentCalculation.hasCODCharge && (
              <div className="flex justify-between text-yellow-600">
                <span>COD Charge</span>
                <span>+ {formatPrice(paymentCalculation.codCharge)}</span>
              </div>
            )}
            
            {paymentPlan === 'partial' && (
              <>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Pay Now ({paymentCalculation.advancePercent}%):</span>
                    <span className="font-medium text-green-600">{formatPrice(paymentCalculation.advanceAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Pay Later ({paymentCalculation.remainingPercent}%):</span>
                    <span className="font-medium text-orange-600">{formatPrice(paymentCalculation.remainingAmount)}</span>
                  </div>
                </div>
              </>
            )}
            
            <div className={`border-t pt-3 ${paymentPlan === 'partial' ? 'mt-3' : ''}`}>
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>{paymentPlan === 'partial' ? 'Amount Due Now:' : 'Total Amount:'}</span>
                <span>{formatPrice(paymentPlan === 'partial' ? paymentCalculation.advanceAmount : paymentCalculation.finalAmount)}</span>
              </div>
              {paymentPlan === 'partial' && (
                <p className="text-sm text-gray-500 mt-1">
                  Remaining {formatPrice(paymentCalculation.remainingAmount)} to be paid later
                </p>
              )}
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
          {loading ? 'Processing...' : `Pay ${formatPrice(paymentPlan === 'partial' ? paymentCalculation.advanceAmount : paymentCalculation.finalAmount)}`}
        </button>
      </div>
    </div>
  )
}
