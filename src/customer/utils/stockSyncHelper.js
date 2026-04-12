/**
 * Stock Sync Helper
 * =================
 * Ensures inStock field matches size stock data
 * Maintains compatibility between UI and backend logic
 */

/**
 * Sync inStock field with sizes array stock data
 * @param {Object} product - Product object with sizes array
 * @returns {Object} Product with synced inStock field
 */
export const syncStockWithSizes = (product) => {
  if (!product) return product

  // If product has sizes array, calculate inStock from sizes
  if (product.sizes && Array.isArray(product.sizes)) {
    const totalStock = product.sizes.reduce((sum, size) => sum + (size.stock || 0), 0)
    const hasStock = totalStock > 0
    
    // Update inStock to match size stock reality
    return {
      ...product,
      stock: totalStock, // Add/update stock field for backend compatibility
      inStock: hasStock   // Keep inStock for UI compatibility
    }
  }

  // If no sizes array, use stock field if available
  if (product.stock !== undefined) {
    return {
      ...product,
      inStock: product.stock > 0
    }
  }

  // Default fallback
  return {
    ...product,
    stock: 0,
    inStock: false
  }
}

/**
 * Batch sync all products in an array
 * @param {Array} products - Array of product objects
 * @returns {Array} Array of synced products
 */
export const syncAllProducts = (products) => {
  if (!Array.isArray(products)) return products
  
  return products.map(syncStockWithSizes)
}

/**
 * Get available sizes for a product
 * @param {Object} product - Product object
 * @returns {Array} Array of sizes with stock > 0
 */
export const getAvailableSizes = (product) => {
  if (!product?.sizes || !Array.isArray(product.sizes)) {
    return []
  }
  
  return product.sizes.filter(size => (size.stock || 0) > 0)
}

/**
 * Check if specific size is available
 * @param {Object} product - Product object
 * @param {string} size - Size to check
 * @returns {boolean} True if size has stock
 */
export const isSizeAvailable = (product, size) => {
  if (!product?.sizes || !Array.isArray(product.sizes)) {
    return false
  }
  
  const sizeObj = product.sizes.find(s => s.size === size)
  return sizeObj ? (sizeObj.stock || 0) > 0 : false
}

/**
 * Get stock for specific size
 * @param {Object} product - Product object
 * @param {string} size - Size to get stock for
 * @returns {number} Stock quantity for size
 */
export const getSizeStock = (product, size) => {
  if (!product?.sizes || !Array.isArray(product.sizes)) {
    return 0
  }
  
  const sizeObj = product.sizes.find(s => s.size === size)
  return sizeObj ? (sizeObj.stock || 0) : 0
}
