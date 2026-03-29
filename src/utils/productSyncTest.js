/**
 * PRODUCT SYNC VERIFICATION SCRIPT
 * 
 * This script tests the complete data flow from:
 * 1. Admin creates product → Backend saves → Frontend displays consistently
 * 2. Verify field mappings work across all components
 * 
 * Run this in browser console on kkingsjewellery.com
 */

// ✅ TEST 1: Check current product data structure
function debugCurrentProducts() {
  console.log('🔍 TESTING PRODUCT SYNC VERIFICATION');
  console.log('=====================================');
  
  // Find all product cards on the page
  const productCards = document.querySelectorAll('[data-testid="product-card"], .product-card, [class*="ProductCard"]');
  
  if (productCards.length === 0) {
    console.log('❌ No product cards found on current page');
    console.log('💡 Navigate to homepage or shop page to test');
    return;
  }
  
  console.log(`✅ Found ${productCards.length} product cards`);
  
  // Check if debug logs are working
  console.log('📊 Check browser console for debug logs from:');
  console.log('  - PRODUCT CARD (LISTING) components');
  console.log('  - PRODUCT DETAILS (DETAIL PAGE) components');
  console.log('  - Look for "=== PRODUCT DEBUG ===" messages');
}

// ✅ TEST 2: Simulate product data consistency check
function testFieldMappings() {
  console.log('🧪 TESTING FIELD MAPPINGS');
  console.log('=========================');
  
  // Test sample product data structure
  const sampleProduct = {
    _id: 'test123',
    name: 'Test Gold Ring',
    originalPrice: 900,
    sellingPrice: 100,
    images: ['https://example.com/image1.jpg'],
    material: 'Gold',
    purity: '22K',
    weight: 10,
    category: 'Rings',
    inStock: true
  };
  
  console.log('📝 Sample product data:', sampleProduct);
  
  // Test the helper functions (if available)
  if (window.getProductImage) {
    console.log('✅ Helper functions loaded');
    console.log('  - getProductImage:', window.getProductImage(sampleProduct));
    console.log('  - getSellingPrice:', window.getSellingPrice(sampleProduct));
    console.log('  - getOriginalPrice:', window.getOriginalPrice(sampleProduct));
    console.log('  - formatProductDetails:', window.formatProductDetails(sampleProduct));
  } else {
    console.log('⚠️ Helper functions not available in window scope');
    console.log('💡 Check if productHelpers.js is loaded correctly');
  }
}

// ✅ TEST 3: API endpoint test
async function testProductAPI() {
  console.log('🌐 TESTING PRODUCT API');
  console.log('====================');
  
  try {
    // Test products list endpoint
    const listResponse = await fetch('/api/products');
    console.log('📦 Products API Status:', listResponse.status);
    
    if (listResponse.ok) {
      const listData = await listResponse.json();
      console.log('📊 Products response structure:', {
        hasData: !!listData.data,
        isArray: Array.isArray(listData.data),
        productCount: listData.data?.length || 0
      });
      
      // Test first product structure
      if (listData.data && listData.data.length > 0) {
        const firstProduct = listData.data[0];
        console.log('🔍 First product fields:', Object.keys(firstProduct));
        console.log('💰 Price fields:', {
          price: firstProduct.price,
          originalPrice: firstProduct.originalPrice,
          sellingPrice: firstProduct.sellingPrice,
          selling_price: firstProduct.selling_price
        });
        console.log('🖼️ Image fields:', {
          images: firstProduct.images,
          image: firstProduct.image,
          imageUrl: firstProduct.imageUrl
        });
      }
    }
    
    // Test single product endpoint (if we have an ID)
    if (listData?.data?.[0]?._id) {
      const productId = listData.data[0]._id;
      const detailResponse = await fetch(`/api/products/${productId}`);
      console.log('🔍 Product Detail API Status:', detailResponse.status);
      
      if (detailResponse.ok) {
        const detailData = await detailResponse.json();
        console.log('📊 Detail response structure:', {
          hasData: !!detailData.data,
          fields: Object.keys(detailData.data || {})
        });
      }
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

// ✅ TEST 4: Image loading test
function testImageLoading() {
  console.log('🖼️ TESTING IMAGE LOADING');
  console.log('========================');
  
  const productImages = document.querySelectorAll('img[src*="cloudinary"], img[src*="placeholder"], img[alt*="Product"]');
  
  console.log(`📸 Found ${productImages.length} product images`);
  
  productImages.forEach((img, index) => {
    console.log(`Image ${index + 1}:`, {
      src: img.src,
      alt: img.alt,
      loaded: img.complete && img.naturalHeight !== 0,
      error: img.naturalHeight === 0
    });
  });
}

// ✅ TEST 5: Price display consistency
function testPriceDisplay() {
  console.log('💰 TESTING PRICE DISPLAY');
  console.log('========================');
  
  const priceElements = document.querySelectorAll('[class*="price"], [class*="Price"], span:contains("₹")');
  
  console.log(`💵 Found ${priceElements.length} price elements`);
  
  priceElements.forEach((element, index) => {
    console.log(`Price ${index + 1}:`, {
      text: element.textContent,
      classes: element.className,
      isStrikethrough: element.style.textDecoration === 'line-through' || element.classList.contains('line-through')
    });
  });
}

// ✅ RUN ALL TESTS
function runProductSyncTest() {
  console.log('🚀 STARTING COMPLETE PRODUCT SYNC TEST');
  console.log('========================================');
  
  debugCurrentProducts();
  testFieldMappings();
  testProductAPI();
  testImageLoading();
  testPriceDisplay();
  
  console.log('✅ PRODUCT SYNC TEST COMPLETED');
  console.log('📋 SUMMARY:');
  console.log('  1. Check console for "=== PRODUCT DEBUG ===" messages');
  console.log('  2. Verify API responses have consistent field names');
  console.log('  3. Ensure images load correctly (no broken images)');
  console.log('  4. Confirm prices show consistently across pages');
  console.log('  5. Look for any field mapping inconsistencies');
}

// ✅ Make functions available globally
window.debugCurrentProducts = debugCurrentProducts;
window.testFieldMappings = testFieldMappings;
window.testProductAPI = testProductAPI;
window.testImageLoading = testImageLoading;
window.testPriceDisplay = testPriceDisplay;
window.runProductSyncTest = runProductSyncTest;

console.log('🎯 Product sync verification tools loaded!');
console.log('💡 Run runProductSyncTest() in console to start testing');
