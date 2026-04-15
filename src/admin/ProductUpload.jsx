import { useState, useEffect } from 'react'
import { uploadToCloudinary } from "../utils/cloudinaryUpload"
import AdminCard from './layout/AdminCard'
import AdminButton from './layout/AdminButton'
import FormInput from './components/FormInput'
import FormTextarea from './components/FormTextarea'
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { API_BASE_URL } from '../config/api'
import { events } from '../utils/eventSystem'

const ProductUpload = () => {
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        console.log("🔍 PRODUCT UPLOAD - Fetching brands and categories...")
        
        // ✅ Use the working endpoints we discovered
        const [catRes, brandRes] = await Promise.all([
          fetch(`${API_BASE_URL}/categories`),
          fetch(`${API_BASE_URL}/brands`) // Use working endpoint
        ])
        const catData = await catRes.json()
        const brandData = await brandRes.json()
        
        console.log("📦 Categories Response:", catData)
        console.log("📦 Brands Response:", brandData)
        
        // ✅ Extract categories (assuming same structure as brands)
        const categories = catData?.data?.categories || catData?.data || catData?.categories || []
        
        // ✅ Extract brands using the correct structure we found earlier
        let brands = []
        if (brandData?.data?.brands && Array.isArray(brandData.data.brands)) {
          brands = brandData.data.brands
          console.log("✅ Found brands in data.data.brands")
        } else if (brandData?.brands && Array.isArray(brandData.brands)) {
          brands = brandData.brands
          console.log("✅ Found brands in data.brands")
        } else if (brandData?.data && Array.isArray(brandData.data)) {
          brands = brandData.data
          console.log("✅ Found brands in data.data")
        } else {
          console.log("🔍 Checking all brand data structures:", brandData)
          // Try to find brands in any nested structure
          const findBrands = (obj, path = "") => {
            if (Array.isArray(obj)) {
              console.log(`✅ Found brand array at ${path}:`, obj)
              return obj
            }
            if (obj && typeof obj === 'object') {
              for (const [key, value] of Object.entries(obj)) {
                if (key.toLowerCase().includes('brand')) {
                  console.log(`🔍 Checking ${path}${key}:`, value)
                  if (Array.isArray(value)) {
                    console.log(`✅ Found brands array at ${path}${key}:`, value)
                    return value
                  }
                }
                const found = findBrands(value, path ? `${path}.${key}` : key)
                if (found && found.length > 0) return found
              }
            }
            return null
          }
          
          const foundBrands = findBrands(brandData)
          if (foundBrands) {
            brands = foundBrands
            console.log("✅ Found brands in nested structure")
          }
        }
        
        console.log("📊 Final categories:", categories)
        console.log("📊 Final brands:", brands)
        console.log("📊 Brands length:", brands.length)
        
        setCategories(Array.isArray(categories) ? categories : [])
        setBrands(Array.isArray(brands) ? brands : [])
      } catch (e) {
        console.error('Failed to load categories/brands', e)
      }
    }
    fetchOptions()
  }, [])

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    purchasePrice: '',
    originalPrice: '',
    selling_price: '',
    category: '',
    brand: '',
    images: ['', '', '', ''], // Support 4 images
    stock: '1',
    hasSizes: false,
    sizes: [],
    material: 'Gold',
    purity: '',
    weight: '',
    sku: '',
    isBestSeller: false,
    isOnSale: false,
    discountPercentage: ''
  })

  const [sizeInput, setSizeInput] = useState({ size: '', stock: '' })

  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [errors, setErrors] = useState({})
  const [failedImages, setFailedImages] = useState(new Set()) // Track failed images

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }))
    setError('')
    setSuccess('')
  }

  const handleImageUpload = async (e, index) => {
    const file = e.target.files[0]
    if (!file) return

    setIsUploading(true)
    setError('')
    setSuccess('')

    try {
      console.log(`📤 Uploading image ${index + 1}:`, {
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        type: file.type
      })
      
      const imageUrl = await uploadToCloudinary(file)
      
      // Update specific image in the images array
      setFormData(prev => {
        const newImages = [...prev.images]
        newImages[index] = imageUrl
        return { ...prev, images: newImages }
      })
      
      // Remove from failed images set if it was there
      setFailedImages(prev => {
        const newSet = new Set(prev)
        newSet.delete(index)
        return newSet
      })
      
      setSuccess(`Image ${index + 1} uploaded successfully!`)
      console.log(`✅ Image ${index + 1} uploaded successfully:`, imageUrl)
    } catch (error) {
      console.error(`❌ Image ${index + 1} upload failed:`, error)
      const errorMessage = error.message || 'Unknown error occurred'
      
      // Add to failed images set
      setFailedImages(prev => new Set(prev).add(index))
      
      // Provide specific error messages
      if (errorMessage.includes('smaller than')) {
        setError(`Image ${index + 1} is too large. Max size is 10MB.`)
      } else if (errorMessage.includes('Only')) {
        setError(`Image ${index + 1} format not supported. Use JPEG, PNG, WebP, or GIF.`)
      } else if (errorMessage.includes('Authentication')) {
        setError(`Authentication required. Please login again.`)
      } else if (errorMessage.includes('Cloudinary')) {
        setError(`Cloudinary service error. Please try again.`)
      } else {
        setError(`Image ${index + 1} upload failed: ${errorMessage}`)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleRetryImage = async (index) => {
    // Clear the file input and trigger a new upload
    const fileInput = document.getElementById(`image-input-${index}`)
    if (fileInput) {
      fileInput.value = ''
      fileInput.click()
    }
  }

  const handleRemoveImage = (index) => {
    setFormData(prev => {
      const newImages = [...prev.images]
      newImages[index] = ''
      return { ...prev, images: newImages }
    })
  }

  const handleAddSize = () => {
    if (!sizeInput.size || !sizeInput.stock) {
      setError('Please enter both size and stock')
      return
    }
    setFormData(prev => ({
      ...prev,
      sizes: [...prev.sizes, { size: sizeInput.size, stock: Number(sizeInput.stock) }]
    }))
    setSizeInput({ size: '', stock: '' })
    setError('')
  }

  const handleRemoveSize = (index) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index)
    }))
  }

  const validate = () => {
    const newErrors = {}
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Product name is required'
    }
    
    if (!formData.description?.trim()) {
      newErrors.description = 'Product description is required'
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required'
    }
    
    const purchasePrice = Number(formData.purchasePrice)
    const originalPrice = Number(formData.originalPrice)
    const sellingPrice = Number(formData.selling_price)
    
    if (!formData.purchasePrice || isNaN(purchasePrice) || purchasePrice < 0) {
      newErrors.purchasePrice = 'Valid purchase price is required'
    }
    
    if (!formData.originalPrice || isNaN(originalPrice) || originalPrice < 0) {
      newErrors.originalPrice = 'Valid MRP price is required'
    }
    
    if (!formData.selling_price || isNaN(sellingPrice) || sellingPrice < 0) {
      newErrors.selling_price = 'Valid selling price is required'
    }
    
    // Pricing logic validation
    if (sellingPrice > originalPrice) {
      newErrors.selling_price = 'Selling price cannot be greater than MRP'
    }
    
    if (sellingPrice < purchasePrice) {
      newErrors.selling_price = 'Selling price must be higher than purchase price'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const testDirectAPICall = async () => {
    console.log('=== TESTING DIRECT API CALL ===')
    
    const token = localStorage.getItem('kk_admin_token')
    if (!token) {
      console.error('No admin token found')
      setError('No admin token found')
      return
    }
    
    const testPayload = {
      name: 'Test Product ' + Date.now(),
      description: 'Test description for debugging',
      originalPrice: 1000,
      sellingPrice: 800,
      purchasePrice: 500,
      category: '50f1b2b3c4d5e6f7a8b9c0d1', // Replace with actual category ID
      images: ['https://res.cloudinary.com/dkbxrhe1v/image/upload/v1776242526/kkings-jewellery/cdk6mddqokoclu4brgbw.png'],
      stock: 10
    }
    
    console.log('Test payload:', testPayload)
    
    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(testPayload)
      })
      
      console.log('Test response status:', res.status)
      const data = await res.json()
      console.log('Test response data:', data)
      
      if (res.ok) {
        setSuccess('TEST: Product created successfully!')
      } else {
        setError(`TEST: ${data.message || 'Failed to create product'}`)
      }
    } catch (error) {
      console.error('Test API error:', error)
      setError(`TEST: ${error.message}`)
    }
  }

  const handleSubmit = async (e) => {
    console.log('=== handleSubmit called ===')
    e.preventDefault()
    if (isSubmitting) {
      console.log('Already submitting, returning...')
      return
    }

    // DEBUG: Add test bypass
    if (e.shiftKey && e.altKey) {
      console.log('DEBUG MODE: Bypassing validation')
      await testDirectAPICall()
      return
    }

    console.log('Starting product submission...')
    setError('')
    setSuccess('')
    setErrors({})

    // Frontend validation
    if (!validate()) {
      console.log('Frontend validation failed')
      return
    }
    console.log('Frontend validation passed')
    // Frontend validation already handled by validate() function

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('kk_admin_token')
      if (!token) {
        setError('Not authenticated. Please log in as admin.')
        return
      }

      const validImages = formData.images.filter(img => img && img.trim() !== '')

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        // ✅ FIXED: Send correct field names - backend now handles both
        originalPrice: originalPrice,
        sellingPrice: sellingPrice, // Send as sellingPrice (camelCase)
        category: formData.category,
        brand: formData.brand || null,
        images: validImages,
        stock: formData.hasSizes ? 0 : stock,
        hasSizes: formData.hasSizes,
        sizes: formData.sizes,
        material: formData.material || 'Gold',
        purity: formData.purity || null,
        weight: formData.weight ? Number(formData.weight) : null,
        sku: formData.sku || undefined,
        isBestSeller: formData.isBestSeller || false,
        isOnSale: formData.isOnSale || false,
        discountPercentage: formData.discountPercentage ? Number(formData.discountPercentage) : 0
      }

      console.log("Final payload being sent:", payload)

      console.log('Making API call to:', `${API_BASE_URL}/products`)
      console.log('Request headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token ? '***' : 'MISSING'}`
      })

      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      console.log('Response status:', res.status)
      console.log('Response headers:', Object.fromEntries(res.headers.entries()))

      const data = await res.json()
      console.log('Response data:', data)

      if (!res.ok) {
        console.log('Request failed with status:', res.status)
        // Handle backend validation errors
        if (data.errors && typeof data.errors === 'object') {
          console.log('Backend validation errors:', data.errors)
          setErrors(data.errors)
          setError('Please fix the validation errors below')
        } else {
          const errMsg = data.message || data.error || 'Failed to add product'
          console.log('Backend error message:', errMsg)
          setError(errMsg)
        }
        return
      }

      setFormData({
        name: '',
        description: '',
        purchasePrice: '',
        originalPrice: '',
        selling_price: '',
        category: '',
        brand: '',
        images: ['', '', '', ''],
        stock: '1',
        hasSizes: false,
        sizes: [],
        material: 'Gold',
        purity: '',
        weight: '',
        sku: '',
        isBestSeller: false,
        isOnSale: false,
        discountPercentage: ''
      })

      setSuccess('✅ Product added successfully! It will now appear in the Products list and on the website.')
      setTimeout(() => setSuccess(''), 5000)

      // Trigger real-time sync event for customer side
      console.log('🔄 Triggering adminProductUpdated event for sync')
      window.dispatchEvent(new Event('adminProductUpdated'))

    } catch (err) {
      console.error('❌ Error adding product:', err)
      setError('Network error. Please check if the backend is running.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Product</h1>
          <p className="text-gray-500 mt-2">
            Add a new item to your inventory
          </p>
        </div>
      </div>

      <AdminCard padding="p-8">

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 text-green-700 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
              <FormInput
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter product name"
                required
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ae0b0b] focus:border-transparent"
                >
                  <option value="">
                    {categories.length === 0 ? 'No categories — add from Admin → Categories' : 'Select a category...'}
                  </option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
                {categories.length === 0 && (
                  <p className="text-xs text-orange-500 mt-1">⚠️ No categories found. <a href="/admin/categories" className="underline">Add categories first</a>.</p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                <select
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ae0b0b] focus:border-transparent"
                >
                  <option value="">
                    {brands.length === 0 ? 'No brands — add from Admin → Brands' : 'Select a brand (optional)...'}
                  </option>
                  {brands.map(brand => (
                    <option key={brand._id} value={brand._id}>{brand.name}</option>
                  ))}
                </select>
                {brands.length === 0 && (
                  <p className="text-xs text-gray-400 mt-1"><a href="/admin/brands" className="underline text-[#ae0b0b]">Add brands</a> to assign to products.</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Inventory</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <FormInput
                label="Purchase Price (₹) *"
                type="number"
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                required
              />

              <FormInput
                label="Discounted Price (₹)"
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                required
              />

              <FormInput
                label="Original Price / MRP (₹)"
                type="number"
                name="selling_price"
                value={formData.selling_price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                required
              />

              {!formData.hasSizes && (
                <FormInput
                  label="Stock"
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="1"
                />
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
                <select
                  name="material"
                  value={formData.material}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ae0b0b] focus:border-transparent"
                >
                  <option value="Gold">Gold</option>
                  <option value="Silver">Silver</option>
                  <option value="Platinum">Platinum</option>
                  <option value="Brass">Brass</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <FormInput
                label="Purity"
                name="purity"
                value={formData.purity}
                onChange={handleInputChange}
                placeholder="e.g., 22K, 925"
              />

              <FormInput
                label="Weight (grams)"
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                placeholder="0.00"
              />

              <FormInput
                label="SKU"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                placeholder="Product SKU (optional)"
              />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Size Management</h2>
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.hasSizes}
                  onChange={(e) => setFormData(prev => ({ ...prev, hasSizes: e.target.checked, sizes: [] }))}
                  className="w-4 h-4 text-[#ae0b0b] border-gray-300 rounded focus:ring-[#ae0b0b]"
                />
                <span className="text-sm font-medium text-gray-700">This product has sizes (e.g., Rings, Bracelets)</span>
              </label>
            </div>

            {formData.hasSizes && (
              <div className="space-y-4">
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Size (e.g., 7, M, L)"
                    value={sizeInput.size}
                    onChange={(e) => setSizeInput(prev => ({ ...prev, size: e.target.value }))}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ae0b0b] focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={sizeInput.stock}
                    onChange={(e) => setSizeInput(prev => ({ ...prev, stock: e.target.value }))}
                    min="0"
                    className="w-24 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ae0b0b] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleAddSize}
                    className="px-4 py-2.5 bg-[#ae0b0b] text-white rounded-lg hover:bg-[#8f0a0a] transition-colors"
                  >
                    Add Size
                  </button>
                </div>

                {formData.sizes.length > 0 && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Added Sizes:</h4>
                    <div className="space-y-2">
                      {formData.sizes.map((sizeObj, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                          <span className="text-sm font-medium">Size: {sizeObj.size} - Stock: {sizeObj.stock}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSize(index)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Tags & Sale Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isBestSeller"
                    checked={formData.isBestSeller}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#ae0b0b] border-gray-300 rounded focus:ring-[#ae0b0b]"
                  />
                  <span className="text-sm font-medium text-gray-700">Mark as Best Seller 🔥</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isOnSale"
                    checked={formData.isOnSale}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#ae0b0b] border-gray-300 rounded focus:ring-[#ae0b0b]"
                  />
                  <span className="text-sm font-medium text-gray-700">On Sale 💸</span>
                </label>
              </div>

              {formData.isOnSale && (
                <div className="grid md:grid-cols-2 gap-6 p-4 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Percentage (%)
                    </label>
                    <input
                      type="number"
                      name="discountPercentage"
                      value={formData.discountPercentage}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      step="1"
                      placeholder="e.g., 20 for 20% off"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ae0b0b] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This will automatically calculate the selling price
                    </p>
                  </div>
                  
                  <div className="flex items-end">
                    <div className="text-sm text-gray-600">
                      <p className="font-medium mb-2">Discount Preview:</p>
                      {formData.discountPercentage && formData.selling_price ? (
                        <div className="space-y-1">
                          <p>Original: ₹{Number(formData.selling_price).toLocaleString('en-IN')}</p>
                          <p className="text-red-600 font-semibold">
                            Discount: {formData.discountPercentage}% off
                          </p>
                          <p className="text-green-600 font-semibold">
                            Final: ₹{(formData.selling_price * (1 - formData.discountPercentage / 100)).toLocaleString('en-IN')}
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-400">Enter discount to see preview</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
            <FormTextarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={5}
              placeholder="Enter product description..."
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h2>
            <p className="text-sm text-gray-500 mb-4">Upload up to 4 high-quality images (JPEG, PNG, WebP)</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.images.map((image, index) => (
                <div key={index}>
                  {!image ? (
                    <div>
                      <label className="group relative block aspect-square border-2 border-dashed border-gray-300 rounded-xl hover:border-[#ae0b0b] cursor-pointer transition-all overflow-hidden">
                        <input
                          id={`image-input-${index}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, index)}
                          disabled={isUploading}
                          className="hidden"
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gray-50 group-hover:bg-red-50 transition-colors">
                          <PhotoIcon className="w-8 h-8 text-gray-400 group-hover:text-[#ae0b0b] mb-2" />
                          <span className="text-xs font-medium text-gray-500 group-hover:text-[#ae0b0b] text-center">
                            {isUploading ? 'Uploading...' : `Image ${index + 1}`}
                          </span>
                        </div>
                      </label>
                      
                      {/* Retry button for failed images */}
                      {failedImages.has(index) && (
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() => handleRetryImage(index)}
                            className="w-full text-xs bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600 transition-colors"
                          >
                            🔄 Retry Image {index + 1}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative group aspect-square">
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover rounded-xl border-2 border-green-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-lg p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all shadow-lg"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-green-600/80 text-white text-xs font-medium px-2 py-1 rounded">
                        ✅ Image {index + 1}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <AdminButton
              type="button"
              variant="secondary"
              onClick={testDirectAPICall}
              size="lg"
              className="text-xs"
            >
              DEBUG: Test API
            </AdminButton>
            
            <AdminButton
              type="submit"
              loading={isSubmitting}
              disabled={isUploading}
              size="lg"
              className="flex-1"
            >
              {isSubmitting ? 'Adding Product...' : 'Add Product'}
            </AdminButton>

            <AdminButton
              type="button"
              variant="secondary"
              onClick={() => window.history.back()}
              size="lg"
            >
              Cancel
            </AdminButton>
          </div>

        </form>
      </AdminCard>
    </div>
  )
}

export default ProductUpload
