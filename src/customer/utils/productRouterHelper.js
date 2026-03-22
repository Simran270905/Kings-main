/**
 * Product Router Helper - DEPRECATED
 * ===================================
 * This file is no longer used as products now come from API
 * Use ProductContext instead
 * 
 * @deprecated Use ProductContext.getProductById() instead
 */

// No hardcoded products - all data comes from API
const allProducts = []

/**
 * Get product by ID with safe fallback
 * @param {string|number} productId - Product ID to find
 * @returns {Object|null} Product object or null if not found
 */
export const getProductById = (productId) => {
  if (!productId) return null
  
  const id = String(productId)
  return allProducts.find(product => String(product.id) === id) || null
}

/**
 * Validate product ID exists
 * @param {string|number} productId - Product ID to validate
 * @returns {boolean} True if product exists
 */
export const isValidProductId = (productId) => {
  return getProductById(productId) !== null
}

/**
 * Get all unique product IDs
 * @returns {Array} Array of unique product IDs
 */
export const getAllProductIds = () => {
  return allProducts.map(product => product.id)
}

/**
 * Check for duplicate product IDs
 * @returns {Array} Array of duplicate IDs found
 */
export const findDuplicateIds = () => {
  const idCounts = {}
  const duplicates = []
  
  allProducts.forEach(product => {
    const id = String(product.id)
    idCounts[id] = (idCounts[id] || 0) + 1
    
    if (idCounts[id] > 1) {
      duplicates.push(id)
    }
  })
  
  return [...new Set(duplicates)] // Remove duplicates from duplicates array
}

/**
 * Get products by category
 * @param {string} category - Category name
 * @returns {Array} Array of products in category
 */
export const getProductsByCategory = (category) => {
  if (!category) return allProducts
  
  return allProducts.filter(product => 
    product.category === category || 
    product.category?.toLowerCase() === category.toLowerCase()
  )
}

/**
 * Get product URL with validation
 * @param {string|number} productId - Product ID
 * @returns {string} Valid product URL or fallback
 */
export const getProductUrl = (productId) => {
  if (isValidProductId(productId)) {
    return `/product/${productId}`
  }
  return '/shop' // Fallback to shop page
}

/**
 * Safe product link generator
 * @param {string|number} productId - Product ID
 * @param {Object} props - Additional Link props
 * @returns {Object} Safe link props for React Router
 */
export const createSafeProductLink = (productId, props = {}) => {
  const url = getProductUrl(productId)
  return {
    to: url,
    ...props
  }
}

/**
 * Validate all product data integrity
 * @returns {Object} Validation results
 */
export const validateProductData = () => {
  const duplicateIds = findDuplicateIds()
  const missingIds = allProducts.filter(p => !p.id)
  const productsWithoutName = allProducts.filter(p => !p.name && !p.title)
  const productsWithoutPrice = allProducts.filter(p => !p.price && !p.selling_price)
  
  return {
    totalProducts: allProducts.length,
    duplicateIds,
    missingIds,
    productsWithoutName,
    productsWithoutPrice,
    isValid: duplicateIds.length === 0 && missingIds.length === 0
  }
}
