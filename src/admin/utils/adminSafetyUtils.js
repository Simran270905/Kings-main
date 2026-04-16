// 🛡️ Admin Panel Safety Utilities
// Prevents crashes and ensures safe data rendering

/**
 * Safe string getter with fallback
 */
export const safeString = (value, fallback = "N/A") => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  return String(value);
};

/**
 * Safe number getter with fallback
 */
export const safeNumber = (value, fallback = 0) => {
  const num = Number(value);
  return isNaN(num) ? fallback : num;
};

/**
 * Safe array getter with fallback
 */
export const safeArray = (value, fallback = []) => {
  if (!Array.isArray(value)) {
    console.log("Admin Safety: Expected array, got:", typeof value, value);
    return fallback;
  }
  return value;
};

/**
 * Safe object getter with fallback
 */
export const safeObject = (value, fallback = {}) => {
  if (value === null || value === undefined || typeof value !== 'object') {
    console.log("Admin Safety: Expected object, got:", typeof value, value);
    return fallback;
  }
  return value;
};

/**
 * Safe customer name extraction
 */
export const safeCustomerName = (order) => {
  if (!order) return "N/A";
  
  // Try customer object first (registered users)
  if (order.customer?.name) {
    return safeString(order.customer.name);
  }
  
  // Try customer.firstName + customer.lastName (embedded customer object)
  if (order.customer?.firstName || order.customer?.lastName) {
    const firstName = safeString(order.customer.firstName, "");
    const lastName = safeString(order.customer.lastName, "");
    return (firstName && lastName) ? `${firstName} ${lastName}`.trim() : firstName || lastName || "Guest User";
  }
  
  // Try guestInfo (guest checkout system)
  if (order.guestInfo?.firstName || order.guestInfo?.lastName) {
    const firstName = safeString(order.guestInfo.firstName, "");
    const lastName = safeString(order.guestInfo.lastName, "");
    return (firstName && lastName) ? `${firstName} ${lastName}`.trim() : firstName || lastName || "Guest User";
  }
  
  return "Guest User";
};

/**
 * Safe customer email extraction
 */
export const safeCustomerEmail = (order) => {
  if (!order) return "N/A";
  
  // Try customer object first (registered users)
  if (order.customer?.email) {
    return safeString(order.customer.email);
  }
  
  // Try guestInfo (guest checkout system)
  if (order.guestInfo?.email) {
    return safeString(order.guestInfo.email);
  }
  
  return "N/A";
};

/**
 * Safe customer phone extraction
 */
export const safeCustomerPhone = (order) => {
  if (!order) return "N/A";
  
  // Try customer object first (registered users)
  if (order.customer?.phone || order.customer?.mobile) {
    return safeString(order.customer?.phone || order.customer?.mobile);
  }
  
  // Try guestInfo (guest checkout system)
  if (order.guestInfo?.mobile) {
    return safeString(order.guestInfo.mobile);
  }
  
  return "N/A";
};

/**
 * Safe order amount extraction
 */
export const safeOrderAmount = (order) => {
  if (!order) return 0;
  return safeNumber(order.totalAmount || order.total || order.amount, 0)
}

/**
 * Safe order status extraction
 */
export const safeOrderStatus = (order) => {
  return safeString(order.status, 'pending')
}

/**
 * Safe order date extraction
 */
export const safeOrderDate = (order) => {
  const date = order.createdAt || order.date || order.orderDate
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}

/**
 * Safe date formatter
 */
export const safeDate = (date) => {
  if (!date) return "-"
  try {
    return new Date(date).toLocaleDateString();
  } catch {
    return "-"
  }
}

/**
 * Safe product name extraction
 */
export const safeProductName = (product) => {
  return safeString(product.name || product.title, 'Unnamed Product')
}

/**
 * Safe product price extraction
 */
export const safeProductPrice = (product) => {
  return safeNumber(product.price, 0)
}

/**
 * Safe product stock extraction
 */
export const safeProductStock = (product) => {
  return safeNumber(product.stock || product.inventory || 0, 0)
}

/**
 * Safe category name extraction
 */
export const safeCategoryName = (category) => {
  // Handle undefined, null, or non-object category values
  if (!category || typeof category !== 'object') {
    return 'No Category'
  }
  
  return safeString(category.name || category.title, 'Unnamed Category')
}

/**
 * Safe brand name extraction
 */
export const safeBrandName = (brand) => {
  return safeString(brand.name || brand.brandName, 'Unnamed Brand')
}

/**
 * Safe currency formatter
 */
export const safeCurrency = (amount, currency = '₹') => {
  const num = safeNumber(amount, 0)
  return `${currency}${num.toLocaleString('en-IN')}`
}

/**
 * Extract unique customers from orders
 */
