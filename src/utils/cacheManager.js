/**
 * Smart Cache Management System
 * Provides intelligent caching with TTL, invalidation, and performance optimization
 */

class CacheManager {
  constructor() {
    this.cache = new Map()
    this.timestamps = new Map()
    this.defaultTTL = 5 * 60 * 1000 // 5 minutes default TTL
    this.maxSize = 100 // Maximum cache entries
    this.hitCount = 0
    this.missCount = 0
  }

  /**
   * Set cache entry with TTL
   * @param {string} key - Cache key
   * @param {*} data - Data to cache
   * @param {number} ttl - Time to live in milliseconds
   */
  set(key, data, ttl = this.defaultTTL) {
    // Check cache size limit
    if (this.cache.size >= this.maxSize) {
      this.evictOldest()
    }
    
    const timestamp = Date.now()
    this.cache.set(key, {
      data: data,
      timestamp: timestamp,
      ttl: ttl,
      accessCount: 0
    })
    this.timestamps.set(key, timestamp + ttl)
    
    console.log(`💾 Cache SET [${key}]: TTL=${ttl}ms`)
  }

  /**
   * Get cache entry
   * @param {string} key - Cache key
   * @param {boolean} updateAccessCount - Whether to update access count
   * @returns {*} Cached data or null
   */
  get(key, updateAccessCount = true) {
    const entry = this.cache.get(key)
    const timestamp = this.timestamps.get(key)
    
    // Check if entry exists and is not expired
    if (entry && timestamp && Date.now() <= timestamp) {
      if (updateAccessCount) {
        entry.accessCount++
      }
      this.hitCount++
      console.log(`📦 Cache HIT [${key}]: hits=${this.hitCount}`)
      return entry.data
    }
    
    // Remove expired entry
    if (entry) {
      this.cache.delete(key)
      this.timestamps.delete(key)
    }
    
    this.missCount++
    console.log(`❌ Cache MISS [${key}]: misses=${this.missCount}`)
    return null
  }

  /**
   * Check if cache entry exists and is valid
   * @param {string} key - Cache key
   * @returns {boolean} Whether entry exists and is valid
   */
  has(key) {
    const entry = this.cache.get(key)
    const timestamp = this.timestamps.get(key)
    
    return entry && timestamp && Date.now() <= timestamp
  }

  /**
   * Delete cache entry
   * @param {string} key - Cache key
   */
  delete(key) {
    const deleted = this.cache.delete(key)
    this.timestamps.delete(key)
    
    if (deleted) {
      console.log(`🗑️ Cache DELETE [${key}]`)
    }
    
    return deleted
  }

  /**
   * Clear cache entries matching pattern
   * @param {string} pattern - Pattern to match (supports wildcards)
   */
  invalidate(pattern) {
    const keysToDelete = []
    
    for (const key of this.cache.keys()) {
      if (this.matchesPattern(key, pattern)) {
        keysToDelete.push(key)
      }
    }
    
    keysToDelete.forEach(key => this.delete(key))
    console.log(`🧹 Cache INVALIDATE [${pattern}]: deleted ${keysToDelete.length} entries`)
  }

  /**
   * Clear all cache entries
   */
  clear() {
    const size = this.cache.size
    this.cache.clear()
    this.timestamps.clear()
    console.log(`🧹 Cache CLEAR: removed ${size} entries`)
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getStats() {
    const totalRequests = this.hitCount + this.missCount
    const hitRate = totalRequests > 0 ? (this.hitCount / totalRequests * 100).toFixed(2) : 0
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: `${hitRate}%`,
      totalRequests: totalRequests
    }
  }

  /**
   * Evict oldest entries to maintain cache size
   */
  evictOldest() {
    let oldestKey = null
    let oldestTime = Date.now()
    
    for (const [key, entry] of this.cache) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp
        oldestKey = key
      }
    }
    
    if (oldestKey) {
      this.delete(oldestKey)
      console.log(`🗑️ Cache EVICT [${oldestKey}]: oldest entry`)
    }
  }

  /**
   * Check if key matches pattern
   * @param {string} key - Cache key
   * @param {string} pattern - Pattern to match
   * @returns {boolean} Whether key matches pattern
   */
  matchesPattern(key, pattern) {
    if (pattern === '*') return true
    
    // Simple wildcard matching
    const regex = new RegExp(pattern.replace(/\*/g, '.*'))
    return regex.test(key)
  }

  /**
   * Clean up expired entries
   */
  cleanup() {
    const now = Date.now()
    const keysToDelete = []
    
    for (const [key, timestamp] of this.timestamps) {
      if (now > timestamp) {
        keysToDelete.push(key)
      }
    }
    
    keysToDelete.forEach(key => this.delete(key))
    
    if (keysToDelete.length > 0) {
      console.log(`🧹 Cache CLEANUP: removed ${keysToDelete.length} expired entries`)
    }
    
    return keysToDelete.length
  }
}

// Create singleton instance
export const cacheManager = new CacheManager()

// Auto cleanup expired entries every minute
setInterval(() => {
  cacheManager.cleanup()
}, 60 * 1000)

/**
 * Convenience methods for common cache operations
 */
export const cache = {
  set: (key, data, ttl) => cacheManager.set(key, data, ttl),
  get: (key) => cacheManager.get(key),
  has: (key) => cacheManager.has(key),
  delete: (key) => cacheManager.delete(key),
  invalidate: (pattern) => cacheManager.invalidate(pattern),
  clear: () => cacheManager.clear(),
  getStats: () => cacheManager.getStats(),
  
  // Specific cache types
  products: {
    set: (data) => cacheManager.set('products', data),
    get: () => cacheManager.get('products'),
    invalidate: () => cacheManager.delete('products')
  },
  
  orders: {
    set: (data) => cacheManager.set('orders', data),
    get: () => cacheManager.get('orders'),
    invalidate: () => cacheManager.delete('orders')
  },
  
  categories: {
    set: (data) => cacheManager.set('categories', data),
    get: () => cacheManager.get('categories'),
    invalidate: () => cacheManager.delete('categories')
  },
  
  customers: {
    set: (data) => cacheManager.set('customers', data),
    get: () => cacheManager.get('customers'),
    invalidate: () => cacheManager.delete('customers')
  }
}

export default cacheManager
