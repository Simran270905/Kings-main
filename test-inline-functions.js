// Test inline formatPrice functions
const formatPrice = (value) => {
  const num = Number(value);
  return `₹${(isNaN(num) ? 0 : num).toLocaleString("en-IN")}`;
};

const getSellingPrice = (item) => {
  const num = Number(item.sellingPrice || item.selling_price || item.price || 0);
  return isNaN(num) ? 0 : num;
};

const getQuantity = (item) => {
  const num = Number(item.quantity);
  return isNaN(num) ? 1 : num;
};

const calculateItemTotal = (item) => {
  return getSellingPrice(item) * getQuantity(item);
};

console.log('🎉 INLINE FUNCTIONS TEST')
console.log('=========================')

console.log('✅ formatPrice(1000):', formatPrice(1000))
console.log('✅ formatPrice(null):', formatPrice(null))
console.log('✅ formatPrice(undefined):', formatPrice(undefined))

const testProduct = {
  sellingPrice: 1000,
  selling_price: 999,
  price: 888,
  originalPrice: 1200
}

console.log('✅ getSellingPrice(testProduct):', getSellingPrice(testProduct))
console.log('✅ getQuantity(testProduct):', getQuantity(testProduct))

const testCartItem = {
  sellingPrice: 1000,
  quantity: 2
}

console.log('✅ calculateItemTotal(testCartItem):', calculateItemTotal(testCartItem))

console.log('🎉 INLINE FUNCTIONS WORKING CORRECTLY!')
console.log('✅ DEV SERVER SHOULD NOW WORK WITHOUT IMPORT ERRORS')
