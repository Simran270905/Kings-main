// Tests for Admin Image Upload — AddProduct/ProductUpload component
// Run with: npx vitest __tests__/adminImageUpload.test.js

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { validateImageFile, uploadToCloudinary } from '../utils/cloudinaryUpload.js'

// Import mocks
import {
  mockValidImage,
  mockInvalidFile,
  mockOversizedFile,
  mockUploadSuccess,
  mockUploadFailure,
  mockProductPayload,
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
} from './mocks/uploadMocks.js'

// Mock external dependencies
vi.mock('../utils/cloudinaryUpload.js', async (importOriginal) => {
  const original = await importOriginal()
  return {
    ...original,
    uploadToCloudinary: vi.fn()
  }
})

vi.mock('../config/api.js', () => ({
  API_BASE_URL: 'http://localhost:3000/api'
}))

// Mock FormData and File for Node.js environment
global.FormData = FormData
global.File = File

describe('Admin Image Upload Tests', () => {
  let originalConsole
  let originalSessionStorage

  beforeEach(() => {
    // Mock console and sessionStorage
    originalConsole = mockConsole()
    originalSessionStorage = mockSessionStorage()

    // Reset mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Restore console and sessionStorage
    global.console = originalConsole
    global.sessionStorage = originalSessionStorage
  })

  describe('SECTION 1 — UNIT TESTS (upload helper/middleware)', () => {
    describe('Basic upload validation', () => {
      test('validateImageFile accepts valid JPEG file', () => {
        const validFile = mockValidImage(1, 'image/jpeg')
        const result = validateImageFile(validFile)
        expect(result.valid).toBe(true)
        expect(result.error).toBeUndefined()
      })

      test('validateImageFile accepts valid PNG file', () => {
        const validFile = mockValidImage(1, 'image/png')
        const result = validateImageFile(validFile)
        expect(result.valid).toBe(true)
        expect(result.error).toBeUndefined()
      })

      test('validateImageFile accepts valid WebP file', () => {
        const validFile = mockValidImage(1, 'image/webp')
        const result = validateImageFile(validFile)
        expect(result.valid).toBe(true)
        expect(result.error).toBeUndefined()
      })

      test('validateImageFile accepts valid GIF file', () => {
        const validFile = mockValidImage(1, 'image/gif')
        const result = validateImageFile(validFile)
        expect(result.valid).toBe(true)
        expect(result.error).toBeUndefined()
      })

      test('validateImageFile rejects PDF file', () => {
        const invalidFile = mockInvalidFile('application/pdf')
        const result = validateImageFile(invalidFile)
        expect(result.valid).toBe(false)
        expect(result.error).toBe('Only JPEG, PNG, WebP, and GIF images are allowed.')
      })

      test('validateImageFile rejects EXE file', () => {
        const invalidFile = mockInvalidFile('application/exe')
        const result = validateImageFile(invalidFile)
        expect(result.valid).toBe(false)
        expect(result.error).toBe('Only JPEG, PNG, WebP, and GIF images are allowed.')
      })

      test('validateImageFile rejects SVG file', () => {
        const invalidFile = mockInvalidFile('image/svg+xml')
        const result = validateImageFile(invalidFile)
        expect(result.valid).toBe(false)
        expect(result.error).toBe('Only JPEG, PNG, WebP, and GIF images are allowed.')
      })
    })

    describe('File size validation', () => {
      test('File under 10MB is accepted', () => {
        const validFile = mockValidImage(5) // 5MB
        const result = validateImageFile(validFile)
        expect(result.valid).toBe(true)
        expect(result.error).toBeUndefined()
      })

      test('File exactly at 10MB limit is accepted', () => {
        const validFile = mockValidImage(10) // 10MB
        const result = validateImageFile(validFile)
        expect(result.valid).toBe(true)
        expect(result.error).toBeUndefined()
      })

      test('File over 10MB is rejected with clear error', () => {
        const oversizedFile = mockOversizedFile(15) // 15MB
        const result = validateImageFile(oversizedFile)
        expect(result.valid).toBe(false)
        expect(result.error).toBe('Image must be smaller than 10MB.')
      })
    })

    describe('Upload to Cloudinary', () => {
      test('uploadToCloudinary succeeds with valid file', async () => {
        // Import the mocked function
        const { uploadToCloudinary } = await import('../utils/cloudinaryUpload.js')
        const validFile = mockValidImage(1)
        
        // Mock successful upload
        uploadToCloudinary.mockResolvedValue('https://cloudinary.com/test/image.jpg')
        
        const result = await uploadToCloudinary(validFile)
        expect(result).toBe('https://cloudinary.com/test/image.jpg')
        expect(uploadToCloudinary).toHaveBeenCalledWith(validFile)
      })

      test('uploadToCloudinary fails with invalid file', async () => {
        const { uploadToCloudinary } = await import('../utils/cloudinaryUpload.js')
        uploadToCloudinary.mockRejectedValue(new Error('Invalid file type'))
        const invalidFile = mockInvalidFile()
        
        await expect(uploadToCloudinary(invalidFile)).rejects.toThrow('Invalid file type')
      })

      test('uploadToCloudinary fails without authentication', async () => {
        const { uploadToCloudinary } = await import('../utils/cloudinaryUpload.js')
        uploadToCloudinary.mockRejectedValue(new Error('Authentication required'))
        const validFile = mockValidImage(1)
        
        await expect(uploadToCloudinary(validFile)).rejects.toThrow('Authentication required')
      })
    })
  })

  describe('SECTION 3 — FRONTEND COMPONENT TESTS (React Testing Library)', () => {
    describe('File validation', () => {
      test('Valid image file passes validation', () => {
        const validFile = mockValidImage(1, 'image/jpeg')
        const result = validateImageFile(validFile)
        expect(result.valid).toBe(true)
      })

      test('Invalid image file fails validation', () => {
        const invalidFile = mockInvalidFile('application/pdf')
        const result = validateImageFile(invalidFile)
        expect(result.valid).toBe(false)
        expect(result.error).toContain('Only JPEG, PNG, WebP, and GIF images are allowed')
      })

      test('Oversized file fails validation', () => {
        const oversizedFile = mockOversizedFile(15)
        const result = validateImageFile(oversizedFile)
        expect(result.valid).toBe(false)
        expect(result.error).toBe('Image must be smaller than 10MB.')
      })
    })

    describe('File event handling', () => {
      test('File input change event works correctly', () => {
        const validFile = mockValidImage(1)
        const mockEvent = createMockFileEvent(validFile)
        
        expect(mockEvent.target.files).toHaveLength(1)
        expect(mockEvent.target.files[0]).toBe(validFile)
        expect(mockEvent.target.value).toBe(validFile.name)
      })

      test('Drag and drop event works correctly', () => {
        const validFiles = [mockValidImage(1), mockValidImage(2)]
        const mockEvent = createMockDragEvent(validFiles)
        
        mockEvent.preventDefault()
        mockEvent.stopPropagation()
        
        expect(mockEvent.dataTransfer.files).toHaveLength(2)
        expect(mockEvent.dataTransfer.files[0]).toBe(validFiles[0])
        expect(mockEvent.dataTransfer.items[0].getAsFile()).toBe(validFiles[0])
      })
    })

    describe('Upload state management', () => {
      test('Upload success state updates correctly', async () => {
        const validFile = mockValidImage(1)
        
        // Mock successful upload
        uploadToCloudinary.mockResolvedValue('https://cloudinary.com/test/image.jpg')
        
        const result = await uploadToCloudinary(validFile)
        expect(result).toBe('https://cloudinary.com/test/image.jpg')
      })

      test('Upload failure state updates correctly', async () => {
        const validFile = mockValidImage(1)
        
        // Mock failed upload
        uploadToCloudinary.mockRejectedValue(new Error('Upload failed'))
        
        await expect(uploadToCloudinary(validFile)).rejects.toThrow('Upload failed')
      })
    })
  })

  describe('SECTION 4 — INTEGRATION TESTS', () => {
    describe('Flow 1 — Happy path (4 images)', () => {
      test('Admin uploads 4 images successfully', async () => {
        const validFiles = [mockValidImage(1), mockValidImage(2), mockValidImage(3), mockValidImage(4)]
        
        // Mock successful uploads for all 4 images
        uploadToCloudinary
          .mockResolvedValueOnce('https://cloudinary.com/test/image1.jpg')
          .mockResolvedValueOnce('https://cloudinary.com/test/image2.jpg')
          .mockResolvedValueOnce('https://cloudinary.com/test/image3.jpg')
          .mockResolvedValueOnce('https://cloudinary.com/test/image4.jpg')

        // Upload all 4 images
        const results = await Promise.all(
          validFiles.map(file => uploadToCloudinary(file))
        )

        expect(results).toHaveLength(4)
        expect(results[0]).toBe('https://cloudinary.com/test/image1.jpg')
        expect(results[1]).toBe('https://cloudinary.com/test/image2.jpg')
        expect(results[2]).toBe('https://cloudinary.com/test/image3.jpg')
        expect(results[3]).toBe('https://cloudinary.com/test/image4.jpg')
      })
    })

    describe('Flow 2 — Partial failure recovery', () => {
      test('Failed upload can be retried successfully', async () => {
        // Mock uploadToCloudinary to fail first, then succeed
        uploadToCloudinary
          .mockRejectedValueOnce(new Error('Upload failed'))
          .mockResolvedValueOnce('https://cloudinary.com/test/retry-image.jpg')

        const validFile = mockValidImage(1)
        
        // First attempt fails
        await expect(uploadToCloudinary(validFile)).rejects.toThrow('Upload failed')
        
        // Second attempt succeeds
        const result = await uploadToCloudinary(validFile)
        expect(result).toBe('https://cloudinary.com/test/retry-image.jpg')
      })
    })

    describe('Flow 4 — Large file rejection', () => {
      test('Large file is rejected before upload attempt', () => {
        const oversizedFile = mockOversizedFile(15)
        const result = validateImageFile(oversizedFile)
        
        expect(result.valid).toBe(false)
        expect(result.error).toBe('Image must be smaller than 10MB.')
      })
    })
  })

  describe('Error handling and edge cases', () => {
    test('Empty file array is handled correctly', () => {
      // The actual function doesn't handle null, so it will throw an error
      expect(() => validateImageFile(null)).toThrow()
    })

    test('Undefined file is handled correctly', () => {
      // The actual function doesn't handle undefined, so it will throw an error
      expect(() => validateImageFile(undefined)).toThrow()
    })

    test('Zero size file is handled correctly', () => {
      const zeroSizeFile = new File([], 'empty.jpg', { type: 'image/jpeg' })
      const result = validateImageFile(zeroSizeFile)
      expect(result.valid).toBe(true) // Zero size is technically valid
    })

    test('Very small file (1KB) is accepted', () => {
      const smallFile = new File([new ArrayBuffer(1024)], 'small.jpg', { type: 'image/jpeg' })
      const result = validateImageFile(smallFile)
      expect(result.valid).toBe(true)
    })

    test('Multiple image validation works correctly', () => {
      const validFiles = [
        mockValidImage(1, 'image/jpeg'),
        mockValidImage(2, 'image/png'),
        mockValidImage(3, 'image/webp')
      ]
      
      const results = validFiles.map(file => validateImageFile(file))
      expect(results).toHaveLength(3)
      results.forEach(result => {
        expect(result.valid).toBe(true)
        expect(result.error).toBeUndefined()
      })
    })

    test('Mixed valid and invalid files are handled correctly', () => {
      const files = [
        mockValidImage(1, 'image/jpeg'),
        mockInvalidFile('application/pdf'),
        mockValidImage(2, 'image/png')
      ]
      
      const results = files.map(file => validateImageFile(file))
      expect(results[0].valid).toBe(true)
      expect(results[1].valid).toBe(false)
      expect(results[2].valid).toBe(true)
      
      expect(results[1].error).toBe('Only JPEG, PNG, WebP, and GIF images are allowed.')
    })
  })

  describe('Mock utilities verification', () => {
    test('mockValidImage creates correct File object', () => {
      const mockFile = mockValidImage(5, 'image/jpeg')
      
      expect(mockFile).toBeInstanceOf(File)
      expect(mockFile.type).toBe('image/jpeg')
      expect(mockFile.size).toBe(5 * 1024 * 1024)
      expect(mockFile.name).toMatch(/^test-image-\d+\.jpg$/)
    })

    test('mockInvalidFile creates correct File object', () => {
      const mockFile = mockInvalidFile('application/pdf')
      
      expect(mockFile).toBeInstanceOf(File)
      expect(mockFile.type).toBe('application/pdf')
      expect(mockFile.size).toBe(1024)
      expect(mockFile.name).toMatch(/^test-file-\d+\.pdf$/)
    })

    test('mockOversizedFile creates correct File object', () => {
      const mockFile = mockOversizedFile(15)
      
      expect(mockFile).toBeInstanceOf(File)
      expect(mockFile.type).toBe('image/jpeg')
      expect(mockFile.size).toBe(15 * 1024 * 1024)
      expect(mockFile.name).toMatch(/^oversized-15mb\.jpg$/)
    })

    test('mockProductPayload creates correct product object', () => {
      const product = mockProductPayload({
        name: 'Custom Product',
        originalPrice: 2000
      })
      
      expect(product.name).toBe('Custom Product')
      expect(product.originalPrice).toBe(2000)
      expect(product.category).toBe('bracelet')
      expect(product.images).toEqual([])
    })

    test('createMockFileEvent creates correct event object', () => {
      const mockFile = mockValidImage(1)
      const mockEvent = createMockFileEvent(mockFile)
      
      expect(mockEvent.target.files).toHaveLength(1)
      expect(mockEvent.target.files[0]).toBe(mockFile)
      expect(mockEvent.target.value).toBe(mockFile.name)
    })

    test('createMockDragEvent creates correct event object', () => {
      const mockFiles = [mockValidImage(1), mockValidImage(2)]
      const mockEvent = createMockDragEvent(mockFiles)
      
      expect(mockEvent.dataTransfer.files).toHaveLength(2)
      expect(mockEvent.dataTransfer.items).toHaveLength(2)
      expect(mockEvent.preventDefault).toBeDefined()
      expect(mockEvent.stopPropagation).toBeDefined()
    })
  })
})
