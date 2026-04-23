// NEW FILE - Frontend Review URL Helper Utility
import { validateUrlParameters } from '../../utils/emailReviewLinks.js'

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
    
    // Validate parameters
    const validation = validateUrlParameters(orderId, encodedToken)
    
    return {
      orderId: validation.orderId,
      token: validation.token,
      valid: validation.valid,
      error: validation.error
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
