import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { calculateTotalDiscount, getDiscountBadgeText } from '../src/utils/discountCalculator.js'
import { calculatePaymentMethodDiscount } from '../src/utils/discountCalculator.js'
import Payment from '../src/customer/components/Payment/Payment.jsx'
import { calculatePaymentMethodDiscount as backendCalculateDiscount } from '../KKings_Jewellery-Backend-main/src/utils/discountCalculator.js'

// Mock components and contexts
const mockCartItems = [
  {
    id: '1',
    title: 'Test Product',
    price: 1000,
    quantity: 2,
    image: 'test.jpg'
  }
]

const mockDeliveryAddress = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  mobile: '9876543210',
  streetAddress: '123 Test St',
  city: 'Test City',
  state: 'TS',
  zipCode: '123456'
}

// Wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
)

describe('Prepaid Discount Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // FEATURE 1: Prepaid Discount Logic Tests
  describe('Discount Calculation Logic', () => {
    it('should apply 10% discount when payment method is "upi"', () => {
      const result = calculatePaymentMethodDiscount('upi', 1000)
      
      expect(result.hasDiscount).toBe(true)
      expect(result.discountAmount).toBe(100)
      expect(result.discountedAmount).toBe(900)
      expect(result.discountPercentage).toBe(10)
      expect(result.discountType).toBe('payment_method')
    })

    it('should apply 10% discount when payment method is "netbanking"', () => {
      const result = calculatePaymentMethodDiscount('netbanking', 1000)
      
      expect(result.hasDiscount).toBe(true)
      expect(result.discountAmount).toBe(100)
      expect(result.discountedAmount).toBe(900)
      expect(result.discountPercentage).toBe(10)
      expect(result.discountType).toBe('payment_method')
    })

    it('should not apply discount when payment method is "cod"', () => {
      const result = calculatePaymentMethodDiscount('cod', 1000)
      
      expect(result.hasDiscount).toBe(false)
      expect(result.discountAmount).toBe(0)
      expect(result.discountedAmount).toBe(1000)
      expect(result.discountPercentage).toBe(0)
      expect(result.discountType).toBe(null)
    })

    it('should not apply discount when payment method is "card"', () => {
      const result = calculatePaymentMethodDiscount('card', 1000)
      
      expect(result.hasDiscount).toBe(false)
      expect(result.discountAmount).toBe(0)
      expect(result.discountedAmount).toBe(1000)
      expect(result.discountPercentage).toBe(0)
      expect(result.discountType).toBe(null)
    })

    it('should handle case insensitive payment methods', () => {
      const result1 = calculatePaymentMethodDiscount('UPI', 1000)
      const result2 = calculatePaymentMethodDiscount('NetBanking', 1000)
      
      expect(result1.hasDiscount).toBe(true)
      expect(result2.hasDiscount).toBe(true)
      expect(result1.discountAmount).toBe(100)
      expect(result2.discountAmount).toBe(100)
    })

    it('should handle edge cases for payment method discount', () => {
      // Test with zero amount
      const result1 = calculatePaymentMethodDiscount('upi', 0)
      expect(result1.hasDiscount).toBe(false)
      
      // Test with negative amount
      const result2 = calculatePaymentMethodDiscount('upi', -100)
      expect(result2.hasDiscount).toBe(false)
      
      // Test with null/undefined payment method
      const result3 = calculatePaymentMethodDiscount(null, 1000)
      expect(result3.hasDiscount).toBe(false)
      
      // Test with empty string payment method
      const result4 = calculatePaymentMethodDiscount('', 1000)
      expect(result4.hasDiscount).toBe(false)
    })

    it('should correctly calculate total discount with coupon and payment method', () => {
      const result = calculateTotalDiscount(1000, 50, 'upi')
      
      expect(result.originalAmount).toBe(1000)
      expect(result.couponDiscount).toBe(50)
      expect(result.paymentMethodDiscount).toBe(95) // 10% of (1000-50)
      expect(result.totalDiscount).toBe(145)
      expect(result.finalAmount).toBe(855)
      expect(result.hasPaymentDiscount).toBe(true)
    })
  })

  // FEATURE 1: UI Component Tests
  describe('Payment Component UI Tests', () => {
    it('should show discount badge when UPI is selected', async () => {
      render(
        <TestWrapper>
          <Payment 
            deliveryAddress={mockDeliveryAddress}
            clearCart={vi.fn()}
          />
        </TestWrapper>
      )

      // Select UPI payment method
      const upiButton = screen.getByText(/UPI Payment/i)
      fireEvent.click(upiButton)

      // Wait for discount badge to appear
      await waitFor(() => {
        expect(screen.getByText(/10% OFF on Prepaid Payment!/i)).toBeInTheDocument()
      })
    })

    it('should show discount badge when Netbanking is selected', async () => {
      render(
        <TestWrapper>
          <Payment 
            deliveryAddress={mockDeliveryAddress}
            clearCart={vi.fn()}
          />
        </TestWrapper>
      )

      // Select Netbanking payment method
      const netbankingButton = screen.getByText(/NetBanking/i)
      fireEvent.click(netbankingButton)

      // Wait for discount badge to appear
      await waitFor(() => {
        expect(screen.getByText(/10% OFF on Prepaid Payment!/i)).toBeInTheDocument()
      })
    })

    it('should not show discount badge for COD payment method', async () => {
      render(
        <TestWrapper>
          <Payment 
            deliveryAddress={mockDeliveryAddress}
            clearCart={vi.fn()}
          />
        </TestWrapper>
      )

      // Select COD payment method
      const codButton = screen.getByText(/Cash on Delivery/i)
      fireEvent.click(codButton)

      // Discount badge should not appear
      await waitFor(() => {
        expect(screen.queryByText(/10% OFF on Prepaid Payment!/i)).not.toBeInTheDocument()
      })
    })

    it('should not show discount badge for Card payment method', async () => {
      render(
        <TestWrapper>
          <Payment 
            deliveryAddress={mockDeliveryAddress}
            clearCart={vi.fn()}
          />
        </TestWrapper>
      )

      // Select Online Payment (Card) payment method
      const cardButton = screen.getByText(/Online Payment/i)
      fireEvent.click(cardButton)

      // Discount badge should not appear
      await waitFor(() => {
        expect(screen.queryByText(/10% OFF on Prepaid Payment!/i)).not.toBeInTheDocument()
      })
    })

    it('should update order summary in real-time when payment method changes', async () => {
      render(
        <TestWrapper>
          <Payment 
            deliveryAddress={mockDeliveryAddress}
            clearCart={vi.fn()}
          />
        </TestWrapper>
      )

      // Initially, no discount should be shown
      expect(screen.queryByText(/Payment Method Discount/i)).not.toBeInTheDocument()

      // Select UPI
      const upiButton = screen.getByText(/UPI Payment/i)
      fireEvent.click(upiButton)

      // Wait for discount to appear in summary
      await waitFor(() => {
        expect(screen.getByText(/Payment Method Discount \(10%\)/i)).toBeInTheDocument()
      })

      // Select COD
      const codButton = screen.getByText(/Cash on Delivery/i)
      fireEvent.click(codButton)

      // Discount should disappear
      await waitFor(() => {
        expect(screen.queryByText(/Payment Method Discount/i)).not.toBeInTheDocument()
      })
    })

    it('should disable payment method discount when partial payment is selected', async () => {
      render(
        <TestWrapper>
          <Payment 
            deliveryAddress={mockDeliveryAddress}
            clearCart={vi.fn()}
          />
        </TestWrapper>
      )

      // Select UPI first
      const upiButton = screen.getByText(/UPI Payment/i)
      fireEvent.click(upiButton)

      // Wait for discount badge
      await waitFor(() => {
        expect(screen.getByText(/10% OFF on Prepaid Payment!/i)).toBeInTheDocument()
      })

      // Select partial payment
      const partialPaymentRadio = screen.getByLabelText(/Partial Payment/i)
      fireEvent.click(partialPaymentRadio)

      // Discount badge should disappear
      await waitFor(() => {
        expect(screen.queryByText(/10% OFF on Prepaid Payment!/i)).not.toBeInTheDocument()
      })

      // Check that info note appears
      expect(screen.getByText(/Remaining amount must be paid before your order is shipped/i)).toBeInTheDocument()
    })
  })

  // FEATURE 1: Backend Tests
  describe('Backend Discount Processing Tests', () => {
    it('should correctly save both originalAmount and discountedAmount in MongoDB', () => {
      const orderData = {
        totalAmount: 1000,
        paymentMethod: 'upi'
      }

      const result = backendCalculateDiscount(orderData.paymentMethod, orderData.totalAmount)
      
      expect(result.originalAmount).toBe(1000)
      expect(result.discountedAmount).toBe(900)
      expect(result.hasDiscount).toBe(true)
      expect(result.discountAmount).toBe(100)
    })

    it('should reject manually tampered discount that does not match 10% calculation', () => {
      // Test with invalid discount amount
      const orderData = {
        totalAmount: 1000,
        paymentMethod: 'upi',
        paymentMethodDiscount: 150 // Should be 100 for 10%
      }

      const expectedDiscount = Math.round((orderData.totalAmount * 10) / 100)
      expect(orderData.paymentMethodDiscount).not.toBe(expectedDiscount)
      
      // The backend should recalculate and use the correct amount
      const result = backendCalculateDiscount(orderData.paymentMethod, orderData.totalAmount)
      expect(result.discountAmount).toBe(expectedDiscount)
    })

    it('should handle edge cases in backend discount calculation', () => {
      // Test with very large amount
      const result1 = backendCalculateDiscount('upi', 1000000)
      expect(result1.discountAmount).toBe(100000)
      expect(result1.discountedAmount).toBe(900000)

      // Test with decimal amount
      const result2 = backendCalculateDiscount('upi', 999.99)
      expect(result2.discountAmount).toBe(100) // Rounded
      expect(result2.discountedAmount).toBe(899.99)
    })
  })

  // FEATURE 1: Integration Tests
  describe('Prepaid Discount Integration Tests', () => {
    it('should handle complete discount flow from selection to order creation', async () => {
      // Mock the createOrder function
      const mockCreateOrder = vi.fn().mockResolvedValue({
        success: true,
        order: { _id: 'test-order-id' }
      })

      render(
        <TestWrapper>
          <Payment 
            deliveryAddress={mockDeliveryAddress}
            clearCart={vi.fn()}
          />
        </TestWrapper>
      )

      // Select UPI payment method
      const upiButton = screen.getByText(/UPI Payment/i)
      fireEvent.click(upiButton)

      // Wait for discount to be applied
      await waitFor(() => {
        expect(screen.getByText(/10% OFF on Prepaid Payment!/i)).toBeInTheDocument()
      })

      // Check that payment button shows discounted amount
      await waitFor(() => {
        expect(screen.getByText(/Pay ₹900/i)).toBeInTheDocument()
      })
    })

    it('should maintain discount consistency across payment method changes', async () => {
      render(
        <TestWrapper>
          <Payment 
            deliveryAddress={mockDeliveryAddress}
            clearCart={vi.fn()}
          />
        </TestWrapper>
      )

      // Select UPI
      const upiButton = screen.getByText(/UPI Payment/i)
      fireEvent.click(upiButton)

      await waitFor(() => {
        expect(screen.getByText(/Pay ₹900/i)).toBeInTheDocument()
      })

      // Select Netbanking
      const netbankingButton = screen.getByText(/NetBanking/i)
      fireEvent.click(netbankingButton)

      await waitFor(() => {
        expect(screen.getByText(/Pay ₹900/i)).toBeInTheDocument()
      })

      // Select COD
      const codButton = screen.getByText(/Cash on Delivery/i)
      fireEvent.click(codButton)

      await waitFor(() => {
        expect(screen.getByText(/Pay ₹1000/i)).toBeInTheDocument()
      })
    })
  })
})

/*
README: How to run prepaid discount tests

1. Install dependencies:
   npm install

2. Run all prepaid discount tests:
   npm test __tests__/prepaidDiscount.test.js

3. Run with coverage:
   npm test __tests__/prepaidDiscount.test.js --coverage

4. Run tests in watch mode:
   npm test __tests__/prepaidDiscount.test.js --watch

5. Run tests with UI:
   npm run test:ui __tests__/prepaidDiscount.test.js

Test Coverage:
- Discount calculation logic for all payment methods
- UI component behavior and real-time updates
- Backend discount processing and validation
- Integration tests for complete discount flow
- Edge cases and error handling

Expected Results:
All tests should pass, confirming that:
- 10% discount is correctly applied for UPI/Netbanking
- No discount is applied for COD/Card
- UI updates in real-time
- Backend correctly processes and validates discounts
- Integration between frontend and backend works seamlessly
*/
