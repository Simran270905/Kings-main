// Debug: Show API configuration in development
if (import.meta.env.DEV) {
  console.log('🔍 Frontend API Configuration Debug:')
  console.log('VITE_API_URL:', import.meta.env.VITE_API_URL)
  console.log('NODE_ENV:', import.meta.env.MODE)
}

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.kkingsjewellery.com/api'

// Validate API URL in development
if (import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
  console.warn('⚠️ VITE_API_URL not set. Using production URL. Check your .env file.')
}

export const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_SITfLVVfxHyUDe'

export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dkbxrhe1v'

export const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'kkings_uploads'
