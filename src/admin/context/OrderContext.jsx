import React, { createContext, useContext, useState, useEffect } from 'react'
import adminApi from '../utils/adminApiService'
import { useAdminAuth } from './useAdminAuth'
import { extractData, extractPagination, logApiCall, logApiResponse } from '../../utils/dataExtractionHelper.js'
import { API_BASE_URL } from '../../config/api.js'

export const OrderContext = createContext({
orders: [],
loading: false,
error: null,
pagination: null,
fetchOrders: () => {},
createOrder: () => {},
updateOrder: () => {},
deleteOrder: () => {},
getOrderById: () => null,
updateOrderStatus: () => {},
setFilters: () => {},
setPage: () => {}
})

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

```
if (setOrderRefreshCallback) {
  setOrderRefreshCallback(() => fetchOrders)
}
```

}, [])

const fetchOrders = async (silent = false) => {
try {
if (!silent) setLoading(true)

```
  logApiCall('/orders', 'GET')
  const data = await adminApi.getOrders()
  logApiResponse('/orders', data)
  
  const newOrders = extractData(data)
  const pagination = extractPagination(data)
  
  const hasChanged = orders.length !== newOrders.length || 
    !orders.every((order, index) => order._id === newOrders[index]?._id)
  
  if (hasChanged || newOrders.length === 0) {
    setOrders(newOrders)
    setLastFetch(new Date())
  }
} catch (error) {
  setError(error.message)
  if (!silent) {
    setOrders([])
  }
} finally {
  if (!silent) setLoading(false)
}
```

}

const createOrder = async (orderData) => {
try {
const token = localStorage.getItem('token')
const res = await fetch(`${API_BASE_URL}/orders`, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'Authorization': `Bearer ${token}`
},
body: JSON.stringify(orderData),
})

```
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to create order')

  const adminToken = localStorage.getItem('kk_admin_token')
  if (adminToken && adminToken !== 'undefined') {
    fetchOrders(true)
  }

  return { success: true, order: data.data }
} catch (error) {
  return { success: false, error: error.message }
}
```

}

const updateOrderStatus = async (orderId, newStatus) => {
try {
const data = await adminApi.updateOrderStatus(orderId, newStatus)

```
  setOrders(prev =>
    prev.map(o => (o._id === orderId ? data.data : o))
  )

  return { success: true }
} catch (error) {
  return { success: false, error: error.message }
}
```

}

const deleteOrder = async (orderId) => {
try {
const token = localStorage.getItem('kk_admin_token')
if (!token) {
return { success: false, error: 'Admin authentication required' }
}

```
  await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  setOrders(prev => prev.filter(o => o._id !== orderId))
  return { success: true }
} catch (error) {
  return { success: false, error: error.message }
}
```

}

const getStats = () => {
const totalOrders = orders.length;
const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
const paidOrders = orders.filter(o => o.paymentStatus === 'paid').length;
const pendingOrders = orders.filter(o => o.paymentStatus !== 'paid').length;

```
const pendingStatusOrders = orders.filter(o => o.status === 'pending').length;
const processingOrders = orders.filter(o => o.status === 'processing').length;
const shippedOrders = orders.filter(o => o.status === 'shipped').length;
const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;

return {
  total: totalOrders,
  totalRevenue,
  paidOrders,
  pendingOrders,
  pending: pendingStatusOrders,
  processing: processingOrders,
  shipped: shippedOrders,
  delivered: deliveredOrders,
  cancelled: cancelledOrders
};
```

}

const refreshOrders = () => {
fetchOrders()
}

const forceRefresh = () => {
fetchOrders()
}

return (
<OrderContext.Provider
value={{
orders,
loading,
error,
lastFetch,
createOrder,
updateOrderStatus,
deleteOrder,
getStats,
refreshOrders,
forceRefresh
}}
>
{children}
</OrderContext.Provider>
)
}

export default OrderProvider
