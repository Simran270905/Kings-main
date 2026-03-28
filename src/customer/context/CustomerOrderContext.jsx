import React, { createContext, useContext, useEffect, useState } from 'react'
import { API_BASE_URL } from '@config/api.js'
import { extractData, extractError, isSuccess, logApiCall, logApiResponse } from '../../utils/dataExtractionHelper.js'

const API_URL = API_BASE_URL
const getToken = () => localStorage.getItem('token')

// ✅ TOKEN VALIDATION FUNCTION
const validateToken = async (token) => {
  if (!token) return { valid: false, error: 'No token found' }
  
  try {
    const response = await fetch(`${API_URL}/auth/verify-token`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      return { valid: true, user: data.user }
    } else {
      const data = await response.json()
      return { valid: false, error: data.message || 'Token invalid' }
    }
  } catch (error) {
    return { valid: false, error: 'Token validation failed' }
  }
}

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
    
    if (!token) return { success: false, error: 'Please log in to place an order' }
    if (!orderData?.items?.length) return { success: false, error: 'Cart is empty' }

    // ✅ VALIDATE TOKEN BEFORE ORDER CREATION
    console.log(" VALIDATING TOKEN...")
    const tokenValidation = await validateToken(token)
    console.log(" Token validation result:", tokenValidation)
    
    if (!tokenValidation.valid) {
      console.error(" TOKEN INVALID:", tokenValidation.error)
      // Clear invalid token and user data
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('isAuthenticated')
      return { success: false, error: 'Session expired. Please log in again.' }
    }

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
      
      console.log(" Making order request with token:", token.substring(0, 20) + "...")
      
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderDataWithUser),
      })

      console.log(' Order API response status:', response.status)
      const body = await response.json()
      console.log(' Order API response:', body)

      if (!response.ok) {
        console.error(' Order creation failed:', body)
        
        // ✅ CHECK IF TOKEN EXPIRED DURING REQUEST
        if (body.message === 'Invalid authorization token' || body.message === 'Token expired') {
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