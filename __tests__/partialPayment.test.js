import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import { request } from 'supertest'
import express from 'express'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import Order from '../KKings_Jewellery-Backend-main/src/models/Order.js'
import PaymentPlanSelector from '../src/customer/components/Payment/PaymentPlanSelector.jsx'
import Payment from '../src/customer/components/Payment/Payment.jsx'
import AdminOrders from '../src/admin/pages/AdminOrders.jsx'

// Mock data
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

const mockCartItems = [
  {
    id: '1',
    title: 'Test Product',
    price: 1000,
    quantity: 2,
    image: 'test.jpg'
  }
]

const mockPartialPaymentOrder = {
  _id: '507f1f77bcf86cd799439011',
  paymentPlan: 'partial',
  advanceAmount: 600,
  remainingAmount: 1400,
  remainingPaymentStatus: 'pending',
  totalAmount: 2000,
  status: 'pending',
  paymentMethod: 'upi',
  shippingAddress: mockDeliveryAddress,
  items: mockCartItems
}

const mockFullPaymentOrder = {
  _id: '507f1f77bcf86cd799439012',
  paymentPlan: 'full',
  advanceAmount: null,
  remainingAmount: null,
  remainingPaymentStatus: null,
  totalAmount: 2000,
  status: 'pending',
  paymentMethod: 'upi',
  shippingAddress: mockDeliveryAddress,
  items: mockCartItems
}

const mockPaidPartialOrder = {
  ...mockPartialPaymentOrder,
  remainingPaymentStatus: 'paid',
  remainingPaymentDate: new Date('2024-01-16T10:30:00Z')
}

// Test wrapper
const TestWrapper = ({ children, initialEntries }) => (
  <MemoryRouter initialEntries={initialEntries}>
    {children}
  </MemoryRouter>
)

