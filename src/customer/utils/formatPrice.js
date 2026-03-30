/**
 * Shared price formatting utilities for null-safe price display
 * Prevents "Cannot read properties of null (reading 'toLocaleString')" errors
 */

/**
 * Format price value to Indian Rupee string with null safety
 * @param {any} value - The price value to format
 * @returns {string} Formatted price string (e.g., "₹1,000")
 */
export const formatPrice = (value) => {
  const num = Number(value);
  return `₹${(isNaN(num) ? 0 : num).toLocaleString("en-IN")}`;
};

/**
 * Convert any value to a safe number with fallback
 * @param {any} value - The value to convert
 * @param {number} fallback - Default value if conversion fails
 * @returns {number} Safe numeric value
 */
export const safeNum = (value, fallback = 0) => {
  const num = Number(value);
  return isNaN(num) ? fallback : num;
};

/**
 * Get the selling price from an item with fallback chain
 * @param {object} item - Product/cart item
 * @returns {number} Safe selling price
 */
export const getSellingPrice = (item) => {
  return safeNum(item.sellingPrice || item.selling_price || item.price || 0);
};

/**
 * Get the original price from an item with fallback
 * @param {object} item - Product/cart item
 * @returns {number} Safe original price
 */
export const getOriginalPrice = (item) => {
  return safeNum(item.originalPrice || item.original_price || 0);
};

/**
 * Get the quantity from an item with fallback
 * @param {object} item - Product/cart item
 * @returns {number} Safe quantity (minimum 1)
 */
export const getQuantity = (item) => {
  return safeNum(item.quantity, 1);
};

/**
 * Calculate item total with null safety
 * @param {object} item - Product/cart item
 * @returns {number} Item total price
 */
export const calculateItemTotal = (item) => {
  return getSellingPrice(item) * getQuantity(item);
};

/**
 * Calculate cart total with null safety
 * @param {Array} items - Array of cart items
 * @returns {number} Cart total
 */
export const calculateCartTotal = (items) => {
  return items.reduce((sum, item) => {
    return sum + calculateItemTotal(item);
  }, 0);
};
