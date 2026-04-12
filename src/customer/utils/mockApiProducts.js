/**
 * Mock API Products Module
 * ===========================
 * Simulates backend API for product and category operations
 * All functions are Promise-based (async) ready for real backend integration
 * 
 * ARCHITECTURE:
 * - All functions return Promises (simulate async network calls)
 * - Internally uses localStorage as persistent storage (simulates database)
 * - Includes data validation and error handling
 * - Easy to replace with real API endpoints:
 *   Just change fetch/localStorage calls to real API endpoints
 * 
 * EXAMPLE MIGRATION:
 * Instead of: localStorage.getItem('kk_products')
 * Use:        fetch('/api/products').then(r => r.json())
 * 
 * All other logic stays the same - no UI changes needed!
 */

// ============================================================================
// PRODUCT API OPERATIONS (Async)
// ============================================================================

/**
 * Fetch all products from API
 * Simulates: GET /api/products
 * 
 * @returns {Promise<Array>} Array of products
 */
export const fetchProductsApi = async () => {
  return new Promise((resolve, reject) => {
    // Simulate network delay (0-100ms)
    setTimeout(() => {
      try {
        const data = localStorage.getItem('kk_products')
        const products = data ? JSON.parse(data) : []
        console.log('📡 [API] Fetched products:', products.length)
        resolve(products)
      } catch (error) {
        console.error('❌ [API] Failed to fetch products:', error.message)
        reject(error)
      }
    }, Math.random() * 100)
  })
}

/**
 * Fetch single product by ID
 * Simulates: GET /api/products/:id
 * 
 * @param {string} productId - Product ID to fetch
 * @returns {Promise<Object>} Product object or null
 */
export const fetchProductByIdApi = async (productId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const data = localStorage.getItem('kk_products')
        const products = data ? JSON.parse(data) : []
        const product = products.find(p => String(p.id) === String(productId)) || null
        
        if (!product) {
          console.error('❌ [API] Product not found:', productId)
          reject(new Error('Product not found'))
          return
        }
        
        console.log('📡 [API] Fetched product:', productId)
        resolve(product)
      } catch (error) {
        console.error('❌ [API] Failed to fetch product:', error.message)
        reject(error)
      }
    }, Math.random() * 100)
  })
}

/**
 * Create new product
 * Simulates: POST /api/products
 * 
 * @param {Object} productData - Product to create
 * @returns {Promise<Object>} Created product with ID
 */
export const createProductApi = async (productData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        // Validate required fields
        if (!productData.name && !productData.title) {
          const error = 'Product name is required'
          console.error('❌ [API] Validation failed:', error)
          reject(new Error(error))
          return
        }

        // Generate unique ID
        const newProduct = {
          ...productData,
          id: productData.id || Date.now().toString(),
          createdAt: productData.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        // Check for duplicate ID
        const data = localStorage.getItem('kk_products')
        const products = data ? JSON.parse(data) : []
        if (products.some(p => p.id === newProduct.id)) {
          const error = 'Product with this ID already exists'
          console.error('❌ [API] Duplicate ID:', error)
          reject(new Error(error))
          return
        }

        // Save to storage
        products.push(newProduct)
        localStorage.setItem('kk_products', JSON.stringify(products))
        
        console.log('✅ [API] Product created:', newProduct.id)
        resolve(newProduct)
      } catch (error) {
        console.error('❌ [API] Failed to create product:', error.message)
        reject(error)
      }
    }, Math.random() * 100)
  })
}

/**
 * Update existing product
 * Simulates: PUT /api/products/:id
 * 
 * @param {string} productId - Product ID to update
 * @param {Object} updates - Updated product data
 * @returns {Promise<Object>} Updated product
 */
