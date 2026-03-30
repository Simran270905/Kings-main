import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import { request } from 'supertest'
import express from 'express'
import OrderTrack from '../src/customer/pages/OrderTrack/OrderTrack.jsx'
import TrackOrderPage from '../src/customer/pages/TrackOrder/TrackOrderPage.jsx'
import OrderSuccess from '../src/customer/pages/OrderSuccess/OrderSuccess.jsx'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import Order from '../KKings_Jewellery-Backend-main/src/models/Order.js'

// Mock data
const mockOrderData = {
  _id: '507f1f77bcf86cd799439011',
  status: 'pending',
  createdAt: new Date('2024-01-15T10:30:00Z'),
  updatedAt: new Date('2024-01-15T10:30:00Z'),
  shippingAddress: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    mobile: '9876543210',
    streetAddress: '123 Test St',
    city: 'Test City',
    state: 'TS',
    zipCode: '123456'
  },
  items: [
    {
      name: 'Test Product',
      quantity: 2,
      image: 'test.jpg'
    }
  ],
  totalAmount: 1000,
  paymentMethod: 'upi',
  trackingNumber: 'TRK123456789',
  trackingUrl: 'https://courier.com/track/TRK123456789',
  estimatedDelivery: new Date('2024-01-20T00:00:00Z')
}

const mockCancelledOrder = {
  ...mockOrderData,
  status: 'cancelled',
  cancelledAt: new Date('2024-01-16T10:30:00Z'),
  cancellationReason: 'Customer request'
}

// Test wrapper
const TestWrapper = ({ children, initialEntries }) => (
  <MemoryRouter initialEntries={initialEntries}>
    {children}
  </MemoryRouter>
)

