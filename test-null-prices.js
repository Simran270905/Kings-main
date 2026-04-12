// Test script to verify null price handling fix
const API_BASE_URL = 'https://api.kkingsjewellery.com/api'

async function testProductsAPI() {
  try {
    console.log('🔍 Testing products API for null price handling...')
    const response = await fetch(`${API_BASE_URL}/products`)
    const data = await response.json()
    
    console.log('📦 Products API Response:', data)
    console.log('📊 Products count:', data.data?.products?.length || 0)
    
    if (data.data?.products?.length > 0) {
      console.log('✅ Products found:', data.data?.products?.length)
      
      // Check for null prices
      const productsWithNullPrices = data.data.products.filter(p => 
        !p.sellingPrice || !p.originalPrice || !p.purchasePrice
      )
      
      if (productsWithNullPrices.length > 0) {
        console.log('⚠️ Products with null prices:', productsWithNullPrices.length)
        console.log('📊 Sample null price product:', productsWithNullPrices[0])
      } else {
        console.log('✅ All products have valid prices')
      }
      
      // Check price values
      console.log('📊 Sample product prices:')
      data.data.products.slice(0, 3).forEach((product, index) => {
        console.log(`  Product ${index + 1}:`)
        console.log(`    Name: ${product.name}`)
        console.log(`    Selling Price: ${product.sellingPrice}`)
        console.log(`    Original Price: ${product.originalPrice}`)
        console.log(`    Purchase Price: ${product.purchasePrice}`)
      })
    } else {
      console.log('⚠️ Still no products found')
    }
    
    return data
  } catch (error) {
    console.error('❌ API Error:', error.message)
    return null
  }
}

async function main() {
  console.log('🚀 TESTING NULL PRICE HANDLING FIX')
  console.log('=====================================')
  
  await testProductsAPI()
  
  console.log('\n📊 EXPECTED BEHAVIOR:')
  console.log('✅ Frontend should handle null prices gracefully')
  console.log('✅ No more "Cannot read properties of null (reading toLocaleString)" errors')
  console.log('✅ Prices should show as ₹0 when null/undefined')
  console.log('✅ ErrorBoundary should not catch any price formatting errors')
}

main().catch(console.error)
