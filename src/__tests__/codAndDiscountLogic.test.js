/**
 * COD and Discount Logic Tests
 * Tests for ₹150 COD charge and 10% discount only on UPI/Netbanking + Full Payment
 */

import { describe, test, expect } from 'vitest'
import { 
  calculatePaymentMethodDiscount,
  calculateCODCharge,
  calculatePartialPayment,
  isPaymentMethodEligibleForDiscount,
  getDiscountBadgeText
} from '../../src/utils/discountCalculator.js'

describe('COD Charge Tests', () => {
  test('COD + Full Payment total = itemTotal + 150', () => {
    const result = calculatePartialPayment(1000, 'cod', 'full')
    expect(result.finalAmount).toBe(1150)
    expect(result.codCharge).toBe(150)
    expect(result.hasCODCharge).toBe(true)
  })

  test('COD + Partial: advance = 10% of (itemTotal + 150)', () => {
    const result = calculatePartialPayment(1000, 'cod', 'partial')
    expect(result.advanceAmount).toBe(115) // 10% of 1150
    expect(result.remainingAmount).toBe(1035) // 90% of 1150
    expect(result.codCharge).toBe(150)
  })

  test('UPI + Full: no COD charge added', () => {
    const result = calculatePartialPayment(1000, 'upi', 'full')
    expect(result.finalAmount).toBe(900) // 10% discount, no COD charge
    expect(result.codCharge).toBe(0)
    expect(result.hasCODCharge).toBe(false)
  })

  test('Netbanking + Partial: no COD charge added', () => {
    const result = calculatePartialPayment(1000, 'netbanking', 'partial')
    expect(result.advanceAmount).toBe(100) // 10% of 1000 (no discount, no COD charge)
    expect(result.codCharge).toBe(0)
    expect(result.hasCODCharge).toBe(false)
  })

  test('COD charge line appears in UI when COD selected', () => {
    const result = calculateCODCharge('cod')
    expect(result.hasCODCharge).toBe(true)
    expect(result.codCharge).toBe(150)
    expect(result.message).toBe('💵 ₹150 handling charge for Cash on Delivery')
  })

  test('COD charge line disappears when switching to UPI/Netbanking', () => {
    const result = calculateCODCharge('upi')
    expect(result.hasCODCharge).toBe(false)
    expect(result.codCharge).toBe(0)
    expect(result.message).toBe('')
  })

  test('Edge case: Order ₹100 COD total = ₹250', () => {
    const result = calculatePartialPayment(100, 'cod', 'full')
    expect(result.finalAmount).toBe(250) // 100 + 150
  })

  test('Edge case: Order ₹999 COD partial advance = ₹114.85', () => {
    const result = calculatePartialPayment(999, 'cod', 'partial')
    expect(result.finalAmount).toBe(1149) // 999 + 150
    expect(result.advanceAmount).toBe(115) // Math.round(10% of 1149)
    expect(result.remainingAmount).toBe(1034) // 1149 - 115
  })
})

describe('Discount Logic Tests', () => {
  test('UPI + Full Payment: 10% discount applied ✅', () => {
    const result = calculatePaymentMethodDiscount('upi', 'full', 1000)
    expect(result.hasDiscount).toBe(true)
    expect(result.discountAmount).toBe(100)
    expect(result.discountedAmount).toBe(900)
  })

  test('Netbanking + Full Payment: 10% discount applied ✅', () => {
    const result = calculatePaymentMethodDiscount('netbanking', 'full', 1000)
    expect(result.hasDiscount).toBe(true)
    expect(result.discountAmount).toBe(100)
    expect(result.discountedAmount).toBe(900)
  })

  test('UPI + Partial Payment: NO discount ✅', () => {
    const result = calculatePaymentMethodDiscount('upi', 'partial', 1000)
    expect(result.hasDiscount).toBe(false)
    expect(result.discountAmount).toBe(0)
    expect(result.discountedAmount).toBe(1000)
  })

  test('Netbanking + Partial Payment: NO discount ✅', () => {
    const result = calculatePaymentMethodDiscount('netbanking', 'partial', 1000)
    expect(result.hasDiscount).toBe(false)
    expect(result.discountAmount).toBe(0)
    expect(result.discountedAmount).toBe(1000)
  })

  test('COD + Full Payment: NO discount ✅', () => {
    const result = calculatePaymentMethodDiscount('cod', 'full', 1000)
    expect(result.hasDiscount).toBe(false)
    expect(result.discountAmount).toBe(0)
    expect(result.discountedAmount).toBe(1000)
  })

  test('COD + Partial Payment: NO discount ✅', () => {
    const result = calculatePaymentMethodDiscount('cod', 'partial', 1000)
    expect(result.hasDiscount).toBe(false)
    expect(result.discountAmount).toBe(0)
    expect(result.discountedAmount).toBe(1000)
  })

  test('Card + Full Payment: 10% discount applied ✅', () => {
    const result = calculatePaymentMethodDiscount('card', 'full', 1000)
    expect(result.hasDiscount).toBe(true)
    expect(result.discountAmount).toBe(100)
    expect(result.discountedAmount).toBe(900)
  })

  test('Card + Partial Payment: NO discount ✅', () => {
    const result = calculatePaymentMethodDiscount('card', 'partial', 1000)
    expect(result.hasDiscount).toBe(false)
    expect(result.discountAmount).toBe(0)
    expect(result.discountedAmount).toBe(1000)
  })
})

