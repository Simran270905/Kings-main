// 🔐 Admin API Service - Centralized API integration with JWT authentication
import { API_BASE_URL } from '@config/api.js'
import { events } from '../../utils/eventSystem.js'
import { cache } from '../../utils/cacheManager.js'

class AdminApiService {
  constructor() {
    this.baseURL = API_BASE_URL
    this.token = null
  }

  // 🔐 Get token from localStorage
  getToken() {
    if (!this.token) {
      this.token = localStorage.getItem('kk_admin_token')
    }
    return this.token
  }

  // 🔐 Set token
  setToken(token) {
    this.token = token
    if (token) {
      localStorage.setItem('kk_admin_token', token)
    } else {
      localStorage.removeItem('kk_admin_token')
    }
  }

  // 🔐 Clear token (logout)
  clearToken() {
    this.token = null
    localStorage.removeItem('kk_admin_token')
  }

  // 🌐 Make authenticated API calls
  async request(endpoint, options = {}) {
    const token = this.getToken()
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config)
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        this.clearToken()
        throw new Error('Session expired. Please login again.')
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`)
      }

      return data
    } catch (error) {
      console.error(`❌ API Error [${endpoint}]:`, error.message)
      throw error
    }
  }

  // ======================
  // 🔐 AUTHENTICATION
  // ======================

  // Admin login
  async login(password) {
    try {
      console.log('🔐 Attempting admin login with password:', password)
      
      const response = await fetch(`${this.baseURL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      })

      console.log('🔐 Login response status:', response.status)
      console.log('🔐 Login response headers:', response.headers)

      const data = await response.json()
      console.log('🔐 Login response data:', data)

      if (!response.ok) {
        // Handle specific login errors
        if (response.status === 401) {
          throw new Error('Invalid password')
        } else if (response.status === 400) {
          throw new Error(data.message || 'Password is required')
        } else {
          throw new Error(data.message || `HTTP ${response.status}`)
        }
      }

      if (data.success && data.data?.token) {
        this.setToken(data.data.token)
        return { success: true, token: data.data.token }
      }

      throw new Error('Login failed')
    } catch (error) {
      console.error(`❌ Login Error:`, error.message)
      throw error
    }
  }

  // Verify admin token
  async verifyToken() {
    try {
      const response = await fetch(`${this.baseURL}/admin/verify`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      })

      if (response.status === 401) {
        this.clearToken()
        return false
      }

      // Check if response is ok before parsing JSON
      if (!response.ok) {
        this.clearToken()
        return false
      }

      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json()
        return data.success === true
      } else {
        // If not JSON, assume invalid
        this.clearToken()
        return false
      }
    } catch (error) {
      console.error(`❌ Token verification error:`, error.message)
      this.clearToken()
      return false
    }
  }

  // Admin logout
  async logout() {
    try {
      await this.request('/admin/logout', { method: 'POST' })
    } finally {
      this.clearToken()
    }
  }

  // ======================
  // 📦 PRODUCTS
  // ======================

  // Get all products
  async getProducts(params = {}) {
    const query = new URLSearchParams(params).toString()
    return this.request(`/products${query ? '?' + query : ''}`)
  }

  // Get single product
  async getProduct(id) {
    return this.request(`/products/${id}`)
  }

  // Create product
  async createProduct(productData) {
    console.log('🔧 Creating product:', productData)
    
    const result = await this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    })
    
    // Trigger real-time sync event
    if (result.success && result.data) {
      events.productCreated(result.data)
      cache.invalidate('products') // Invalidate products cache
      console.log('🔄 Product created event triggered')
    }
    
    return result
  }

  // Update product
  async updateProduct(id, productData) {
    console.log('🔧 Updating product:', id, productData)
    
    const result = await this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    })
    
    // Trigger real-time sync event
    if (result.success && result.data) {
      events.productUpdated(result.data)
      cache.invalidate('products') // Invalidate products cache
      console.log('🔄 Product updated event triggered')
    }
    
    return result
  }

  // Delete product
  async deleteProduct(id) {
    console.log('🔧 Deleting product:', id)
    
    const result = await this.request(`/products/${id}`, {
      method: 'DELETE'
    })
    
    // Trigger real-time sync event
    if (result.success) {
      events.productDeleted(id)
      cache.invalidate('products') // Invalidate products cache
      console.log('🔄 Product deleted event triggered')
    }
    
    return result
  }

  // Get product stats
  async getProductStats() {
    return this.request('/products/stats')
  }

  // ======================
  // 📋 ORDERS
  // ======================

  // Get all orders (Admin)
  async getOrders(params = {}) {
    const query = new URLSearchParams(params).toString()
    return this.request(`/orders${query ? '?' + query : ''}`)
  }

  // Get single order
  async getOrder(id) {
    return this.request(`/orders/${id}`)
  }

  // Update order status
  async updateOrderStatus(id, status) {
    console.log('🔧 Updating order status:', id, status)
    
    const result = await this.request(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    })
    
    // Trigger real-time sync event
    if (result.success && result.data) {
      events.orderStatusChanged(id, status)
      events.orderUpdated(result.data)
      cache.invalidate('orders') // Invalidate orders cache
      console.log('🔄 Order status changed event triggered')
    }
    
    return result
  }

  // Mark COD order as paid
  async markCODOrderAsPaid(id, options = {}) {
    console.log('🔧 Marking COD order as paid:', id, options)
    
    const result = await this.request(`/orders/${id}/mark-cod-paid`, {
      method: 'PUT',
      body: JSON.stringify(options)
    })
    
    // Trigger real-time sync event
    if (result.success && result.data) {
      events.orderUpdated(result.data)
      cache.invalidate('orders') // Invalidate orders cache
      console.log('🔄 Order updated event triggered')
    }
    
    return result
  }

  // Get order stats
  async getOrderStats() {
    return this.request('/orders/stats')
  }

  // ======================
  // 👥 USERS
  // ======================

  // Get all users
  async getUsers(params = {}) {
    const query = new URLSearchParams(params).toString()
    return this.request(`/customers${query ? '?' + query : ''}`)
  }

  // Get user stats
  async getUserStats() {
    return this.request('/customers/stats')
  }

  // ======================
  // 📊 ANALYTICS
  // ======================

  // Get comprehensive admin analytics
  async getAnalytics(params = {}) {
    const query = new URLSearchParams(params).toString()
    return this.request(`/admin/analytics${query ? '?' + query : ''}`)
  }

  // Validate revenue
  async validateRevenue() {
    return this.request('/admin/analytics/validate-revenue')
  }

  // ======================
  // 🏷️ CATEGORIES & BRANDS
  // ======================

  // Get categories
  async getCategories() {
    return this.request('/categories')
  }

  // Get brands
  async getBrands() {
    return this.request('/brands')
  }

  // ======================
  // 🎫 COUPONS
  // ======================

  // Get coupons
  async getCoupons() {
    return this.request('/coupons')
  }

  // Create coupon
  async createCoupon(couponData) {
    return this.request('/coupons', {
      method: 'POST',
      body: JSON.stringify(couponData)
    })
  }

  // Update coupon
  async updateCoupon(id, couponData) {
    return this.request(`/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(couponData)
    })
  }

  // Delete coupon
  async deleteCoupon(id) {
    return this.request(`/coupons/${id}`, {
      method: 'DELETE'
    })
  }

  // ======================
  // 📝 CONTENT MANAGEMENT
  // ======================

  // Get homepage content
  async getHomepageContent() {
    return this.request('/content/homepage')
  }

  // Update homepage content
  async updateHomepageContent(content) {
    return this.request('/content/homepage', {
      method: 'PUT',
      body: JSON.stringify(content)
    })
  }

  // Get footer content
  async getFooterContent() {
    return this.request('/content/footer')
  }

  // Update footer content
  async updateFooterContent(content) {
    return this.request('/content/footer', {
      method: 'PUT',
      body: JSON.stringify(content)
    })
  }
}

// Create singleton instance
const adminApi = new AdminApiService()

export default adminApi
