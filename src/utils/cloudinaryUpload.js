// src/utils/cloudinaryUpload.js
import { API_BASE_URL } from '../config/api'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE_MB = 5

export const validateImageFile = (file) => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, WebP, and GIF images are allowed.' }
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return { valid: false, error: `Image must be smaller than ${MAX_SIZE_MB}MB.` }
  }
  return { valid: true }
}

/**
 * Upload image to Cloudinary via backend API
 * @param {File} file - Image file to upload
 * @returns {Promise<string>} - Secure URL of uploaded image
 */
export const uploadToCloudinary = async (file) => {
  const validation = validateImageFile(file)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  const token = localStorage.getItem('kk_admin_token')
  if (!token) {
    throw new Error('Authentication required. Please login.')
  }

  const formData = new FormData()
  formData.append('image', file)

  const res = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.message || 'Image upload failed. Please try again.')
  }

  const result = await res.json()
  if (!result.data || !result.data.url) {
    throw new Error('Upload succeeded but no URL was returned.')
  }

  return result.data.url
}

/**
 * Upload multiple images to Cloudinary via backend API
 * @param {File[]} files - Array of image files to upload
 * @returns {Promise<string[]>} - Array of secure URLs
 */
export const uploadMultipleToCloudinary = async (files) => {
  if (!files || files.length === 0) {
    throw new Error('No files provided')
  }

  if (files.length > 4) {
    throw new Error('Maximum 4 images allowed')
  }

  // Validate all files first
  for (const file of files) {
    const validation = validateImageFile(file)
    if (!validation.valid) {
      throw new Error(validation.error)
    }
  }

  const token = localStorage.getItem('kk_admin_token')
  if (!token) {
    throw new Error('Authentication required. Please login.')
  }

  const formData = new FormData()
  files.forEach(file => formData.append('images', file))

  const res = await fetch(`${API_BASE_URL}/upload/multiple`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.message || 'Image upload failed. Please try again.')
  }

  const result = await res.json()
  if (!result.data || !result.data.images) {
    throw new Error('Upload succeeded but no URLs were returned.')
  }

  return result.data.images.map(img => img.url)
}
