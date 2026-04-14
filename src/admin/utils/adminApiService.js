// 🔐 Admin API Service - Centralized API integration with JWT authentication
import axios from 'axios'
import { API_BASE_URL } from '@config/api.js'
import { events } from '../../utils/eventSystem.js'
import { cache } from '../../utils/cacheManager.js'

class AdminApiService {
  constructor() {
    console.log(' AdminApiService: Initializing...');
    console.log(' AdminApiService: API_BASE_URL:', API_BASE_URL);
    this.baseURL = API_BASE_URL
    this.token = null
    console.log(' AdminApiService: Initialized with baseURL:', this.baseURL);
  }

  // SAFE API CALL WRAPPER - Does NOT swallow errors
  safeApiCall = async (promise) => {
    try {
      const res = await promise
      return res || {}
    } catch (err) {
      console.error("API Error:", err)
      // Let errors propagate naturally - don't swallow them
      throw err
    }
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
  // AUTHENTICATION
  // ======================

  // Admin login
  async login(password) {
    try {
      console.log(' Attempting admin login with password:', password)
      console.log(' Base URL:', this.baseURL)
      
      // Use axios directly without safeApiCall
      const response = await axios.post(`${this.baseURL}/admin/login`, { password })

      console.log(' Login response status:', response.status)
      console.log(' Login response data:', response.data)

      // Check if response is HTML (indicates routing issue)
      const contentType = response.headers['content-type']
      if (contentType && contentType.includes('text/html')) {
        throw new Error('Server returned HTML instead of JSON - check API routing')
      }

      const data = response.data || {}
      
      console.log(' Processing response data:', data)
      console.log(' data.success:', data.success)
      console.log(' data.data?.token:', data.data?.token)
      console.log(' data.token:', data.token)
      
      // Handle both response formats: { success: true, data: { token } } or { success: true, token }
      const isSuccess = data.success === true
      const token = data.data?.token || data.token

      console.log(' isSuccess:', isSuccess)
      console.log(' token exists:', !!token)

      if (isSuccess && token) {
        this.setToken(token)
        return { success: true, token, data }
      } else if (isSuccess) {
        throw new Error('Login successful but no token received')
      } else {
        console.log(' Throwing error - data.message:', data.message)
        throw new Error(data.message || 'Login failed')
      }
    } catch (error) {
      console.error("Login error:", error)
      
      // Handle axios HTTP errors with proper message extraction
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      } else if (error.response) {
        // Handle different HTTP status codes
        const status = error.response.status
        const contentType = error.response.headers['content-type']
        
        // Check if we got HTML instead of JSON
        if (contentType && contentType.includes('text/html')) {
          throw new Error('API routing error - server returned HTML instead of JSON')
        }
        
        if (status === 401) {
          throw new Error("Invalid password")
        } else if (status === 400) {
          throw new Error("Password is required")
        } else if (status === 404) {
          throw new Error("Admin login endpoint not found - check server routing")
        } else if (status === 500) {
          throw new Error("Server error - please try again")
        } else {
          throw new Error(`Login failed (${status})`)
        }
      } else if (error.request) {
        // Network error
        throw new Error("Network error - please check your connection")
      } else {
        // Other error
        throw new Error(error.message || 'Login failed')
      }
    }
  }

  // Verify admin token
  async verifyToken() {
    try {
      const token = this.getToken();
      
      // Only call API if token exists
      if (!token) {
        return false;
      }

      const response = await fetch(`${this.baseURL}/admin/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
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
  // PRODUCTS
  // ======================

  // Get all products
  async getProducts(params = {}) {
    // Set default limit to 100 products for admin
    const defaultParams = { limit: 100, ...params }
    const query = new URLSearchParams(defaultParams).toString()
    return this.request(`/products${query ? '?' + query : ''}`)
  }

  // Get recent products (for dashboard)
  async getRecentProducts(params = {}) {
    // Set default limit to 5 products for dashboard
    const defaultParams = { limit: 5, ...params }
    const query = new URLSearchParams(defaultParams).toString()
    return this.request(`/products/recent${query ? '?' + query : ''}`)
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
    }
    
    return result
  }

  // Update product
  async updateProduct(id, productData) {
    const result = await this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    })
    
    // Trigger real-time sync event
    if (result.success && result.data) {
      events.productUpdated(result.data)
      cache.invalidate('products') // Invalidate products cache
    }
    
    return result
  }

  // Delete product
  async deleteProduct(id) {
    const result = await this.request(`/products/${id}`, {
      method: 'DELETE'
    })
    
    // Trigger real-time sync event
    if (result.success) {
      events.productDeleted(id)
      cache.invalidate('products') // Invalidate products cache
    }
    
    return result
  }

  // Create order
  async createOrder(orderData) {
    console.log('🔧 Creating order:', orderData)
    
    const result = await this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    })
    
    return result
  }

  // Update order status
  async updateOrderStatus(orderId, status) {
    console.log('🔧 Updating order status:', { orderId, status })
    
    const result = await this.request(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    })
    
    return result
  }

  // Delete order
  async deleteOrder(orderId) {
    console.log('🔧 Deleting order:', orderId)
    
    const result = await this.request(`/orders/${orderId}`, {
      method: 'DELETE'
    })
    
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
    const result = await this.request(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    })
    
    // Trigger real-time sync event
    if (result.success && result.data) {
      events.orderStatusChanged(id, status)
      events.orderUpdated(result.data)
      cache.invalidate('orders') // Invalidate orders cache
    }
    
    return result
  }

  // Mark COD order as paid
  async markCODOrderAsPaid(id, options = {}) {
    const result = await this.request(`/orders/${id}/mark-cod-paid`, {
      method: 'PUT',
      body: JSON.stringify(options)
    })
    
    // Trigger real-time sync event
    if (result.success && result.data) {
      events.orderUpdated(result.data)
      cache.invalidate('orders') // Invalidate orders cache
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
console.log(' adminApiService: Creating singleton instance...');
const adminApi = new AdminApiService()
console.log(' adminApiService: Singleton created:', adminApi);

export default adminApi
