// 📦 Admin Product Context - Shared product data for admin panel
import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react'
import adminApi from '../utils/adminApiService'

export const AdminProductContext = createContext()

export const useAdminProduct = () => {
  const context = useContext(AdminProductContext)
  if (!context) {
    throw new Error('useAdminProduct must be used within an AdminProductProvider')
  }
  return context
}

export const AdminProductProvider = ({ children }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastFetch, setLastFetch] = useState(null)
  const [refreshCount, setRefreshCount] = useState(0)

  // Debounce refresh to prevent excessive calls
  const debounceRefresh = useRef(null)
  const isInitialized = useRef(false)
  
  // Global refresh event listener
  useEffect(() => {
    const handleProductUpdate = () => {
      console.log('🔄 Global product refresh triggered')
      
      // Clear existing timeout
      if (debounceRefresh.current) {
        clearTimeout(debounceRefresh.current)
      }
      
      // Debounce the refresh with longer delay to prevent 429 errors
      debounceRefresh.current = setTimeout(() => {
        fetchProducts(true)
      }, 1000) // Increased to 1000ms debounce
    }

    window.addEventListener('adminProductUpdated', handleProductUpdate)
    return () => {
      window.removeEventListener('adminProductUpdated', handleProductUpdate)
      if (debounceRefresh.current) {
        clearTimeout(debounceRefresh.current)
      }
    }
  }, []) // Empty dependency array - only run once

  // Trigger global refresh
  const triggerGlobalRefresh = () => {
    window.dispatchEvent(new Event('adminProductUpdated'))
  }

  // Fetch products from admin API with rate limiting
  const fetchProducts = async (silent = false) => {
    try {
      // Prevent concurrent requests
      if (loading) {
        console.log('⏸️ Fetch already in progress, skipping')
        return
      }

      if (!silent) setLoading(true)
      setError(null)

      const data = await adminApi.getProducts()
      
      // Extract products array from response
      let productsArray = []
      if (data.success && data.data && data.data.products) {
        productsArray = data.data.products
      } else if (data.success && data.data && Array.isArray(data.data)) {
        productsArray = data.data
      } else if (data.data && data.data.products) {
        productsArray = data.data.products
      } else if (data.data && Array.isArray(data.data)) {
        productsArray = data.data
      } else if (data.products) {
        productsArray = data.products
      } else if (Array.isArray(data)) {
        productsArray = data
      }
      
      console.log('📦 Products data extraction:', {
        hasData: !!data,
        hasSuccess: !!data.success,
        dataStructure: data.data ? Object.keys(data.data) : 'no data',
        extractedCount: productsArray.length,
        isArray: Array.isArray(productsArray)
      })
      
      // Only update if data has changed to prevent unnecessary re-renders
      const hasChanged = products.length !== productsArray.length || 
        !products.every((product, index) => product._id === productsArray[index]?._id)
      
      // Safety guard: ensure productsArray is actually an array
      const safeProductsArray = Array.isArray(productsArray) ? productsArray : []
      
      if (hasChanged) {
        setProducts(safeProductsArray)
        setLastFetch(new Date())
        setRefreshCount(prev => prev + 1)
        console.log(`📦 Admin Products updated: ${safeProductsArray.length} products (refresh #${refreshCount + 1})`)
      } else {
        console.log('📦 Products data unchanged, skipping update')
      }
    } catch (err) {
      // Handle 429 rate limiting specifically
      if (err.message.includes('429') || err.message.includes('Too many requests')) {
        console.warn('⚠️ Rate limited, backing off...')
        setError('Rate limited. Please wait a moment.')
      } else {
        console.error('❌ Error fetching admin products:', err.message)
        setError(err.message)
      }
      setProducts([]) // Always ensure array on error
    } finally {
      if (!silent) setLoading(false)
    }
  }

  // Initial fetch with rate limiting
  useEffect(() => {
    if (!isInitialized.current && !loading) {
      isInitialized.current = true
      console.log('🚀 Initial product fetch')
      fetchProducts()
    }
  }, []) // Empty dependency array - only run once

  // Refresh products
  const refreshProducts = () => {
    fetchProducts()
  }

  // Stock helpers (consistent with ProductsManagement)
  const getTotalStock = (product) => {
    if (!product) return 0
    
    // Handle sizes array
    if (product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
      return product.sizes.reduce((sum, s) => sum + (s.stock || 0), 0)
    }
    
    // Handle single stock value
    return product.stock || 0
  }

  const getStockStatus = (product) => {
    if (!product) return 'ok'
    
    const total = getTotalStock(product)
    if (total <= 0) return 'out'
    if (total <= 5) return 'low'
    return 'ok'
  }

  // Get low stock products count (memoized)
  const getLowStockCount = useMemo(() => {
    if (!Array.isArray(products)) return 0
    
    const lowStock = products.filter(p => {
      const status = getStockStatus(p)
      return status === 'low'
    })
    
    // Only log in development and limit frequency
    if (import.meta.env.DEV && lowStock.length > 0) {
      console.log('🔍 Low stock calculation:', {
        totalProducts: products.length,
        lowStockProducts: lowStock.length,
        lowStockDetails: lowStock.map(p => ({ 
          name: p.name, 
          stock: getTotalStock(p),
          status: getStockStatus(p)
        }))
      })
    }
    return lowStock.length
  }, [products]) // Only recalculate when products change

  // Get out of stock products count
  const getOutOfStockCount = () => {
    return products.filter(p => getStockStatus(p) === 'out').length
  }

  // Get total products count (memoized)
  const getTotalProductsCount = useMemo(() => {
    return products.length
  }, [products])

  return (
    <AdminProductContext.Provider
      value={{
        products,
        loading,
        error,
        lastFetch,
        fetchProducts,
        refreshProducts,
        triggerGlobalRefresh,
        getTotalStock,
        getStockStatus,
        getLowStockCount, // Now memoized
        getOutOfStockCount,
        getTotalProductsCount // Now memoized
      }}
    >
      {children}
    </AdminProductContext.Provider>
  )
}

export default AdminProductProvider
