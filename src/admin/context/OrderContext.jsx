import React, { createContext, useContext, useState, useEffect } from 'react'
import adminApi from '../utils/adminApiService'
import { useAdminAuth } from './useAdminAuth'
import { extractData, extractPagination, logApiCall, logApiResponse } from '../../utils/dataExtractionHelper.js'
import { API_BASE_URL } from '../../config/api.js'

export const OrderContext = createContext()

export const useOrder = () => {
const context = useContext(OrderContext)
if (!context) {
throw new Error('useOrder must be used within an OrderProvider')
}
return context
}

export const OrderProvider = ({ children }) => {
const [orders, setOrders] = useState([])
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)
const [lastFetch, setLastFetch] = useState(null)
const { setOrderRefreshCallback } = useAdminAuth() || {}

useEffect(() => {
  const token = localStorage.getItem('kk_admin_token')
  if (token && token !== 'undefined') {
    fetchOrders()
  }

  if (setOrderRefreshCallback) {
    setOrderRefreshCallback(() => fetchOrders)
  }

}, [])

const fetchOrders = async (silent = false) => {
  try {
    if (!silent) setLoading(true)

    logApiCall('/orders', 'GET')
    const data = await adminApi.getOrders()
    logApiResponse('/orders', data)

    const newOrders = extractData(data)

    setOrders(newOrders)
    setLastFetch(new Date())
  } catch (err) {
    setError(err.message)
    if (!silent) setOrders([])
  } finally {
    if (!silent) setLoading(false)
  }
}

const createOrder = async (orderData) => {
  try {
    const token = localStorage.getItem('token')

    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message)

    return { success: true, order: data.data }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

const updateOrderStatus = async (orderId, status) => {
  try {
    const res = await adminApi.updateOrderStatus(orderId, status)

    setOrders(prev =>
      prev.map(o => (o._id === orderId ? res.data : o))
    )

    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

const deleteOrder = async (orderId) => {
  try {
    const token = localStorage.getItem('kk_admin_token')

    await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })

    setOrders(prev => prev.filter(o => o._id !== orderId))

    return { success: true }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

const getStats = () => {
return {
total: orders.length,
totalRevenue: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
}
}

return (
<OrderContext.Provider
value={{
orders,
loading,
error,
lastFetch,
fetchOrders,
createOrder,
updateOrderStatus,
deleteOrder,
getStats
}}
>
{children}
</OrderContext.Provider>
)
}

export default OrderProvider