describe('Combined Logic Tests', () => {
  test('UPI + Full Payment: ₹1000 → ₹900 (10% discount only)', () => {
    const result = calculatePartialPayment(1000, 'upi', 'full')
    expect(result.finalAmount).toBe(900)
    expect(result.hasDiscount).toBe(true)
    expect(result.hasCODCharge).toBe(false)
    expect(result.discountAmount).toBe(100)
    expect(result.codCharge).toBe(0)
  })

  test('COD + Full Payment: ₹1000 → ₹1150 (₹150 COD charge only)', () => {
    const result = calculatePartialPayment(1000, 'cod', 'full')
    expect(result.finalAmount).toBe(1150)
    expect(result.hasDiscount).toBe(false)
    expect(result.hasCODCharge).toBe(true)
    expect(result.discountAmount).toBe(0)
    expect(result.codCharge).toBe(150)
  })

  test('COD + Partial Payment: ₹1000 → ₹115 advance, ₹1035 remaining', () => {
    const result = calculatePartialPayment(1000, 'cod', 'partial')
    expect(result.finalAmount).toBe(1150)
    expect(result.advanceAmount).toBe(115)
    expect(result.remainingAmount).toBe(1035)
    expect(result.hasDiscount).toBe(false)
    expect(result.hasCODCharge).toBe(true)
  })

  test('UPI + Partial Payment: ₹1000 → ₹100 advance, ₹900 remaining', () => {
    const result = calculatePartialPayment(1000, 'upi', 'partial')
    expect(result.finalAmount).toBe(1000)
    expect(result.advanceAmount).toBe(100)
    expect(result.remainingAmount).toBe(900)
    expect(result.hasDiscount).toBe(false)
    expect(result.hasCODCharge).toBe(false)
  })

  test('Netbanking + Partial Payment: ₹1000 → ₹100 advance, ₹900 remaining', () => {
    const result = calculatePartialPayment(1000, 'netbanking', 'partial')
    expect(result.finalAmount).toBe(1000)
    expect(result.advanceAmount).toBe(100)
    expect(result.remainingAmount).toBe(900)
    expect(result.hasDiscount).toBe(false)
    expect(result.hasCODCharge).toBe(false)
  })
})

describe('Edge Cases', () => {
  test('Order ₹100: COD total = ₹250, advance = ₹25, remaining = ₹225', () => {
    const result = calculatePartialPayment(100, 'cod', 'partial')
    expect(result.finalAmount).toBe(250)
    expect(result.advanceAmount).toBe(25)
    expect(result.remainingAmount).toBe(225)
  })

  test('Order ₹999: UPI Full = ₹899.10 (after 10% off)', () => {
    const result = calculatePartialPayment(999, 'upi', 'full')
    expect(result.finalAmount).toBe(899) // Math.round(999 * 0.9)
    expect(result.hasDiscount).toBe(true)
    expect(result.discountAmount).toBe(100)
  })

  test('Order ₹10000: COD partial advance = ₹1015, remaining = ₹9135', () => {
    const result = calculatePartialPayment(10000, 'cod', 'partial')
    expect(result.finalAmount).toBe(10150) // 10000 + 150
    expect(result.advanceAmount).toBe(1015) // Math.round(10% of 10150)
    expect(result.remainingAmount).toBe(9135) // 10150 - 1015
  })
})

describe('UI Helper Functions', () => {
  test('isPaymentMethodEligibleForDiscount returns correct values', () => {
    expect(isPaymentMethodEligibleForDiscount('upi', 'full')).toBe(true)
    expect(isPaymentMethodEligibleForDiscount('netbanking', 'full')).toBe(true)
    expect(isPaymentMethodEligibleForDiscount('card', 'full')).toBe(true) // ✅ UPDATED: Card now eligible
    expect(isPaymentMethodEligibleForDiscount('upi', 'partial')).toBe(false)
    expect(isPaymentMethodEligibleForDiscount('netbanking', 'partial')).toBe(false)
    expect(isPaymentMethodEligibleForDiscount('card', 'partial')).toBe(false)
    expect(isPaymentMethodEligibleForDiscount('cod', 'full')).toBe(false)
  })

  test('getDiscountBadgeText returns correct messages', () => {
    expect(getDiscountBadgeText('upi', 'full')).toBe('🎉 10% OFF on Prepaid Payment!')
    expect(getDiscountBadgeText('netbanking', 'full')).toBe('🎉 10% OFF on Prepaid Payment!')
    expect(getDiscountBadgeText('card', 'full')).toBe('🎉 10% OFF on Prepaid Payment!') // ✅ UPDATED: Card now shows badge
    expect(getDiscountBadgeText('upi', 'partial')).toBe('')
    expect(getDiscountBadgeText('cod', 'full')).toBe('')
  })
})
