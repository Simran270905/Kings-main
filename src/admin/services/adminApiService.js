import { API_BASE_URL } from '../../config/api.js'

// Simple API service for admin operations
const adminApiService = {
  // Get all users/customers
  getAllUsers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch users')
      }
      
      return result
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    }
  }
}

export default adminApiService
