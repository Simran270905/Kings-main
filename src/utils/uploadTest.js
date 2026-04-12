// Test upload endpoint
import { API_BASE_URL } from '../config/api.js'

export const testUploadEndpoint = async () => {
  console.log('🧪 Testing upload endpoint...')
  
  // Check if admin token exists
  const token = sessionStorage.getItem('kk_admin_token')
  if (!token) {
    console.error('❌ No admin token found')
    return false
  }
  
  try {
    // Test upload endpoint with a simple request
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      // Don't send any file, just test if endpoint exists
    })
    
    console.log('📡 Upload endpoint response status:', response.status)
    
    if (response.status === 400) {
      const data = await response.json()
      console.log('✅ Upload endpoint exists and is working:', data.message)
      return true
    } else if (response.status === 401) {
      console.error('❌ Authentication failed')
      return false
    } else if (response.status === 404) {
      console.error('❌ Upload endpoint not found')
      return false
    } else {
      const data = await response.json()
      console.log('📦 Upload endpoint response:', data)
      return true
    }
  } catch (error) {
    console.error('❌ Upload endpoint test failed:', error.message)
    return false
  }
}

// Test Cloudinary configuration
export const testCloudinaryConfig = async () => {
  console.log('☁️ Testing Cloudinary configuration...')
  
  try {
    const response = await fetch(`${API_BASE_URL}/health`)
    const data = await response.json()
    
    if (data.services?.storage?.cloudinary) {
      console.log('✅ Cloudinary is configured')
      return true
    } else {
      console.error('❌ Cloudinary is not configured')
      return false
    }
  } catch (error) {
    console.error('❌ Failed to test Cloudinary config:', error.message)
    return false
  }
}
