// NEW FILE - Frontend Review URL Helper Utility - Build Fixed

/**
 * Safely extract and validate review token from URL
 * @param {URLSearchParams} urlParams - URL search parameters
 * @param {object} routeParams - Route parameters (fallback)
 * @returns {object} - { orderId, token, valid, error }
 */
export function extractReviewTokenFromUrl(urlParams, routeParams = {}) {
  try {
    // Get parameters from URL query string
    const queryOrderId = urlParams.get('orderId')
    const queryToken = urlParams.get('token')
    
    // Fallback to route parameters
    const routeOrderId = routeParams.orderId
    const routeToken = routeParams.token
    
    // Use query parameters first, then route params
    const orderId = queryOrderId || routeOrderId
    const encodedToken = queryToken || routeToken
    
    if (!orderId || !encodedToken) {
      return {
        orderId: orderId || null,
        token: null,
        valid: false,
        error: 'Missing orderId or token in URL'
      }
    }
    
    // Basic validation
    if (typeof orderId !== 'string' || typeof encodedToken !== 'string') {
      return {
        orderId: null,
        token: null,
        valid: false,
        error: 'Invalid parameter types'
      }
    }
    
    return {
      orderId: orderId.trim(),
      token: encodedToken.trim(),
      valid: true,
      error: null
    }
  } catch (error) {
    console.error('Error extracting review token from URL:', error.message)
    return {
      orderId: null,
      token: null,
      valid: false,
      error: 'Failed to extract token from URL'
    }
  }
}

/**
 * Create review verification URL
 * @param {string} orderId - Order ID
 * @param {string} token - JWT token
 * @param {string} apiBaseUrl - API base URL
 * @returns {string} - Complete verification URL
 */
export function createVerificationUrl(orderId, token, apiBaseUrl = 'https://api.kkingsjewellery.com/api') {
  try {
    if (!orderId || !token) {
      throw new Error('Order ID and token are required')
    }
    
    // Ensure token is properly URL encoded
    const encodedToken = encodeURIComponent(token)
    
    return `${apiBaseUrl}/reviews/verify-token?orderId=${orderId}&token=${encodedToken}`
  } catch (error) {
    console.error('Error creating verification URL:', error.message)
    throw new Error('Failed to create verification URL')
  }
}

/**
 * Decode token from URL parameters safely (Step 5 - Safe decoding)
 * @param {string} encodedToken - URL-encoded JWT token
 * @returns {string} - Decoded token
 */
export function decodeTokenFromUrl(encodedToken) {
  try {
    if (!encodedToken) {
      throw new Error('No token provided')
    }
    
    console.log('FRONTEND TOKEN DECODING DEBUG:')
    console.log('- Encoded token length:', encodedToken.length)
    console.log('- Encoded token preview:', encodedToken.substring(0, 30) + '...')
    
    // Decode URL-encoded token
    const decodedToken = decodeURIComponent(encodedToken)
    
    console.log('- Decoded token length:', decodedToken.length)
    console.log('- Decoded token preview:', decodedToken.substring(0, 30) + '...')
    console.log('- Token changed during decode:', encodedToken !== decodedToken)
    
    // Validate JWT format
    if (!decodedToken.startsWith('eyJ')) {
      throw new Error('Invalid token format - does not start with eyJ')
    }
    
    return decodedToken
  } catch (error) {
    console.error('Error decoding token from URL:', error.message)
    throw new Error('Failed to decode token from URL')
  }
}

/**
 * Create review submission URL
 * @param {string} apiBaseUrl - API base URL
 * @returns {string} - Complete submission URL
 */
export function createSubmissionUrl(apiBaseUrl = null) {
  const baseUrl = apiBaseUrl || import.meta.env.VITE_API_URL || 'https://api.kkingsjewellery.com/api'
  return `${baseUrl}/reviews/submit`
}

/**
 * Validate JWT token format
 * @param {string} token - JWT token to validate
 * @returns {boolean} - True if valid JWT format
 */
export function isValidJwtFormat(token) {
  try {
    if (!token || typeof token !== 'string') {
      return false
    }
    
    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.')
    if (parts.length !== 3) {
      return false
    }
    
    // Check if header is valid base64
    try {
      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')))
      return header.alg && header.typ
    } catch {
      return false
    }
  } catch {
    return false
  }
}

export default {
  extractReviewTokenFromUrl,
  createVerificationUrl,
  createSubmissionUrl,
  isValidJwtFormat
}