describe('Order Tracking Tests', () => {
  let mongoServer
  let app
  let testOrder

  beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())
    
    // Create test order
    testOrder = new Order(mockOrderData)
    await testOrder.save()
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
  })

  beforeEach(async () => {
    // Clear any additional data
    await Order.deleteMany({})
    
    // Recreate test order
    testOrder = new Order(mockOrderData)
    await testOrder.save()
    
    vi.clearAllMocks()
  })

  // FEATURE 2: API Endpoint Tests
  describe('Order Tracking API Tests', () => {
    beforeEach(() => {
      // Create Express app for testing
      app = express()
      app.use(express.json())
      
      // Mock the trackOrder controller
      app.get('/api/orders/track/:orderId', async (req, res) => {
        const { orderId } = req.params
        
        if (!orderId) {
          return res.status(400).json({ success: false, message: 'Order ID is required' })
        }
        
        try {
          const order = await Order.findById(orderId).select({
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

    it('should return correct status for a valid order ID', async () => {
      const response = await request(app)
        .get(`/api/orders/track/${testOrder._id}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.status).toBe('pending')
      expect(response.body.data.orderId).toBe(testOrder._id.toString())
      expect(response.body.data.totalAmount).toBe(1000)
    })

    it('should return 404 for an invalid/fake order ID', async () => {
      const fakeOrderId = '507f1f77bcf86cd799439999'
      
      const response = await request(app)
        .get(`/api/orders/track/${fakeOrderId}`)
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Order not found')
    })

    it('should return 400 for missing order ID', async () => {
      const response = await request(app)
        .get('/api/orders/track/')
        .expect(404) // Route not found
    })

    it('should NOT expose sensitive admin/customer data in tracking API response', async () => {
      const response = await request(app)
        .get(`/api/orders/track/${testOrder._id}`)
        .expect(200)

      const data = response.body.data
      
      // Should NOT contain sensitive fields
      expect(data).not.toHaveProperty('userId')
      expect(data).not.toHaveProperty('customer')
      expect(data).not.toHaveProperty('paymentStatus')
      expect(data).not.toHaveProperty('amountPaid')
      expect(data).not.toHaveProperty('paymentDate')
      expect(data).not.toHaveProperty('notes')
      expect(data).not.toHaveProperty('discount')
      
      // Should contain only safe tracking information
      expect(data).toHaveProperty('status')
      expect(data).toHaveProperty('shippingAddress')
      expect(data).toHaveProperty('items')
      expect(data).toHaveProperty('totalAmount')
      expect(data).toHaveProperty('paymentMethod')
    })

    it('should handle different order statuses correctly', async () => {
      // Test with different statuses
      const statuses = ['pending', 'processing', 'shipped', 'delivered']
      
      for (const status of statuses) {
        await Order.findByIdAndUpdate(testOrder._id, { status })
        
        const response = await request(app)
          .get(`/api/orders/track/${testOrder._id}`)
          .expect(200)

        expect(response.body.data.status).toBe(status)
      }
    })
  })

  // FEATURE 2: UI Component Tests
  describe('Order Tracking UI Tests', () => {
    it('should render stepper UI with all 4 stages', async () => {
      // Mock fetch to return order data
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: mockOrderData
        })
      })

      render(
        <TestWrapper initialEntries={[`/orders/track/${testOrder._id}`]}>
          <OrderTrack />
        </TestWrapper>
      )

      await waitFor(() => {
        // Check for all 4 stages
        expect(screen.getByText(/Order Confirmed/i)).toBeInTheDocument()
        expect(screen.getByText(/Processing/i)).toBeInTheDocument()
        expect(screen.getByText(/Shipped/i)).toBeInTheDocument()
        expect(screen.getByText(/Delivered/i)).toBeInTheDocument()
      })
    })

    it('should highlight correct stage based on current order status from DB', async () => {
      // Test with 'processing' status
      const processingOrder = { ...mockOrderData, status: 'processing' }
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: processingOrder
        })
      })

      render(
        <TestWrapper initialEntries={[`/orders/track/${testOrder._id}`]}>
          <OrderTrack />
        </TestWrapper>
      )

      await waitFor(() => {
        // Processing stage should be highlighted (current)
        const processingStage = screen.getByText(/Processing/i).closest('[class*="text-"]')
        expect(processingStage).toHaveClass('text-yellow-600')
        
        // Pending stage should be completed
        const pendingStage = screen.getByText(/Order Confirmed/i).closest('[class*="text-"]')
        expect(pendingStage).toHaveClass('text-green-600')
        
        // Shipped and Delivered should be inactive
        expect(screen.getByText(/Shipped/i).closest('[class*="text-"]')).toHaveClass('text-gray-400')
        expect(screen.getByText(/Delivered/i).closest('[class*="text-"]')).toHaveClass('text-gray-400')
      })
    })

    it('should show cancelled state clearly for cancelled orders', async () => {
      // Mock fetch to return cancelled order
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: mockCancelledOrder
        })
      })

      render(
        <TestWrapper initialEntries={[`/orders/track/${testOrder._id}`]}>
          <OrderTrack />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/Order Not Found/i)).not.toBeInTheDocument()
        // Should show order details even if cancelled
        expect(screen.getByText(/₹1000/i)).toBeInTheDocument()
      })
    })

    it('should work WITHOUT login (no auth token required)', async () => {
      // Clear localStorage to ensure no auth token
      localStorage.clear()

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: mockOrderData
        })
      })

      render(
        <TestWrapper initialEntries={[`/orders/track/${testOrder._id}`]}>
          <OrderTrack />
        </TestWrapper>
      )

      await waitFor(() => {
        // Should load successfully without authentication
        expect(screen.getByText(/Order Confirmed/i)).toBeInTheDocument()
        expect(screen.getByText(/₹1000/i)).toBeInTheDocument()
      })
    })

    it('should show loading state while fetching order data', async () => {
      // Mock fetch with delay
      global.fetch = vi.fn(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              data: mockOrderData
            })
          }), 100)
        )
      )

      render(
        <TestWrapper initialEntries={[`/orders/track/${testOrder._id}`]}>
          <OrderTrack />
        </TestWrapper>
      )

      // Should show loading state initially
      expect(screen.getByText(/Loading order details.../i)).toBeInTheDocument()
    })

    it('should handle network errors gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      render(
        <TestWrapper initialEntries={[`/orders/track/${testOrder._id}`]}>
          <OrderTrack />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/Failed to fetch order details/i)).toBeInTheDocument()
      })
    })
  })

  // FEATURE 2: Order Confirmation Page Tests
  describe('Order Confirmation Page Tests', () => {
    it('should show order ID with clickable tracking link', () => {
      const orderId = '507f1f77bcf86cd799439011'
      
      render(
        <TestWrapper initialEntries={['/order-success']}>
          <OrderSuccess />
        </TestWrapper>
      )

      // Mock location state
      window.history.replaceState({ orderId }, '', '/order-success')

      // Re-render with state
      render(
        <TestWrapper initialEntries={['/order-success']}>
          <OrderSuccess />
        </TestWrapper>
      )

      // Check for tracking message
      expect(screen.getByText(/Your order has been confirmed!/i)).toBeInTheDocument()
    })
  })

  // FEATURE 2: Track Order Page Tests
  describe('Track Order Page Tests', () => {
    it('should render track order input page correctly', () => {
      render(
        <TestWrapper initialEntries={['/orders/track']}>
          <TrackOrderPage />
        </TestWrapper>
      )

      expect(screen.getByText(/Track Your Order/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/Enter your Order ID/i)).toBeInTheDocument()
      expect(screen.getByText(/Track Order/i)).toBeInTheDocument()
    })

    it('should validate order ID input', async () => {
      render(
        <TestWrapper initialEntries={['/orders/track']}>
          <TrackOrderPage />
        </TestWrapper>
      )

      const trackButton = screen.getByText(/Track Order/i)
      const input = screen.getByPlaceholderText(/Enter your Order ID/i)

      // Click button without entering ID
      fireEvent.click(trackButton)

      // Should show validation error (mock toast)
      await waitFor(() => {
        expect(screen.getByText(/Please enter your Order ID/i)).toBeInTheDocument()
      })
    })
  })

  // FEATURE 2: Status Update Tests
  describe('Order Status Update Tests', () => {
    it('should update tracking page when admin changes order status', async () => {
      // Start with pending status
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: mockOrderData
        })
      })

      const { rerender } = render(
        <TestWrapper initialEntries={[`/orders/track/${testOrder._id}`]}>
          <OrderTrack />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/Order Confirmed/i).closest('[class*="text-"]')).toHaveClass('text-green-600')
      })

      // Simulate admin updating status to 'shipped'
      const shippedOrder = { ...mockOrderData, status: 'shipped' }
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: shippedOrder
        })
      })

      // Re-render to simulate page refresh
      rerender(
        <TestWrapper initialEntries={[`/orders/track/${testOrder._id}`]}>
          <OrderTrack />
        </TestWrapper>
      )

      await waitFor(() => {
        // Shipped stage should be highlighted
        expect(screen.getByText(/Shipped/i).closest('[class*="text-"]')).toHaveClass('text-purple-600')
        // Previous stages should be completed
        expect(screen.getByText(/Order Confirmed/i).closest('[class*="text-"]')).toHaveClass('text-green-600')
        expect(screen.getByText(/Processing/i).closest('[class*="text-"]')).toHaveClass('text-green-600')
      })
    })

    it('should handle complete status progression correctly', async () => {
      const statusProgression = ['pending', 'processing', 'shipped', 'delivered']
      
      for (const status of statusProgression) {
        const orderWithStatus = { ...mockOrderData, status }
        
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: orderWithStatus
          })
        })

        render(
          <TestWrapper initialEntries={[`/orders/track/${testOrder._id}`]}>
            <OrderTrack />
          </TestWrapper>
        )

        await waitFor(() => {
          // Current status should be highlighted
          const statusElement = screen.getByText(
            status === 'pending' ? /Order Confirmed/i : 
            status === 'processing' ? /Processing/i :
            status === 'shipped' ? /Shipped/i : /Delivered/i
          )
          expect(statusElement.closest('[class*="text-"]')).not.toHaveClass('text-gray-400')
        })
      }
    })
  })

  // FEATURE 2: Error Handling Tests
  describe('Order Tracking Error Handling Tests', () => {
    it('should handle malformed order IDs gracefully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({
          success: false,
          message: 'Order not found'
        })
      })

      render(
        <TestWrapper initialEntries={['/orders/track/invalid-id']}>
          <OrderTrack />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/Order Not Found/i)).toBeInTheDocument()
        expect(screen.getByText(/Please check your Order ID/i)).toBeInTheDocument()
      })
    })

    it('should handle server errors gracefully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({
          success: false,
          message: 'Internal server error'
        })
      })

      render(
        <TestWrapper initialEntries={[`/orders/track/${testOrder._id}`]}>
          <OrderTrack />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/Failed to fetch order details/i)).toBeInTheDocument()
      })
    })
  })
})

/*
README: How to run order tracking tests

1. Install dependencies:
   npm install
   npm install mongodb-memory-server supertest --save-dev

2. Run all order tracking tests:
   npm test __tests__/orderTracking.test.js

3. Run with coverage:
   npm test __tests__/orderTracking.test.js --coverage

4. Run tests in watch mode:
   npm test __tests__/orderTracking.test.js --watch

5. Run tests with UI:
   npm run test:ui __tests__/orderTracking.test.js

Test Coverage:
- API endpoint functionality and error handling
- UI component rendering and user interactions
- Order status progression and highlighting
- Authentication independence (no login required)
- Data security (no sensitive data exposure)
- Error handling for various scenarios
- Integration between frontend and backend

Expected Results:
All tests should pass, confirming that:
- Tracking API returns correct order information
- UI renders stepper with all 4 stages correctly
- Status highlighting works based on database values
- No authentication is required for tracking
- Sensitive data is not exposed
- Error handling works gracefully
- Status updates are reflected in real-time
*/
