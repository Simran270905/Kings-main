import { useContext } from 'react'
import { OrderContext } from '../../admin/context/OrderContext'

/**
 * useOrder Hook
 * =============
 * Customer-facing hook to access OrderContext
 * 
 * THIS IS A BRIDGE: Allows customer components to access admin OrderContext
 * which manages all order operations globally
 * 
 * Usage:
 * ------
 * const { createOrder, orders, updateOrderStatus } = useOrder()
 * 
 * Methods Available:
 * - createOrder(data) - Create new order
 * - getOrder(id) - Get single order
 * - updateOrder(id, updates) - Modify order
 * - updateOrderStatus(id, status) - Change order status
 * - deleteOrder(id) - Remove order
 * - getAllOrders() - Get all orders
 * - getOrdersByStatusFilter(status) - Filter by status
 * - getCustomerOrders(phone) - Get customer's orders
 * - getRecentOrdersList(limit) - Get recent orders
 * - getStats() - Get order statistics
 * - orders - Current orders array from state
 */
export const useOrder = () => {
  const context = useContext(OrderContext)

  if (!context) {
    throw new Error(
      '❌ useOrder hook must be used within OrderProvider. ' +
      'Make sure OrderProvider wraps your component in App.jsx'
    )
  }

  return context
}
