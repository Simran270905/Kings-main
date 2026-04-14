// Safe fetch wrapper with timeout, retry, and error handling
class SafeFetch {
  constructor() {
    this.cache = new Map()
    this.retryCount = 3
    this.timeout = 5000 // 5 seconds
  }

  async fetch(url, options = {}) {
    const cacheKey = `${url}-${JSON.stringify(options)}`
    
    // Check cache first for GET requests
    if (options.method === 'GET' || !options.method) {
      const cached = this.cache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < 60000) { // 1 minute cache
        return cached.data
      }
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Cache successful GET responses
      if (options.method === 'GET' || !options.method) {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        })
      }

      return data
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - Please check your connection')
      }

      // Retry logic
      if (this.retryCount > 0) {
        console.log(`🔄 Retrying fetch... (${this.retryCount} attempts left)`)
        this.retryCount--
        await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
        return this.fetch(url, options)
      }

      // Return fallback data if available
      const fallbackData = this.getFallbackData(url)
      if (fallbackData) {
        console.log('📦 Using fallback data')
        return fallbackData
      }

      throw error
    }
  }

  getFallbackData(url) {
    // Return cached data even if expired as fallback
    const cacheKey = `${url}-${JSON.stringify({ method: 'GET' })}`
    const cached = this.cache.get(cacheKey)
    return cached ? cached.data : null
  }

  // Clear cache for specific URL
  clearCache(url) {
    const keys = Array.from(this.cache.keys())
    keys.forEach(key => {
      if (key.includes(url)) {
        this.cache.delete(key)
      }
    })
  }

  // Clear all cache
  clearAllCache() {
    this.cache.clear()
  }
}

export default new SafeFetch()
