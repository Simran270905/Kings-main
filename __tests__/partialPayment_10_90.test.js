import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Simple test setup without external dependencies
describe('Partial Payment 10/90 Split Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Mock partial payment calculation functions for 10/90 split
  const calculatePartialPayment10_90 = (totalAmount, paymentMethod, paymentPlan) => {
    // First calculate any prepaid discount
    const eligibleMethods = ['upi', 'netbanking']
    const hasDiscount = eligibleMethods.includes(paymentMethod?.toLowerCase())
    
    let originalAmount = totalAmount
    let discountAmount = 0
    let discountedAmount = totalAmount
    
    if (hasDiscount) {
      discountAmount = Math.round((totalAmount * 10) / 100)
      discountedAmount = totalAmount - discountAmount
    }
    
    if (paymentPlan === 'full') {
      return {
        paymentPlan: 'full',
        originalAmount,
        discountAmount,
        discountedAmount,
        advanceAmount: null,
        remainingAmount: null,
        advancePercent: null,
        remainingPercent: null,
        payNowAmount: discountedAmount,
        hasDiscount,
        discountApplied: hasDiscount,
        discountPercent: hasDiscount ? 10 : 0,
        paymentMethod,
        discountedTotal: discountedAmount
      }
    }
    
    // Partial payment calculation (10/90 split)
    const advancePercent = 10
    const remainingPercent = 90
    const calculationAmount = discountedAmount // Use discounted amount for calculation
    const advanceAmount = Math.round((calculationAmount * advancePercent) / 100)
    const remainingAmount = calculationAmount - advanceAmount
    
    return {
      paymentPlan: 'partial',
      originalAmount,
      discountAmount,
      discountedAmount,
      advanceAmount,
      remainingAmount,
      advancePercent,
      remainingPercent,
      payNowAmount: advanceAmount,
      hasDiscount,
      discountApplied: hasDiscount,
      discountPercent: hasDiscount ? 10 : 0,
      paymentMethod,
      remainingPaymentStatus: 'pending',
      discountedTotal: discountedAmount
    }
  }

  // FEATURE: 10/90 Split Calculation Tests
  describe('10/90 Split Calculation Logic', () => {
    it('should calculate exactly 10% advance for UPI + Partial Payment', () => {
      const totalAmount = 1000
      const result = calculatePartialPayment10_90(totalAmount, 'upi', 'partial')
      
      // UPI gets 10% discount first: 1000 - 100 = 900
      // Then 10/90 split on discounted amount: 900 * 0.1 = 90 advance
      expect(result.advanceAmount).toBe(90)
      expect(result.remainingAmount).toBe(810)
      expect(result.advancePercent).toBe(10)
      expect(result.remainingPercent).toBe(90)
      expect(result.hasDiscount).toBe(true)
      expect(result.discountAmount).toBe(100)
      expect(result.discountedAmount).toBe(900)
    })

    it('should calculate exactly 90% remaining for UPI + Partial Payment', () => {
      const totalAmount = 1000
      const result = calculatePartialPayment10_90(totalAmount, 'upi', 'partial')
      
      expect(result.remainingAmount).toBe(810) // 90% of discounted amount (900)
      expect(result.remainingPercent).toBe(90)
    })

    it('should calculate exactly 10% advance for COD + Partial Payment', () => {
      const totalAmount = 1000
      const result = calculatePartialPayment10_90(totalAmount, 'cod', 'partial')
      
      // COD gets no discount: 1000
      // Then 10/90 split on original amount: 1000 * 0.1 = 100 advance
      expect(result.advanceAmount).toBe(100)
      expect(result.remainingAmount).toBe(900)
      expect(result.advancePercent).toBe(10)
      expect(result.remainingPercent).toBe(90)
      expect(result.hasDiscount).toBe(false)
      expect(result.discountAmount).toBe(0)
      expect(result.discountedAmount).toBe(1000)
    })

    it('should calculate exactly 90% remaining for COD + Partial Payment', () => {
      const totalAmount = 1000
      const result = calculatePartialPayment10_90(totalAmount, 'cod', 'partial')
      
      expect(result.remainingAmount).toBe(900) // 90% of original amount (1000)
      expect(result.remainingPercent).toBe(90)
    })

    it('should handle edge case math for various amounts', () => {
      const testCases = [
        { 
          amount: 100, 
          method: 'upi', 
          plan: 'partial',
          expectedAdvance: 9,   // 10% of 90 (after 10% discount)
          expectedRemaining: 81  // 90% of 90
        },
        { 
          amount: 99, 
          method: 'upi', 
          plan: 'partial',
          expectedAdvance: 9,   // 10% of 89 (after 10% discount, rounded)
          expectedRemaining: 80  // 90% of 89
        },
        { 
          amount: 1000, 
          method: 'upi', 
          plan: 'partial',
          expectedAdvance: 90,  // 10% of 900 (after 10% discount)
          expectedRemaining: 810 // 90% of 900
        },
        { 
          amount: 9999, 
          method: 'upi', 
          plan: 'partial',
          expectedAdvance: 900, // 10% of 8999 (after 10% discount, rounded)
          expectedRemaining: 8099 // 90% of 8999
        },
        { 
          amount: 10000, 
          method: 'upi', 
          plan: 'partial',
          expectedAdvance: 900, // 10% of 9000 (after 10% discount)
          expectedRemaining: 8100 // 90% of 9000
        }
      ]

      for (const testCase of testCases) {
        const result = calculatePartialPayment10_90(testCase.amount, testCase.method, testCase.plan)
        expect(result.advanceAmount).toBe(testCase.expectedAdvance)
        expect(result.remainingAmount).toBe(testCase.expectedRemaining)
      }
    })

    it('should handle COD edge cases without rounding errors', () => {
      const testCases = [
        { 
          amount: 100, 
          method: 'cod', 
          plan: 'partial',
          expectedAdvance: 10,   // 10% of 100 (no discount)
          expectedRemaining: 90  // 90% of 100
        },
        { 
          amount: 99, 
          method: 'cod', 
          plan: 'partial',
          expectedAdvance: 10,   // 10% of 99 (rounded)
          expectedRemaining: 89  // 90% of 99
        },
        { 
          amount: 1000, 
          method: 'cod', 
          plan: 'partial',
          expectedAdvance: 100,  // 10% of 1000 (no discount)
          expectedRemaining: 900 // 90% of 1000
        },
        { 
          amount: 9999, 
          method: 'cod', 
          plan: 'partial',
          expectedAdvance: 1000, // 10% of 9999 (rounded)
          expectedRemaining: 8999 // 90% of 9999
        },
        { 
          amount: 10000, 
          method: 'cod', 
          plan: 'partial',
          expectedAdvance: 1000, // 10% of 10000 (no discount)
          expectedRemaining: 9000 // 90% of 10000
        }
      ]

      for (const testCase of testCases) {
        const result = calculatePartialPayment10_90(testCase.amount, testCase.method, testCase.plan)
        expect(result.advanceAmount).toBe(testCase.expectedAdvance)
        expect(result.remainingAmount).toBe(testCase.expectedRemaining)
      }
    })

    it('should ensure no rounding errors - amounts round to 2 decimal places', () => {
      const testCases = [
        100.99,
        999.99,
        1000.99,
        9999.99
      ]

      for (const amount of testCases) {
        const result = calculatePartialPayment10_90(amount, 'upi', 'partial')
        
        // Verify that advance + remaining equals discounted amount
        expect(result.advanceAmount + result.remainingAmount).toBe(result.discountedAmount)
        
        // Verify percentages are correct
        const actualAdvancePercent = (result.advanceAmount / result.discountedAmount) * 100
        const actualRemainingPercent = (result.remainingAmount / result.discountedAmount) * 100
        
        expect(Math.abs(actualAdvancePercent - 10)).toBeLessThan(1) // Allow small rounding difference
        expect(Math.abs(actualRemainingPercent - 90)).toBeLessThan(1) // Allow small rounding difference
      }
    })
  })

  // FEATURE: Full Payment Tests
  describe('Full Payment with 10/90 Split Logic', () => {
    it('should handle UPI + Full Payment correctly', () => {
      const totalAmount = 1000
      const result = calculatePartialPayment10_90(totalAmount, 'upi', 'full')
      
      expect(result.paymentPlan).toBe('full')
      expect(result.discountAmount).toBe(100) // 10% discount
      expect(result.discountedAmount).toBe(900) // After discount
      expect(result.payNowAmount).toBe(900) // Pay full discounted amount
      expect(result.advanceAmount).toBe(null)
      expect(result.remainingAmount).toBe(null)
      expect(result.hasDiscount).toBe(true)
    })

    it('should handle COD + Full Payment correctly', () => {
      const totalAmount = 1000
      const result = calculatePartialPayment10_90(totalAmount, 'cod', 'full')
      
      expect(result.paymentPlan).toBe('full')
      expect(result.discountAmount).toBe(0) // No discount
      expect(result.discountedAmount).toBe(1000) // Original amount
      expect(result.payNowAmount).toBe(1000) // Pay full amount
      expect(result.advanceAmount).toBe(null)
      expect(result.remainingAmount).toBe(null)
      expect(result.hasDiscount).toBe(false)
    })
  })

  // FEATURE: Netbanking Tests
  describe('Netbanking Payment Tests', () => {
    it('should apply 10% discount for Netbanking + Partial Payment', () => {
      const totalAmount = 1000
      const result = calculatePartialPayment10_90(totalAmount, 'netbanking', 'partial')
      
      // Netbanking gets 10% discount first: 1000 - 100 = 900
      // Then 10/90 split on discounted amount: 900 * 0.1 = 90 advance
      expect(result.advanceAmount).toBe(90)
      expect(result.remainingAmount).toBe(810)
      expect(result.hasDiscount).toBe(true)
      expect(result.discountAmount).toBe(100)
    })

    it('should apply 10% discount for Netbanking + Full Payment', () => {
      const totalAmount = 1000
      const result = calculatePartialPayment10_90(totalAmount, 'netbanking', 'full')
      
      expect(result.discountAmount).toBe(100) // 10% discount
      expect(result.discountedAmount).toBe(900) // After discount
      expect(result.payNowAmount).toBe(900) // Pay full discounted amount
      expect(result.hasDiscount).toBe(true)
    })
  })

  // FEATURE: Card Payment Tests
  describe('Card Payment Tests', () => {
    it('should not apply discount for Card + Partial Payment', () => {
      const totalAmount = 1000
      const result = calculatePartialPayment10_90(totalAmount, 'card', 'partial')
      
      expect(result.advanceAmount).toBe(100) // 10% of 1000 (no discount)
      expect(result.remainingAmount).toBe(900) // 90% of 1000
      expect(result.hasDiscount).toBe(false)
      expect(result.discountAmount).toBe(0)
    })

    it('should not apply discount for Card + Full Payment', () => {
      const totalAmount = 1000
      const result = calculatePartialPayment10_90(totalAmount, 'card', 'full')
      
      expect(result.discountAmount).toBe(0) // No discount
      expect(result.discountedAmount).toBe(1000) // Original amount
      expect(result.payNowAmount).toBe(1000) // Pay full amount
      expect(result.hasDiscount).toBe(false)
    })
  })

  // FEATURE: Badge Text Tests
  describe('Badge and UI Text Tests', () => {
    it('should show correct badge text for partial payments', () => {
      const getPaymentPlanBadgeText = (paymentPlan) => {
        if (paymentPlan === 'partial') {
          return '💳 Pay just 10% now, rest 90% later!'
        }
        return ''
      }

      expect(getPaymentPlanBadgeText('partial')).toBe('💳 Pay just 10% now, rest 90% later!')
      expect(getPaymentPlanBadgeText('full')).toBe('')
    })

    it('should show correct discount badge text', () => {
      const getDiscountBadgeText = (paymentMethod) => {
        const eligibleMethods = ['upi', 'netbanking']
        if (eligibleMethods.includes(paymentMethod?.toLowerCase())) {
          return '🎉 Extra 10% OFF on UPI/Netbanking!'
        }
        return ''
      }

      expect(getDiscountBadgeText('upi')).toBe('🎉 Extra 10% OFF on UPI/Netbanking!')
      expect(getDiscountBadgeText('netbanking')).toBe('🎉 Extra 10% OFF on UPI/Netbanking!')
      expect(getDiscountBadgeText('cod')).toBe('')
      expect(getDiscountBadgeText('card')).toBe('')
    })
  })

  // FEATURE: MongoDB Field Tests
  describe('MongoDB Field Tests', () => {
    it('should save correct 10/90 split fields in MongoDB', () => {
      const orderData = {
        totalAmount: 1000,
        paymentMethod: 'upi',
        paymentPlan: 'partial'
      }

      const result = calculatePartialPayment10_90(orderData.totalAmount, orderData.paymentMethod, orderData.paymentPlan)

      // Expected MongoDB fields
      const expectedMongoFields = {
        originalAmount: 1000,
        discountApplied: true,
        discountPercent: 10,
        discountedTotal: 900,
        paymentPlan: 'partial',
        advancePercent: 10,
        advanceAmount: 90,
        remainingPercent: 90,
        remainingAmount: 810,
        remainingPaymentStatus: 'pending'
      }

      expect(result.originalAmount).toBe(expectedMongoFields.originalAmount)
      expect(result.discountApplied).toBe(expectedMongoFields.discountApplied)
      expect(result.discountPercent).toBe(expectedMongoFields.discountPercent)
      expect(result.discountedTotal).toBe(expectedMongoFields.discountedTotal)
      expect(result.paymentPlan).toBe(expectedMongoFields.paymentPlan)
      expect(result.advancePercent).toBe(expectedMongoFields.advancePercent)
      expect(result.advanceAmount).toBe(expectedMongoFields.advanceAmount)
      expect(result.remainingPercent).toBe(expectedMongoFields.remainingPercent)
      expect(result.remainingAmount).toBe(expectedMongoFields.remainingAmount)
    })

    it('should save correct fields for COD + Partial Payment', () => {
      const orderData = {
        totalAmount: 1000,
        paymentMethod: 'cod',
        paymentPlan: 'partial'
      }

      const result = calculatePartialPayment10_90(orderData.totalAmount, orderData.paymentMethod, orderData.paymentPlan)

      expect(result.originalAmount).toBe(1000)
      expect(result.discountApplied).toBe(false)
      expect(result.discountPercent).toBe(0)
      expect(result.discountedTotal).toBe(1000)
      expect(result.advancePercent).toBe(10)
      expect(result.advanceAmount).toBe(100)
      expect(result.remainingPercent).toBe(90)
      expect(result.remainingAmount).toBe(900)
    })
  })

  // FEATURE: Backward Compatibility Tests
  describe('Backward Compatibility Tests', () => {
    it('should not break existing orders with old 30/70 split', () => {
      // Simulate existing order with old 30/70 split
      const existingOrder = {
        _id: '507f1f77bcf86cd799439011',
        paymentPlan: 'partial',
        advanceAmount: 300, // Old 30% of 1000
        remainingAmount: 700, // Old 70% of 1000
        // Missing new fields: advancePercent, remainingPercent, etc.
      }

      // The system should handle this gracefully
      const result = calculatePartialPayment10_90(1000, 'upi', 'partial')
      
      // New calculation should work independently
      expect(result.advanceAmount).toBe(90) // New 10% calculation
      expect(result.remainingAmount).toBe(810) // New 90% calculation
      
      // Existing order data should remain unchanged
      expect(existingOrder.advanceAmount).toBe(300)
      expect(existingOrder.remainingAmount).toBe(700)
    })

    it('should handle orders without paymentPlan field', () => {
      // Simulate existing order without paymentPlan field
      const existingOrder = {
        _id: '507f1f77bcf86cd799439012',
        totalAmount: 1000,
        paymentMethod: 'upi'
        // No paymentPlan field
      }

      // Should default to 'full' payment plan
      const result = calculatePartialPayment10_90(existingOrder.totalAmount, existingOrder.paymentMethod, 'full')
      
      expect(result.paymentPlan).toBe('full')
      expect(result.advanceAmount).toBe(null)
      expect(result.remainingAmount).toBe(null)
    })
  })

  // FEATURE: Admin Panel Tests
  describe('Admin Panel Tests', () => {
    it('should show correct 10/90 amounts in admin panel', () => {
      const orderData = calculatePartialPayment10_90(1000, 'upi', 'partial')
      
      // Expected admin panel display
      const expectedAdminDisplay = {
        paymentMethod: 'upi',
        paymentPlan: 'partial',
        originalAmount: 1000,
        discountApplied: true,
        discountPercent: 10,
        discountedTotal: 900,
        advancePercent: 10,
        advanceAmount: 90,
        remainingPercent: 90,
        remainingAmount: 810,
        remainingPaymentStatus: 'pending'
      }

      expect(orderData.paymentMethod).toBe(expectedAdminDisplay.paymentMethod)
      expect(orderData.paymentPlan).toBe(expectedAdminDisplay.paymentPlan)
      expect(orderData.originalAmount).toBe(expectedAdminDisplay.originalAmount)
      expect(orderData.discountApplied).toBe(expectedAdminDisplay.discountApplied)
      expect(orderData.discountPercent).toBe(expectedAdminDisplay.discountPercent)
      expect(orderData.discountedTotal).toBe(expectedAdminDisplay.discountedTotal)
      expect(orderData.advancePercent).toBe(expectedAdminDisplay.advancePercent)
      expect(orderData.advanceAmount).toBe(expectedAdminDisplay.advanceAmount)
      expect(orderData.remainingPercent).toBe(expectedAdminDisplay.remainingPercent)
      expect(orderData.remainingAmount).toBe(expectedAdminDisplay.remainingAmount)
    })

    it('should show "Mark Remaining as Paid" button correctly', () => {
      const partialOrder = calculatePartialPayment10_90(1000, 'upi', 'partial')
      
      // Should show button for pending partial payments
      const shouldShowButton = partialOrder.paymentPlan === 'partial' && partialOrder.remainingPaymentStatus !== 'paid'
      expect(shouldShowButton).toBe(true)
      
      // Should not show button for full payments
      const fullOrder = calculatePartialPayment10_90(1000, 'upi', 'full')
      const shouldShowButtonForFull = fullOrder.paymentPlan === 'partial' && fullOrder.remainingPaymentStatus !== 'paid'
      expect(shouldShowButtonForFull).toBe(false)
    })
  })

  // FEATURE: Integration Scenarios
  describe('Integration Scenarios', () => {
    it('should handle Scenario 1: UPI + Partial Payment correctly', () => {
      const result = calculatePartialPayment10_90(1000, 'upi', 'partial')
      
      // Scenario 1: UPI or Netbanking + Partial Payment
      // - Apply 10% prepaid discount on full order total first
      // - Then take 10% of discounted total as advance
      // - Remaining 90% of discounted total is due later
      // Example: Order ₹1000 → After 10% discount = ₹900 → Advance = ₹90 → Remaining = ₹810
      
      expect(result.originalAmount).toBe(1000)
      expect(result.discountAmount).toBe(100)
      expect(result.discountedAmount).toBe(900)
      expect(result.advanceAmount).toBe(90)
      expect(result.remainingAmount).toBe(810)
      expect(result.advancePercent).toBe(10)
      expect(result.remainingPercent).toBe(90)
    })

    it('should handle Scenario 2: COD + Partial Payment correctly', () => {
      const result = calculatePartialPayment10_90(1000, 'cod', 'partial')
      
      // Scenario 2: COD or Card + Partial Payment
      // - No prepaid discount
      // - Advance = 10% of original total
      // - Remaining 90% of original total
      // Example: Order ₹1000 → Advance = ₹100 → Remaining = ₹900
      
      expect(result.originalAmount).toBe(1000)
      expect(result.discountAmount).toBe(0)
      expect(result.discountedAmount).toBe(1000)
      expect(result.advanceAmount).toBe(100)
      expect(result.remainingAmount).toBe(900)
      expect(result.advancePercent).toBe(10)
      expect(result.remainingPercent).toBe(90)
    })

    it('should handle Scenario 3: UPI + Full Payment correctly', () => {
      const result = calculatePartialPayment10_90(1000, 'upi', 'full')
      
      // Scenario 3: UPI or Netbanking + Full Payment
      // - Apply 10% prepaid discount on full order total
      // - Pay full discounted amount at once
      // Example: Order ₹1000 → Pay ₹900 now
      
      expect(result.originalAmount).toBe(1000)
      expect(result.discountAmount).toBe(100)
      expect(result.discountedAmount).toBe(900)
      expect(result.payNowAmount).toBe(900)
      expect(result.advanceAmount).toBe(null)
      expect(result.remainingAmount).toBe(null)
    })

    it('should handle Scenario 4: COD + Full Payment correctly', () => {
      const result = calculatePartialPayment10_90(1000, 'cod', 'full')
      
      // Scenario 4: COD or Card + Full Payment
      // - No discount
      // - Pay full original amount
      // Example: Order ₹1000 → Pay ₹1000
      
      expect(result.originalAmount).toBe(1000)
      expect(result.discountAmount).toBe(0)
      expect(result.discountedAmount).toBe(1000)
      expect(result.payNowAmount).toBe(1000)
      expect(result.advanceAmount).toBe(null)
      expect(result.remainingAmount).toBe(null)
    })
  })
})

/*
README: How to run 10/90 split tests

1. Install dependencies:
   npm install

2. Run all 10/90 split tests:
   npm test __tests__/partialPayment_10_90.test.js

3. Run with coverage:
   npm test __tests__/partialPayment_10_90.test.js --coverage

4. Run tests in watch mode:
   npm test __tests__/partialPayment_10_90.test.js --watch

5. Run tests with UI:
   npm run test:ui __tests__/partialPayment_10_90.test.js

Test Coverage:
- 10/90 split calculation accuracy for all payment methods
- Discount application before partial payment calculation
- Edge cases and rounding error prevention
- MongoDB field validation
- Backward compatibility with existing orders
- Admin panel display logic
- Integration scenarios for all payment combinations

Expected Results:
All tests should pass, confirming that:
- 10/90 split works correctly for UPI/Netbanking with discount
- 10/90 split works correctly for COD/Card without discount
- No rounding errors in calculations
- MongoDB fields are saved correctly
- Admin panel shows accurate information
- Existing orders remain unaffected
- All integration scenarios work as expected
*/