export const updateProductApi = async (productId, updates) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const data = localStorage.getItem('kk_products')
        const products = data ? JSON.parse(data) : []
        const index = products.findIndex(p => String(p.id) === String(productId))

        if (index === -1) {
          const error = 'Product not found'
          console.error('❌ [API] Update failed:', error)
          reject(new Error(error))
          return
        }

        // Merge updates, preserve createdAt, update updatedAt
        const updated = {
          ...products[index],
          ...updates,
          id: productId, // Ensure ID doesn't change
          createdAt: products[index].createdAt, // Preserve creation date
          updatedAt: new Date().toISOString(),
        }

        products[index] = updated
        localStorage.setItem('kk_products', JSON.stringify(products))
        
        console.log('✅ [API] Product updated:', productId)
        resolve(updated)
      } catch (error) {
        console.error('❌ [API] Failed to update product:', error.message)
        reject(error)
      }
    }, Math.random() * 100)
  })
}

/**
 * Delete product
 * Simulates: DELETE /api/products/:id
 * 
 * @param {string} productId - Product ID to delete
 * @returns {Promise<Object>} Deleted product
 */
export const deleteProductApi = async (productId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const data = localStorage.getItem('kk_products')
        const products = data ? JSON.parse(data) : []
        const index = products.findIndex(p => String(p.id) === String(productId))

        if (index === -1) {
          const error = 'Product not found'
          console.error('❌ [API] Delete failed:', error)
          reject(new Error(error))
          return
        }

        const deleted = products[index]
        products.splice(index, 1)
        localStorage.setItem('kk_products', JSON.stringify(products))
        
        console.log('✅ [API] Product deleted:', productId)
        resolve(deleted)
      } catch (error) {
        console.error('❌ [API] Failed to delete product:', error.message)
        reject(error)
      }
    }, Math.random() * 100)
  })
}

/**
 * Fetch products in a specific category
 * Simulates: GET /api/products?category=:categoryId
 * 
 * @param {string} categoryId - Category ID to filter by
 * @returns {Promise<Array>} Products in category
 */
export const fetchProductsByCategoryApi = async (categoryId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const data = localStorage.getItem('kk_products')
        const products = data ? JSON.parse(data) : []
        const filtered = products.filter(p => String(p.categoryId) === String(categoryId))
        
        console.log('📡 [API] Fetched products in category:', categoryId, 'Count:', filtered.length)
        resolve(filtered)
      } catch (error) {
        console.error('❌ [API] Failed to fetch products by category:', error.message)
        reject(error)
      }
    }, Math.random() * 100)
  })
}

/**
 * Fetch products with low stock
 * Simulates: GET /api/products/stock/low
 * 
 * @returns {Promise<Array>} Products with low stock
 */
export const fetchLowStockProductsApi = async () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const data = localStorage.getItem('kk_products')
        const products = data ? JSON.parse(data) : []
        const lowStock = products.filter(
          p => p.stock !== undefined && p.lowStockThreshold !== undefined && p.stock <= p.lowStockThreshold
        )
        
        console.log('📡 [API] Fetched low stock products:', lowStock.length)
        resolve(lowStock)
      } catch (error) {
        console.error('❌ [API] Failed to fetch low stock products:', error.message)
        reject(error)
      }
    }, Math.random() * 100)
  })
}

/**
 * Update product stock (decrease)
 * Simulates: PATCH /api/products/:id/stock/decrease
 * Used for checkout/order placement
 * 
 * @param {string} productId - Product ID
 * @param {number} amount - Amount to decrease
 * @returns {Promise<Object>} Updated product
 */
