// 🧹 BROWSER CONSOLE CLEANUP SCRIPT
// Run this in your browser console to clear cached data and refresh pricing

console.log('🧹 CLEANING BROWSER CACHE AND RESETING PRICING');

// Step 1: Clear all localStorage data
console.log('🗑️ Clearing localStorage...');
localStorage.clear();
console.log('✅ localStorage cleared');

// Step 2: Clear sessionStorage
console.log('🗑️ Clearing sessionStorage...');
sessionStorage.clear();
console.log('✅ sessionStorage cleared');

// Step 3: Force refresh the page to get fresh data
console.log('🔄 Refreshing page for fresh data...');
setTimeout(() => {
  window.location.reload();
}, 1000);

console.log('✅ Cleanup complete! Page will refresh automatically.');

// MANUAL INSTRUCTIONS:
// 1. Open browser console (F12)
// 2. Copy and paste this script
// 3. Press Enter
// 4. Wait for page to refresh
// 5. Test add to cart again

// ALTERNATIVE: Manual clear
// localStorage.clear();
// sessionStorage.clear();
// location.reload();
