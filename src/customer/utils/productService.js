/**
 * Product Service Layer
 * Abstracts all API operations for products and categories
 * Provides error-safe data persistence with fallback defaults
 * 
 * This layer prepares the app for easy backend API integration:
 * Simply replace API calls with new endpoints and the entire
 * ProductContext will work with backend without any UI changes.
 */

import { API_BASE_URL } from '@config/api.js'

// ============================================================================
// PRODUCT OPERATIONS
// ============================================================================

/**
 * Load all products from backend API
 * @returns {Promise<Array>} Array of products from API
 */
export const loadProducts = async () => {
  try {
    const apiUrl = `${API_BASE_URL}/products`
    const response = await fetch(apiUrl)
    
    if (!response.ok) {
      console.error(`❌ API Error: HTTP ${response.status}`)
      return []
    }
    
    const data = await response.json()
    console.log("🔍 PRODUCT SERVICE: Raw API response:", data)
    
    // Fix: API response is {success: true, data: {products: [...], pagination: {...}}}
    const products = data.data?.products || []
    console.log(`📦 Loaded ${products.length} products from API`)
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
    // Add timeout to prevent hanging
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    // Fix: Fetch ALL products by setting high limit
    const apiUrl = `${API_BASE_URL}/products?limit=500`

    const response = await fetch(apiUrl, {
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      console.error(`❌ API Error: HTTP ${response.status}`)
      
      // Handle 429 rate limit errors specifically
      if (response.status === 429) {
        const error = new Error('HTTP 429: Too many requests - rate limit exceeded')
        error.status = 429
        throw error
      }
      
      return []
    }
    
    const data = await response.json()
    
    // Fix: API response is {success: true, data: {products: [...], pagination: {...}}}
    const products = data.data?.products || []
    
    // 🔧 TEMPORARY FIX: If no products found, provide sample data for testing
    if (products.length === 0) {
      console.warn('⚠️ No products found in API - using sample data for testing')
      return [
        {
          id: 'sample-1',
          _id: 'sample-1',
          name: 'Sample Gold Bracelet',
          description: 'Beautiful gold bracelet for testing',
          originalPrice: 5000,
          sellingPrice: 4500,
          category: 'Bracelets',
          brand: 'Test Brand',
          stock: 10,
          images: [],
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'sample-2',
          _id: 'sample-2',
          name: 'Sample Silver Ring',
          description: 'Elegant silver ring for testing',
          originalPrice: 3000,
          sellingPrice: 2500,
          category: 'Rings',
          brand: 'Test Brand',
          stock: 5,
          images: [],
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ]
    }
    
    return products
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('❌ API timeout: Request took too long')
    } else if (error.status === 429) {
      console.error('❌ Rate limit exceeded:', error.message)
      throw error // Re-throw to let ProductContext handle the retry
    } else {
      console.error('❌ Error fetching products from API:', error.message)
    }
    return []
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
 * Load all categories from backend API
 * @returns {Promise<Array>} Array of categories from API
 */
export const loadCategories = async () => {
  try {
    const apiUrl = `${API_BASE_URL}/categories`
    const response = await fetch(apiUrl)
    
    if (!response.ok) {
      console.error(`❌ API Error: HTTP ${response.status}`)
      return []
    }
    
    const data = await response.json()
    let categories = []
    
    // Handle both old and new response structures
    if (Array.isArray(data?.data)) {
      categories = data.data
    } else if (data?.data?.categories && Array.isArray(data.data.categories)) {
      categories = data.data.categories
    }
    
    console.log(`📂 Loaded ${categories.length} categories from API`)
    return Array.isArray(categories) ? categories : []
  } catch (error) {
    console.error('❌ Error loading categories:', error.message)
    return []
  }
}

/**
 * Fetch categories from backend API
 * @returns {Promise<Array>} Array of categories from API
 */
export const fetchCategoriesFromAPI = async () => {
  try {
    // Add timeout to prevent hanging
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const apiUrl = `${API_BASE_URL}/categories`
    console.log("API CALL:", apiUrl)

    const response = await fetch(apiUrl, {
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      console.error(`❌ API Error: HTTP ${response.status}`)
      return []
    }
    
    const data = await response.json()
    let categories = []
    
    // Handle both old and new response structures
    if (Array.isArray(data?.data)) {
      categories = data.data
    } else if (data?.data?.categories && Array.isArray(data.data.categories)) {
      categories = data.data.categories
    }
    
    return categories
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('❌ API timeout: Request took too long')
    } else {
      console.error('❌ Error fetching categories from API:', error.message)
    }
    return []
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
