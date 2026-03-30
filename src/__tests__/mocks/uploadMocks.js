// Tests for Admin Image Upload — AddProduct/ProductUpload component
// Run with: npx jest __tests__/adminImageUpload.test.js

/**
 * Mock utilities for image upload testing
 * Creates mock File objects, upload responses, and test data
 */

// Mock File creation utilities
export const mockValidImage = (sizeMB = 1, type = 'image/jpeg') => {
  const sizeBytes = sizeMB * 1024 * 1024
  const buffer = new ArrayBuffer(sizeBytes)
  const mockFile = new File([buffer], `test-image-${Date.now()}.jpg`, {
    type,
    lastModified: Date.now()
  })
  
  // Add mock properties that File object normally has
  Object.defineProperty(mockFile, 'name', {
    value: `test-image-${Date.now()}.jpg`,
    writable: false
  })
  
  return mockFile
}

export const mockInvalidFile = (type = 'application/pdf') => {
  const buffer = new ArrayBuffer(1024)
  return new File([buffer], `test-file-${Date.now()}.pdf`, {
    type,
    lastModified: Date.now()
  })
}

export const mockOversizedFile = (sizeMB = 15) => {
  const sizeBytes = sizeMB * 1024 * 1024
  const buffer = new ArrayBuffer(sizeBytes)
  return new File([buffer], `oversized-${sizeMB}mb.jpg`, {
    type: 'image/jpeg',
    lastModified: Date.now()
  })
}

// Mock upload responses
export const mockUploadSuccess = (url = `https://cloudinary.com/test/image-${Date.now()}.jpg`) => ({
  success: true,
  data: {
    url,
    publicId: `test_image_${Date.now()}`,
    originalName: 'test-image.jpg',
    size: 1024000,
    format: 'jpg'
  },
  message: 'Upload successful'
})

export const mockUploadFailure = (reason = 'Upload failed') => ({
  success: false,
  message: reason,
  error: reason
})

// Mock product data
export const mockProductPayload = (overrides = {}) => ({
  name: 'Test Product',
  description: 'Test product description',
  originalPrice: 1000,
  sellingPrice: 900,
  category: 'bracelet',
  brand: 'test-brand',
  stock: 10,
  sku: 'TEST-001',
  material: 'gold',
  images: [],
  ...overrides
})

// Mock Cloudinary responses
export const mockCloudinaryConfig = {
  cloud_name: 'test-cloud',
  api_key: 'test-key',
  api_secret: 'test-secret'
}

// Mock admin authentication
export const mockAdminToken = 'mock-admin-jwt-token'
export const mockExpiredToken = 'expired-admin-token'

// Mock database product
export const mockProduct = (overrides = {}) => ({
  _id: '507f1f77bcf86cd799439011',
  name: 'Test Product',
  description: 'Test description',
  originalPrice: 1000,
  sellingPrice: 900,
  category: 'bracelet',
  brand: 'test-brand',
  stock: 10,
  sku: 'TEST-001',
  images: ['https://cloudinary.com/test/image1.jpg'],
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
})

// Mock API responses
export const mockCategoriesResponse = {
  success: true,
  data: {
    categories: [
      { _id: 'cat1', name: 'bracelet', description: 'Bracelets' },
      { _id: 'cat2', name: 'chain', description: 'Chains' }
    ]
  }
}

export const mockBrandsResponse = {
  success: true,
  data: {
    brands: [
      { _id: 'brand1', name: 'Test Brand', description: 'Test Brand' }
    ]
  }
}

// Mock FormData for file uploads
export const createMockFormData = (files = []) => {
  const formData = new FormData()
  files.forEach((file, index) => {
    formData.append('images', file)
  })
  return formData
}

// Mock fetch responses
export const mockFetchResponse = (data, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
  text: async () => JSON.stringify(data)
})

// Mock console methods to avoid noise in tests
export const mockConsole = () => {
  const originalConsole = global.console
  global.console = {
    ...originalConsole,
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  }
  return originalConsole
}

// Mock sessionStorage
export const mockSessionStorage = () => {
  const store = {}
  global.sessionStorage = {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString()
    }),
    removeItem: vi.fn((key) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    })
  }
  return store
}

// Helper to create mock event for file input
export const createMockFileEvent = (file) => {
  return {
    target: {
      files: [file],
      value: file.name
    }
  }
}

// Helper to create mock drag event
export const createMockDragEvent = (files) => {
  return {
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    dataTransfer: {
      files: files,
      items: files.map(file => ({
        kind: 'file',
        type: file.type,
        getAsFile: () => file
      }))
    }
  }
}

// Mock React Testing Library utilities
export const createMockUserEvent = () => ({
  preventDefault: vi.fn(),
  stopPropagation: vi.fn()
})

export default {
  mockValidImage,
  mockInvalidFile,
  mockOversizedFile,
  mockUploadSuccess,
  mockUploadFailure,
  mockProductPayload,
  mockCloudinaryConfig,
  mockAdminToken,
  mockExpiredToken,
  mockProduct,
  mockCategoriesResponse,
  mockBrandsResponse,
  createMockFormData,
  mockFetchResponse,
  mockConsole,
  mockSessionStorage,
  createMockFileEvent,
  createMockDragEvent,
  createMockUserEvent
}
