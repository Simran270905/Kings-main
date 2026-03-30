/**
 * Frontend Payment Method Discount Calculator
 * Provides 10% discount for UPI and Netbanking payment methods
 */

/**
 * Calculate discount based on payment method and payment plan
 * @param {string} paymentMethod - The payment method ('upi', 'netbanking', 'cod', 'card')
 * @param {string} paymentPlan - The payment plan ('full' or 'partial')
 * @param {number} orderTotal - The original order total amount
 * @returns {Object} - Discount calculation result
 */
export const calculatePaymentMethodDiscount = (paymentMethod, paymentPlan, orderTotal) => {
  // Validate inputs
  if (!paymentMethod || !paymentPlan || typeof orderTotal !== 'number' || orderTotal <= 0) {
    return {
      hasDiscount: false,
      discountAmount: 0,
      discountedAmount: orderTotal,
      discountType: null,
      discountPercentage: 0,
      message: ''
    }
  }

  // ✅ UPDATED: Discount applies to UPI/Netbanking/Card + Full Payment
  const eligibleMethods = ['upi', 'netbanking', 'card']
  const normalizedMethod = paymentMethod.toLowerCase().trim()
  const normalizedPlan = paymentPlan.toLowerCase().trim()
  
  if (!eligibleMethods.includes(normalizedMethod) || normalizedPlan !== 'full') {
    return {
      hasDiscount: false,
      discountAmount: 0,
      discountedAmount: orderTotal,
      discountType: null,
      discountPercentage: 0,
      message: ''
    }
  }

  // Calculate 10% discount
  const discountPercentage = 10
  const discountAmount = Math.round((orderTotal * discountPercentage) / 100)
  const discountedAmount = orderTotal - discountAmount

  return {
    hasDiscount: true,
    discountAmount,
    discountedAmount,
    discountType: 'payment_method',
    discountPercentage,
    message: `🎉 10% OFF on Prepaid Payment!`
  }
}

/**
 * Apply discount to order total
 * @param {number} baseTotal - The base order total
 * @param {number} couponDiscount - Existing coupon discount
 * @param {string} paymentMethod - The selected payment method
 * @returns {Object} - Complete discount breakdown
 */
export const calculateTotalDiscount = (baseTotal, couponDiscount = 0, paymentMethod = '') => {
  const amountAfterCoupon = baseTotal - couponDiscount
  const paymentDiscountCalculation = calculatePaymentMethodDiscount(paymentMethod, amountAfterCoupon)
  
  return {
    originalAmount: baseTotal,
    couponDiscount,
    paymentMethodDiscount: paymentDiscountCalculation.discountAmount,
    totalDiscount: couponDiscount + paymentDiscountCalculation.discountAmount,
    finalAmount: paymentDiscountCalculation.discountedAmount,
    hasPaymentDiscount: paymentDiscountCalculation.hasDiscount,
    discountMessage: paymentDiscountCalculation.message
  }
}

/**
 * Calculate COD charge
 * @param {string} paymentMethod - The payment method ('cod' or others)
 * @returns {Object} - COD charge calculation result
 */
export const calculateCODCharge = (paymentMethod) => {
  const COD_CHARGE = 150
  const normalizedMethod = paymentMethod.toLowerCase().trim()
  
  if (normalizedMethod === 'cod') {
    return {
      hasCODCharge: true,
      codCharge: COD_CHARGE,
      message: '💵 ₹150 handling charge for Cash on Delivery'
    }
  }
  
  return {
    hasCODCharge: false,
    codCharge: 0,
    message: ''
  }
}

/**
 * Check if payment method is eligible for discount
 * @param {string} paymentMethod - The payment method to check
 * @param {string} paymentPlan - The payment plan ('full' or 'partial')
 * @returns {boolean} - Whether eligible for discount
 */
