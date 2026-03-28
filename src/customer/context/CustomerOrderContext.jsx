import React, { createContext, useContext, useEffect, useState } from 'react'
import { API_BASE_URL } from '@config/api.js'
import { extractData, extractError, isSuccess, logApiCall, logApiResponse } from '../../utils/dataExtractionHelper.js'

const API_URL = API_BASE_URL
const getToken = () => localStorage.getItem('token')

export const CustomerOrderContext = createContext(null)

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
      logApiCall('/orders/my-orders', 'GET')
      const response = await fetch(`${API_URL}/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const body = await response.json()
      logApiResponse('/orders/my-orders', body)

      if (!response.ok) {
        throw new Error(extractError(body))
      }

      const ordersData = extractData(body)
      setOrders(ordersData)
    } catch (err) {
      setError(extractError(err) || 'Network error while loading orders')
      setOrders([]) // Clear orders on error
    } finally {
      setLoading(false)
    }
  }

  const fetchOrderDetails = async (orderId) => {
    const token = getToken()
    if (!token) return { success: false, error: 'Please log in' }
    if (!orderId) return { success: false, error: 'Invalid order ID' }

    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
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
    
    // DEBUG: Check token status
    console.log(" ORDER CREATION - TOKEN DEBUG:")
    console.log(" Token exists:", !!token)
    console.log(" Token length:", token?.length || 0)
    console.log(" Token preview:", token ? token.substring(0, 20) + "..." : "null")
    console.log(" localStorage keys:", Object.keys(localStorage))
    console.log(" Order data items count:", orderData?.items?.length || 0)
    
    if (!orderData?.items?.length) return { success: false, error: 'Cart is empty' }

    // ✅ NOTE: /orders endpoint is PUBLIC - no token validation needed
    // But we still send token if available for user identification
    console.log(' Creating order with data:', orderData)

    setLoading(true)
    setError(null)

    try {
      // Get user data from localStorage to send with order
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      const orderDataWithUser = {
        ...orderData,
        user: userData
      }
      
      // ✅ Prepare headers - include token if available
      const headers = {
        'Content-Type': 'application/json',
      }
      
      // Only add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
        console.log(" Making order request with token:", token.substring(0, 20) + "...")
      } else {
        console.log(" Making order request without token (guest checkout)")
      }
      
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(orderDataWithUser),
      })

      console.log(' Order API response status:', response.status)
      const body = await response.json()
      console.log(' Order API response:', body)

      if (!response.ok) {
        console.error(' Order creation failed:', body)
        
        // ✅ CHECK IF TOKEN EXPIRED DURING REQUEST (only if token was sent)
        if (token && (body.message === 'Invalid authorization token' || body.message === 'Token expired')) {
          console.log(" TOKEN EXPIRED DURING REQUEST - CLEARING SESSION")
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          localStorage.removeItem('isAuthenticated')
          return { success: false, error: 'Session expired. Please log in again.' }
        }
        
        return { success: false, error: body?.message || 'Failed to place order' }
      }

      setCurrentOrder(body.data)
      await fetchUserOrders()

      if (typeof clearCartFn === 'function') {
        clearCartFn()
      }

      window.dispatchEvent(new Event('ordersUpdated'))

      console.log(' Order created successfully:', body.data)
      return { success: true, order: body.data }
    } catch (err) {
      console.error(' Order creation error:', err)
      return { success: false, error: 'Network error while placing order' }
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
    if (getToken()) {
      fetchUserOrders()
    }
  }, [])

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