/**
 * Real-time Data Sync Event System
 * Enables instant synchronization between admin and customer panels
 */

class DataSyncEventSystem {
  constructor() {
    this.listeners = new Map()
    this.eventHistory = []
    this.maxHistorySize = 100
  }

  /**
   * Subscribe to data changes
   * @param {string} eventType - Type of event (e.g., 'product-updated', 'order-created')
   * @param {Function} callback - Callback function to execute when event occurs
   * @returns {Function} Unsubscribe function
   */
  subscribe(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, [])
    }
    
    const callbacks = this.listeners.get(eventType)
    callbacks.push(callback)
    
    // Return unsubscribe function
    return () => {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  /**
   * Emit data change event
   * @param {string} eventType - Type of event
   * @param {Object} data - Event data
   */
  emit(eventType, data) {
    const event = {
      type: eventType,
      data: data,
      timestamp: new Date().toISOString(),
      id: Date.now().toString()
    }
    
    // Add to history
    this.eventHistory.push(event)
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift()
    }
    
    // Log event
    console.log(`🔄 Data Sync Event [${eventType}]:`, data)
    
    // Execute callbacks
    const callbacks = this.listeners.get(eventType) || []
    callbacks.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error(`❌ Event callback error [${eventType}]:`, error)
      }
    })
  }

  /**
   * Get event history
   * @param {string} eventType - Optional event type filter
   * @returns {Array} Array of events
   */
  getHistory(eventType = null) {
    if (eventType) {
      return this.eventHistory.filter(event => event.type === eventType)
    }
    return [...this.eventHistory]
  }

  /**
   * Clear event history
   */
  clearHistory() {
    this.eventHistory = []
  }

  /**
   * Get all active listeners
   * @returns {Object} Map of event types and listener counts
   */
  getListeners() {
    const result = {}
    for (const [eventType, callbacks] of this.listeners) {
      result[eventType] = callbacks.length
    }
    return result
  }
}

// Create singleton instance
export const dataSyncEvents = new DataSyncEventSystem()

// Event types constants
export const EVENT_TYPES = {
  PRODUCT_CREATED: 'product-created',
  PRODUCT_UPDATED: 'product-updated',
  PRODUCT_DELETED: 'product-deleted',
  ORDER_CREATED: 'order-created',
  ORDER_UPDATED: 'order-updated',
  ORDER_STATUS_CHANGED: 'order-status-changed',
  CUSTOMER_REGISTERED: 'customer-registered',
  CUSTOMER_UPDATED: 'customer-updated',
  CATEGORY_CREATED: 'category-created',
  CATEGORY_UPDATED: 'category-updated',
  CATEGORY_DELETED: 'category-deleted',
  BRAND_CREATED: 'brand-created',
  BRAND_UPDATED: 'brand-updated',
  BRAND_DELETED: 'brand-deleted',
  COUPON_CREATED: 'coupon-created',
  COUPON_UPDATED: 'coupon-updated',
  COUPON_DELETED: 'coupon-deleted'
}

/**
 * Enhanced event emitter with validation
 */
export const emitSafeEvent = (eventType, data, validator = null) => {
  if (!EVENT_TYPES[eventType]) {
    console.warn(`⚠️ Unknown event type: ${eventType}`)
    return
  }
  
  if (validator && !validator(data)) {
    console.error(`❌ Event validation failed [${eventType}]:`, data)
    return
  }
  
  dataSyncEvents.emit(eventType, {
    ...data,
    source: 'admin-panel',
    timestamp: new Date().toISOString()
  })
}

/**
 * Event validators
 */
export const validators = {
  product: (data) => {
    return data && typeof data.id === 'string' && typeof data.name === 'string'
  },
  order: (data) => {
    return data && typeof data.id === 'string' && typeof data.status === 'string'
  },
  customer: (data) => {
    return data && typeof data.email === 'string' && typeof data.name === 'string'
  }
}

/**
 * Convenience methods for common events
 */
export const events = {
  // Product events
  productCreated: (product) => emitSafeEvent(EVENT_TYPES.PRODUCT_CREATED, product, validators.product),
  productUpdated: (product) => emitSafeEvent(EVENT_TYPES.PRODUCT_UPDATED, product, validators.product),
  productDeleted: (productId) => emitSafeEvent(EVENT_TYPES.PRODUCT_DELETED, { id: productId }),
  
  // Order events
  orderCreated: (order) => emitSafeEvent(EVENT_TYPES.ORDER_CREATED, order, validators.order),
  orderUpdated: (order) => emitSafeEvent(EVENT_TYPES.ORDER_UPDATED, order, validators.order),
  orderStatusChanged: (orderId, status) => emitSafeEvent(EVENT_TYPES.ORDER_STATUS_CHANGED, { id: orderId, status }),
  
  // Customer events
  customerRegistered: (customer) => emitSafeEvent(EVENT_TYPES.CUSTOMER_REGISTERED, customer, validators.customer),
  customerUpdated: (customer) => emitSafeEvent(EVENT_TYPES.CUSTOMER_UPDATED, customer, validators.customer),
  
  // Category events
  categoryCreated: (category) => emitSafeEvent(EVENT_TYPES.CATEGORY_CREATED, category),
  categoryUpdated: (category) => emitSafeEvent(EVENT_TYPES.CATEGORY_UPDATED, category),
  categoryDeleted: (categoryId) => emitSafeEvent(EVENT_TYPES.CATEGORY_DELETED, { id: categoryId }),
  
  // Brand events
  brandCreated: (brand) => emitSafeEvent(EVENT_TYPES.BRAND_CREATED, brand),
  brandUpdated: (brand) => emitSafeEvent(EVENT_TYPES.BRAND_UPDATED, brand),
  brandDeleted: (brandId) => emitSafeEvent(EVENT_TYPES.BRAND_DELETED, { id: brandId }),
  
  // Coupon events
  couponCreated: (coupon) => emitSafeEvent(EVENT_TYPES.COUPON_CREATED, coupon),
  couponUpdated: (coupon) => emitSafeEvent(EVENT_TYPES.COUPON_UPDATED, coupon),
  couponDeleted: (couponId) => emitSafeEvent(EVENT_TYPES.COUPON_DELETED, { id: couponId })
}

export default dataSyncEvents
