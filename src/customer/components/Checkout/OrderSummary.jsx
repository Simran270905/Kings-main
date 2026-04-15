import React, { useState } from 'react'
import { useCart } from '../../../context/useCart'
import { useNavigate } from 'react-router-dom'
import { useProduct } from '../../../context/ProductContext'
import { validateCartStock, processOrderAndDecrementStock } from '../../utils/checkoutValidation'
import { useOrder } from '../../../context/useOrder'
import { API_BASE_URL } from '@config/api.js'
// Analytics recording removed from customer flow
import toast from 'react-hot-toast'

// Razorpay integration
const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = () => {
      resolve(true)
    }
    script.onabort = () => {
      resolve(false)
    }
    document.body.appendChild(script)
  })
}

// Inline formatPrice functions to bypass import issues
const formatPrice = (value) => {
  const num = Number(value);
  return `₹${(isNaN(num) ? 0 : num).toLocaleString("en-IN")}`;
};

const getSellingPrice = (item) => {
  const num = Number(item.sellingPrice || item.selling_price || 0);
  return isNaN(num) ? 0 : num;
};

const getQuantity = (item) => {
  const num = Number(item.quantity);
  return isNaN(num) ? 1 : num;
};

const calculateItemTotal = (item) => {
  return getSellingPrice(item) * getQuantity(item);
};

