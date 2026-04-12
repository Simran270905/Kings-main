<<<<<<< HEAD
import { API_BASE_URL } from '../../config/api.js'
=======
import { API_BASE_URL } from '@config/api.js'
>>>>>>> 4969c802b413d50e828a9e734372265fe263f995

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