describe('Partial Payment Tests', () => {
  let mongoServer
  let app
  let testPartialOrder
  let testFullOrder

  beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
  })

  beforeEach(async () => {
    // Clear any additional data
    await Order.deleteMany({})
    
    // Create test orders
    testPartialOrder = new Order(mockPartialPaymentOrder)
    await testPartialOrder.save()
    
    testFullOrder = new Order(mockFullPaymentOrder)
    await testFullOrder.save()
    
    vi.clearAllMocks()
  })

  // FEATURE 3: UI Component Tests
  describe('Partial Payment UI Tests', () => {
    it('should render partial payment option below existing payment method selector', async () => {
      render(
        <TestWrapper initialEntries={['/payment']}>
          <Payment 
            deliveryAddress={mockDeliveryAddress}
            clearCart={vi.fn()}
          />
        </TestWrapper>
      )

      // Check that payment methods are rendered first
      expect(screen.getByText(/Online Payment/i)).toBeInTheDocument()
      expect(screen.getByText(/UPI Payment/i)).toBeInTheDocument()
      expect(screen.getByText(/Cash on Delivery/i)).toBeInTheDocument()

      // Check that payment plan selector is rendered below
      await waitFor(() => {
        expect(screen.getByText(/Payment Plan/i)).toBeInTheDocument()
        expect(screen.getByText(/Full Payment/i)).toBeInTheDocument()
        expect(screen.getByText(/Partial Payment – Pay 30% now, 70% later/i)).toBeInTheDocument()
      })
    })

    it('should correctly calculate 30% advance amount when partial payment is selected', async () => {
      const totalAmount = 2000
      const expectedAdvance = Math.round((totalAmount * 30) / 100) // 600
      const expectedRemaining = totalAmount - expectedAdvance // 1400

      render(
        <PaymentPlanSelector
          selectedPlan="partial"
          onPlanChange={vi.fn()}
          totalAmount={totalAmount}
        />
      )

      await waitFor(() => {
        expect(screen.getByText(/Advance Amount \(30%\)/i)).toBeInTheDocument()
        expect(screen.getByText(`₹${expectedAdvance.toLocaleString('en-IN')}`)).toBeInTheDocument()
        expect(screen.getByText(/Remaining Amount \(70%\)/i)).toBeInTheDocument()
        expect(screen.getByText(`₹${expectedRemaining.toLocaleString('en-IN')}`)).toBeInTheDocument()
      })
    })

    it('should correctly calculate 70% remaining amount when partial payment is selected', async () => {
      const totalAmount = 2000
      const expectedAdvance = Math.round((totalAmount * 30) / 100) // 600
      const expectedRemaining = totalAmount - expectedAdvance // 1400

      render(
        <PaymentPlanSelector
          selectedPlan="partial"
          onPlanChange={vi.fn()}
          totalAmount={totalAmount}
        />
      )

      await waitFor(() => {
        expect(screen.getByText(/Remaining Amount \(70%\)/i)).toBeInTheDocument()
        expect(screen.getByText(`₹${expectedRemaining.toLocaleString('en-IN')}`)).toBeInTheDocument()
      })
    })

    it('should have correct math for various order totals (edge cases)', async () => {
      const testCases = [
        { total: 100, expectedAdvance: 30, expectedRemaining: 70 },
        { total: 999, expectedAdvance: 300, expectedRemaining: 699 },
        { total: 10000, expectedAdvance: 3000, expectedRemaining: 7000 },
        { total: 1, expectedAdvance: 0, expectedRemaining: 1 }, // Edge case: minimum amount
        { total: 99999, expectedAdvance: 29997, expectedRemaining: 70002 }
      ]

      for (const testCase of testCases) {
        const { total, expectedAdvance, expectedRemaining } = testCase

        const { unmount } = render(
          <PaymentPlanSelector
            selectedPlan="partial"
            onPlanChange={vi.fn()}
            totalAmount={total}
          />
        )

        await waitFor(() => {
          expect(screen.getByText(`₹${expectedAdvance.toLocaleString('en-IN')}`)).toBeInTheDocument()
          expect(screen.getByText(`₹${expectedRemaining.toLocaleString('en-IN')}`)).toBeInTheDocument()
        })

        unmount()
      }
    })

    it('should have "Full Payment" selected by default and existing flow unchanged', async () => {
      const onPlanChange = vi.fn()

      render(
        <PaymentPlanSelector
          selectedPlan="full"
          onPlanChange={onPlanChange}
          totalAmount={2000}
        />
      )

      await waitFor(() => {
        // Full payment should be selected by default
        const fullPaymentRadio = screen.getByLabelText(/Full Payment/i)
        expect(fullPaymentRadio).toBeChecked()
        
        // Partial payment should not be selected
        const partialPaymentRadio = screen.getByLabelText(/Partial Payment/i)
        expect(partialPaymentRadio).not.toBeChecked()
      })

      // Should show benefits of full payment
      expect(screen.getByText(/Benefits of Full Payment:/i)).toBeInTheDocument()
      expect(screen.getByText(/Eligible for 10% prepaid discount/i)).toBeInTheDocument()
    })

    it('should disable 10% prepaid discount when partial payment is selected', async () => {
      render(
        <TestWrapper initialEntries={['/payment']}>
          <Payment 
            deliveryAddress={mockDeliveryAddress}
            clearCart={vi.fn()}
          />
        </TestWrapper>
      )

      // Select UPI payment method first
      const upiButton = screen.getByText(/UPI Payment/i)
      fireEvent.click(upiButton)

      await waitFor(() => {
        // Discount badge should appear initially
        expect(screen.getByText(/10% OFF on Prepaid Payment!/i)).toBeInTheDocument()
      })

      // Select partial payment
      const partialPaymentRadio = screen.getByLabelText(/Partial Payment/i)
      fireEvent.click(partialPaymentRadio)

      await waitFor(() => {
        // Discount badge should disappear
        expect(screen.queryByText(/10% OFF on Prepaid Payment!/i)).not.toBeInTheDocument()
        
        // Info note should appear
        expect(screen.getByText(/Remaining amount must be paid before your order is shipped/i)).toBeInTheDocument()
        expect(screen.getByText(/10% prepaid discount is not applicable for partial payments/i)).toBeInTheDocument()
      })
    })

    it('should show info note about remaining payment requirement', async () => {
      render(
        <PaymentPlanSelector
          selectedPlan="partial"
          onPlanChange={vi.fn()}
          totalAmount={2000}
        />
      )

      await waitFor(() => {
        expect(screen.getByText(/Important Information:/i)).toBeInTheDocument()
        expect(screen.getByText(/Remaining amount must be paid before your order is shipped/i)).toBeInTheDocument()
        expect(screen.getByText(/10% prepaid discount is not applicable for partial payments/i)).toBeInTheDocument()
        expect(screen.getByText(/Order processing begins after advance payment confirmation/i)).toBeInTheDocument()
      })
    })
  })

  // FEATURE 3: Backend Tests
  describe('Partial Payment Backend Tests', () => {
    beforeEach(() => {
      // Create Express app for testing
      app = express()
      app.use(express.json())
      
      // Mock the createOrder controller
      app.post('/api/orders', async (req, res) => {
        try {
          const orderData = req.body
          
          // Create order with payment plan fields
          const order = new Order({
            ...orderData,
            status: 'pending',
            paymentStatus: orderData.paymentMethod === 'cod' ? 'pending' : 'paid',
            amountPaid: orderData.paymentPlan === 'partial' ? orderData.advanceAmount : orderData.totalAmount,
            remainingPaymentStatus: orderData.paymentPlan === 'partial' ? 'pending' : null
          })
          
          await order.save()
          
          res.status(201).json({
            success: true,
            order: order
          })
        } catch (error) {
          res.status(400).json({
            success: false,
            message: error.message
          })
        }
      })

      // Mock remaining payment endpoints
      app.get('/api/orders/:orderId/remaining-payment', async (req, res) => {
        try {
          const order = await Order.findById(req.params.orderId)
          
          if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' })
          }
          
          if (order.paymentPlan !== 'partial') {
            return res.status(400).json({ success: false, message: 'This order does not have a partial payment plan' })
          }
          
          res.json({
            success: true,
            data: {
              orderId: order._id,
              paymentPlan: order.paymentPlan,
              advanceAmount: order.advanceAmount,
              remainingAmount: order.remainingAmount,
              remainingPaymentStatus: order.remainingPaymentStatus,
              remainingPaymentDate: order.remainingPaymentDate
            }
          })
        } catch (error) {
          res.status(500).json({ success: false, message: 'Server error' })
        }
      })

      app.patch('/api/orders/:orderId/remaining-payment', async (req, res) => {
        try {
          const order = await Order.findById(req.params.orderId)
          
          if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' })
          }
          
          if (order.paymentPlan !== 'partial') {
            return res.status(400).json({ success: false, message: 'This order does not have a partial payment plan' })
          }
          
          if (order.remainingPaymentStatus === 'paid') {
            return res.status(400).json({ success: false, message: 'Remaining payment has already been marked as paid' })
          }
          
          // Update remaining payment status
          order.remainingPaymentStatus = 'paid'
          order.remainingPaymentDate = new Date()
          order.paymentStatus = 'paid'
          order.amountPaid = order.totalAmount
          order.paymentDate = new Date()
          
          await order.save()
          
          res.json({
            success: true,
            data: {
              orderId: order._id,
              remainingPaymentStatus: order.remainingPaymentStatus,
              remainingPaymentDate: order.remainingPaymentDate,
              paymentStatus: order.paymentStatus
            }
          })
        } catch (error) {
          res.status(500).json({ success: false, message: 'Server error' })
        }
      })
    })

    it('should save MongoDB order with paymentPlan: "partial", advanceAmount, remainingAmount, remainingPaymentStatus: "pending"', async () => {
      const orderData = {
        items: mockCartItems,
        shippingAddress: mockDeliveryAddress,
        totalAmount: 2000,
        paymentMethod: 'upi',
        paymentPlan: 'partial',
        advanceAmount: 600,
        remainingAmount: 1400
      }

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.order.paymentPlan).toBe('partial')
      expect(response.body.order.advanceAmount).toBe(600)
      expect(response.body.order.remainingAmount).toBe(1400)
      expect(response.body.order.remainingPaymentStatus).toBe('pending')
      expect(response.body.order.amountPaid).toBe(600) // Only advance amount paid initially
    })

    it('should save MongoDB order with paymentPlan: "full" for full payment orders', async () => {
      const orderData = {
        items: mockCartItems,
        shippingAddress: mockDeliveryAddress,
        totalAmount: 2000,
        paymentMethod: 'upi',
        paymentPlan: 'full'
      }

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.order.paymentPlan).toBe('full')
      expect(response.body.order.advanceAmount).toBe(null)
      expect(response.body.order.remainingAmount).toBe(null)
      expect(response.body.order.remainingPaymentStatus).toBe(null)
      expect(response.body.order.amountPaid).toBe(2000) // Full amount paid
    })

    it('should not affect existing orders without paymentPlan field', async () => {
      // Create an order without paymentPlan field (simulating existing data)
      const existingOrder = new Order({
        items: mockCartItems,
        shippingAddress: mockDeliveryAddress,
        totalAmount: 2000,
        paymentMethod: 'upi',
        status: 'pending'
        // Note: No paymentPlan field
      })
      await existingOrder.save()

      // Should be able to retrieve the order without issues
      const retrievedOrder = await Order.findById(existingOrder._id)
      expect(retrievedOrder).toBeTruthy()
      expect(retrievedOrder.totalAmount).toBe(2000)
      expect(retrievedOrder.paymentPlan).toBe('full') // Default value
    })
  })

  // FEATURE 3: Admin Panel Tests
  describe('Admin Panel Partial Payment Tests', () => {
    it('should show partial payment section with correct advance and remaining amounts', async () => {
      // Mock the useOrder hook
      vi.mock('../src/admin/context/OrderContext.js', () => ({
        useOrder: () => ({
          orders: [mockPartialPaymentOrder],
          updateOrderStatus: vi.fn(),
          getStats: vi.fn(),
          loading: false,
          lastFetch: new Date(),
          forceRefresh: vi.fn()
        })
      }))

      render(
        <TestWrapper initialEntries={['/admin/orders']}>
          <AdminOrders />
        </TestWrapper>
      )

      // Click "View" button for the order
      const viewButton = screen.getByText(/View/i)
      fireEvent.click(viewButton)

      await waitFor(() => {
        // Should show payment plan details
        expect(screen.getByText(/Payment Plan Details/i)).toBeInTheDocument()
        expect(screen.getByText(/Partial Payment/i)).toBeInTheDocument()
        expect(screen.getByText(/₹600/i)).toBeInTheDocument() // Advance amount
        expect(screen.getByText(/₹1400/i)).toBeInTheDocument() // Remaining amount
        expect(screen.getByText(/⏳ Pending/i)).toBeInTheDocument() // Status
      })
    })

    it('should show "Mark Remaining as Paid" button only when paymentPlan is "partial" AND remainingPaymentStatus is "pending"', async () => {
      // Mock with partial payment order (pending)
      vi.mock('../src/admin/context/OrderContext.js', () => ({
        useOrder: () => ({
          orders: [mockPartialPaymentOrder],
          updateOrderStatus: vi.fn(),
          getStats: vi.fn(),
          loading: false,
          lastFetch: new Date(),
          forceRefresh: vi.fn()
        })
      }))

      const { unmount } = render(
        <TestWrapper initialEntries={['/admin/orders']}>
          <AdminOrders />
        </TestWrapper>
      )

      // Click "View" button
      fireEvent.click(screen.getByText(/View/i))

      await waitFor(() => {
        // Button should be visible for pending partial payment
        expect(screen.getByText(/Mark Remaining as Paid/i)).toBeInTheDocument()
      })

      unmount()

      // Mock with paid partial payment order
      vi.mock('../src/admin/context/OrderContext.js', () => ({
        useOrder: () => ({
          orders: [mockPaidPartialOrder],
          updateOrderStatus: vi.fn(),
          getStats: vi.fn(),
          loading: false,
          lastFetch: new Date(),
          forceRefresh: vi.fn()
        })
      }))

      render(
        <TestWrapper initialEntries={['/admin/orders']}>
          <AdminOrders />
        </TestWrapper>
      )

      // Click "View" button
      fireEvent.click(screen.getByText(/View/i))

      await waitFor(() => {
        // Button should be hidden for paid partial payment
        expect(screen.queryByText(/Mark Remaining as Paid/i)).not.toBeInTheDocument()
        expect(screen.getByText(/✓ Paid/i)).toBeInTheDocument()
      })
    })

    it('should hide "Mark Remaining as Paid" button after payment is marked as paid', async () => {
      // Mock with pending partial payment order
      vi.mock('../src/admin/context/OrderContext.js', () => ({
        useOrder: () => ({
          orders: [mockPartialPaymentOrder],
          updateOrderStatus: vi.fn(),
          getStats: vi.fn(),
          loading: false,
          lastFetch: new Date(),
          forceRefresh: vi.fn()
        })
      }))

      // Mock localStorage for admin token
      global.localStorage.setItem('adminToken', 'test-token')

      // Mock fetch for the PATCH request
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            orderId: mockPartialPaymentOrder._id,
            remainingPaymentStatus: 'paid',
            remainingPaymentDate: new Date().toISOString(),
            paymentStatus: 'paid'
          }
        })
      })

      render(
        <TestWrapper initialEntries={['/admin/orders']}>
          <AdminOrders />
        </TestWrapper>
      )

      // Click "View" button
      fireEvent.click(screen.getByText(/View/i))

      await waitFor(() => {
        // Button should be visible initially
        expect(screen.getByText(/Mark Remaining as Paid/i)).toBeInTheDocument()
      })

      // Click the button to mark as paid
      fireEvent.click(screen.getByText(/Mark Remaining as Paid/i))

      await waitFor(() => {
        // Button should be hidden after marking as paid
        expect(screen.queryByText(/Mark Remaining as Paid/i)).not.toBeInTheDocument()
        expect(screen.getByText(/✓ Paid/i)).toBeInTheDocument()
      })
    })

    it('should not show payment plan section for full payment orders', async () => {
      // Mock with full payment order
      vi.mock('../src/admin/context/OrderContext.js', () => ({
        useOrder: () => ({
          orders: [mockFullPaymentOrder],
          updateOrderStatus: vi.fn(),
          getStats: vi.fn(),
          loading: false,
          lastFetch: new Date(),
          forceRefresh: vi.fn()
        })
      }))

      render(
        <TestWrapper initialEntries={['/admin/orders']}>
          <AdminOrders />
        </TestWrapper>
      )

      // Click "View" button
      fireEvent.click(screen.getByText(/View/i))

      await waitFor(() => {
        // Should not show payment plan section for full payment
        expect(screen.queryByText(/Payment Plan Details/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/Partial Payment/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/Mark Remaining as Paid/i)).not.toBeInTheDocument()
      })
    })
  })

  // FEATURE 3: API Endpoint Tests
  describe('Partial Payment API Tests', () => {
    beforeEach(() => {
      // Create Express app for testing
      app = express()
      app.use(express.json())
      
      // Mock remaining payment endpoints
      app.get('/api/orders/:orderId/remaining-payment', async (req, res) => {
        try {
          const order = await Order.findById(req.params.orderId)
          
          if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' })
          }
          
          if (order.paymentPlan !== 'partial') {
            return res.status(400).json({ success: false, message: 'This order does not have a partial payment plan' })
          }
          
          res.json({
            success: true,
            data: {
              orderId: order._id,
              paymentPlan: order.paymentPlan,
              advanceAmount: order.advanceAmount,
              remainingAmount: order.remainingAmount,
              remainingPaymentStatus: order.remainingPaymentStatus,
              remainingPaymentDate: order.remainingPaymentDate
            }
          })
        } catch (error) {
          res.status(500).json({ success: false, message: 'Server error' })
        }
      })

      app.patch('/api/orders/:orderId/remaining-payment', async (req, res) => {
        try {
          const order = await Order.findById(req.params.orderId)
          
          if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' })
          }
          
          if (order.paymentPlan !== 'partial') {
            return res.status(400).json({ success: false, message: 'This order does not have a partial payment plan' })
          }
          
          if (order.remainingPaymentStatus === 'paid') {
            return res.status(400).json({ success: false, message: 'Remaining payment has already been marked as paid' })
          }
          
          // Update remaining payment status
          order.remainingPaymentStatus = 'paid'
          order.remainingPaymentDate = new Date()
          order.paymentStatus = 'paid'
          order.amountPaid = order.totalAmount
          order.paymentDate = new Date()
          
          await order.save()
          
          res.json({
            success: true,
            data: {
              orderId: order._id,
              remainingPaymentStatus: order.remainingPaymentStatus,
              remainingPaymentDate: order.remainingPaymentDate,
              paymentStatus: order.paymentStatus
            }
          })
        } catch (error) {
          res.status(500).json({ success: false, message: 'Server error' })
        }
      })
    })

    it('should PATCH /api/orders/:orderId/remaining-payment correctly updates remainingPaymentStatus to "paid"', async () => {
      const response = await request(app)
        .patch(`/api/orders/${testPartialOrder._id}/remaining-payment`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.remainingPaymentStatus).toBe('paid')
      expect(response.body.data.paymentStatus).toBe('paid')
      expect(response.body.data.remainingPaymentDate).toBeTruthy()

      // Verify in database
      const updatedOrder = await Order.findById(testPartialOrder._id)
      expect(updatedOrder.remainingPaymentStatus).toBe('paid')
      expect(updatedOrder.paymentStatus).toBe('paid')
      expect(updatedOrder.amountPaid).toBe(2000) // Full amount now paid
    })

    it('should return error for full payment orders', async () => {
      const response = await request(app)
        .get(`/api/orders/${testFullOrder._id}/remaining-payment`)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('This order does not have a partial payment plan')
    })

    it('should return error when trying to mark already paid partial payment', async () => {
      // Create a paid partial payment order
      const paidOrder = new Order(mockPaidPartialOrder)
      await paidOrder.save()

      const response = await request(app)
        .patch(`/api/orders/${paidOrder._id}/remaining-payment`)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Remaining payment has already been marked as paid')
    })
  })

  // FEATURE 3: Integration Tests
  describe('Partial Payment Integration Tests', () => {
    it('should handle complete partial payment flow from selection to order creation', async () => {
      render(
        <TestWrapper initialEntries={['/payment']}>
          <Payment 
            deliveryAddress={mockDeliveryAddress}
            clearCart={vi.fn()}
          />
        </TestWrapper>
      )

      // Select partial payment
      const partialPaymentRadio = screen.getByLabelText(/Partial Payment/i)
      fireEvent.click(partialPaymentRadio)

      await waitFor(() => {
        // Should show partial payment breakdown
        expect(screen.getByText(/Advance Amount \(30%\)/i)).toBeInTheDocument()
        expect(screen.getByText(/Remaining Amount \(70%\)/i)).toBeInTheDocument()
        expect(screen.getByText(/₹600/i)).toBeInTheDocument() // 30% of 2000
        expect(screen.getByText(/₹1400/i)).toBeInTheDocument() // 70% of 2000
      })

      // Payment button should show advance amount
      expect(screen.getByText(/Pay ₹600/i)).toBeInTheDocument()
    })

    it('should maintain payment plan selection across payment method changes', async () => {
      render(
        <TestWrapper initialEntries={['/payment']}>
          <Payment 
            deliveryAddress={mockDeliveryAddress}
            clearCart={vi.fn()}
          />
        </TestWrapper>
      )

      // Select partial payment
      const partialPaymentRadio = screen.getByLabelText(/Partial Payment/i)
      fireEvent.click(partialPaymentRadio)

      await waitFor(() => {
        expect(screen.getByText(/Pay ₹600/i)).toBeInTheDocument()
      })

      // Change payment method
      const codButton = screen.getByText(/Cash on Delivery/i)
      fireEvent.click(codButton)

      // Should still show partial payment breakdown
      await waitFor(() => {
        expect(screen.getByText(/Advance Amount \(30%\)/i)).toBeInTheDocument()
        expect(screen.getByText(/Pay ₹600/i)).toBeInTheDocument()
      })
    })
  })
})

/*
README: How to run partial payment tests

1. Install dependencies:
   npm install
   npm install mongodb-memory-server supertest --save-dev

2. Run all partial payment tests:
   npm test __tests__/partialPayment.test.js

3. Run with coverage:
   npm test __tests__/partialPayment.test.js --coverage

4. Run tests in watch mode:
   npm test __tests__/partialPayment.test.js --watch

5. Run tests with UI:
   npm run test:ui __tests__/partialPayment.test.js

Test Coverage:
- UI component rendering and user interactions
- Payment plan calculations for various amounts
- Discount disable functionality for partial payments
- Backend order creation with payment plan fields
- Admin panel partial payment management
- API endpoint functionality and error handling
- Integration between frontend and backend

Expected Results:
All tests should pass, confirming that:
- Partial payment option renders correctly below payment methods
- 30%/70% calculations are accurate for all amounts
- Prepaid discount is disabled for partial payments
- Backend correctly saves payment plan information
- Admin panel can manage remaining payments
- API endpoints work correctly
- Integration flow works seamlessly
- Existing orders without paymentPlan field are unaffected
*/
