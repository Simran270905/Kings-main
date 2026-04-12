import React, { createContext, useContext, useEffect, useState } from 'react'
import { API_BASE_URL } from '../config/api.js';
import { extractData, extractError, isSuccess, logApiCall, logApiResponse } from '../utils/dataExtractionHelper.js'

const API_URL = API_BASE_URL
const getToken = () => localStorage.getItem('token')

export const CustomerOrderContext = createContext({
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  setError: () => {},
  fetchUserOrders: () => {},
  fetchOrderDetails: () => {},
  createOrder: () => {},
  buyNow: () => {}
})

export function CustomerOrderProvider({ children }) {
  const [orders, setOrders] = useState([])
  const [currentOrder, setCurrentOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchUserOrders = async () => {
    const token = getToken()
    
    if (!token) {
      setOrders([])
      setError('Please log in to view orders')
      return
    }

    setLoading(true)
    setError(null)

    try {
      logApiCall('/customers/orders/my-orders', 'GET')
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 25000) // 25 second timeout
      
      const response = await fetch(API_URL + '/customers/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      // Handle empty response
      const text = await response.text()
      let body
      try {
        body = JSON.parse(text)
      } catch (parseError) {
        console.error("Failed to parse JSON response:", text)
        throw new Error('Invalid server response')
      }
      
      logApiResponse('/customers/orders/my-orders', body)

      if (!response.ok) {
        throw new Error(extractError(body))
      }

      const ordersData = body.orders || body.data?.orders || []
      setOrders(ordersData)
    } catch (err) {
      // Handle specific error types
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again.')
      } else if (err.message && err.message.includes('Failed to fetch')) {
        setError('Network connection failed. Please check your internet connection.')
      } else {
        setError(extractError(err) || 'Network error while loading orders')
      }
      
      setOrders([]) // Clear orders on error
    } finally {
      setLoading(false)
    }
  }

  const fetchOrderDetails = async (orderId) => {
    const token = getToken()
    console.log(" DEBUG: Token exists:", !!token)
    console.log(" DEBUG: Token preview:", token ? token.substring(0, 20) + "..." : "null")
    
    if (!token) return { success: false, error: 'Please log in' }
    if (!orderId) return { success: false, error: 'Invalid order ID' }

    try {
      const response = await fetch(API_URL + '/orders/' + orderId, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const body = await response.json()
      if (!response.ok) {
        return { success: false, error: body?.message || 'Unable to fetch order' }
      }
      return { success: true, order: body.data }
    } catch (err) {
      return { success: false, error: 'Network error while loading order' }
    }
  }

  const createOrder = async (orderData, clearCartFn) => {
    const token = getToken()
    
    console.log("📦 ORDER CREATION - TOKEN DEBUG:")
    console.log("📦 Token exists:", !!token)
    console.log("📦 Token length:", token?.length || 0)
    console.log("📦 Token preview:", token ? token.substring(0, 20) + "..." : "null")
    console.log("📦 localStorage keys:", Object.keys(localStorage))
    console.log("📦 Order data items count:", orderData?.items?.length || 0)
    
    // Enhanced validation
    if (!orderData) {
      console.error("📦 Order creation error: No order data provided")
      return { success: false, error: 'Order data is required' }
    }
    
    if (!orderData?.items?.length) {
      console.error("📦 Order creation error: Cart is empty")
      return { success: false, error: 'Cart is empty' }
    }
    
    if (!token) {
      console.error("📦 Order creation error: No authentication token")
      return { success: false, error: 'Authentication required to place order' }
    }

    setLoading(true)
    setError(null)

    try {
      console.log("📦 Creating order with data:", orderData)
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
      
      const response = await fetch(API_URL + '/customers/orders', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(orderData),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      console.log("📦 Order API response status:", response.status)
      
      // Handle empty response
      const text = await response.text()
      let body
      try {
        body = JSON.parse(text)
      } catch (parseError) {
        console.error("📦 Failed to parse JSON response:", text)
        body = { message: 'Invalid server response' }
      }
      
      console.log("📦 Order API response:", body)

      if (!response.ok) {
        console.error("📦 Order creation failed:", body)
        
        if (body.message === 'Invalid authorization token' || body.message === 'Token expired') {
          console.log("📦 TOKEN EXPIRED DURING REQUEST - CLEARING SESSION")
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          localStorage.removeItem('isAuthenticated')
          return { success: false, error: 'Your session has expired. Please log in again to continue.' }
        }
        
        if (response.status === 400) {
          return { success: false, error: body.message || 'Please check your order details and try again.' }
        }
        
        if (response.status === 500) {
          return { success: false, error: 'Server is temporarily unavailable. Please try again in a few minutes.' }
        }
        
        if (response.status === 429) {
          return { success: false, error: 'Too many requests. Please wait a moment and try again.' }
        }
        
        return { success: false, error: body?.message || 'Unable to place order. Please try again.' }
      }

      const createdOrder = body.order || body.data
      if (!createdOrder) {
        console.error("📦 No order data in response:", body)
        return { success: false, error: 'Order was created but data is missing. Please contact support.' }
      }
      
      setCurrentOrder(createdOrder)
      
      // Fetch orders in background without blocking
      fetchUserOrders().catch(err => {
        console.warn("📦 Failed to refresh orders after creation:", err)
      })

      if (typeof clearCartFn === 'function') {
        clearCartFn()
      }

      window.dispatchEvent(new Event('ordersUpdated'))

      console.log("📦 Order created successfully:", createdOrder)
      return { success: true, order: createdOrder }
    } catch (err) {
      console.error("📦 Order creation error:", err)
      
      // Handle specific error types
      if (err.name === 'AbortError') {
        return { success: false, error: 'Request timed out. Please try again.' }
      }
      
      if (err.message && err.message.includes('Failed to fetch')) {
        return { success: false, error: 'Network connection failed. Please check your internet connection.' }
      }
      
      return { success: false, error: err.message || 'Network error while placing order' }
    } finally {
      setLoading(false)
    }
  }

  const buyNow = async (product, quantity, userDetails, clearCartFn) => {
    if (!product || quantity < 1) {
      return { success: false, error: 'Select a valid product and quantity' }
    }

    const orderData = {
      items: [{
        productId: product.id || product._id,
        name: product.name || product.title,
        price: product.price || product.selling_price,
        quantity,
      }],
      totalAmount: (product.price || product.selling_price || 0) * quantity,
      address: userDetails?.address || '',
      contact: userDetails?.contact || '',
    }

    return createOrder(orderData, clearCartFn)
  }

  useEffect(() => {
    const token = getToken()
    if (token && !loading) {
      fetchUserOrders()
    }
  }, []) // Empty dependency array - only run once on mount

  return (
    <CustomerOrderContext.Provider
      value={{
        orders,
        currentOrder,
        loading,
        error,
        setError,
        fetchUserOrders,
        fetchOrderDetails,
        createOrder,
        buyNow,
      }}
    >
      {children}
    </CustomerOrderContext.Provider>
  )
}

export const useCustomerOrder = () => {
  const context = useContext(CustomerOrderContext)
  if (!context) throw new Error('useCustomerOrder must be used within CustomerOrderProvider')
  return context
}

// Default export for better Fast Refresh compatibility
export default CustomerOrderProvider