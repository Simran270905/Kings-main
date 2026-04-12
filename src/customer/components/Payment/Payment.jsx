import React, { useState, useEffect, useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../../../context/useCart'
import { AuthContext } from '../../../context/AuthContext'
import { useCustomerOrder } from '../../../context/CustomerOrderContext'
import { CreditCardIcon, DevicePhoneMobileIcon, BanknotesIcon, TicketIcon, ShieldCheckIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { API_BASE_URL } from '../../../config/api.js'
import { couponApi } from '../../../services/api.js'
import { calculatePartialPayment } from '../../../utils/discountCalculator.js'
import PriceDisplay from '../Shared/PriceDisplay.jsx'

// Helpers
const formatPrice = (value) => {
const num = Number(value)
return `₹${(isNaN(num) ? 0 : num).toLocaleString("en-IN")}`
}

const getSellingPrice = (item) => Number(item.sellingPrice || item.selling_price || 0) || 0
const getOriginalPrice = (item) => Number(item.originalPrice || item.original_price || 0) || 0
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

export default function Payment({ deliveryAddress: propDeliveryAddress, clearCart: propClearCart }) {
const navigate = useNavigate()
const location = useLocation()
const { cartItems, totalPrice, clearCart } = useCart()
const { user } = useContext(AuthContext)
const { createOrder } = useCustomerOrder()

const [deliveryAddress] = useState(propDeliveryAddress || location.state?.deliveryAddress || {})
const [selectedMethod, setSelectedMethod] = useState('')
const [loading, setLoading] = useState(false)
const [couponCode, setCouponCode] = useState('')
const [appliedCoupon, setAppliedCoupon] = useState(null)
const [discount, setDiscount] = useState(0)
const [paymentPlan, setPaymentPlan] = useState('full')

const paymentCalculation = calculatePartialPayment(totalPrice, selectedMethod, paymentPlan)

const handlePayment = async () => {
if (!selectedMethod) return toast.error('Select payment method')

```
const token = localStorage.getItem('token')
if (!token) return toast.error('Login required')

const orderData = {
  items: cartItems.map(item => ({
    productId: item.id || item._id,
    name: item.title || item.name,
    price: getSellingPrice(item),
    quantity: getQuantity(item)
  })),
  totalAmount: paymentCalculation.finalAmount,
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
```

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

```
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
}

const rzp = new window.Razorpay(options)
rzp.open()
```

}

return ( <div className="p-6"> <h1 className="text-2xl mb-4">Payment</h1>

```
  <div className="space-y-3 mb-6">
    <button onClick={() => setSelectedMethod('razorpay')}>Online</button>
    <button onClick={() => setSelectedMethod('upi')}>UPI</button>
    <button onClick={() => setSelectedMethod('netbanking')}>NetBanking</button>
    <button onClick={() => setSelectedMethod('cod')}>COD</button>
  </div>

  <button
    onClick={handlePayment}
    disabled={loading}
    className="bg-red-600 text-white px-6 py-3 rounded"
  >
    {loading ? 'Processing...' : `Pay ₹${paymentCalculation.finalAmount}`}
  </button>
</div>


)
}
