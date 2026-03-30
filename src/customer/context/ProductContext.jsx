import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import {
  fetchProductsFromAPI,
  fetchCategoriesFromAPI,
  getProductById,
  getCategoryById,
  getProductsByCategory,
  getLowStockProducts,
  isInStock,
  isLowStock,
  validateProduct,
  initializeProductStock,
} from '../utils/productService'
import { normalizeProduct, normalizeProducts, syncProductStock } from '../utils/productSchemaNormalizer'
import { dataSyncEvents, EVENT_TYPES } from '../../utils/eventSystem.js'
import { cache } from '../../utils/cacheManager.js'

const ProductContext = createContext({
  products: [],
  categories: [],
  loading: false,
  error: null,
  fetchProducts: () => {},
  fetchCategories: () => {},
  getProductById: () => null,
  getProductsByCategory: () => [],
  searchProducts: () => [],
  refreshProducts: () => {}
})

export const useProduct = () => {
  const context = useContext(ProductContext)
  if (!context) {
    throw new Error('useProduct must be used within a ProductProvider')
  }
  return context
}

/**
 * ProductProvider Component
 * Enhanced with:
 * - Inventory/Stock management (stock, lowStockThreshold)
 * - Category management
 * - Data persistence layer (service abstraction)
 * - Auto validation
 * - Error-safe storage
 * - Backend API integration
 * - Performance optimizations
 * - Caching mechanisms
 * 
 * All operations persist to localStorage via productService layer.
 * Fetches from backend API on mount.
 */
