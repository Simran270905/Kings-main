import { describe, it, expect } from 'vitest'
import {
  calculateTotalStats,
  getRevenueStats,
  getMonthlySalesData,
  getTopProducts,
  getCustomerStats,
  getRecentOrders,
  getConversionRate,
} from './analyticsUtils'

describe('analyticsUtils', () => {
  const mockOrders = [
    {
      _id: '1',
      status: 'delivered',
      totalAmount: 1000,
      createdAt: new Date('2024-01-15'),
      customer: { email: 'user1@test.com' },
      items: [
        { id: 'p1', name: 'Product 1', quantity: 2, price: 500 },
      ],
    },
    {
      _id: '2',
      status: 'pending',
      totalAmount: 500,
      createdAt: new Date('2024-02-20'),
      customer: { email: 'user2@test.com' },
      items: [
        { id: 'p2', name: 'Product 2', quantity: 1, price: 500 },
      ],
    },
    {
      _id: '3',
      status: 'delivered',
      totals: { total: 1500 },
      createdAt: new Date('2024-03-10'),
      shippingAddress: { email: 'user1@test.com' },
      items: [
        { id: 'p1', name: 'Product 1', quantity: 3, price: 500 },
      ],
    },
    {
      _id: '4',
      status: 'cancelled',
      totalAmount: 200,
      createdAt: new Date('2024-03-25'),
      customer: { email: 'user3@test.com' },
      items: [],
    },
  ]

  describe('calculateTotalStats', () => {
    it('should calculate total orders and revenue correctly', () => {
      const stats = calculateTotalStats(mockOrders)
      expect(stats.totalOrders).toBe(4)
      expect(stats.deliveredOrders).toBe(2)
      expect(stats.totalRevenue).toBe(2500) // 1000 + 1500
    })

    it('should count orders by status', () => {
      const stats = calculateTotalStats(mockOrders)
      expect(stats.pendingOrders).toBe(1)
      expect(stats.cancelledOrders).toBe(1)
      expect(stats.deliveredOrders).toBe(2)
    })

    it('should calculate average order value', () => {
      const stats = calculateTotalStats(mockOrders)
      expect(stats.averageOrderValue).toBe(1250) // 2500 / 2 delivered
    })

    it('should return 0 for empty orders', () => {
      const stats = calculateTotalStats([])
      expect(stats.totalOrders).toBe(0)
      expect(stats.totalRevenue).toBe(0)
      expect(stats.averageOrderValue).toBe(0)
    })
  })

  describe('getRevenueStats', () => {
    it('should calculate total revenue from delivered orders only', () => {
      const stats = getRevenueStats(mockOrders)
      expect(stats.totalRevenue).toBe(2500)
    })

    it('should handle empty orders array', () => {
      const stats = getRevenueStats([])
      expect(stats.totalRevenue).toBe(0)
      expect(stats.revenueGrowth).toBe(0)
    })

    it('should calculate revenue growth correctly', () => {
      const thisMonth = new Date()
      const lastMonth = new Date()
      lastMonth.setMonth(lastMonth.getMonth() - 1)

      const orders = [
        {
          status: 'delivered',
          totalAmount: 1000,
          createdAt: thisMonth,
        },
        {
          status: 'delivered',
          totalAmount: 500,
          createdAt: lastMonth,
        },
      ]

      const stats = getRevenueStats(orders)
      expect(stats.thisMonthRevenue).toBe(1000)
      expect(stats.lastMonthRevenue).toBe(500)
      expect(stats.revenueGrowth).toBe(100) // (1000-500)/500 * 100
    })
  })

  describe('getMonthlySalesData', () => {
    it('should group orders by month', () => {
      const data = getMonthlySalesData(mockOrders)
      expect(data.length).toBeGreaterThan(0)
      expect(data[0]).toHaveProperty('month')
      expect(data[0]).toHaveProperty('orders')
      expect(data[0]).toHaveProperty('revenue')
    })

    it('should only include revenue from delivered orders', () => {
      const data = getMonthlySalesData(mockOrders)
      const total = data.reduce((sum, m) => sum + m.revenue, 0)
      expect(total).toBe(2500) // Only delivered orders
    })

    it('should return empty array for no orders', () => {
      const data = getMonthlySalesData([])
      expect(data).toEqual([])
    })
  })

  describe('getTopProducts', () => {
    it('should return top products by sales quantity', () => {
      const products = getTopProducts(5, mockOrders)
      expect(products[0].name).toBe('Product 1')
      expect(products[0].sales).toBe(5) // 2 + 3
    })

    it('should calculate product revenue', () => {
      const products = getTopProducts(5, mockOrders)
      expect(products[0].revenue).toBe(2500) // (2*500) + (3*500)
    })

    it('should limit results correctly', () => {
      const products = getTopProducts(1, mockOrders)
      expect(products.length).toBe(1)
    })

    it('should handle empty orders', () => {
      const products = getTopProducts(5, [])
      expect(products).toEqual([])
    })
  })

  describe('getCustomerStats', () => {
    it('should count unique customers by email', () => {
      const stats = getCustomerStats(mockOrders)
      expect(stats.uniqueCustomers).toBe(3) // user1, user2, user3
      expect(stats.totalOrders).toBe(4)
    })

    it('should handle orders without emails', () => {
      const ordersNoEmail = [
        { customer: {}, items: [] },
        { customer: { email: 'test@test.com' }, items: [] },
      ]
      const stats = getCustomerStats(ordersNoEmail)
      expect(stats.uniqueCustomers).toBe(1)
    })

    it('should return 0 for empty orders', () => {
      const stats = getCustomerStats([])
      expect(stats.uniqueCustomers).toBe(0)
      expect(stats.totalOrders).toBe(0)
    })
  })

  describe('getRecentOrders', () => {
    it('should sort orders by date descending', () => {
      const recent = getRecentOrders(10, mockOrders)
      expect(recent[0]._id).toBe('4') // Most recent (2024-03-25)
      expect(recent[recent.length - 1]._id).toBe('1') // Oldest (2024-01-15)
    })

    it('should limit results', () => {
      const recent = getRecentOrders(2, mockOrders)
      expect(recent.length).toBe(2)
    })

    it('should not mutate original array', () => {
      const original = [...mockOrders]
      getRecentOrders(10, mockOrders)
      expect(mockOrders).toEqual(original)
    })
  })

  describe('getConversionRate', () => {
    it('should calculate percentage of delivered orders', () => {
      const rate = getConversionRate(mockOrders)
      expect(rate).toBe('50.0') // 2 delivered out of 4 total
    })

    it('should return 0.0 for empty orders', () => {
      const rate = getConversionRate([])
      expect(rate).toBe('0.0')
    })

    it('should return string with 1 decimal place', () => {
      const orders = [
        { status: 'delivered' },
        { status: 'delivered' },
        { status: 'pending' },
      ]
      const rate = getConversionRate(orders)
      expect(rate).toBe('66.7') // 2/3 * 100
      expect(typeof rate).toBe('string')
    })
  })
})
