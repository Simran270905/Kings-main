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
