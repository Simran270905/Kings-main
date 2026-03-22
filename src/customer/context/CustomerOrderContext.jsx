import React, { createContext, useState, useEffect, useContext } from 'react'
import { API_BASE_URL } from '../../config/api'

const API_URL = API_BASE_URL

export const CustomerOrderContext = createContext(null)

export function CustomerOrderProvider({ children }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch user's orders
  const fetchUserOrders = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/orders/my-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        // Handle response format: {success: true, data: {orders: [...], pagination: {...}}}
        setOrders(data.data?.orders || data.data || [])
      } else {
        setError('Failed to fetch orders')
      }
    } catch (err) {
      setError('Network error')
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }

  // Create order
  const createOrder = async (orderData) => {
    const token = localStorage.getItem('token')
    const headers = {
      'Content-Type': 'application/json',
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify(orderData)
      })

      if (response.ok) {
        const data = await response.json()
        // Refresh orders after creating new one
        await fetchUserOrders()
        return { success: true, order: data.data }
      } else {
        const errorData = await response.json()
        return { success: false, error: errorData.message || 'Failed to create order' }
      }
    } catch (err) {
      console.error('Error creating order:', err)
      return { success: false, error: 'Network error' }
    }
  }

  // Load orders on mount if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchUserOrders()
    }
  }, [])

  const value = {
    orders,
    loading,
    error,
    fetchUserOrders,
    createOrder
  }

  return (
    <CustomerOrderContext.Provider value={value}>
      {children}
    </CustomerOrderContext.Provider>
  )
}

export const useCustomerOrder = () => {
  const context = useContext(CustomerOrderContext)
  if (!context) {
    throw new Error('useCustomerOrder must be used within CustomerOrderProvider')
  }
  return context
}