export const decreaseProductStockApi = async (productId, amount) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        if (amount <= 0) {
          const error = 'Amount must be positive'
          console.error('❌ [API] Stock decrease failed:', error)
          reject(new Error(error))
          return
        }

        const data = localStorage.getItem('kk_products')
        const products = data ? JSON.parse(data) : []
        const index = products.findIndex(p => String(p.id) === String(productId))

        if (index === -1) {
          const error = 'Product not found'
          console.error('❌ [API] Stock decrease failed:', error)
          reject(new Error(error))
          return
        }

        const product = products[index]
        const currentStock = product.stock || 0

        if (currentStock < amount) {
          const error = `Insufficient stock. Available: ${currentStock}, Requested: ${amount}`
          console.error('❌ [API] Stock decrease failed:', error)
          reject(new Error(error))
          return
        }

        const updated = {
          ...product,
          stock: currentStock - amount,
          updatedAt: new Date().toISOString(),
        }

        products[index] = updated
        localStorage.setItem('kk_products', JSON.stringify(products))
        
        console.log(`✅ [API] Stock decreased for product ${productId}: ${currentStock} → ${updated.stock}`)
        resolve(updated)
      } catch (error) {
        console.error('❌ [API] Failed to decrease stock:', error.message)
        reject(error)
      }
    }, Math.random() * 100)
  })
}

/**
 * Update product stock (increase)
 * Simulates: PATCH /api/products/:id/stock/increase
 * Used for admin inventory restocking
 * 
 * @param {string} productId - Product ID
 * @param {number} amount - Amount to increase
 * @returns {Promise<Object>} Updated product
 */
export const increaseProductStockApi = async (productId, amount) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        if (amount <= 0) {
          const error = 'Amount must be positive'
          console.error('❌ [API] Stock increase failed:', error)
          reject(new Error(error))
          return
        }

        const data = localStorage.getItem('kk_products')
        const products = data ? JSON.parse(data) : []
        const index = products.findIndex(p => String(p.id) === String(productId))

        if (index === -1) {
          const error = 'Product not found'
          console.error('❌ [API] Stock increase failed:', error)
          reject(new Error(error))
          return
        }

        const product = products[index]
        const currentStock = product.stock || 0
        const updated = {
          ...product,
          stock: currentStock + amount,
          updatedAt: new Date().toISOString(),
        }

        products[index] = updated
        localStorage.setItem('kk_products', JSON.stringify(products))
        
        console.log(`✅ [API] Stock increased for product ${productId}: ${currentStock} → ${updated.stock}`)
        resolve(updated)
      } catch (error) {
        console.error('❌ [API] Failed to increase stock:', error.message)
        reject(error)
      }
    }, Math.random() * 100)
  })
}

// ============================================================================
// CATEGORY API OPERATIONS (Async)
// ============================================================================

/**
 * Fetch all categories
 * Simulates: GET /api/categories
 * 
 * @returns {Promise<Array>} Array of categories
 */
export const fetchCategoriesApi = async () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const data = localStorage.getItem('kk_categories')
        const categories = data ? JSON.parse(data) : []
        console.log('📡 [API] Fetched categories:', categories.length)
        resolve(categories)
      } catch (error) {
        console.error('❌ [API] Failed to fetch categories:', error.message)
        reject(error)
      }
    }, Math.random() * 100)
  })
}

/**
 * Fetch single category
 * Simulates: GET /api/categories/:id
 * 
 * @param {string} categoryId - Category ID
 * @returns {Promise<Object>} Category object
 */
export const fetchCategoryByIdApi = async (categoryId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const data = localStorage.getItem('kk_categories')
        const categories = data ? JSON.parse(data) : []
        const category = categories.find(c => String(c.id) === String(categoryId)) || null
        
        if (!category) {
          const error = 'Category not found'
          console.error('❌ [API] Category fetch failed:', error)
          reject(new Error(error))
          return
        }
        
        console.log('📡 [API] Fetched category:', categoryId)
        resolve(category)
      } catch (error) {
        console.error('❌ [API] Failed to fetch category:', error.message)
        reject(error)
      }
    }, Math.random() * 100)
  })
}

/**
 * Create new category
 * Simulates: POST /api/categories
 * 
 * @param {Object} categoryData - Category to create
 * @returns {Promise<Object>} Created category
 */
