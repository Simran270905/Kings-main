/**
 * 🛠️ DATA EXTRACTION HELPER
 * Standardizes API response extraction across the entire application
 */

/**
 * Extract data from API response with consistent fallbacks
 * @param {Object} response - API response object
 * @returns {Array|Object} Extracted data
 */
export const extractData = (response) => {
  // Handle different API response structures
  if (!response) return [];
  
  // Standard backend format: { success: true, data: { orders: [] } }
  if (response.data?.data?.orders) return response.data.data.orders;
  
  // Alternative format: { success: true, data: { orders: [] } }
  if (response.data?.orders) return response.data.orders;
  
  // Direct data format: { success: true, data: [] }
  if (response.data) return response.data;
  
  // Fallback to response itself
  if (Array.isArray(response)) return response;
  
  // Final fallback - ensure we never return undefined
  return response.data || [];
};

/**
 * Extract pagination data from API response
 * @param {Object} response - API response object
 * @returns {Object} Pagination data
 */
export const extractPagination = (response) => {
  if (!response) return { total: 0, page: 1, pages: 0 };
  
  return response.data?.data?.pagination || 
         response.data?.pagination || 
         { total: 0, page: 1, pages: 0 };
};

/**
 * Extract error message from API response
 * @param {Object} response - API response object
 * @returns {String} Error message
 */
export const extractError = (response) => {
  if (!response) return 'Unknown error';
  
  return response.message || 
         response.data?.message || 
         response.error || 
         'An error occurred';
};

/**
 * Check if API response is successful
 * @param {Object} response - API response object
 * @returns {Boolean} Success status
 */
export const isSuccess = (response) => {
  if (!response) return false;
  return response?.success === true || response?.data?.success === true;
};

/**
 * Standard API response structure
 */
export const createSuccessResponse = (data, message = 'Success') => ({
  success: true,
  message,
  data
});

export const createErrorResponse = (message, errors = null) => ({
  success: false,
  message,
  ...(errors && { errors })
});

/**
 * Console logging helpers for debugging
 */
export const logApiCall = (endpoint, method = 'GET', data = null) => {
  console.log(`🔗 API Call: ${method} ${endpoint}`, data ? { data } : '');
};

export const logApiResponse = (endpoint, response) => {
  const extractedData = extractData(response);
  console.log(`📦 API Response: ${endpoint}`, {
    success: isSuccess(response),
    dataCount: Array.isArray(extractedData) ? extractedData.length : (extractedData ? 1 : 0),
    hasData: Array.isArray(extractedData) ? extractedData.length > 0 : !!extractedData
  });
};
