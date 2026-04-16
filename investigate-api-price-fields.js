// 🔍 API PRICE FIELDS INVESTIGATION
console.log('🔍 INVESTIGATING API PRICE FIELDS');

// Test what the backend API returns
const testAPIResponse = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/products');
    const data = await response.json();
    
    if (data.success && data.data?.products?.length > 0) {
      const sampleProduct = data.data.products[0];
      
      console.log('📋 SAMPLE PRODUCT FROM API:');
      console.log('Product ID:', sampleProduct._id);
      console.log('Product Name:', sampleProduct.name);
      console.log('All Fields:', Object.keys(sampleProduct));
      console.log('Price Fields Found:', {
        originalPrice: sampleProduct.originalPrice,
        sellingPrice: sampleProduct.sellingPrice,
        price: sampleProduct.price, // This should not exist
        purchasePrice: sampleProduct.purchasePrice, // This should not exist
        mrp: sampleProduct.mrp,
        discountedPrice: sampleProduct.discountedPrice,
        salePrice: sampleProduct.salePrice
      });
      
      // Test our getSellingPrice function
      const testGetSellingPrice = (item) => {
        const num = Number(item.sellingPrice || item.selling_price || 0);
        return isNaN(num) ? 0 : num;
      };
      
      const sellingPrice = testGetSellingPrice(sampleProduct);
      console.log('✅ Calculated Selling Price:', sellingPrice);
      
      // Check if there are any problematic fields
      const hasUnwantedFields = sampleProduct.price !== undefined || sampleProduct.purchasePrice !== undefined;
      console.log('⚠️ Has unwanted price fields:', hasUnwantedFields);
      
      if (hasUnwantedFields) {
        console.log('❌ BACKEND IS RETURNING UNWANTED PRICE FIELDS');
        console.log('This needs to be fixed in the backend API response');
      } else {
        console.log('✅ Backend API response looks clean');
      }
      
    } else {
      console.log('❌ No products found or API error');
    }
  } catch (error) {
    console.log('❌ API Error:', error.message);
    console.log('Make sure backend is running on http://localhost:5000');
  }
};

// Auto-run the test
testAPIResponse();

console.log('🎯 INSTRUCTIONS:');
console.log('1. Make sure backend is running (npm start in backend folder)');
console.log('2. Run this script in browser console');
console.log('3. Check if backend returns unwanted price fields');
console.log('4. If unwanted fields exist, backend API needs fixing');
