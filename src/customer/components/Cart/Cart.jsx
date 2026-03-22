'use client'

import { useCart } from '../../context/useCart'
import { useNavigate, Link } from 'react-router-dom'
import CartItem from './CartItem'
import { ShoppingBagIcon, ArrowLeftIcon, ShieldCheckIcon, TruckIcon, TagIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function Cart() {
  const { cartItems, increaseQty, decreaseQty, removeItem, totalPrice } = useCart()

  const totalDiscount = 0 // discount logic not yet standardized across data
  const totalAmount = totalPrice - totalDiscount
  const navigate = useNavigate()

  // FIXED: Add handler to prevent checkout with empty cart
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty. Please add items before checking out.')
      return
    }
    navigate('/checkout?step=1')
  }

  const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/shop" className="p-2 hover:bg-gray-200 rounded-xl transition-colors">
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-sm text-gray-500 mt-0.5">{totalItems} item{totalItems !== 1 ? 's' : ''} in your cart</p>
          </div>
        </div>

        {cartItems.length === 0 ? (
          /* EMPTY STATE */
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <ShoppingBagIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#ae0b0b] text-white font-bold rounded-xl hover:bg-[#8f0a0a] transition-colors shadow-lg shadow-[#ae0b0b]/20"
            >
              <ShoppingBagIcon className="h-5 w-5" />
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* CART ITEMS */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onIncrease={() => increaseQty(item.id)}
                  onDecrease={() => decreaseQty(item.id)}
                  onRemove={() => removeItem(item.id)}
                />
              ))}
            </div>

            {/* PRICE SUMMARY */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-24">
                <h3 className="text-base font-bold text-gray-900 mb-5 pb-3 border-b">Order Summary</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({totalItems} item{totalItems !== 1 ? 's' : ''})</span>
                    <span className="font-medium text-gray-900">₹{totalPrice.toLocaleString()}</span>
                  </div>

                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span className="font-medium">-₹{totalDiscount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <TruckIcon className="h-4 w-4" />
                      Delivery
                    </span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>

                  <div className="pt-3 border-t flex justify-between">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-lg text-[#ae0b0b]">₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                {totalDiscount > 0 && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                    <TagIcon className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <p className="text-xs text-green-700 font-medium">You save ₹{totalDiscount.toLocaleString()} on this order!</p>
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  className="mt-5 w-full py-4 bg-[#ae0b0b] text-white font-bold rounded-xl hover:bg-[#8f0a0a] transition-colors shadow-lg shadow-[#ae0b0b]/20 text-base"
                >
                  Proceed to Checkout
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                  <ShieldCheckIcon className="h-4 w-4" />
                  Secure checkout · SSL encrypted
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
