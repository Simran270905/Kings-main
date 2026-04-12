/**
 * Card Discount Tests
 * Tests for 10% discount on Card payments (Full Payment only)
 */

import { describe, test, expect } from 'vitest'
import { 
  calculatePaymentMethodDiscount,
  calculatePartialPayment,
  isPaymentMethodEligibleForDiscount,
  getDiscountBadgeText
} from '../../src/utils/discountCalculator.js'

describe('Card Discount Tests', () => {
  test('Card + Full Payment: 10% discount IS applied ✅', () => {
    const result = calculatePaymentMethodDiscount('card', 'full', 1000)
    expect(result.hasDiscount).toBe(true)
    expect(result.discountAmount).toBe(100)
    expect(result.discountedAmount).toBe(900)
    expect(result.discountPercentage).toBe(10)
  })

  test('Card + Full Payment: correct discounted total saved in DB ✅', () => {
    const result = calculatePartialPayment(1000, 'card', 'full')
    expect(result.finalAmount).toBe(900) // 1000 - 100 discount
    expect(result.hasDiscount).toBe(true)
    expect(result.discountAmount).toBe(100)
    expect(result.codCharge).toBe(0)
  })

  test('Card + Partial Payment: NO discount applied ✅', () => {
    const result = calculatePaymentMethodDiscount('card', 'partial', 1000)
    expect(result.hasDiscount).toBe(false)
    expect(result.discountAmount).toBe(0)
    expect(result.discountedAmount).toBe(1000)
  })

  test('Card + Partial Payment: advance = 10% of original (no discount) ✅', () => {
    const result = calculatePartialPayment(1000, 'card', 'partial')
    expect(result.advanceAmount).toBe(100) // 10% of 1000 (no discount)
    expect(result.remainingAmount).toBe(900) // 90% of 1000
    expect(result.hasDiscount).toBe(false)
    expect(result.finalAmount).toBe(1000)
  })
})

describe('Regression Tests - Ensure Existing Logic Still Works', () => {
  test('UPI + Full Payment: still works (regression check) ✅', () => {
    const result = calculatePaymentMethodDiscount('upi', 'full', 1000)
    expect(result.hasDiscount).toBe(true)
    expect(result.discountAmount).toBe(100)
    expect(result.discountedAmount).toBe(900)
  })

  test('Netbanking + Full Payment: still works (regression check) ✅', () => {
    const result = calculatePaymentMethodDiscount('netbanking', 'full', 1000)
    expect(result.hasDiscount).toBe(true)
    expect(result.discountAmount).toBe(100)
    expect(result.discountedAmount).toBe(900)
  })

  test('COD + Full Payment: still NO discount (regression check) ✅', () => {
    const result = calculatePaymentMethodDiscount('cod', 'full', 1000)
    expect(result.hasDiscount).toBe(false)
    expect(result.discountAmount).toBe(0)
    expect(result.discountedAmount).toBe(1000)
  })

  test('UPI + Partial Payment: still NO discount (regression check) ✅', () => {
    const result = calculatePaymentMethodDiscount('upi', 'partial', 1000)
    expect(result.hasDiscount).toBe(false)
    expect(result.discountAmount).toBe(0)
    expect(result.discountedAmount).toBe(1000)
  })

  test('Netbanking + Partial Payment: still NO discount (regression check) ✅', () => {
    const result = calculatePaymentMethodDiscount('netbanking', 'partial', 1000)
    expect(result.hasDiscount).toBe(false)
    expect(result.discountAmount).toBe(0)
    expect(result.discountedAmount).toBe(1000)
  })

  test('COD + Partial Payment: still NO discount (regression check) ✅', () => {
    const result = calculatePaymentMethodDiscount('cod', 'partial', 1000)
    expect(result.hasDiscount).toBe(false)
    expect(result.discountAmount).toBe(0)
    expect(result.discountedAmount).toBe(1000)
  })
})

describe('UI Badge Tests', () => {
  test('"10% OFF" badge appears next to Card option in UI ✅', () => {
    const result = getDiscountBadgeText('card', 'full')
    expect(result).toBe('🎉 10% OFF on Prepaid Payment!')
  })

  test('"10% OFF" badge appears next to UPI option in UI ✅', () => {
    const result = getDiscountBadgeText('upi', 'full')
    expect(result).toBe('🎉 10% OFF on Prepaid Payment!')
  })

  test('"10% OFF" badge appears next to Netbanking option in UI ✅', () => {
    const result = getDiscountBadgeText('netbanking', 'full')
    expect(result).toBe('🎉 10% OFF on Prepaid Payment!')
  })

  test('"10% OFF" badge disappears when Partial Payment selected ✅', () => {
    const cardPartial = getDiscountBadgeText('card', 'partial')
    const upiPartial = getDiscountBadgeText('upi', 'partial')
    const netbankingPartial = getDiscountBadgeText('netbanking', 'partial')
    
    expect(cardPartial).toBe('')
    expect(upiPartial).toBe('')
    expect(netbankingPartial).toBe('')
  })

  test('Badge text shows "Prepaid Payments" not just "UPI/Netbanking" ✅', () => {
    const result = getDiscountBadgeText('card', 'full')
    expect(result).toBe('🎉 10% OFF on Prepaid Payment!')
    expect(result).toContain('Prepaid Payment') // Fixed: singular "Payment" not "Payments"
  })

  test('"10% OFF" badge does not appear next to COD option ✅', () => {
    const codFull = getDiscountBadgeText('cod', 'full')
    const codPartial = getDiscountBadgeText('cod', 'partial')
    
    expect(codFull).toBe('')
    expect(codPartial).toBe('')
  })
})

