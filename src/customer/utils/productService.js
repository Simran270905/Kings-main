/**
 * Product Service Layer
 * Abstracts all localStorage operations for products and categories
 * Provides error-safe data persistence with fallback defaults
 * 
 * This layer prepares the app for easy backend API integration:
 * Simply replace localStorage calls with API endpoints and the entire
 * ProductContext will work with backend without any UI changes.
 */

// ============================================================================
// PRODUCT OPERATIONS
// ============================================================================

/**
 * Load all products from localStorage
 * @returns {Array} Array of products, or empty array on error
 */
export const loadProducts = () => {
  try {
    const data = localStorage.getItem('kk_products')
    if (!data) {
      console.log('📦 No products in localStorage, will fetch from API')
      return []
    }
    const products = JSON.parse(data)
    console.log(`📦 Loaded ${products.length} products from storage`)
    return Array.isArray(products) ? products : []
  } catch (error) {
    console.error('❌ Error loading products:', error.message)
    return []
  }
}

/**
 * Fetch products from backend API
 * @returns {Promise<Array>} Array of products from API
 */
export const fetchProductsFromAPI = async () => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api'
    const response = await fetch(`${API_BASE_URL}/products`)
    
    if (!response.ok) {
      console.error(`❌ API Error: HTTP ${response.status}`)
      return []
    }
    
    const data = await response.json()
    
    // Handle API response structure: { success, data: { products: [...] } }
    let products = []
    if (data.data && data.data.products && Array.isArray(data.data.products)) {
      products = data.data.products
    } else if (data.data && Array.isArray(data.data)) {
      products = data.data
    } else if (Array.isArray(data)) {
      products = data
    }
    
    return products
  } catch (error) {
    console.error('Error fetching products:', error.message)
    return []
  }
}

/**
 * Save all products to localStorage
 * @param {Array} products - Products to save
 * @returns {boolean} Success status
 */
export const saveProducts = (products) => {
  try {
    if (!Array.isArray(products)) {
      throw new Error('Products must be an array')
    }
    localStorage.setItem('kk_products', JSON.stringify(products))
    console.log(`✅ Saved ${products.length} products to storage`)
    return true
  } catch (error) {
    console.error('❌ Error saving products:', error.message)
    return false
  }
}

/**
 * Get product by ID
 * @param {string} productId - Product ID to find
 * @param {Array} products - Products array to search
 * @returns {Object|null} Product object or null if not found
 */
export const getProductById = (productId, products) => {
  return (
    products.find(p => String(p.id) === String(productId)) ||
    products.find(p => String(p._id) === String(productId)) ||
    null
  )
}

// ============================================================================
// CATEGORY OPERATIONS
// ============================================================================

/**
 * Load all categories from localStorage
 * @returns {Array} Array of categories, or empty array on error
 */
export const loadCategories = () => {
  try {
    const data = localStorage.getItem('kk_categories')
    if (!data) return []
    const categories = JSON.parse(data)
    return Array.isArray(categories) ? categories : []
  } catch (error) {
    console.error('❌ Error loading categories:', error.message)
    return []
  }
}

/**
 * Fetch categories from backend API
 * @returns {Promise<Array>} Array of categories
 */
export const fetchCategoriesFromAPI = async () => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api'
    const response = await fetch(`${API_BASE_URL}/categories`)
    if (!response.ok) return []
    const data = await response.json()
    let categories = []
    if (data.data && Array.isArray(data.data)) {
      categories = data.data
    } else if (Array.isArray(data)) {
      categories = data
    }
    return categories.map(c => ({
      id: c._id || c.id,
      name: c.name,
      slug: c.slug,
      image: c.image,
    }))
  } catch (error) {
    console.error('Error fetching categories:', error.message)
    return []
  }
}

/**
 * Save all categories to localStorage
 * @param {Array} categories - Categories to save
 * @returns {boolean} Success status
 */
export const saveCategories = (categories) => {
  try {
    if (!Array.isArray(categories)) {
      throw new Error('Categories must be an array')
    }
    localStorage.setItem('kk_categories', JSON.stringify(categories))
    return true
  } catch (error) {
    console.error('❌ Error saving categories:', error.message)
    return false
  }
}

/**
 * Get category by ID
 * @param {string} categoryId - Category ID to find
 * @param {Array} categories - Categories array to search
 * @returns {Object|null} Category object or null if not found
 */
export const getCategoryById = (categoryId, categories) => {
  return categories.find(c => String(c.id) === String(categoryId)) || null
}

/**
 * Get all products in a category
 * @param {string} categoryId - Category ID to search
 * @param {Array} products - Products array to search
 * @returns {Array} Products in this category
 */
export const getProductsByCategory = (categoryId, products) => {
  return products.filter(p => String(p.categoryId) === String(categoryId))
}

// ============================================================================
// INVENTORY OPERATIONS
// ============================================================================

/**
 * Get products with low stock
 * @param {Array} products - Products to check
 * @returns {Array} Products where stock <= lowStockThreshold
 */
export const getLowStockProducts = (products) => {
  return products.filter(
    product =>
      product.stock !== undefined &&
      product.lowStockThreshold !== undefined &&
      product.stock <= product.lowStockThreshold
  )
}

/**
 * Check if a product is in stock
 * @param {Object} product - Product to check
 * @returns {boolean} True if stock > 0
 */
export const isInStock = (product) => {
  return product && product.stock !== undefined && product.stock > 0
}

/**
 * Check if a product has low stock
 * @param {Object} product - Product to check
 * @returns {boolean} True if stock <= lowStockThreshold
 */
export const isLowStock = (product) => {
  return (
    product &&
    product.stock !== undefined &&
    product.lowStockThreshold !== undefined &&
    product.stock <= product.lowStockThreshold
  )
}

// ============================================================================
// VALIDATION OPERATIONS
// ============================================================================

/**
 * Validate product before saving
 * @param {Object} product - Product to validate
 * @param {Array} categories - Available categories
 * @returns {Object} { valid: boolean, error?: string }
 */
export const validateProduct = (product, categories) => {
  // Validate required fields
  if (!product.name && !product.title) {
    return { valid: false, error: 'Product name is required' }
  }

  // Validate category if provided
  if (product.categoryId) {
    const categoryExists = categories.some(
      c => String(c.id) === String(product.categoryId)
    )
    if (!categoryExists) {
      return { valid: false, error: 'Selected category does not exist' }
    }
  }

  // Validate stock if provided
  if (product.stock !== undefined) {
    if (typeof product.stock !== 'number' || product.stock < 0) {
      return { valid: false, error: 'Stock must be a non-negative number' }
    }
  }

  // Validate low stock threshold if provided
  if (product.lowStockThreshold !== undefined) {
    if (
      typeof product.lowStockThreshold !== 'number' ||
      product.lowStockThreshold < 0
    ) {
      return {
        valid: false,
        error: 'Low stock threshold must be a non-negative number',
      }
    }
  }

  return { valid: true }
}

/**
 * Initialize product with stock defaults if not provided
 * @param {Object} product - Product to initialize
 * @returns {Object} Product with stock fields
 */
export const initializeProductStock = (product) => {
  return {
    ...product,
    stock: product.stock !== undefined ? product.stock : 0,
    lowStockThreshold: product.lowStockThreshold !== undefined ? product.lowStockThreshold : 5,
  }
}
