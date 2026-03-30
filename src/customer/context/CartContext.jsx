import React, { createContext, useEffect, useState } from 'react'

export const CartContext = createContext({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  updateQuantity: () => {},
  getCartTotal: () => 0,
  getCartCount: () => 0,
  loading: false,
  error: null
})

export function CartProvider({ children }) {
  // FIXED: Initialize cart from localStorage with proper error handling
  const [cartItems, setCartItems] = useState(() => {
    try {
      const raw = localStorage.getItem('kk_cart')
      const parsed = raw ? JSON.parse(raw) : []
      // Ensure all items have id
      return parsed.map(item => ({
        ...item,
        id: item.id || item._id || item.productId
      })).filter(item => item.id) // Remove items without id
    } catch (error) {
      return []
    }
  })

  // FIXED: Persist cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('kk_cart', JSON.stringify(cartItems))
    } catch (error) {
      console.error('Failed to persist cart to localStorage:', error)
    }
  }, [cartItems])

  // FIXED: Add to cart with duplicate prevention and size validation
  const addToCart = (product, qty = 1) => {
    // Ensure product has an id
    if (!product.id && !product._id) {
      console.error('Cannot add product to cart: missing id', product)
      return
    }

    setCartItems((prev) => {
      // Check if product already exists in cart (considering size)
      const found = prev.find((p) => 
        String(p.id || p._id) === String(product.id || product._id) && 
        (p.selectedSize || null) === (product.selectedSize || null)
      )
      
      if (found) {
        // FIXED: Update quantity if product exists
        return prev.map((p) =>
          String(p.id || p._id) === String(product.id || product._id) && 
          (p.selectedSize || null) === (product.selectedSize || null)
            ? { ...p, quantity: p.quantity + qty }
            : p
        )
      }
      
      // FIXED: Ensure required fields are present with consistent field names
      const newItem = {
        ...product,
        id: product.id || product._id, // Ensure id is set
        quantity: qty,
        // ✅ FIXED: Use consistent sellingPrice field
        sellingPrice: product.sellingPrice || product.selling_price || product.price || 0,
        originalPrice: product.originalPrice || product.original_price || 0,
        selectedSize: product.selectedSize || null,
      }
      
      return [...prev, newItem]
    })
  }

  // FIXED: Increase quantity with validation
  const increaseQty = (id) => {
    setCartItems((prev) =>
      prev.map((p) =>
        String(p.id || p._id) === String(id)
          ? { ...p, quantity: Math.max(1, p.quantity + 1) }
          : p
      )
    )
  }

  // FIXED: Decrease quantity with minimum validation
  const decreaseQty = (id) => {
    setCartItems((prev) =>
      prev.map((p) =>
        String(p.id || p._id) === String(id) && p.quantity > 1
          ? { ...p, quantity: p.quantity - 1 }
          : p
      )
    )
  }

  // FIXED: Remove item from cart safely (considering size)
  const removeItem = (id, size = null) => {
    setCartItems((prev) => 
      prev.filter((p) => 
        !(String(p.id || p._id) === String(id) && (p.selectedSize || null) === (size || null))
      )
    )
  }

  // FIXED: Clear entire cart
  const clearCart = () => {
    setCartItems([])
    // Also clear checkout data when cart is cleared
    try {
      localStorage.removeItem('kk_checkout_data')
    } catch (error) {
      // Failed to clear, continue anyway
    }
  }

  // FIXED: Calculate total price with consistent sellingPrice field
  const totalPrice = cartItems.reduce((sum, item) => {
    const itemPrice = item.sellingPrice || item.selling_price || item.price || 0
    return sum + itemPrice * (item.quantity || 1)
  }, 0)

  // FIXED: Listen for global add-to-cart events from other components
  useEffect(() => {
    const handler = (e) => {
      if (!e?.detail) return
      addToCart(e.detail, 1)
    }
    
    window.addEventListener('kk_add_to_cart', handler)
    
    return () => {
      window.removeEventListener('kk_add_to_cart', handler)
    }
  }, [])

  // Context value with all cart operations
  const value = {
    cartItems,
    addToCart,
    increaseQty,
    decreaseQty,
    removeItem,
    clearCart,
    totalPrice,
    cartCount: cartItems.length,
    // Helper method to check if item is in cart (considering size)
    isInCart: (id, size = null) => cartItems.some((p) => 
      String(p.id) === String(id) && (p.selectedSize || null) === (size || null)
    ),
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}