export const createCategoryApi = async (categoryData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        if (!categoryData.name || categoryData.name.trim() === '') {
          const error = 'Category name is required'
          console.error('❌ [API] Validation failed:', error)
          reject(new Error(error))
          return
        }

        const data = localStorage.getItem('kk_categories')
        const categories = data ? JSON.parse(data) : []

        // Check for duplicate name
        if (categories.some(c => c.name.toLowerCase() === categoryData.name.toLowerCase())) {
          const error = 'Category with this name already exists'
          console.error('❌ [API] Duplicate category:', error)
          reject(new Error(error))
          return
        }

        const newCategory = {
          id: categoryData.id || Date.now().toString(),
          name: categoryData.name.trim(),
          createdAt: categoryData.createdAt || new Date().toISOString(),
        }

        categories.push(newCategory)
        localStorage.setItem('kk_categories', JSON.stringify(categories))
        
        console.log('✅ [API] Category created:', newCategory.id)
        resolve(newCategory)
      } catch (error) {
        console.error('❌ [API] Failed to create category:', error.message)
        reject(error)
      }
    }, Math.random() * 100)
  })
}

/**
 * Update category
 * Simulates: PUT /api/categories/:id
 * 
 * @param {string} categoryId - Category ID
 * @param {Object} updates - Updated category data
 * @returns {Promise<Object>} Updated category
 */
export const updateCategoryApi = async (categoryId, updates) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const data = localStorage.getItem('kk_categories')
        const categories = data ? JSON.parse(data) : []
        const index = categories.findIndex(c => String(c.id) === String(categoryId))

        if (index === -1) {
          const error = 'Category not found'
          console.error('❌ [API] Update failed:', error)
          reject(new Error(error))
          return
        }

        // Check for duplicate name
        if (
          updates.name &&
          categories.some(
            c => c.id !== categoryId && c.name.toLowerCase() === updates.name.toLowerCase()
          )
        ) {
          const error = 'Category with this name already exists'
          console.error('❌ [API] Duplicate name:', error)
          reject(new Error(error))
          return
        }

        const updated = {
          ...categories[index],
          ...updates,
          id: categoryId,
          updatedAt: new Date().toISOString(),
        }

        categories[index] = updated
        localStorage.setItem('kk_categories', JSON.stringify(categories))
        
        console.log('✅ [API] Category updated:', categoryId)
        resolve(updated)
      } catch (error) {
        console.error('❌ [API] Failed to update category:', error.message)
        reject(error)
      }
    }, Math.random() * 100)
  })
}

/**
 * Delete category
 * Simulates: DELETE /api/categories/:id
 * 
 * @param {string} categoryId - Category ID
 * @returns {Promise<Object>} Deleted category
 */
export const deleteCategoryApi = async (categoryId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        // Check if products exist in this category
        const productData = localStorage.getItem('kk_products')
        const products = productData ? JSON.parse(productData) : []
        const productsInCategory = products.filter(p => String(p.categoryId) === String(categoryId))

        if (productsInCategory.length > 0) {
          const error = `Cannot delete category with ${productsInCategory.length} product(s)`
          console.error('❌ [API] Delete failed:', error)
          reject(new Error(error))
          return
        }

        const data = localStorage.getItem('kk_categories')
        const categories = data ? JSON.parse(data) : []
        const index = categories.findIndex(c => String(c.id) === String(categoryId))

        if (index === -1) {
          const error = 'Category not found'
          console.error('❌ [API] Delete failed:', error)
          reject(new Error(error))
          return
        }

        const deleted = categories[index]
        categories.splice(index, 1)
        localStorage.setItem('kk_categories', JSON.stringify(categories))
        
        console.log('✅ [API] Category deleted:', categoryId)
        resolve(deleted)
      } catch (error) {
        console.error('❌ [API] Failed to delete category:', error.message)
        reject(error)
      }
    }, Math.random() * 100)
  })
}
