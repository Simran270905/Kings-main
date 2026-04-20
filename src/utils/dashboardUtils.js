/**
 * Dashboard utility functions for calculating statistics
 */

/**
 * Calculate dashboard statistics from products and orders data
 * @param {Array} products - Array of products
 * @param {Array} orders - Array of orders
 * @returns {Object} Dashboard statistics
 */
export const calculateDashboardStats = (products, orders) => {
  // Ensure we have arrays
  const productsArray = Array.isArray(products) ? products : []
  const ordersArray = Array.isArray(orders) ? orders : []

  // 1. Total Products
  const totalProducts = productsArray.length

  // 2. Total Revenue (only delivered orders)
  const totalRevenue = ordersArray
    .filter(order => order.status === 'delivered')
    .reduce((sum, order) => sum + (order.totalAmount || 0), 0)

  // 3. Pending Orders
  const pendingOrders = ordersArray.filter(order => order.status === 'pending').length

  // 4. Low Stock Products (stock <= 5)
  const lowStock = productsArray.filter(product => {
    const totalStock = product.variants?.reduce((sum, variant) => sum + (variant.stock || 0), 0) || 
                     product.stock || 0
    return totalStock <= 5
  }).length

  // Additional calculations
  const totalOrders = ordersArray.length
  const processingOrders = ordersArray.filter(order => order.status === 'processing').length
  const deliveredOrders = ordersArray.filter(order => order.status === 'delivered').length

  // Average order value
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  // Recent products (last 5 added)
  const recentProducts = productsArray
    .sort((a, b) => new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id))
    .slice(0, 5)
    .map(product => ({
      _id: product._id,
      name: product.name,
      price: product.sellingPrice || product.price,
      stock: product.variants?.reduce((sum, variant) => sum + (variant.stock || 0), 0) || 
             product.stock || 0,
      image: product.images?.[0] || '/placeholder-product.jpg'
    }))

  return {
    // Main metrics
    totalProducts,
    totalRevenue,
    pendingOrders,
    lowStock,
    
    // Additional metrics
    totalOrders,
    processingOrders,
    deliveredOrders,
    averageOrderValue,
    
    // Recent data
    recentProducts,
    
    // Timestamp
    lastUpdated: new Date().toISOString()
  }
}

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  return `₹${(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}

/**
 * Get stock status color based on quantity
 * @param {number} stock - Stock quantity
 * @returns {string} Tailwind CSS color class
 */
export const getStockStatusColor = (stock) => {
  if (stock <= 5) return 'text-red-600 bg-red-50'
  if (stock <= 10) return 'text-yellow-600 bg-yellow-50'
  return 'text-green-600 bg-green-50'
}

/**
 * Get order status color based on status
 * @param {string} status - Order status
 * @returns {string} Tailwind CSS color class
 */
export const getOrderStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'text-yellow-600 bg-yellow-50'
    case 'processing': return 'text-blue-600 bg-blue-50'
    case 'shipped': return 'text-purple-600 bg-purple-50'
    case 'delivered': return 'text-green-600 bg-green-50'
    case 'cancelled': return 'text-red-600 bg-red-50'
    default: return 'text-gray-600 bg-gray-50'
  }
}

/**
 * Truncate text for display
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 30) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
