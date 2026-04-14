import { createContext, useContext, useState, useEffect } from 'react'
import adminApi from '../utils/adminApiService'
import { extractData } from '../../utils/dataExtractionHelper.js'
import { API_BASE_URL } from '../../config/api.js'

export const OrderContext = createContext(null)

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

useEffect(() => {
fetchOrders()
}, [])

const fetchOrders = async (silent = false) => {
try {
if (!silent) setLoading(true)

  const data = await adminApi.getOrders()
  const newOrders = extractData(data)
  setOrders(Array.isArray(newOrders) ? newOrders : [])
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
  const data = await adminApi.createOrder(orderData)
  return { success: true, order: data.order }
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
const res = await adminApi.deleteOrder(orderId)

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
