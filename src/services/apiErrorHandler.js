// API Service Error Handler and Recovery
class ApiServiceErrorHandler {
  constructor() {
    this.retryAttempts = 2  // ✅ Reduced from 3
    this.retryDelay = 1000
    this.circuitBreakerThreshold = 10  // ✅ Increased from 5
    this.circuitBreakerTimeout = 15000  // ✅ Reduced from 30000
    this.failureCount = 0
    this.lastFailureTime = null
    this.circuitBreakerOpen = false
  }

  // Circuit breaker pattern to prevent cascading failures
  async checkCircuitBreaker() {
    if (this.circuitBreakerOpen) {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime
      if (timeSinceLastFailure > this.circuitBreakerTimeout) {
        this.circuitBreakerOpen = false
        this.failureCount = 0
        console.log('🔧 Circuit breaker closed - retrying requests')
      } else {
        throw new Error('Circuit breaker is open - service temporarily unavailable')
      }
    }
  }

  // Record failure and potentially open circuit breaker
  recordFailure() {
    this.failureCount++
    this.lastFailureTime = Date.now()
    
    if (this.failureCount >= this.circuitBreakerThreshold) {
      this.circuitBreakerOpen = true
      console.log('⚠️ Circuit breaker opened - too many failures')
    }
  }

  // Record success and reset failure count
  recordSuccess() {
    this.failureCount = 0
    if (this.circuitBreakerOpen) {
      this.circuitBreakerOpen = false
      console.log('✅ Circuit breaker closed - service recovered')
    }
  }

  // Enhanced fetch with retry logic and error handling
  async fetchWithRetry(url, options = {}, retryCount = 0) {
    await this.checkCircuitBreaker()

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          ...options.headers
        }
      })

      // Check for HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      this.recordSuccess()
      return response

    } catch (error) {
      this.recordFailure()

      // Retry logic for network errors
      if (retryCount < this.retryAttempts && this.shouldRetry(error)) {
        console.log(`🔄 Retrying request (attempt ${retryCount + 1}/${this.retryAttempts}):`, error.message)
        
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (retryCount + 1)))
        return this.fetchWithRetry(url, options, retryCount + 1)
      }

      throw error
    }
  }

  // Determine if error is retryable
  shouldRetry(error) {
    const retryableErrors = [
      'Network error',
      'Failed to fetch',
      'CORS',
      'timeout',
      'ECONNREFUSED',
      'ENOTFOUND'
    ]
    
    return retryableErrors.some(retryableError => 
      error.message.toLowerCase().includes(retryableError.toLowerCase())
    )
  }

  // Handle API response with proper error processing
  async handleResponse(response) {
    try {
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`)
      }
      
      return data
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON response from server')
      }
      throw error
    }
  }
}

// Create global error handler instance
const apiErrorHandler = new ApiServiceErrorHandler()

// Enhanced API service with error handling
export const enhancedApiService = {
  async request(url, options = {}) {
    try {
      const response = await apiErrorHandler.fetchWithRetry(url, options)
      return await apiErrorHandler.handleResponse(response)
    } catch (error) {
      console.error('❌ API Request Failed:', {
        url,
        method: options.method || 'GET',
        error: error.message,
        timestamp: new Date().toISOString()
      })
      
      // User-friendly error messages
      const userError = this.getUserFriendlyError(error)
      throw new Error(userError)
    }
  },

  getUserFriendlyError(error) {
    const errorMessages = {
      'Circuit breaker is open': 'Service temporarily unavailable. Please try again in a moment.',
      'Network error': 'Network connection issue. Please check your internet connection.',
      'Failed to fetch': 'Unable to connect to server. Please try again.',
      'Invalid password': 'Incorrect password. Please try again.',
      'User not found': 'Account not found. Please check your credentials.',
      'Email already exists': 'An account with this email already exists.',
      'Invalid email format': 'Please enter a valid email address.',
      'default': 'Something went wrong. Please try again.'
    }

    for (const [key, message] of Object.entries(errorMessages)) {
      if (error.message.includes(key)) {
        return message
      }
    }
    
    return errorMessages.default
  }
}

export default apiErrorHandler
