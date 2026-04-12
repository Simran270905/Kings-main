/**
 * Product Data Models & Schema
 * ============================
 * Defines the structure of products and categories
 * Provides validation and initialization functions
 * 
 * PRODUCT SCHEMA:
 * {
 *   id: string (unique, auto-generated if not provided)
 *   name: string (required)
 *   description: string
 *   price: number (required, must be > 0)
 *   categoryId: string (optional, must reference valid category)
 *   imageUrl: string
 *   stock: number (defaults to 0)
 *   lowStockThreshold: number (defaults to 5)
 *   createdAt: ISO-8601 timestamp
 *   updatedAt: ISO-8601 timestamp
 * }
 * 
 * CATEGORY SCHEMA:
 * {
 *   id: string (unique, auto-generated if not provided)
 *   name: string (required, unique)
 *   createdAt: ISO-8601 timestamp
 *   updatedAt: ISO-8601 timestamp
 * }
 */

// ============================================================================
// PRODUCT MODEL
// ============================================================================

/**
 * Product default schema
 * Use this as template when creating new products
 */
export const productDefaults = {
  id: undefined, // Auto-generated
  name: '',
  title: '', // Alternative name field for compatibility
  description: '',
  price: 0,
  selling_price: undefined, // For discounted price
  categoryId: undefined,
  imageUrl: '',
  stock: 0,
  lowStockThreshold: 5,
  createdAt: undefined, // Auto-generated
  updatedAt: undefined, // Auto-generated
}

/**
 * Create a new product with defaults and validation
 * 
 * @param {Object} productData - Product data to create
 * @returns {Object} Validated product with defaults
 */
export const createProduct = (productData = {}) => {
  const product = {
    ...productDefaults,
    ...productData,
  }

  // Auto-generate ID if not provided
  if (!product.id) {
    product.id = `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Auto-generate timestamps if not provided
  if (!product.createdAt) {
    product.createdAt = new Date().toISOString()
  }
  if (!product.updatedAt) {
    product.updatedAt = new Date().toISOString()
  }

  return product
}

/**
 * Validate product data against schema
 * 
 * @param {Object} product - Product to validate
 * @param {Array} categories - Available categories for validation
 * @returns {Object} { valid: boolean, errors: Array<string> }
 */
export const validateProductSchema = (product, categories = []) => {
  const errors = []

  // Validate required fields
  if (!product.id || typeof product.id !== 'string') {
    errors.push('Product ID must be a non-empty string')
  }

  if (!product.name && !product.title) {
    errors.push('Product name is required')
  }

  if (product.name && typeof product.name !== 'string') {
    errors.push('Product name must be a string')
  }

  // Validate price
  if (product.price === undefined || product.price === null) {
    errors.push('Product price is required')
  } else if (typeof product.price !== 'number') {
    errors.push('Product price must be a number')
  } else if (product.price < 0) {
    errors.push('Product price cannot be negative')
  }

  // Validate stock
  if (product.stock !== undefined) {
    if (typeof product.stock !== 'number') {
      errors.push('Product stock must be a number')
    } else if (product.stock < 0) {
      errors.push('Product stock cannot be negative')
    } else if (!Number.isInteger(product.stock)) {
      errors.push('Product stock must be an integer')
    }
  }

  // Validate low stock threshold
  if (product.lowStockThreshold !== undefined) {
    if (typeof product.lowStockThreshold !== 'number') {
      errors.push('Low stock threshold must be a number')
    } else if (product.lowStockThreshold < 0) {
      errors.push('Low stock threshold cannot be negative')
    } else if (!Number.isInteger(product.lowStockThreshold)) {
      errors.push('Low stock threshold must be an integer')
    }
  }

  // Validate category reference
  if (product.categoryId) {
    const categoryExists = categories.some(c => String(c.id) === String(product.categoryId))
    if (!categoryExists) {
      errors.push(`Category with ID "${product.categoryId}" does not exist`)
    }
  }

  // Validate timestamps
  if (product.createdAt && isNaN(new Date(product.createdAt).getTime())) {
    errors.push('Invalid createdAt timestamp')
  }

  if (product.updatedAt && isNaN(new Date(product.updatedAt).getTime())) {
    errors.push('Invalid updatedAt timestamp')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Normalize product data (clean and standardize)
 * 
 * @param {Object} product - Product to normalize
 * @returns {Object} Normalized product
 */
export const normalizeProduct = (product) => {
  return {
    id: String(product.id).trim(),
    name: (product.name || product.title || '').trim(),
    title: (product.title || product.name || '').trim(),
    description: (product.description || '').trim(),
    price: Number(product.price) || 0,
    selling_price: product.selling_price !== undefined ? Number(product.selling_price) : undefined,
    categoryId: product.categoryId ? String(product.categoryId).trim() : undefined,
    imageUrl: (product.imageUrl || '').trim(),
    stock: Number(product.stock) || 0,
    lowStockThreshold: Number(product.lowStockThreshold) || 5,
    createdAt: product.createdAt || new Date().toISOString(),
    updatedAt: product.updatedAt || new Date().toISOString(),
  }
}

// ============================================================================
// CATEGORY MODEL
// ============================================================================

/**
 * Category default schema
 */
export const categoryDefaults = {
  id: undefined, // Auto-generated
  name: '',
  createdAt: undefined, // Auto-generated
  updatedAt: undefined, // Auto-generated
}

/**
 * Create a new category with defaults and validation
 * 
 * @param {Object} categoryData - Category data to create
 * @returns {Object} Validated category with defaults
 */
export const createCategory = (categoryData = {}) => {
  const category = {
    ...categoryDefaults,
    ...categoryData,
  }

  // Auto-generate ID if not provided
  if (!category.id) {
    category.id = `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Auto-generate timestamps if not provided
  if (!category.createdAt) {
    category.createdAt = new Date().toISOString()
  }
  if (!category.updatedAt) {
    category.updatedAt = new Date().toISOString()
  }

  return category
}

/**
 * Validate category data against schema
 * 
 * @param {Object} category - Category to validate
 * @param {Array} existingCategories - Other categories to check for duplicates
 * @returns {Object} { valid: boolean, errors: Array<string> }
 */
export const validateCategorySchema = (category, existingCategories = []) => {
  const errors = []

  // Validate required fields
  if (!category.id || typeof category.id !== 'string') {
    errors.push('Category ID must be a non-empty string')
  }

  if (!category.name || typeof category.name !== 'string') {
    errors.push('Category name is required and must be a string')
  }

  // Validate unique name
  if (category.name) {
    const duplicate = existingCategories.find(
      c => c.id !== category.id && c.name.toLowerCase() === category.name.toLowerCase()
    )
    if (duplicate) {
      errors.push(`Category name "${category.name}" already exists`)
    }
  }

  // Validate timestamps
  if (category.createdAt && isNaN(new Date(category.createdAt).getTime())) {
    errors.push('Invalid createdAt timestamp')
  }

  if (category.updatedAt && isNaN(new Date(category.updatedAt).getTime())) {
    errors.push('Invalid updatedAt timestamp')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Normalize category data (clean and standardize)
 * 
 * @param {Object} category - Category to normalize
 * @returns {Object} Normalized category
 */
export const normalizeCategory = (category) => {
  return {
    id: String(category.id).trim(),
    name: (category.name || '').trim(),
    createdAt: category.createdAt || new Date().toISOString(),
    updatedAt: category.updatedAt || new Date().toISOString(),
  }
}

/**
 * Get product summary (lightweight version for lists)
 * Excludes description for performance on large lists
 * 
 * @param {Object} product - Full product object
 * @returns {Object} Product summary
 */
export const getProductSummary = (product) => {
  return {
    id: product.id,
    name: product.name || product.title,
    price: product.price,
    selling_price: product.selling_price,
    imageUrl: product.imageUrl,
    categoryId: product.categoryId,
    stock: product.stock,
    inStock: (product.stock || 0) > 0,
  }
}

/**
 * Check if product is available for purchase
 * 
 * @param {Object} product - Product to check
 * @returns {boolean} True if product can be purchased
 */
export const isProductAvailable = (product) => {
  return product && (product.stock || 0) > 0
}

/**
 * Check if product is low on stock
 * 
 * @param {Object} product - Product to check
 * @returns {boolean} True if stock <= threshold
 */
export const isProductLowStock = (product) => {
  return (
    product &&
    product.stock !== undefined &&
    product.lowStockThreshold !== undefined &&
    product.stock <= product.lowStockThreshold
  )
}

/**
 * Get effective price (selling price if available, otherwise regular price)
 * 
 * @param {Object} product - Product to get price from
 * @returns {number} Effective price
 */
export const getEffectivePrice = (product) => {
  return product.selling_price !== undefined ? product.selling_price : product.price || 0
}
