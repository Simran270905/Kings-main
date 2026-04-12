// 🔍 CART DATA DEBUG SCRIPT
// Run this in browser console to see what's actually in the cart

console.log('🔍 CART DATA DEBUG');
console.log('==================');

// 1. Check localStorage cart data
const cartData = localStorage.getItem('kk_cart');
console.log('📦 Raw localStorage data:', cartData);

if (cartData) {
  try {
    const parsedCart = JSON.parse(cartData);
    console.log('📋 Parsed cart data:', parsedCart);
    
    if (parsedCart.length > 0) {
      console.log('🔍 First cart item analysis:');
      const firstItem = parsedCart[0];
      
      console.log('Item ID:', firstItem.id);
      console.log('Item Name:', firstItem.name);
      console.log('All Fields:', Object.keys(firstItem));
      
      console.log('Price Fields Found:');
      console.log('- sellingPrice:', firstItem.sellingPrice);
      console.log('- originalPrice:', firstItem.originalPrice);
      console.log('- price:', firstItem.price); // This should be undefined
      console.log('- purchasePrice:', firstItem.purchasePrice); // This should be undefined
      console.log('- cost:', firstItem.cost); // This should be undefined
      
      // Check if item has unwanted fields
      const hasUnwantedFields = firstItem.price !== undefined || 
                               firstItem.purchasePrice !== undefined || 
                               firstItem.cost !== undefined;
      
      console.log('⚠️ Has unwanted price fields:', hasUnwantedFields);
      
      if (hasUnwantedFields) {
        console.log('❌ CART CONTAINS OLD DATA WITH WRONG PRICE FIELDS');
        console.log('🧹 SOLUTION: Clear localStorage and refresh');
        console.log('Run: localStorage.clear(); location.reload();');
      } else {
        console.log('✅ Cart data structure looks clean');
        
        // Check if sellingPrice is correct
        const expectedSellingPrice = firstItem.sellingPrice;
        const actualPrice = expectedSellingPrice;
        
        console.log('Expected sellingPrice:', expectedSellingPrice);
        console.log('Actual price from cart:', actualPrice);
        
        // If you know what the price should be, compare it here
        // For example, if you expect ₹1000:
        const expectedPrice = 1000; // Change this to what you expect
        const priceCorrect = actualPrice === expectedPrice;
        
        console.log('Price is correct:', priceCorrect);
        
        if (!priceCorrect) {
          console.log('❌ Price value is wrong');
          console.log('Expected:', expectedPrice);
          console.log('Actual:', actualPrice);
        }
      }
    } else {
      console.log('📦 Cart is empty');
    }
  } catch (error) {
    console.log('❌ Error parsing cart data:', error);
  }
} else {
  console.log('📦 No cart data in localStorage');
}

console.log('\n🧹 QUICK FIX COMMANDS:');
console.log('localStorage.clear();');
console.log('location.reload();');

console.log('\n🔍 CART DEBUG COMPLETE');
