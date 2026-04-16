// 🔧 CART DATA CLEANUP AND FIX SCRIPT
// Run this in browser console to fix cart data issues

console.log('🔧 CART DATA CLEANUP AND FIX');
console.log('===========================');

// 1. Check current cart data
const currentCartData = localStorage.getItem('kk_cart');
console.log('📦 Current cart data:', currentCartData);

if (currentCartData) {
  try {
    const cartItems = JSON.parse(currentCartData);
    console.log('📋 Cart items count:', cartItems.length);
    
    if (cartItems.length > 0) {
      console.log('🔍 Analyzing first cart item:');
      const firstItem = cartItems[0];
      
      console.log('Item fields:', Object.keys(firstItem));
      console.log('Price fields:', {
        sellingPrice: firstItem.sellingPrice,
        originalPrice: firstItem.originalPrice,
        price: firstItem.price, // Should be undefined
        purchasePrice: firstItem.purchasePrice // Should be undefined
      });
      
      // 2. Clean up cart items - remove unwanted fields and fix prices
      const cleanedCart = cartItems.map(item => {
        const cleanedItem = {
          id: item.id || item._id,
          name: item.name || item.title || 'Product',
          image: item.image || item.images?.[0] || '',
          quantity: item.quantity || 1,
          sellingPrice: item.sellingPrice || item.selling_price || 0,
          originalPrice: item.originalPrice || item.original_price || 0,
          selectedSize: item.selectedSize || null
        };
        
        // Remove any unwanted price fields
        delete cleanedItem.price;
        delete cleanedItem.purchasePrice;
        delete cleanedItem.cost;
        delete cleanedItem.wholesalePrice;
        
        return cleanedItem;
      });
      
      console.log('✅ Cleaned cart items:', cleanedCart);
      
      // 3. Save cleaned cart back to localStorage
      localStorage.setItem('kk_cart', JSON.stringify(cleanedCart));
      console.log('💾 Saved cleaned cart to localStorage');
      
      // 4. Verify the fix
      const verifyCart = JSON.parse(localStorage.getItem('kk_cart') || '[]');
      if (verifyCart.length > 0) {
        const verifyItem = verifyCart[0];
        const hasUnwantedFields = verifyItem.price !== undefined || 
                                 verifyItem.purchasePrice !== undefined || 
                                 verifyItem.cost !== undefined;
        
        console.log('✅ Cart cleaned successfully:', !hasUnwantedFields);
        console.log('📊 First item after cleaning:', {
          id: verifyItem.id,
          name: verifyItem.name,
          sellingPrice: verifyItem.sellingPrice,
          originalPrice: verifyItem.originalPrice,
          quantity: verifyItem.quantity
        });
      }
      
      console.log('🔄 Refreshing page to apply changes...');
      setTimeout(() => {
        location.reload();
      }, 2000);
      
    } else {
      console.log('📦 Cart is empty - no cleanup needed');
    }
  } catch (error) {
    console.log('❌ Error processing cart data:', error);
    console.log('🧹 Clearing entire cart as fallback...');
    localStorage.removeItem('kk_cart');
    setTimeout(() => {
      location.reload();
    }, 1000);
  }
} else {
  console.log('📦 No cart data found');
}

console.log('\n🎯 CART CLEANUP COMPLETE');
console.log('The page will refresh automatically with cleaned cart data.');
