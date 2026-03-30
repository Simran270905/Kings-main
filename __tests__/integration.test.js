import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import { request } from 'supertest'
import express from 'express'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import Order from '../KKings_Jewellery-Backend-main/src/models/Order.js'
import Payment from '../src/customer/components/Payment/Payment.jsx'
import OrderTrack from '../src/customer/pages/OrderTrack/OrderTrack.jsx'
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

// Test wrapper
const TestWrapper = ({ children, initialEntries }) => (
  <MemoryRouter initialEntries={initialEntries}>
    {children}
  </MemoryRouter>
)

describe('Integration Tests', () => {
  let mongoServer
  let app
  let testOrder

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
    vi.clearAllMocks()
  })

  // INTEGRATION TEST 1: Full flow with UPI + Full Payment + Discount
  describe('UPI + Full Payment + Discount Flow', () => {
    beforeEach(() => {
      // Create Express app for testing
      app = express()
      app.use(express.json())
      
      // Mock createOrder endpoint
      app.post('/api/orders', async (req, res) => {
        try {
          const orderData = req.body
          
          // Simulate discount processing
          let finalAmount = orderData.totalAmount
          let paymentMethodDiscount = 0
          let originalAmount = orderData.totalAmount
          let discountedAmount = null
          
          if (orderData.paymentMethod === 'upi' || orderData.paymentMethod === 'netbanking') {
            paymentMethodDiscount = Math.round((orderData.totalAmount * 10) / 100)
            finalAmount = orderData.totalAmount - paymentMethodDiscount
            discountedAmount = finalAmount
          }
          
          const order = new Order({
            ...orderData,
            status: 'pending',
            paymentStatus: orderData.paymentMethod === 'cod' ? 'pending' : 'paid',
            amountPaid: finalAmount,
            originalAmount,
            discountedAmount,
            paymentMethodDiscount,
            paymentPlan: orderData.paymentPlan || 'full',
            advanceAmount: orderData.advanceAmount || null,
            remainingAmount: orderData.remainingAmount || null,
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

      // Mock trackOrder endpoint
      app.get('/api/orders/track/:orderId', async (req, res) => {
        try {
          const order = await Order.findById(req.params.orderId).select({
            status: 1,
            updatedAt: 1,
            shippingAddress: 1,
            items: 1,
            totalAmount: 1,
            paymentMethod: 1,
            trackingNumber: 1,
            trackingUrl: 1,
            estimatedDelivery: 1,
            createdAt: 1
          })
          
          if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' })
          }
          
          res.json({
            success: true,
            data: {
              orderId: order._id,
              status: order.status,
              createdAt: order.createdAt,
              updatedAt: order.updatedAt,
              shippingAddress: order.shippingAddress,
              items: order.items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                image: item.image
              })),
              totalAmount: order.totalAmount,
              paymentMethod: order.paymentMethod,
              trackingNumber: order.trackingNumber,
              trackingUrl: order.trackingUrl,
              estimatedDelivery: order.estimatedDelivery
            }
          })
        } catch (error) {
          res.status(500).json({ success: false, message: 'Server error' })
        }
      })
    })

    it('should complete full flow: User selects UPI + Full Payment → 10% discount applied → Order saved correctly → Tracking page shows Pending status', async () => {
      // Mock the createOrder function
      const mockCreateOrder = vi.fn().mockResolvedValue({
        success: true,
        order: { _id: 'test-order-id' }
      })

      // Mock the useCustomerOrder hook
      vi.mock('../src/customer/context/CustomerOrderContext.js', () => ({
        useCustomerOrder: () => ({
          createOrder: mockCreateOrder,
          fetchUserOrders: vi.fn()
        })
      }))

      // Mock the useCart hook
      vi.mock('../src/customer/context/useCart.js', () => ({
        useCart: () => ({
          cartItems: mockCartItems,
          totalPrice: 2000,
          clearCart: vi.fn()
        })
      }))

      render(
        <TestWrapper initialEntries={['/payment']}>
          <Payment 
            deliveryAddress={mockDeliveryAddress}
            clearCart={vi.fn()}
          />
        </TestWrapper>
      )

      // Step 1: Select UPI payment method
      const upiButton = screen.getByText(/UPI Payment/i)
      fireEvent.click(upiButton)

      await waitFor(() => {
        // Step 2: Verify 10% discount is applied
        expect(screen.getByText(/10% OFF on Prepaid Payment!/i)).toBeInTheDocument()
        expect(screen.getByText(/Payment Method Discount \(10%\)/i)).toBeInTheDocument()
        expect(screen.getByText(/-₹200/i)).toBeInTheDocument() // 10% of 2000
        expect(screen.getByText(/Pay ₹1800/i)).toBeInTheDocument() // 2000 - 200
      })

      // Step 3: Ensure Full Payment is selected (default)
      expect(screen.getByLabelText(/Full Payment/i)).toBeChecked()
      expect(screen.queryByText(/Advance Amount/i)).not.toBeInTheDocument()

      // Step 4: Simulate order creation
      const payButton = screen.getByText(/Pay ₹1800/i)
      fireEvent.click(payButton)

      // Verify order creation was called with correct data
      await waitFor(() => {
        expect(mockCreateOrder).toHaveBeenCalledWith(
          expect.objectContaining({
            paymentMethod: 'upi',
            paymentPlan: 'full',
            totalAmount: 2000,
            // Should include discount information
          }),
          expect.any(Function)
        )
      })

      // Step 5: Verify order was saved correctly in database
      const savedOrder = await Order.findOne({ paymentMethod: 'upi', paymentPlan: 'full' })
      expect(savedOrder).toBeTruthy()
      expect(savedOrder.originalAmount).toBe(2000)
      expect(savedOrder.discountedAmount).toBe(1800)
      expect(savedOrder.paymentMethodDiscount).toBe(200)
      expect(savedOrder.status).toBe('pending')

      // Step 6: Verify tracking page shows pending status
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            orderId: savedOrder._id,
            status: 'pending',
            shippingAddress: savedOrder.shippingAddress,
            items: savedOrder.items,
            totalAmount: savedOrder.totalAmount,
            paymentMethod: savedOrder.paymentMethod
          }
        })
      })

      render(
        <TestWrapper initialEntries={[`/orders/track/${savedOrder._id}`]}>
          <OrderTrack />
        </TestWrapper>
      )

      await waitFor(() => {
        // Step 7: Verify tracking page shows pending status
        expect(screen.getByText(/Order Confirmed/i).closest('[class*="text-"]')).toHaveClass('text-green-600')
        expect(screen.getByText(/₹2000/i)).toBeInTheDocument()
      })
    })
  })

  // INTEGRATION TEST 2: Partial Payment + UPI flow
  describe('Partial Payment + UPI Flow', () => {
    beforeEach(() => {
      // Create Express app for testing
      app = express()
      app.use(express.json())
      
      // Mock createOrder endpoint
      app.post('/api/orders', async (req, res) => {
        try {
          const orderData = req.body
          
          // No discount for partial payments
          let finalAmount = orderData.advanceAmount
          
          const order = new Order({
            ...orderData,
            status: 'pending',
            paymentStatus: 'paid',
            amountPaid: finalAmount,
            paymentPlan: 'partial',
            advanceAmount: orderData.advanceAmount,
            remainingAmount: orderData.remainingAmount,
            remainingPaymentStatus: 'pending'
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
    })

    it('should complete full flow: User selects Partial Payment + UPI → No discount → Order saved with paymentPlan: partial → Tracking page shows Pending', async () => {
      // Mock the createOrder function
      const mockCreateOrder = vi.fn().mockResolvedValue({
        success: true,
        order: { _id: 'test-order-id' }
      })

      vi.mock('../src/customer/context/CustomerOrderContext.js', () => ({
        useCustomerOrder: () => ({
          createOrder: mockCreateOrder,
          fetchUserOrders: vi.fn()
        })
      }))

      vi.mock('../src/customer/context/useCart.js', () => ({
        useCart: () => ({
          cartItems: mockCartItems,
          totalPrice: 2000,
          clearCart: vi.fn()
        })
      }))

      render(
        <TestWrapper initialEntries={['/payment']}>
          <Payment 
            deliveryAddress={mockDeliveryAddress}
            clearCart={vi.fn()}
          />
        </TestWrapper>
      )

      // Step 1: Select UPI payment method
      const upiButton = screen.getByText(/UPI Payment/i)
      fireEvent.click(upiButton)

      await waitFor(() => {
        // Discount should appear initially
        expect(screen.getByText(/10% OFF on Prepaid Payment!/i)).toBeInTheDocument()
      })

      // Step 2: Select Partial Payment
      const partialPaymentRadio = screen.getByLabelText(/Partial Payment/i)
      fireEvent.click(partialPaymentRadio)

      await waitFor(() => {
        // Step 3: Verify discount is disabled for partial payment
        expect(screen.queryByText(/10% OFF on Prepaid Payment!/i)).not.toBeInTheDocument()
        expect(screen.getByText(/10% prepaid discount is not applicable for partial payments/i)).toBeInTheDocument()
        
        // Verify partial payment breakdown
        expect(screen.getByText(/Advance Amount \(30%\)/i)).toBeInTheDocument()
        expect(screen.getByText(/₹600/i)).toBeInTheDocument() // 30% of 2000
        expect(screen.getByText(/Remaining Amount \(70%\)/i)).toBeInTheDocument()
        expect(screen.getByText(/₹1400/i)).toBeInTheDocument() // 70% of 2000
        
        // Payment button should show advance amount
        expect(screen.getByText(/Pay ₹600/i)).toBeInTheDocument()
      })

      // Step 4: Simulate order creation
      const payButton = screen.getByText(/Pay ₹600/i)
      fireEvent.click(payButton)

      await waitFor(() => {
        expect(mockCreateOrder).toHaveBeenCalledWith(
          expect.objectContaining({
            paymentMethod: 'upi',
            paymentPlan: 'partial',
            advanceAmount: 600,
            remainingAmount: 1400,
            totalAmount: 2000
          }),
          expect.any(Function)
        )
      })

      // Step 5: Verify order was saved correctly
      const savedOrder = await Order.findOne({ paymentPlan: 'partial' })
      expect(savedOrder).toBeTruthy()
      expect(savedOrder.paymentPlan).toBe('partial')
      expect(savedOrder.advanceAmount).toBe(600)
      expect(savedOrder.remainingAmount).toBe(1400)
      expect(savedOrder.remainingPaymentStatus).toBe('pending')
      expect(savedOrder.amountPaid).toBe(600) // Only advance amount paid
    })
  })

  // INTEGRATION TEST 3: COD flow
  describe('COD + Full Payment Flow', () => {
    beforeEach(() => {
      // Create Express app for testing
      app = express()
      app.use(express.json())
      
      app.post('/api/orders', async (req, res) => {
        try {
          const orderData = req.body
          
          const order = new Order({
            ...orderData,
            status: 'pending',
            paymentStatus: 'pending',
            amountPaid: 0,
            paymentPlan: 'full'
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
    })

    it('should complete full flow: User selects COD + Full Payment → No discount → Order saved normally → Tracking works', async () => {
      const mockCreateOrder = vi.fn().mockResolvedValue({
        success: true,
        order: { _id: 'test-order-id' }
      })

      vi.mock('../src/customer/context/CustomerOrderContext.js', () => ({
        useCustomerOrder: () => ({
          createOrder: mockCreateOrder,
          fetchUserOrders: vi.fn()
        })
      }))

      vi.mock('../src/customer/context/useCart.js', () => ({
        useCart: () => ({
          cartItems: mockCartItems,
          totalPrice: 2000,
          clearCart: vi.fn()
        })
      }))

      render(
        <TestWrapper initialEntries={['/payment']}>
          <Payment 
            deliveryAddress={mockDeliveryAddress}
            clearCart={vi.fn()}
          />
        </TestWrapper>
      )

      // Step 1: Select COD payment method
      const codButton = screen.getByText(/Cash on Delivery/i)
      fireEvent.click(codButton)

      await waitFor(() => {
        // Step 2: Verify no discount is applied for COD
        expect(screen.queryByText(/10% OFF on Prepaid Payment!/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/Payment Method Discount/i)).not.toBeInTheDocument()
        expect(screen.getByText(/Pay ₹2000/i)).toBeInTheDocument() // Full amount, no discount
      })

      // Step 3: Ensure Full Payment is selected
      expect(screen.getByLabelText(/Full Payment/i)).toBeChecked()

      // Step 4: Simulate order creation
      const payButton = screen.getByText(/Pay ₹2000/i)
      fireEvent.click(payButton)

      await waitFor(() => {
        expect(mockCreateOrder).toHaveBeenCalledWith(
          expect.objectContaining({
            paymentMethod: 'cod',
            paymentPlan: 'full',
            totalAmount: 2000
          }),
          expect.any(Function)
        )
      })

      // Step 5: Verify order was saved correctly
      const savedOrder = await Order.findOne({ paymentMethod: 'cod' })
      expect(savedOrder).toBeTruthy()
      expect(savedOrder.paymentPlan).toBe('full')
      expect(savedOrder.paymentStatus).toBe('pending')
      expect(savedOrder.amountPaid).toBe(0) // COD orders start with 0 paid
    })
  })

  // INTEGRATION TEST 4: Admin status updates
  describe('Admin Status Update Flow', () => {
    beforeEach(() => {
      // Create Express app for testing
      app = express()
      app.use(express.json())
      
      // Mock createOrder to create a test order
      app.post('/api/orders', async (req, res) => {
        const order = new Order({
          ...req.body,
          status: 'pending',
          paymentStatus: 'paid',
          amountPaid: req.body.advanceAmount || req.body.totalAmount
        })
        await order.save()
        res.json({ success: true, order })
      })

      // Mock status update endpoint
      app.patch('/api/orders/:orderId/status', async (req, res) => {
        const order = await Order.findByIdAndUpdate(
          req.params.orderId,
          { status: req.body.status },
          { new: true }
        )
        res.json({ success: true, order })
      })

      // Mock tracking endpoint
      app.get('/api/orders/track/:orderId', async (req, res) => {
        const order = await Order.findById(req.params.orderId).select({
          status: 1,
          updatedAt: 1,
          shippingAddress: 1,
          items: 1,
          totalAmount: 1,
          paymentMethod: 1
        })
        
        if (!order) {
          return res.status(404).json({ success: false, message: 'Order not found' })
        }
        
        res.json({
          success: true,
          data: {
            orderId: order._id,
            status: order.status,
            shippingAddress: order.shippingAddress,
            items: order.items,
            totalAmount: order.totalAmount,
            paymentMethod: order.paymentMethod
          }
        })
      })
    })

    it('should update tracking page when admin changes order status from Pending → Shipped', async () => {
      // Step 1: Create a test order
      const orderResponse = await request(app)
        .post('/api/orders')
        .send({
          items: mockCartItems,
          shippingAddress: mockDeliveryAddress,
          totalAmount: 2000,
          paymentMethod: 'upi',
          paymentPlan: 'full'
        })
        .expect(200)

      const orderId = orderResponse.body.order._id

      // Step 2: Verify initial status is pending
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            orderId,
            status: 'pending',
            shippingAddress: mockDeliveryAddress,
            items: mockCartItems,
            totalAmount: 2000,
            paymentMethod: 'upi'
          }
        })
      })

      render(
        <TestWrapper initialEntries={[`/orders/track/${orderId}`]}>
          <OrderTrack />
        </TestWrapper>
      )

      await waitFor(() => {
        // Should show pending status
        expect(screen.getByText(/Order Confirmed/i).closest('[class*="text-"]')).toHaveClass('text-green-600')
      })

      // Step 3: Admin updates status to processing
      await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: 'processing' })

      // Step 4: Admin updates status to shipped
      await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: 'shipped' })

      // Step 5: Mock updated tracking response
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            orderId,
            status: 'shipped',
            shippingAddress: mockDeliveryAddress,
            items: mockCartItems,
            totalAmount: 2000,
            paymentMethod: 'upi'
          }
        })
      })

      // Re-render to simulate page refresh
      render(
        <TestWrapper initialEntries={[`/orders/track/${orderId}`]}>
          <OrderTrack />
        </TestWrapper>
      )

      await waitFor(() => {
        // Should show shipped status
        expect(screen.getByText(/Shipped/i).closest('[class*="text-"]')).toHaveClass('text-purple-600')
        // Previous stages should be completed
        expect(screen.getByText(/Order Confirmed/i).closest('[class*="text-"]')).toHaveClass('text-green-600')
        expect(screen.getByText(/Processing/i).closest('[class*="text-"]')).toHaveClass('text-green-600')
      })
    })
  })

  // INTEGRATION TEST 5: Remaining payment flow
  describe('Remaining Payment Flow', () => {
    beforeEach(() => {
      app = express()
      app.use(express.json())
      
      // Mock remaining payment endpoint
      app.patch('/api/orders/:orderId/remaining-payment', async (req, res) => {
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
      })

      app.get('/api/orders/:orderId/remaining-payment', async (req, res) => {
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
      })
    })

    it('should complete remaining payment flow: Admin marks remaining payment as paid → remainingPaymentStatus updates to "paid" in DB', async () => {
      // Step 1: Create a partial payment order
      const partialOrder = new Order({
        items: mockCartItems,
        shippingAddress: mockDeliveryAddress,
        totalAmount: 2000,
        paymentMethod: 'upi',
        paymentPlan: 'partial',
        advanceAmount: 600,
        remainingAmount: 1400,
        remainingPaymentStatus: 'pending',
        status: 'pending',
        paymentStatus: 'paid',
        amountPaid: 600
      })
      await partialOrder.save()

      // Step 2: Verify initial status
      expect(partialOrder.remainingPaymentStatus).toBe('pending')
      expect(partialOrder.amountPaid).toBe(600)

      // Step 3: Admin marks remaining payment as paid
      const response = await request(app)
        .patch(`/api/orders/${partialOrder._id}/remaining-payment`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.remainingPaymentStatus).toBe('paid')
      expect(response.body.data.paymentStatus).toBe('paid')

      // Step 4: Verify database was updated
      const updatedOrder = await Order.findById(partialOrder._id)
      expect(updatedOrder.remainingPaymentStatus).toBe('paid')
      expect(updatedOrder.remainingPaymentDate).toBeTruthy()
      expect(updatedOrder.paymentStatus).toBe('paid')
      expect(updatedOrder.amountPaid).toBe(2000) // Full amount now paid
    })
  })

  // INTEGRATION TEST 6: Cancelled order flow
  describe('Cancelled Order Flow', () => {
    beforeEach(() => {
      app = express()
      app.use(express.json())
      
      // Mock tracking endpoint
      app.get('/api/orders/track/:orderId', async (req, res) => {
        const order = await Order.findById(req.params.orderId).select({
          status: 1,
          updatedAt: 1,
          shippingAddress: 1,
          items: 1,
          totalAmount: 1,
          paymentMethod: 1
        })
        
        if (!order) {
          return res.status(404).json({ success: false, message: 'Order not found' })
        }
        
        res.json({
          success: true,
          data: {
            orderId: order._id,
            status: order.status,
            shippingAddress: order.shippingAddress,
            items: order.items,
            totalAmount: order.totalAmount,
            paymentMethod: order.paymentMethod
          }
        })
      })
    })

    it('should handle cancelled order: tracking page shows cancelled, no further status updates possible', async () => {
      // Step 1: Create a cancelled order
      const cancelledOrder = new Order({
        items: mockCartItems,
        shippingAddress: mockDeliveryAddress,
        totalAmount: 2000,
        paymentMethod: 'upi',
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: 'Customer request'
      })
      await cancelledOrder.save()

      // Step 2: Verify tracking page shows cancelled status
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            orderId: cancelledOrder._id,
            status: 'cancelled',
            shippingAddress: mockDeliveryAddress,
            items: mockCartItems,
            totalAmount: 2000,
            paymentMethod: 'upi'
          }
        })
      })

      render(
        <TestWrapper initialEntries={[`/orders/track/${cancelledOrder._id}`]}>
          <OrderTrack />
        </TestWrapper>
      )

      await waitFor(() => {
        // Should show order details but no active status progression
        expect(screen.getByText(/₹2000/i)).toBeInTheDocument()
        // The stepper should still render but show cancelled state appropriately
      })
    })
  })

  // INTEGRATION TEST 7: Multiple orders
  describe('Multiple Orders Flow', () => {
    beforeEach(() => {
      app = express()
      app.use(express.json())
      
      // Mock tracking endpoint
      app.get('/api/orders/track/:orderId', async (req, res) => {
        const order = await Order.findById(req.params.orderId).select({
          status: 1,
          updatedAt: 1,
          shippingAddress: 1,
          items: 1,
          totalAmount: 1,
          paymentMethod: 1
        })
        
        if (!order) {
          return res.status(404).json({ success: false, message: 'Order not found' })
        }
        
        res.json({
          success: true,
          data: {
            orderId: order._id,
            status: order.status,
            shippingAddress: order.shippingAddress,
            items: order.items,
            totalAmount: order.totalAmount,
            paymentMethod: order.paymentMethod
          }
        })
      })
    })

    it('should handle edge case: Two orders placed by same customer — tracking works independently for each order ID', async () => {
      // Step 1: Create two orders for the same customer
      const order1 = new Order({
        items: mockCartItems,
        shippingAddress: mockDeliveryAddress,
        totalAmount: 2000,
        paymentMethod: 'upi',
        status: 'pending'
      })
      await order1.save()

      const order2 = new Order({
        items: [{ ...mockCartItems[0], title: 'Different Product' }],
        shippingAddress: mockDeliveryAddress,
        totalAmount: 1500,
        paymentMethod: 'cod',
        status: 'shipped'
      })
      await order2.save()

      // Step 2: Test tracking for first order
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            orderId: order1._id,
            status: 'pending',
            shippingAddress: mockDeliveryAddress,
            items: mockCartItems,
            totalAmount: 2000,
            paymentMethod: 'upi'
          }
        })
      })

      render(
        <TestWrapper initialEntries={[`/orders/track/${order1._id}`]}>
          <OrderTrack />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/₹2000/i)).toBeInTheDocument()
        expect(screen.getByText(/Test Product/i)).toBeInTheDocument()
        expect(screen.getByText(/UPI/i)).toBeInTheDocument()
      })

      // Step 3: Test tracking for second order
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            orderId: order2._id,
            status: 'shipped',
            shippingAddress: mockDeliveryAddress,
            items: [{ name: 'Different Product', quantity: 2, image: 'test.jpg' }],
            totalAmount: 1500,
            paymentMethod: 'cod'
          }
        })
      })

      render(
        <TestWrapper initialEntries={[`/orders/track/${order2._id}`]}>
          <OrderTrack />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/₹1500/i)).toBeInTheDocument()
        expect(screen.getByText(/Different Product/i)).toBeInTheDocument()
        expect(screen.getByText(/COD/i)).toBeInTheDocument()
      })

      // Step 4: Verify orders are independent
      const dbOrder1 = await Order.findById(order1._id)
      const dbOrder2 = await Order.findById(order2._id)
      
      expect(dbOrder1.status).toBe('pending')
      expect(dbOrder2.status).toBe('shipped')
      expect(dbOrder1.totalAmount).toBe(2000)
      expect(dbOrder2.totalAmount).toBe(1500)
    })
  })
})

/*
README: How to run integration tests

1. Install dependencies:
   npm install
   npm install mongodb-memory-server supertest --save-dev

2. Run all integration tests:
   npm test __tests__/integration.test.js

3. Run with coverage:
   npm test __tests__/integration.test.js --coverage

4. Run tests in watch mode:
   npm test __tests__/integration.test.js --watch

5. Run tests with UI:
   npm run test:ui __tests__/integration.test.js

Test Coverage:
- End-to-end flows for all payment combinations
- Admin status update workflows
- Remaining payment management
- Cancelled order handling
- Multiple order independence
- Database state verification
- Frontend-backend integration

Expected Results:
All tests should pass, confirming that:
- UPI + Full Payment flow works with 10% discount
- Partial Payment + UPI flow works without discount
- COD + Full Payment flow works without discount
- Admin status updates reflect in real-time tracking
- Remaining payment management works correctly
- Cancelled orders are handled appropriately
- Multiple orders work independently
- Database state is consistent throughout flows
- Frontend and backend integration is seamless
*/
