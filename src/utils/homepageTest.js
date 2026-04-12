/**
 * HOMEPAGE PRODUCT CARD VERIFICATION
 * 
 * Run this script in the browser console on kkingsjewellery.com
 * to verify that the homepage product cards are working correctly.
 */

// ✅ TEST 1: Check if products are loading
function testHomepageProducts() {
  console.log('🔍 TESTING HOMEPAGE PRODUCTS');
  console.log('============================');
  
  // Look for product cards on the page
  const productCards = document.querySelectorAll('a[href*="/product/"]');
  console.log(`Found ${productCards.length} product cards on homepage`);
  
  if (productCards.length === 0) {
    console.log('❌ No product cards found - check if products are loading');
    return;
  }
  
  // Check first product card
  const firstCard = productCards[0];
  const img = firstCard.querySelector('img');
  const title = firstCard.querySelector('h3');
  const price = firstCard.querySelector('.text-red-700, .text-[#b91c1c]');
  
  console.log('First product card analysis:');
  console.log('- Image src:', img?.src?.substring(0, 100) + '...');
  console.log('- Image loaded:', img?.complete && img?.naturalHeight > 0);
  console.log('- Title text:', title?.textContent);
  console.log('- Price text:', price?.textContent);
  console.log('- Card HTML:', firstCard.innerHTML.substring(0, 200) + '...');
}

// ✅ TEST 2: Check console for debug logs
function testDebugLogs() {
  console.log('📊 Checking for debug logs...');
  console.log('Look for these messages in console:');
  console.log('- === PRODUCT DEBUG (HOME SECTION CARD) ===');
  console.log('- 🔧 PRODUCT CONTEXT DEBUG:');
  console.log('- 🏠 HOMEPAGE DEBUG:');
}

// ✅ TEST 3: Test API endpoints
async function testAPIEndpoints() {
  console.log('🌐 TESTING API ENDPOINTS');
  console.log('========================');
  
  try {
    // Test products API
    const productsRes = await fetch('/api/products');
    console.log('Products API status:', productsRes.status);
    
    if (productsRes.ok) {
      const productsData = await productsRes.json();
      console.log('Products response structure:', {
        hasData: !!productsData.data,
        isArray: Array.isArray(productsData.data),
        count: productsData.data?.length || 0
      });
      
      if (productsData.data?.length > 0) {
        const firstProduct = productsData.data[0];
        console.log('First product fields:', Object.keys(firstProduct));
        console.log('First product sample:', {
          name: firstProduct.name,
          sellingPrice: firstProduct.sellingPrice,
          originalPrice: firstProduct.originalPrice,
          images: firstProduct.images,
          image: firstProduct.image
        });
      }
    }
    
    // Test categories API
    const categoriesRes = await fetch('/api/categories');
    console.log('Categories API status:', categoriesRes.status);
    
    if (categoriesRes.ok) {
      const categoriesData = await categoriesRes.json();
      console.log('Categories response:', {
        hasData: !!categoriesData.data,
        isArray: Array.isArray(categoriesData.data),
        count: categoriesData.data?.length || 0
      });
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

// ✅ TEST 4: Check for image loading issues
function testImageLoading() {
  console.log('🖼️ TESTING IMAGE LOADING');
  console.log('========================');
  
  const images = document.querySelectorAll('img[src*="cloudinary"], img[src*="placeholder"], img[alt*="Product"]');
  
  console.log(`Found ${images.length} product images`);
  
  images.forEach((img, index) => {
    console.log(`Image ${index + 1}:`, {
      src: img.src.substring(0, 80) + '...',
      alt: img.alt,
      loaded: img.complete && img.naturalHeight > 0,
      error: img.naturalHeight === 0,
      width: img.naturalWidth,
      height: img.naturalHeight
    });
    
    if (img.naturalHeight === 0) {
      console.log(`❌ Image ${index + 1} failed to load`);
    }
  });
}

// ✅ RUN ALL TESTS
function runHomepageTest() {
  console.log('🚀 STARTING HOMEPAGE VERIFICATION');
  console.log('===================================');
  
  testHomepageProducts();
  testDebugLogs();
  testAPIEndpoints();
  testImageLoading();
  
  console.log('✅ HOMEPAGE TEST COMPLETED');
  console.log('📋 CHECKLIST:');
  console.log('  1. Products are loading from API');
  console.log('  2. Product cards are displaying');
  console.log('  3. Images are loading correctly');
  console.log('  4. Prices are showing correctly');
  console.log('  5. Debug logs are working');
}

// Make functions available globally
window.testHomepageProducts = testHomepageProducts;
window.testAPIEndpoints = testAPIEndpoints;
window.testImageLoading = testImageLoading;
window.runHomepageTest = runHomepageTest;

console.log('🎯 Homepage verification tools loaded!');
console.log('💡 Run runHomepageTest() in console to start testing');