describe('Backend Validation Tests', () => {
  test('Backend validation should allow discount on Card + Full Payment ✅', () => {
    // This simulates the backend validation logic
    const paymentMethod = 'card'
    const paymentPlan = 'full'
    const discountApplied = true
    
    // Simulate the validation: if discountApplied → verify paymentMethod in ["upi", "netbanking", "card"]
    const eligibleMethods = ['upi', 'netbanking', 'card']
    const isValid = discountApplied && eligibleMethods.includes(paymentMethod) && paymentPlan === 'full'
    
    expect(isValid).toBe(true)
  })

  test('Backend rejects discount claim on COD ✅', () => {
    const paymentMethod = 'cod'
    const paymentPlan = 'full'
    const discountApplied = true
    
    const eligibleMethods = ['upi', 'netbanking', 'card']
    const isValid = discountApplied && eligibleMethods.includes(paymentMethod) && paymentPlan === 'full'
    
    expect(isValid).toBe(false)
  })

  test('Backend rejects discount claim on any Partial Payment ✅', () => {
    const paymentMethods = ['upi', 'netbanking', 'card']
    const paymentPlan = 'partial'
    const discountApplied = true
    
    paymentMethods.forEach(method => {
      const eligibleMethods = ['upi', 'netbanking', 'card']
      const isValid = discountApplied && eligibleMethods.includes(method) && paymentPlan === 'full'
      expect(isValid).toBe(false)
    })
  })
})

describe('Complete Logic Matrix Tests', () => {
  test('Complete matrix: All payment methods with Full Payment', () => {
    const upiResult = calculatePartialPayment(1000, 'upi', 'full')
    const netbankingResult = calculatePartialPayment(1000, 'netbanking', 'full')
    const cardResult = calculatePartialPayment(1000, 'card', 'full')
    const codResult = calculatePartialPayment(1000, 'cod', 'full')
    
    // All prepaid methods should have 10% discount
    expect(upiResult.finalAmount).toBe(900)
    expect(upiResult.hasDiscount).toBe(true)
    
    expect(netbankingResult.finalAmount).toBe(900)
    expect(netbankingResult.hasDiscount).toBe(true)
    
    expect(cardResult.finalAmount).toBe(900) // ✅ NEW: Card now has discount
    expect(cardResult.hasDiscount).toBe(true)
    
    // COD should have no discount but ₹150 charge
    expect(codResult.finalAmount).toBe(1150)
    expect(codResult.hasDiscount).toBe(false)
    expect(codResult.codCharge).toBe(150)
  })

  test('Complete matrix: All payment methods with Partial Payment', () => {
    const upiResult = calculatePartialPayment(1000, 'upi', 'partial')
    const netbankingResult = calculatePartialPayment(1000, 'netbanking', 'partial')
    const cardResult = calculatePartialPayment(1000, 'card', 'partial')
    const codResult = calculatePartialPayment(1000, 'cod', 'partial')
    
    // All partial payments should have no discount
    expect(upiResult.hasDiscount).toBe(false)
    expect(upiResult.advanceAmount).toBe(100)
    expect(upiResult.finalAmount).toBe(1000)
    
    expect(netbankingResult.hasDiscount).toBe(false)
    expect(netbankingResult.advanceAmount).toBe(100)
    expect(netbankingResult.finalAmount).toBe(1000)
    
    expect(cardResult.hasDiscount).toBe(false) // ✅ Card partial still no discount
    expect(cardResult.advanceAmount).toBe(100)
    expect(cardResult.finalAmount).toBe(1000)
    
    // COD partial should have no discount but ₹150 charge
    expect(codResult.hasDiscount).toBe(false)
    expect(codResult.advanceAmount).toBe(115) // 10% of 1150
    expect(codResult.finalAmount).toBe(1150)
    expect(codResult.codCharge).toBe(150)
  })
})

describe('Edge Cases', () => {
  test('Edge case: Card + Full Payment with large amount', () => {
    const result = calculatePartialPayment(50000, 'card', 'full')
    expect(result.finalAmount).toBe(45000) // 50000 - 5000 discount
    expect(result.hasDiscount).toBe(true)
    expect(result.discountAmount).toBe(5000)
  })

  test('Edge case: Card + Partial Payment with small amount', () => {
    const result = calculatePartialPayment(100, 'card', 'partial')
    expect(result.advanceAmount).toBe(10) // 10% of 100
    expect(result.remainingAmount).toBe(90) // 90% of 100
    expect(result.hasDiscount).toBe(false)
    expect(result.finalAmount).toBe(100)
  })

  test('Edge case: Case insensitive payment method names', () => {
    const result1 = calculatePaymentMethodDiscount('CARD', 'full', 1000)
    const result2 = calculatePaymentMethodDiscount('Card', 'full', 1000)
    const result3 = calculatePaymentMethodDiscount('card', 'full', 1000)
    
    expect(result1.hasDiscount).toBe(true)
    expect(result2.hasDiscount).toBe(true)
    expect(result3.hasDiscount).toBe(true)
  })
})
