// Test script to check product visibility
const API_BASE_URL = 'https://api.kkingsjewellery.com/api'

async function testProductsAPI() {
  try {
    console.log('🔍 Testing products API...')
    const response = await fetch(`${API_BASE_URL}/products`)
    const data = await response.json()
    console.log('📦 Products API Response:', data)
    console.log('📊 Products count:', data.data?.products?.length || 0)
    console.log('📊 Products sample:', data.data?.products?.slice(0, 3))
    
    return data
  } catch (error) {
    console.error('❌ API Error:', error)
    return null
  }
}

async function testCategoriesAPI() {
  try {
    console.log('🔍 Testing categories API...')
    const response = await fetch(`${API_BASE_URL}/categories`)
    const data = await response.json()
    console.log('📦 Categories API Response:', data)
    console.log('📊 Categories count:', data.data?.categories?.length || 0)
    console.log('📊 Categories sample:', data.data?.categories?.slice(0, 3))
    
    return data
  } catch (error) {
    console.error('❌ API Error:', error)
    return null
  }
}

async function main() {
  console.log('🚀 TESTING API ENDPOINTS')
  
  // Test categories first
  const categoriesData = await testCategoriesAPI()
  
  // Then test products
  const productsData = await testProductsAPI()
  
  console.log('\n📊 SUMMARY:')
  console.log('Categories:', categoriesData?.data?.categories?.length || 0)
  console.log('Products:', productsData?.data?.products?.length || 0)
  
  if (productsData?.data?.products?.length === 0) {
    console.log('🔍 ISSUE CONFIRMED: No products found in database')
    console.log('🔍 POSSIBLE CAUSES:')
    console.log('  1. Existing products may not have isActive field set')
    console.log('  2. New products may not be visible due to isActive filter')
  } else {
    console.log('✅ PRODUCTS FOUND:', productsData?.data?.products?.length, 'products')
    console.log('📊 Sample products:', productsData?.data?.products?.slice(0, 3))
  }
}

main().catch(console.error)