export const isPaymentMethodEligibleForDiscount = (paymentMethod, paymentPlan) => {
  if (!paymentMethod || !paymentPlan) return false
  
  const eligibleMethods = ['upi', 'netbanking', 'card'] // ✅ UPDATED: Include card
  const normalizedMethod = paymentMethod.toLowerCase().trim()
  const normalizedPlan = paymentPlan.toLowerCase().trim()
  
  return eligibleMethods.includes(normalizedMethod) && normalizedPlan === 'full'
}

/**
 * Format discount amount for display
 * @param {number} amount - The discount amount
 * @returns {string} - Formatted discount string
 */
export const formatDiscountAmount = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(amount)
}

/**
 * Calculate partial payment amounts (10/90 split) with discount and COD charge consideration
 * @param {number} totalAmount - The original order total
 * @param {string} paymentMethod - The payment method ('upi', 'netbanking', 'cod', 'card')
 * @param {string} paymentPlan - 'full' or 'partial'
 * @returns {Object} - Complete payment breakdown
 */
export const calculatePartialPayment = (totalAmount, paymentMethod, paymentPlan) => {
  // First calculate any prepaid discount (only for UPI/Netbanking + Full Payment)
  const discountCalculation = calculatePaymentMethodDiscount(paymentMethod, paymentPlan, totalAmount)
  
  // Calculate COD charge
  const codChargeCalculation = calculateCODCharge(paymentMethod)
  
  // Calculate final amount: original + COD charge - discount
  const finalAmount = totalAmount + codChargeCalculation.codCharge - discountCalculation.discountAmount
  
  if (paymentPlan === 'full') {
    return {
      paymentPlan: 'full',
      originalAmount: totalAmount,
      codCharge: codChargeCalculation.codCharge,
      discountAmount: discountCalculation.discountAmount,
      discountedAmount: discountCalculation.discountedAmount,
      finalAmount: finalAmount,
      advanceAmount: null,
      remainingAmount: null,
      advancePercent: null,
      remainingPercent: null,
      payNowAmount: finalAmount,
      hasDiscount: discountCalculation.hasDiscount,
      hasCODCharge: codChargeCalculation.hasCODCharge,
      codMessage: codChargeCalculation.message,
      discountMessage: discountCalculation.message
    }
  }
  
  // Partial payment calculation (10/90 split) - apply to final amount after COD charge and discount
  const advancePercent = 10
  const remainingPercent = 90
  const advanceAmount = Math.round((finalAmount * advancePercent) / 100)
  const remainingAmount = finalAmount - advanceAmount
  
  return {
    paymentPlan: 'partial',
    originalAmount: totalAmount,
    codCharge: codChargeCalculation.codCharge,
    discountAmount: discountCalculation.discountAmount,
    discountedAmount: discountCalculation.discountedAmount,
    finalAmount: finalAmount,
    advanceAmount,
    remainingAmount,
    advancePercent,
    remainingPercent,
    payNowAmount: advanceAmount,
    hasDiscount: discountCalculation.hasDiscount,
    hasCODCharge: codChargeCalculation.hasCODCharge,
    codMessage: codChargeCalculation.message,
    discountMessage: discountCalculation.message
  }
}

/**
 * Get payment plan badge text
 * @param {string} paymentPlan - The selected payment plan
 * @returns {string} - Badge text or empty string
 */
export const getPaymentPlanBadgeText = (paymentPlan) => {
  if (paymentPlan === 'partial') {
    return '💳 Pay just 10% now, rest 90% later!'
  }
  return ''
}

/**
 * Get discount badge text based on payment method and payment plan
 * @param {string} paymentMethod - The selected payment method
 * @param {string} paymentPlan - The selected payment plan
 * @returns {string} - Badge text or empty string
 */
export const getDiscountBadgeText = (paymentMethod, paymentPlan) => {
  if (isPaymentMethodEligibleForDiscount(paymentMethod, paymentPlan)) {
    return '🎉 10% OFF on Prepaid Payment!'
  }
  return ''
}