const OrderSummary = ({ address = {} }) => {
  const { cartItems, totalPrice, clearCart } = useCart()
  const productContext = useProduct()
  const navigate = useNavigate()
  const { createOrder } = useOrder()
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  // FIXED: Calculate totals with tax
  const subtotal = totalPrice
  const tax = Math.round(subtotal * 0.18) // 18% GST
  const shippingCost = 0 // Free shipping
  const totalAmount = subtotal + tax + shippingCost

  // Razorpay payment processing
  const handleRazorpayPayment = async (orderData, orderId) => {
    try {
      // Load Razorpay script
      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js')
      if (!res) {
        toast.error('Failed to load payment gateway. Please try again.')
        return
      }

      const options = {
        key: 'rzp_live_ScZU3xBVpGjz6I', // Your Razorpay Key ID
        amount: totalAmount * 100, // Amount in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise or INR 500.
        currency: 'INR',
        name: 'KKings Jewellery',
        description: `Order #${orderId}`,
        image: 'https://res.cloudinary.com/dkbxrhe1v/image/upload/v1776179795/kkings-jewellery/txbb3wbem7wfjnpsnt5g.jpg',
        order_id: orderId, // This is generated from backend
        handler: async function (response) {
          try {
            console.log("Payment success:", response)

            const verifyRes = await fetch(`${API_BASE_URL}/payments/verify-payment`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                cartItems,
                customer: {
                  firstName: address.firstName,
                  lastName: address.lastName,
                  email: address.email,
                  mobile: address.mobile,
                  streetAddress: address.streetAddress,
                  city: address.city,
                  state: address.state,
                  zipCode: address.zipCode
                },
                totalAmount,
                orderData
              })
            })

            const verifyResult = await verifyRes.json()

            if (verifyResult.success) {
              console.log("✅ Payment verified and order created:", verifyResult.order)
              
              // Clear cart and redirect to success page
              clearCart()
              navigate('/order-success', { 
                state: { 
                  orderId: verifyResult.order._id,
                  orderNumber: verifyResult.order.orderNumber,
                  paymentMethod: 'razorpay',
                  paymentId: response.razorpay_payment_id,
                  amountPaid: totalAmount,
                  orderData: verifyResult.order
                } 
              })
            } else {
              toast.error("Payment verification failed")
            }
          } catch (err) {
            console.error("Verification error:", err)
            toast.error('Payment verification failed. Please contact support.')
          }
        },
        prefill: {
          name: `${address.firstName} ${address.lastName || ''}`,
          email: address.email || '',
          contact: address.mobile
        },
        notes: {
          address: `${address.streetAddress}, ${address.city}, ${address.state} - ${address.zipCode}`,
          order_id: orderId
        },
        theme: {
          color: '#ae0b0b'
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed')
            toast.error('Payment cancelled. Please try again.')
          }
        }
      }

      const paymentObject = new window.Razorpay(options)
      paymentObject.open()
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Payment failed. Please try again.')
    }
  }

  // FIXED: Add order placement functionality with stock validation
  const handlePlaceOrder = async () => {
    // Validate cart and address
    if (cartItems.length === 0) {
      toast.error('Your cart is empty. Please add items before placing an order.')
      navigate('/cart')
      return
    }

    if (!address.firstName || !address.mobile) {
      toast.error('Please complete the delivery address before placing order.')
      navigate('/checkout?step=1')
      return
    }

    // ENHANCED: Validate stock availability before processing
    const stockValidation = validateCartStock(cartItems, productContext)
    if (!stockValidation.valid) {
      const errorMessage = stockValidation.errors.join('\n')
      console.error('Stock validation failed:', errorMessage)
      toast.error('Cannot place order. ' + errorMessage.split('\n')[0] + '. Please update your cart.')
      return
    }

    setIsPlacingOrder(true)

    try {
      // ENHANCED: Process order and decrease stock for all items
      const orderResult = await processOrderAndDecrementStock(cartItems, productContext)
      
      if (!orderResult.success) {
        console.error('❌ Order processing failed:', orderResult.error)
        toast.error('Error processing order: ' + orderResult.error)
        return
      }

      // FIXED: Prepare order data to match backend schema
      const orderData = {
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name || item.title,
          price: getSellingPrice(item) || 0, // Use correct selling price
          originalPrice: getOriginalPrice(item) || getSellingPrice(item) || 0,
          discountPercentage: item.discountPercentage || 0,
          isOnSale: item.isOnSale || false,
          quantity: item.quantity,
          selectedSize: item.selectedSize || null,
          image: item.image || null,
          subtotal: (getSellingPrice(item) || 0) * item.quantity
        })),
        shippingAddress: {
          firstName: address.firstName,
          lastName: address.lastName,
          email: address.email || '',
          mobile: address.mobile,
          streetAddress: address.streetAddress,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode
        },
        subtotal,
        tax,
        shippingCost,
        discount: 0,
        totalAmount,
        paymentMethod: 'razorpay', // Changed to Razorpay
        notes: ''
      }

      console.log('Sending order data:', orderData)

      // Add shipping address to user profile (if logged in)
      try {
        const token = localStorage.getItem('token')
        if (token) {
          await fetch(`${API_BASE_URL}/customers/addresses`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderData.shippingAddress)
          })
        }
      } catch (addressError) {
        console.warn('Could not save address to profile:', addressError)
      }

      // ENHANCED: Create order via API
      const orderContextResult = await createOrder(orderData)
      if (!orderContextResult.success) {
        console.error('Failed to create order:', orderContextResult.error)
        toast.error('Failed to place order: ' + orderContextResult.error)
        return
      }

      const orderId = orderContextResult.order?._id || orderContextResult.order?.id

      // Show success message
      toast.success(`Order created! Proceeding to payment...`)

      // Process Razorpay payment
      await handleRazorpayPayment(orderData, orderId)
    } catch (error) {
      console.error('❌ Error placing order:', error)
      toast.error('Error placing order. Please try again.')
    } finally {
      setIsPlacingOrder(false)
    }
  }

  return (
    <div className="border rounded-md shadow-lg p-5 bg-white">
      <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

      {cartItems.length === 0 ? (
        <p className="text-sm text-gray-500">Your cart is empty.</p>
      ) : (
        <div className="space-y-4">
          {/* FIXED: Display items with consistent pricing */}
          <ul className="space-y-3 pb-4 border-b">
            {cartItems.map((it) => {
              const price = getSellingPrice(it)
              const quantity = getQuantity(it)
              const itemTotal = calculateItemTotal(it)
              return (
                <li key={it.id} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium">{it.title || it.name}</p>
                    <p className="text-xs text-gray-500">Qty: {quantity}</p>
                    {it.selectedSize && (
                      <p className="text-xs text-gray-500">Size: {it.selectedSize}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{formatPrice(price)}</p>
                    <p className="text-xs text-gray-500">{formatPrice(itemTotal)}</p>
                  </div>
                </li>
              )
            })}
          </ul>

          {/* FIXED: Display order totals */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax (18% GST)</span>
              <span className="font-medium">{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-semibold text-base">
              <span>Total Amount</span>
              <span className="text-green-700">{formatPrice(totalAmount)}</span>
            </div>
          </div>

          {/* FIXED: Display delivery address summary */}
          {address.firstName && (
            <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
              <p className="font-medium text-gray-700 mb-2">Delivery Address</p>
              <p className="text-gray-600">
                {address.firstName} {address.lastName}
              </p>
              <p className="text-gray-600">{address.streetAddress}</p>
              <p className="text-gray-600">
                {address.city}, {address.state} {address.zipCode}
              </p>
              <p className="text-gray-600">Phone: {address.mobile}</p>
            </div>
          )}

          {/* FIXED: Add place order button and navigation */}
          <div className="flex gap-3 mt-6">
            <button 
              onClick={() => navigate('/checkout?step=1')} 
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
              disabled={isPlacingOrder}
            >
              Back to Address
            </button>
            <button 
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder || cartItems.length === 0}
              className="ml-auto px-6 py-2 bg-[#ae0b0b] hover:opacity-90 disabled:opacity-50 text-white rounded font-medium transition"
            >
              {isPlacingOrder ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderSummary
