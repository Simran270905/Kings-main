/**
 * Checkout & Order Validation Module
 * ===================================
 * Handles cart checkout validations and stock management
 * 
 * FEATURES:
 * - Validate cart items have sufficient stock
 * - Prevent checkout if any item is out of stock
 * - Process stock deduction on order placement
 * - Generate order confirmation data
 * - Rollback stock if order fails
 * 
 * INTEGRATION:
 * Used by Checkout component to validate and process orders
 * Communicates with ProductContext for stock operations
 */

/**
 * Validate all items in cart have sufficient stock
 * 
 * @param {Array} cartItems - Items in cart (from CartContext)
 * @param {Object} productContext - ProductContext with products array
 * @returns {Object} { valid: boolean, errors: Array<string> }
 */
export const validateCartStock = (cartItems, productContext) => {
  const errors = []

  if (!cartItems || cartItems.length === 0) {
    return { valid: false, errors: ['Cart is empty'] }
  }

  cartItems.forEach(cartItem => {
    const itemId = cartItem.productId || cartItem.id || cartItem._id
    const product = productContext?.getProductById?.(itemId)

    if (!product) {
      errors.push(`Product ${itemId || 'undefined'} not found`)
      return
    }

    const requestedQuantity = cartItem.quantity || 1
    const availableStock = product.stock || 0

    if (availableStock === 0) {
      errors.push(`${product.name}: Out of stock`)
    } else if (availableStock < requestedQuantity) {
      errors.push(`${product.name}: Only ${availableStock} available, ${requestedQuantity} requested`)
    }
  })

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Process order and decrease stock for all cart items
 * 
 * @param {Array} cartItems - Items to order
 * @param {Object} productContext - ProductContext with stock methods
 * @returns {Promise<Object>} { success: boolean, error?: string, order?: Object }
 */
export const processOrderAndDecrementStock = async (cartItems, productContext) => {
  // Validate before processing
  const validation = validateCartStock(cartItems, productContext)
  if (!validation.valid) {
    console.error('❌ Cart validation failed:', validation.errors)
    return {
      success: false,
      error: 'Cart validation failed: ' + validation.errors.join(', ')
    }
  }

  const processedItems = []
  const failedItems = []

  // Process each item
  for (const cartItem of cartItems) {
    try {
      const itemId = cartItem.productId || cartItem.id || cartItem._id
      const result = productContext.decreaseStock(itemId, cartItem.quantity || 1)
      
      if (!result.success) {
        failedItems.push({
          productId: cartItem.productId,
          error: result.error
        })
        continue
      }

      processedItems.push({
        productId: cartItem.productId,
        quantity: cartItem.quantity || 1,
        product: result.product
      })

      console.log(`✅ Stock decreased for product ${cartItem.productId}`)
    } catch (error) {
      console.error(`❌ Failed to process stock for product ${cartItem.productId}:`, error.message)
      failedItems.push({
        productId: cartItem.productId,
        error: error.message
      })
    }
  }

  // If any items failed, return error
  if (failedItems.length > 0) {
    console.error('❌ Order processing failed for some items:', failedItems)
    return {
      success: false,
      error: `Failed to process ${failedItems.length} item(s)`,
      failedItems
    }
  }

  // Create order confirmation
  const order = {
    orderId: `ORD-${Date.now()}`,
    items: processedItems,
    timestamp: new Date().toISOString(),
    status: 'confirmed'
  }

  console.log('✅ Order confirmed:', order.orderId)
  return {
    success: true,
    order
  }
}

/**
 * Get low stock warnings for admin dashboard
 * Shows products that are running low on inventory
 * 
 * @param {Object} productContext - ProductContext
 * @param {number} minWarningLevel - Optional minimum level to show warning (default: 5)
 * @returns {Array} Products with low stock
 */
export const getLowStockAlerts = (productContext, minWarningLevel = 5) => {
  const warnings = productContext?.getLowStockWarnings?.() || []

  return warnings.map(product => ({
    productId: product.id,
    productName: product.name || product.title,
    currentStock: product.stock || 0,
    threshold: product.lowStockThreshold || 5,
    status: product.stock === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
    severity: product.stock === 0 ? 'critical' : product.stock <= minWarningLevel ? 'high' : 'medium'
  }))
}

/**
 * Check if all categories exist for products
 * Validates data integrity
 * 
 * @param {Array} products - Products to validate
 * @param {Array} categories - Available categories
 * @returns {Object} { valid: boolean, errors: Array<string> }
 */
export const validateProductCategories = (products, categories) => {
  const errors = []

  products.forEach(product => {
    if (product.categoryId) {
      const categoryExists = categories.some(c => String(c.id) === String(product.categoryId))
      if (!categoryExists) {
        errors.push(`Product "${product.name || product.title}" references non-existent category ${product.categoryId}`)
      }
    }
  })

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validate all products have required fields
 * Prevents corrupted data in system
 * 
 * @param {Array} products - Products to validate
 * @returns {Object} { valid: boolean, errors: Array<string> }
 */
export const validateProductIntegrity = (products) => {
  const errors = []
  const ids = new Set()

  products.forEach((product, index) => {
    // Check required fields
    if (!product.id) {
      errors.push(`Product at index ${index}: missing ID`)
    }
    
    if (!product.name && !product.title) {
      errors.push(`Product at index ${index}: missing name/title`)
    }

    // Check for duplicate IDs
    if (product.id && ids.has(product.id)) {
      errors.push(`Product at index ${index}: duplicate ID ${product.id}`)
    }
    if (product.id) {
      ids.add(product.id)
    }

    // Check stock is valid
    if (product.stock !== undefined) {
      if (typeof product.stock !== 'number' || product.stock < 0) {
        errors.push(`Product ${product.id}: invalid stock value`)
      }
    }

    // Check price is valid
    if (product.price !== undefined) {
      if (typeof product.price !== 'number' || product.price < 0) {
        errors.push(`Product ${product.id}: invalid price value`)
      }
    }
  })

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Generate order summary for display/storage
 * 
 * @param {Array} cartItems - Items in order
 * @param {Object} productContext - ProductContext
 * @param {Object} deliveryInfo - Delivery/shipping information
 * @returns {Object} Complete order summary
 */
export const generateOrderSummary = (cartItems, productContext, deliveryInfo = {}) => {
  let subtotal = 0
  const items = []

  cartItems.forEach(cartItem => {
    const product = productContext?.getProductById?.(cartItem.productId)
    if (!product) return

    const quantity = cartItem.quantity || 1
    const itemTotal = (product.price || 0) * quantity

    items.push({
      productId: product.id,
      productName: product.name || product.title,
      quantity,
      unitPrice: product.price || 0,
      itemTotal
    })

    subtotal += itemTotal
  })

  // Calculate with simple delivery charge
  const deliveryCharge = deliveryInfo.deliveryCharge || 0
  const tax = Math.round(subtotal * 0.18) // 18% GST
  const total = subtotal + tax + deliveryCharge

  return {
    items,
    subtotal,
    tax,
    deliveryCharge,
    total,
    deliveryInfo,
    summary: {
      itemCount: items.length,
      totalQuantity: cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
    }
  }
}
