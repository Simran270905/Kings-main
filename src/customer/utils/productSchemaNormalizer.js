/**
 * Product Schema Normalizer
 * =========================
 * Ensures consistent product schema across frontend and admin
 * Normalizes field names and adds missing required fields
 */

/**
 * Normalize product data for consistent schema
 * @param {Object} product - Raw product data
 * @returns {Object} Normalized product with consistent fields
 */
export const normalizeProduct = (product) => {
  if (!product || typeof product !== 'object') {
    return null
  }

  // Base normalized product
  const normalized = {
    // ID handling
    id: product.id || product._id?.toString() || `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    
    // Name/title handling - prefer title for frontend, name for admin compatibility
    title: product.title || product.name || 'Untitled Product',
    name: product.name || product.title || 'Untitled Product',
    
    // Image handling - support both single image and multiple images
    image: product.images && product.images.length > 0 
      ? product.images[0] 
      : product.image || '',
    images: Array.isArray(product.images) 
      ? product.images 
      : product.image 
        ? [product.image] 
        : [],
    
    // Description
    description: product.description || '',
    
    // Pricing
    price: parseFloat(product.price) || 0,
    selling_price: parseFloat(product.selling_price) || parseFloat(product.price) || 0,
    
    // Category
    category: product.category || 'uncategorized',
    
    // Brand
    brand: product.brand || null,
    
    // Color
    color: product.color || '',
    
    // Material
    material: product.material || '',
    
    // Stock handling
    stock: parseInt(product.stock) || 0,
    inStock: (parseInt(product.stock) || 0) > 0,
    
    // Size handling
    sizes: Array.isArray(product.sizes) ? product.sizes : [],
    
    // Metadata
    createdAt: product.createdAt || new Date().toISOString(),
    updatedAt: product.updatedAt || new Date().toISOString(),
    
    // Additional fields
    lowStockThreshold: product.lowStockThreshold || 5,
    isBestSeller: product.isBestSeller || false,
    isOnSale: product.isOnSale || false,
  }

  // Calculate total stock from sizes if available
  if (normalized.sizes && normalized.sizes.length > 0) {
    const totalStock = normalized.sizes.reduce((sum, size) => sum + (parseInt(size.stock) || 0), 0)
    normalized.stock = totalStock
    normalized.inStock = totalStock > 0
  }

  // Sync inStock with stock field
  if (normalized.stock !== undefined) {
    normalized.inStock = normalized.stock > 0
  }

  return normalized
}

/**
 * Normalize array of products
 * @param {Array} products - Array of product objects
 * @returns {Array} Array of normalized products
 */
export const normalizeProducts = (products) => {
  if (!Array.isArray(products)) {
    return []
  }
  
  return products.map(normalizeProduct).filter(Boolean)
}

/**
 * Validate product schema
 * @param {Object} product - Product to validate
 * @returns {Object} { valid: boolean, errors: Array<string> }
 */
export const validateProductSchema = (product) => {
  const errors = []
  
  if (!product) {
    errors.push('Product is null or undefined')
    return { valid: false, errors }
  }
  
  // Required fields
  if (!product.id) {
    errors.push('Product ID is required')
  }
  
  if (!product.title && !product.name) {
    errors.push('Product title or name is required')
  }
  
  if (typeof product.price !== 'number' || product.price < 0) {
    errors.push('Product price must be a non-negative number')
  }
  
  // Optional but recommended fields
  if (!product.image && !product.imageUrl) {
    errors.push('Product image is recommended')
  }
  
  if (!product.category) {
    errors.push('Product category is recommended')
  }
  
  // Stock validation
  if (product.stock !== undefined && (typeof product.stock !== 'number' || product.stock < 0)) {
    errors.push('Stock must be a non-negative number')
  }
  
  // Size validation
  if (product.sizes && Array.isArray(product.sizes)) {
    product.sizes.forEach((size, index) => {
      if (!size.size) {
        errors.push(`Size ${index + 1} is missing size value`)
      }
      if (typeof size.stock !== 'number' || size.stock < 0) {
        errors.push(`Size ${index + 1} has invalid stock value`)
      }
    })
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Sync stock between sizes and total stock
 * @param {Object} product - Product to sync
 * @returns {Object} Product with synced stock
 */
export const syncProductStock = (product) => {
  if (!product) return product
  
  const synced = { ...product }
  
  // Calculate total stock from sizes
  if (synced.sizes && Array.isArray(synced.sizes)) {
    const totalStock = synced.sizes.reduce((sum, size) => sum + (parseInt(size.stock) || 0), 0)
    synced.stock = totalStock
    synced.inStock = totalStock > 0
  } else {
    // Ensure inStock matches stock field
    synced.inStock = (synced.stock || 0) > 0
  }
  
  return synced
}

/**
 * Get available sizes for a product
 * @param {Object} product - Product to check
 * @returns {Array} Array of available sizes with stock > 0
 */
export const getAvailableSizes = (product) => {
  if (!product?.sizes || !Array.isArray(product.sizes)) {
    return []
  }
  
  return product.sizes.filter(size => (size.stock || 0) > 0)
}

/**
 * Check if specific size is available
 * @param {Object} product - Product to check
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
 * @param {Object} product - Product to check
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