export const ProductProvider = ({ children }) => {
  // ========================================================================
  // STATE INITIALIZATION
  // ========================================================================

  /**
   * Initialize products as empty array
   * Products will be loaded ONLY from API
   */
  const [products, setProducts] = useState([])

  /**
   * Initialize categories as empty array
   * Categories will be loaded ONLY from API
   */
  const [categories, setCategories] = useState([])

  /**
   * Track last fetch time for caching
   */
  const lastProductsFetch = useRef(null)

  const [loading, setLoading] = useState(true)
  const [lastFetch, setLastFetch] = useState(null)
  const [error, setError] = useState(null)

  // ========================================================================
  // API FETCH ON MOUNT (Optimized with caching)
  // ========================================================================

  /**
   * Fetch products and categories from backend API on mount
   * Enhanced with caching and error handling
   */
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Check if we have fresh cached data (less than 30 seconds old)
      const now = Date.now()
      const lastFetch = lastProductsFetch.current
      
      if (lastFetch && (now - lastFetch) < 30 * 1000) {
        console.log('📦 Using cached data (fresh)')
        return
      }

      // Add rate limiting to prevent 429 errors
      if (window.lastApiCall && (now - window.lastApiCall) < 2000) {
        console.log('🕐 Rate limiting - waiting before API call')
        setTimeout(() => fetchData(), 2000)
        return
      }

      window.lastApiCall = now
      console.log('🌐 Fetching fresh data from API...')
      
      // Parallel fetch for better performance
      const [apiProducts, apiCategories] = await Promise.all([
        fetchProductsFromAPI(),
        fetchCategoriesFromAPI()
      ])

      // Use API data directly without normalization interference
      const normalizedProducts = apiProducts && apiProducts.length > 0 
        ? apiProducts.map(product => normalizeProduct(product))
        : []
      
      console.log("🔧 PRODUCT CONTEXT DEBUG:")
      console.log("Raw API products:", apiProducts?.length || 0)
      console.log("Normalized products:", normalizedProducts.length)
      console.log("Raw API sample:", apiProducts?.slice(0, 1))
      console.log("Normalized sample:", normalizedProducts.slice(0, 1))
      
      setProducts(normalizedProducts)
      setCategories(apiCategories || [])
      setLastFetch(Date.now())
      lastProductsFetch.current = Date.now() // Update ref for cache check
      
      console.log(`✅ Loaded ${normalizedProducts.length} products and ${apiCategories?.length || 0} categories`)
    } catch (error) {
      console.error('❌ Error fetching data:', error)
      
      // Handle 429 rate limit errors specifically
      if (error.message.includes('429') || error.message.includes('Too many requests')) {
        console.log('🕐 Rate limit hit - waiting 10 seconds before retry')
        setTimeout(() => fetchData(), 10000)
        return
      }
      
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [lastFetch])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ========================================================================
  // REAL-TIME SYNC EVENT LISTENERS
  // ========================================================================

  useEffect(() => {
    // Subscribe to admin product changes
    const unsubscribeProductCreated = dataSyncEvents.subscribe(EVENT_TYPES.PRODUCT_CREATED, (data) => {
      console.log('🔄 Real-time: Product created by admin:', data)
      setProducts(prev => [...prev, normalizeProduct(data)])
      cache.invalidate('products')
    })

    const unsubscribeProductUpdated = dataSyncEvents.subscribe(EVENT_TYPES.PRODUCT_UPDATED, (data) => {
      console.log('🔄 Real-time: Product updated by admin')
      setProducts(prev => prev.map(product => {
        const productId = product.id || product._id
        const updatedProductId = data.id || data._id
        if (productId === updatedProductId) {
          const normalizedUpdated = normalizeProduct(data)
          return normalizedUpdated
        }
        return product
      }))
      cache.invalidate('products')
    })

    const unsubscribeProductDeleted = dataSyncEvents.subscribe(EVENT_TYPES.PRODUCT_DELETED, (data) => {
      console.log('🔄 Real-time: Product deleted by admin:', data)
      setProducts(prev => prev.filter(product => product.id !== data.id))
      cache.invalidate('products')
    })

    // Listen for admin product updates (fallback mechanism)
    const handleAdminProductUpdate = () => {
      console.log('🔄 Admin product update detected, refreshing data...')
      fetchData()
    }

    window.addEventListener('adminProductUpdated', handleAdminProductUpdate)

    // Real-time polling for continuous sync
    const startRealTimeSync = () => {
      let retryCount = 0
      const maxRetries = 3
      const retryDelays = [2000, 4000, 8000] // Exponential backoff
      
      const syncInterval = setInterval(async () => {
        try {
          const latestProducts = await fetchProductsFromAPI()
          retryCount = 0 // Reset retry count on success
          
          const currentProductIds = new Set(products.map(p => p.id || p._id))
          
          // Check for updated products (price changes, etc.)
          const updatedProducts = latestProducts.filter(p => {
            const productId = p.id || p._id
            if (!currentProductIds.has(productId)) return false // Skip new products
            
            const currentProduct = products.find(cp => (cp.id || cp._id) === productId)
            if (!currentProduct) return false
            
            // Check if prices changed
            const currentPrice = parseFloat(currentProduct.price) || 0
            const currentSellingPrice = parseFloat(currentProduct.selling_price) || 0
            const newPrice = parseFloat(p.price) || 0
            const newSellingPrice = parseFloat(p.selling_price) || 0
            
            const priceChanged = newPrice !== currentPrice
            const sellingPriceChanged = newSellingPrice !== currentSellingPrice
            
            return priceChanged || sellingPriceChanged
          })
          
          // Check for new products
          const newProducts = latestProducts.filter(p => 
            !currentProductIds.has(p.id || p._id)
          )
          
          if (updatedProducts.length > 0) {
            console.log(`🔄 Real-time sync: Updating ${updatedProducts.length} products`)
            setProducts(prev => {
              return prev.map(product => {
                const updatedProduct = updatedProducts.find(up => (up.id || up._id) === (product.id || product._id))
                if (updatedProduct) {
                  // Safe merge - preserve existing data structure
                  // DO NOT manually override price fields
                  return {
                    ...product,
                    ...updatedProduct
                  }
                }
                return product
              })
            })
            cache.invalidate('products')
          }
          
          if (newProducts.length > 0) {
            console.log(`🔄 Real-time sync: Found ${newProducts.length} new products`)
            setProducts(prev => {
              const existingIds = new Set(prev.map(p => p.id || p._id))
              const trulyNew = newProducts.filter(p => !existingIds.has(p.id || p._id))
              
              // Add new products without normalization to preserve backend data
              return [...prev, ...trulyNew]
            })
            cache.invalidate('products')
          }
        } catch (error) {
          console.error('❌ Real-time sync error:', error)
          
          // Handle timeout errors with retry logic
          if (error.message.includes('timeout') || error.message.includes('AbortError')) {
            retryCount++
            if (retryCount <= maxRetries) {
              const delay = retryDelays[retryCount - 1] || 8000
              console.log(`🔄 Retry ${retryCount}/${maxRetries} in ${delay}ms...`)
              setTimeout(() => {
                // Retry will happen on next interval
              }, delay)
            } else {
              console.error('❌ Max retries reached. Stopping sync.')
              clearInterval(syncInterval)
              // Show user-friendly message
              setError('Unable to load products. Please refresh the page.')
            }
          }
        }
      }, 10000) // Check every 10 seconds

      return syncInterval
    }

    const syncInterval = startRealTimeSync()

    // Subscribe to category changes
    const unsubscribeCategoryUpdated = dataSyncEvents.subscribe(EVENT_TYPES.CATEGORY_UPDATED, (data) => {
      console.log('🔄 Real-time: Category updated by admin:', data)
      // Refresh categories when they change
      fetchCategoriesFromAPI().then(categories => {
        setCategories(categories || [])
      })
    })

    // Cleanup listeners
    return () => {
      unsubscribeProductCreated?.()
      unsubscribeProductUpdated?.()
      unsubscribeProductDeleted?.()
      unsubscribeCategoryUpdated?.()
      window.removeEventListener('adminProductUpdated', handleAdminProductUpdate)
      clearInterval(syncInterval)
    }
  }, [fetchData, products])

  /**
   * Fetch categories separately (for real-time updates)
   */
  const fetchCategories = useCallback(async () => {
    try {
      const apiCategories = await fetchCategoriesFromAPI()
      setCategories(apiCategories || [])
    } catch (error) {
      console.error('❌ Error fetching categories:', error)
    }
  }, [])

  /**
   * Manually refresh products from API (call after adding/editing products)
   */
  const refreshProducts = useCallback(async () => {
    setLastFetch(null) // Force refresh
    await fetchData()
  }, [fetchData])

  // ========================================================================
  // PERSISTENCE - DISABLED
  // ========================================================================
  // Products and categories are NO LONGER saved to localStorage
  // API is the single source of truth
  
  /*
  // Removed localStorage persistence
  // Products now come ONLY from API
  */

  // ========================================================================
  // PRODUCT OPERATIONS (Original API - Backward Compatible)
  // ========================================================================

  /**
   * Add new product
   * Auto-initializes stock fields if not provided
   * Validates category if provided
   * Normalizes product schema before adding
   */
  const addProduct = (product) => {
    // Normalize product schema
    const normalizedProduct = normalizeProduct(product)
    
    // Validate product
    const validation = validateProduct(normalizedProduct, categories)
    if (!validation.valid) {
      return { success: false, error: validation.errors.join(', ') }
    }

    // Initialize stock defaults if needed
    const initializedProduct = initializeProductStock(normalizedProduct)
    
    // Sync stock with sizes
    const syncedProduct = syncProductStock(initializedProduct)

    setProducts((prev) => {
      // Check for duplicate ID
      if (prev.some((p) => String(p.id) === String(syncedProduct.id))) {
        return prev
      }
      
      return [...prev, syncedProduct]
    })

    return { success: true, product: syncedProduct }
  }

  /**
   * Delete product
   * Removes product from inventory
   */
  const deleteProduct = (id) => {
    const product = getProductById(id, products)
    if (!product) {
      return { success: false, error: 'Product not found' }
    }

    setProducts(prev => prev.filter(product => product.id !== id))
    return { success: true }
  }

  /**
   * Update existing product
   * Validates and normalizes product data
   * Syncs stock with size data
   */
  const updateProduct = (id, updates) => {
    setProducts((prev) => {
      const index = prev.findIndex((p) => String(p.id) === String(id))
      if (index === -1) {
        return prev
      }

      const currentProduct = prev[index]
      
      // Merge with updates and normalize
      const updatedProduct = normalizeProduct({
        ...currentProduct,
        ...updates,
        id, // Ensure ID doesn't change
        updatedAt: new Date().toISOString()
      })

      // Validate updated product
      const validation = validateProduct(updatedProduct, categories)
      if (!validation.valid) {
        return prev
      }

      // Sync stock with sizes
      const syncedProduct = syncProductStock(updatedProduct)

      const newProducts = [...prev]
      newProducts[index] = syncedProduct
      
      return newProducts
    })

    return { success: true }
  }

  // ========================================================================
  // INVENTORY / STOCK MANAGEMENT
  // ========================================================================

  /**
   * Increase product stock by amount
   * Handles size-specific stock updates
   * @param {string} productId - Product to update
   * @param {number} amount - Quantity to add
   * @param {string} size - Optional size for size-specific stock
   */
  const increaseStock = (productId, amount, size = null) => {
    if (amount <= 0) {
      return { success: false, error: 'Amount must be positive' }
    }

    return updateProduct(productId, (currentProduct) => {
      let updatedProduct = { ...currentProduct }
      
      if (size && currentProduct.sizes) {
        // Update specific size stock
        const sizeIndex = currentProduct.sizes.findIndex(s => s.size === size)
        if (sizeIndex === -1) {
          return currentProduct
        }
        
        // Update size stock
        updatedProduct.sizes = [...currentProduct.sizes]
        updatedProduct.sizes[sizeIndex] = {
          ...updatedProduct.sizes[sizeIndex],
          stock: (updatedProduct.sizes[sizeIndex].stock || 0) + amount
        }
        
        // Recalculate total stock
        const totalStock = updatedProduct.sizes.reduce((sum, s) => sum + (s.stock || 0), 0)
        updatedProduct.stock = totalStock
        updatedProduct.inStock = totalStock > 0
      } else {
        // Update total stock only
        const currentStock = currentProduct.stock || 0
        const newStock = currentStock + amount
        updatedProduct.stock = newStock
        updatedProduct.inStock = newStock > 0
      }

      return updatedProduct
    })
  }

  /**
   * Decrease product stock by amount
   * Prevents stock from going negative
   * Handles size-specific stock updates
   * @param {string} productId - Product to update
   * @param {number} amount - Quantity to subtract
   * @param {string} size - Optional size for size-specific stock
   */
  const decreaseStock = (productId, amount, size = null) => {
    if (amount <= 0) {
      return { success: false, error: 'Amount must be positive' }
    }

    return updateProduct(productId, (currentProduct) => {
      let updatedProduct = { ...currentProduct }
      
      if (size && currentProduct.sizes) {
        // Update specific size stock
        const sizeIndex = currentProduct.sizes.findIndex(s => s.size === size)
        if (sizeIndex === -1) {
          return currentProduct
        }
        
        const currentSizeStock = currentProduct.sizes[sizeIndex].stock || 0
        if (currentSizeStock < amount) {
          return currentProduct
        }
        
        // Update size stock
        updatedProduct.sizes = [...currentProduct.sizes]
        updatedProduct.sizes[sizeIndex] = {
          ...updatedProduct.sizes[sizeIndex],
          stock: currentSizeStock - amount
        }
        
        // Recalculate total stock
        const totalStock = updatedProduct.sizes.reduce((sum, s) => sum + (s.stock || 0), 0)
        updatedProduct.stock = totalStock
        updatedProduct.inStock = totalStock > 0
      } else {
        // Update total stock only
        const currentStock = currentProduct.stock || 0
        if (currentStock < amount) {
          return currentProduct
        }

        const newStock = currentStock - amount
        updatedProduct.stock = newStock
        updatedProduct.inStock = newStock > 0
      }


      return updatedProduct
    })
  }

  /**
   * Check if product is in stock (stock > 0)
   */
  const checkInStock = (productId) => {
    const product = getProductById(productId, products)
    return isInStock(product)
  }

  /**
   * Check if product has low stock
   */
  const checkLowStock = (productId) => {
    const product = getProductById(productId, products)
    return isLowStock(product)
  }

  /**
   * Get all low stock products
   */
  const getLowStockWarnings = () => {
    return getLowStockProducts(products)
  }

  // ========================================================================
  // CATEGORY MANAGEMENT
  // ========================================================================

  /**
   * Add new category
   * @param {string} name - Category name
   * @returns {Object} { success, category?, error? }
   */
  const addCategory = (name) => {
    if (!name || name.trim() === '') {
      return { success: false, error: 'Category name is required' }
    }

    // Check for duplicate names
    if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      return { success: false, error: 'Category already exists' }
    }

    const newCategory = {
      id: Date.now().toString(),
      name: name.trim()
    }

    setCategories(prev => [...prev, newCategory])
    return { success: true, category: newCategory }
  }

  /**
   * Delete category
   * Prevents deletion if products exist in that category
   * @param {string} categoryId - Category to delete
   */
  const deleteCategory = (categoryId) => {
    const category = getCategoryById(categoryId, categories)
    if (!category) {
      return { success: false, error: 'Category not found' }
    }

    // Check if any products exist in this category
    const productsInCategory = getProductsByCategory(categoryId, products)
    if (productsInCategory.length > 0) {
      return {
        success: false,
        error: `Cannot delete category with ${productsInCategory.length} product(s)`
      }
    }

    setCategories(prev => prev.filter(c => c.id !== categoryId))
    return { success: true }
  }

  /**
   * Update category name
   * @param {string} categoryId - Category to update
   * @param {string} newName - New name
   */
  const updateCategory = (categoryId, newName) => {
    if (!newName || newName.trim() === '') {
      return { success: false, error: 'Category name is required' }
    }

    const category = getCategoryById(categoryId, categories)
    if (!category) {
      return { success: false, error: 'Category not found' }
    }

    // Check for duplicate names (excluding current category)
    if (
      categories.some(
        c =>
          c.id !== categoryId &&
          c.name.toLowerCase() === newName.toLowerCase()
      )
    ) {
      return { success: false, error: 'Category name already exists' }
    }

    setCategories(prev =>
      prev.map(c =>
        c.id === categoryId ? { ...c, name: newName.trim() } : c
      )
    )
    return { success: true, category: { id: categoryId, name: newName } }
  }

  /**
   * Get all categories
   */
  const getAllCategories = () => {
    return categories
  }

  /**
   * Get category by ID
   */
  const getCategory = (categoryId) => {
    return getCategoryById(categoryId, categories)
  }

  /**
   * Get products in a category
   */
  const getProductsInCategory = (categoryId) => {
    return getProductsByCategory(categoryId, products)
  }

  /**
   * Get product by ID
   */
  const getProduct = (productId) => {
    return getProductById(productId, products)
  }

  // ========================================================================
  // CONTEXT VALUE
  // ========================================================================

  const value = {
    // Original API (backward compatible)
    products,
    addProduct,
    deleteProduct,
    updateProduct,
    loading,
    error,

    // New: Categories management
    categories,
    addCategory,
    deleteCategory,
    updateCategory,
    getAllCategories,
    getCategory,
    getProductsInCategory,

    // New: Inventory/Stock management
    increaseStock,
    decreaseStock,
    checkInStock,
    checkLowStock,
    getLowStockWarnings,

    // Performance optimizations
    refreshProducts,
    lastFetch,
    
    // Utility functions
    getProduct,
    getProductById: (id) => getProductById(id, products),
    getLowStockProducts,
    isInStock,
    isLowStock,
    validateProduct,
    initializeProductStock,
    syncProductStock
  }

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  )
}