export const extractCustomersFromOrders = (orders) => {
  if (!Array.isArray(orders)) return []
  
  const uniqueCustomers = new Map()
  
  orders.forEach(order => {
    const email = safeCustomerEmail(order)
    const phone = safeCustomerPhone(order)
    
    // Use email as primary key, phone as fallback
    const key = email !== 'N/A' ? email : phone
    
    if (key && key !== 'N/A') {
      if (!uniqueCustomers.has(key)) {
        uniqueCustomers.set(key, {
          _id: order._id || order.id,
          name: safeCustomerName(order),
          email: email,
          phone: phone,
          totalOrders: 0,
          totalSpent: 0,
          lastOrder: order.createdAt || order.date,
          createdAt: order.createdAt || order.date
        })
      }
      
      // Update order count and spending
      const customer = uniqueCustomers.get(key)
      customer.totalOrders += 1
      customer.totalSpent += safeOrderAmount(order)
      
      // Update last order date if this order is newer
      const orderDate = order.createdAt || order.date
      if (orderDate && (!customer.lastOrder || new Date(orderDate) > new Date(customer.lastOrder))) {
        customer.lastOrder = orderDate
      }
    }
  })
  
  return Array.from(uniqueCustomers.values())
}

/**
 * Admin data logger for debugging
 */
export const logAdminData = (component, data, action) => {
  const timestamp = new Date().toISOString()
  console.log(`🔍 Admin [${component}] ${action}:`, {
    timestamp,
    dataType: Array.isArray(data) ? `array(${data.length})` : typeof data,
    data: data
  })
}

/**
 * Unified API Response Handler
 * Handles nested response structure from backend
 * Provides consistent data extraction across all components
 */

export const handleApiResponse = (response, dataType) => {
  console.log(`🔍 API Response for ${dataType}:`, response)
  
  // Handle nested response structure from backend
  // Backend returns: { success, message, data: { [dataType]: [...] } }
  let data = null
  
  if (response?.data?.data?.[dataType]) {
    // Full nested structure: response.data.data.products
    data = response.data.data[dataType]
  } else if (response?.data?.[dataType]) {
    // Partial nested: response.data.products
    data = response.data[dataType]
  } else if (response?.[dataType]) {
    // Direct: response.products
    data = response[dataType]
  } else if (response?.data) {
    // Data at root level: response.data
    data = response.data
  } else {
    // Fallback to response itself
    data = response
  }
  
  // Ensure array for list endpoints
  if (['products', 'orders', 'categories', 'customers', 'brands', 'coupons'].includes(dataType)) {
    data = Array.isArray(data) ? data : []
  }
  
  console.log(`✅ Extracted ${dataType}:`, data)
  return data
}

export const extractDataType = (endpoint) => {
  // Extract data type from endpoint
  if (endpoint.includes('/products')) return 'products'
  if (endpoint.includes('/orders')) return 'orders'
  if (endpoint.includes('/categories')) return 'categories'
  if (endpoint.includes('/customers')) return 'customers'
  if (endpoint.includes('/brands')) return 'brands'
  if (endpoint.includes('/coupons')) return 'coupons'
  if (endpoint.includes('/users')) return 'users'
  return 'data'
}

export const safeApiResponse = (response, dataType) => {
  try {
    const data = handleApiResponse(response, dataType)
    return {
      success: true,
      data: data,
      message: response?.message || 'Success'
    }
  } catch (error) {
    console.error(`❌ API Response Error [${dataType}]:`, error)
    return {
      success: false,
      data: null,
      error: error.message
    }
  }
}

/**
 * Enhanced API response handler for admin
 */
export const safeAdminApiResponse = async (apiCall, component, endpoint) => {
  try {
    const response = await apiCall
    const dataType = extractDataType(endpoint)
    const handledResponse = safeApiResponse(response, dataType)
    
    logAdminData(component, handledResponse.data, 'api-success')
    
    return handledResponse
  } catch (error) {
    console.error(`❌ Admin API Error [${component}]:`, error)
    logAdminData(component, error, 'api-error')
    
    return {
      success: false,
      data: null,
      error: error.message
    }
  }
}

/**
 * Safe fetch wrapper for admin components
 */
export const safeAdminFetch = async (url, options = {}, component = 'Unknown') => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('kk_admin_token')}`,
        ...options.headers
      },
      ...options
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    const dataType = extractDataType(url)
    const handledData = handleApiResponse(data, dataType)
    
    logAdminData(component, handledData, 'fetch-success')
    
    return {
      success: true,
      data: handledData,
      status: response.status
    }
  } catch (error) {
    console.error(`❌ Admin Fetch Error [${component}]:`, error)
    logAdminData(component, error, 'fetch-error')
    
    return {
      success: false,
      data: null,
      error: error.message
    }
  }
}

/**
 * Validation helpers
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidPhone = (phone) => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
}

export const isValidPrice = (price) => {
  const num = Number(price)
  return !isNaN(num) && num >= 0
}

/**
 * Error message helpers
 */
export const getErrorMessage = (error, fallback = 'An error occurred') => {
  if (typeof error === 'string') return error
  if (error?.message) return error.message
  return fallback
}

/**
 * Loading state helpers
 */
export const createLoadingState = (key) => ({
  [key]: false,
  error: null,
  data: null
})

export const setLoading = (state, key, loading) => {
  state[key] = loading
  if (loading) {
    state.error = null
  }
}

export const setError = (state, key, error) => {
  state[key] = false
  state.error = getErrorMessage(error)
}

export const setData = (state, key, data) => {
  state[key] = false
  state.error = null
  state.data = data
}
