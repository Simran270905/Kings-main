/**
 * Data Sync Initializer
 * =====================
 * Ensures all product data files are properly normalized and synced
 * Runs on app initialization to fix any data inconsistencies
 */

import { bracelets } from '../data/bracelet'
import { chains } from '../data/chains'
import { rings } from '../data/rings'
import { pendals } from '../data/pendals'
import { bali } from '../data/bali'
import { kada } from '../data/kada'
import { rudraksh } from '../data/rudraksh'

import { normalizeProduct, normalizeProducts, syncProductStock } from './productSchemaNormalizer'
import { saveProducts, loadProducts } from './productService'

/**
 * Initialize and sync all product data
 * Ensures consistent schema across all products
 */
export const initializeProductData = () => {
  console.log('🔄 Initializing product data sync...')
  
  // Combine all product arrays
  const allRawProducts = [
    ...bracelets,
    ...chains, 
    ...rings,
    ...pendals,
    ...bali,
    ...kada,
    ...rudraksh
  ]
  
  // Normalize all products
  const normalizedProducts = normalizeProducts(allRawProducts)
  
  // Sync stock with sizes for all products
  const syncedProducts = normalizedProducts.map(product => syncProductStock(product))
  
  // Save to localStorage
  const saveResult = saveProducts(syncedProducts)
  
  if (saveResult) {
    console.log(`✅ Product data sync complete: ${syncedProducts.length} products normalized and saved`)
    
    // Log sync statistics
    const stats = {
      total: syncedProducts.length,
      withSizes: syncedProducts.filter(p => p.sizes && p.sizes.length > 0).length,
      inStock: syncedProducts.filter(p => p.inStock).length,
      outOfStock: syncedProducts.filter(p => !p.inStock).length,
      categories: [...new Set(syncedProducts.map(p => p.category))].length
    }
    
    console.log('📊 Sync Statistics:', stats)
    return syncedProducts
  } else {
    console.error('❌ Failed to save normalized product data')
    return null
  }
}

/**
 * Check if data sync is needed
 * Compares current localStorage data with normalized data
 */
export const needsDataSync = () => {
  const currentProducts = loadProducts()
  
  if (!currentProducts || currentProducts.length === 0) {
    console.log('📦 No products found in storage - sync needed')
    return true
  }
  
  // Check if any products are missing required fields
  const needsSync = currentProducts.some(product => {
    return !product.title || !product.image || product.stock === undefined
  })
  
  if (needsSync) {
    console.log('⚠️ Products missing required fields - sync needed')
    return true
  }
  
  console.log('✅ Products appear to be in sync')
  return false
}

/**
 * Auto-run data sync if needed
 * Call this on app startup
 */
export const autoSyncIfNeeded = () => {
  if (needsDataSync()) {
    return initializeProductData()
  }
  
  return loadProducts()
}
