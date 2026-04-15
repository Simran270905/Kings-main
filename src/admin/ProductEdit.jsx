import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { uploadToCloudinary } from "../utils/cloudinaryUpload"
import { API_BASE_URL } from '../config/api'
import AdminCard from './layout/AdminCard'
import AdminButton from './layout/AdminButton'
import FormInput from './components/FormInput'
import FormTextarea from './components/FormTextarea'
import { PhotoIcon, XMarkIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { events } from '../utils/eventSystem'

const ProductEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  // STEP 1: DETECT EDIT MODE
  const isEditMode = Boolean(id)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    purchasePrice: '',
    originalPrice: '',
    price: '',
    selling_price: '',
    category: '',
    brand: '',
    images: [],
    stock: '1',
    hasSizes: false,
    sizes: [],
    material: 'Gold',
    purity: '',
    weight: '',
    sku: '',
    isActive: true,
    isBestSeller: false,
    isOnSale: false,
    discountPercentage: '',
    // Ensure no undefined fields
    discountAmount: '',
    tags: '',
    metaTitle: '',
    metaDescription: '',
    specifications: {}
  })

  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [sizeInput, setSizeInput] = useState({ size: '', stock: '' })
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Pricing validation states
  const [pricingErrors, setPricingErrors] = useState({
    originalPrice: '',
    sellingPrice: ''
  })
  const [isValidPricing, setIsValidPricing] = useState(true)
  
  // STEP 2: STORE ORIGINAL DATA
  const [initialData, setInitialData] = useState(null)
  const [showInvalidPricingWarning, setShowInvalidPricingWarning] = useState(false)

  // Fetch product data + categories + brands
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [productRes, catRes, brandRes] = await Promise.all([
          fetch(`${API_BASE_URL}/products/${id}?populate=category,brand`),
          fetch(`${API_BASE_URL}/categories`),
          fetch(`${API_BASE_URL}/brands`)
        ])
        const productData = await productRes.json()
        const catData = await catRes.json()
        const brandData = await brandRes.json()

        if (!productRes.ok) throw new Error('Product not found')

        const product = productData.data || productData
        
        // STEP 2: STORE ORIGINAL DATA
        const productFormData = {
          name: product.name || '',
          description: product.description || '',
          originalPrice: product.originalPrice || '',
          price: product.price || '',
          selling_price: product.selling_price || '',
          category: product.category?._id || product.category || '',
          brand: product.brand?._id || product.brand || '',
          images: product.images || [],
          stock: product.stock || '1',
          hasSizes: product.hasSizes || false,
          sizes: product.sizes || [],
          material: product.material || 'Gold',
          purity: product.purity || '',
          weight: product.weight || '',
          sku: product.sku || '',
          isActive: product.isActive !== undefined ? product.isActive : true,
          isBestSeller: product.isBestSeller || false,
          isOnSale: product.isOnSale || false,
          discountPercentage: product.discountPercentage || '',
          // Ensure no undefined fields
          discountAmount: product.discountAmount || '',
          tags: product.tags || '',
          metaTitle: product.metaTitle || '',
          metaDescription: product.metaDescription || '',
          specifications: product.specifications || {}
        }
        
        setFormData(productFormData)
        setInitialData(productFormData)

        let categories = [];
        let brands = [];

        // New structure: { success: true, data: [categories] }
        if (Array.isArray(catData?.data)) {
          categories = catData.data;
        }
        // Old structure: { success: true, data: { categories: [categories] } }
        else if (catData?.data?.categories && Array.isArray(catData.data.categories)) {
          categories = catData.data.categories;
        }

        // Same for brands
        if (Array.isArray(brandData?.data)) {
          brands = brandData.data;
        }
        else if (brandData?.data?.brands && Array.isArray(brandData.data.brands)) {
          brands = brandData.data.brands;
        }

        setCategories(Array.isArray(categories) ? categories : [])
        setBrands(Array.isArray(brands) ? brands : [])
        
        // Validate initial pricing data (non-blocking for existing products)
        const initialFormData = {
          price: product.price || '',
          selling_price: product.selling_price || '',
          originalPrice: product.originalPrice || ''
        }
        validatePricing(initialFormData, false) // Don't enforce on initial load
      } catch (err) {
        setError(err.message || 'Failed to load product')
      } finally {
        setIsLoading(false)
      }
    }
    fetchAll()
  }, [id])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    let newValue = type === 'checkbox' ? checked : value
    
    // Handle number inputs properly
    if (type === 'number') {
      newValue = value === "" ? "" : Number(value)
    }
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: newValue 
    }))
    
    // Clear general error
    setError('')
    setSuccess('')
    
    // STEP 3: TRACK PRICE CHANGES & STEP 4: APPLY CONDITIONAL VALIDATION
    if (name === 'originalPrice' || name === 'selling_price' || name === 'price' || name === 'purchasePrice') {
      const newFormData = { ...formData, [name]: newValue }
      
      if (initialData) {
        const isPriceChanged = 
          newFormData.purchasePrice !== initialData.purchasePrice ||
          newFormData.price !== initialData.price ||
          newFormData.originalPrice !== initialData.originalPrice ||
          newFormData.selling_price !== initialData.selling_price
        
        if (isPriceChanged) {
          // Only validate when pricing is actually changed
          validatePricing(newFormData, true)
          setShowInvalidPricingWarning(false)
        } else {
          // Skip validation if pricing unchanged
          setPricingErrors({ originalPrice: '', sellingPrice: '' })
          setIsValidPricing(true)
        }
      } else {
        validatePricing(newFormData, true)
      }
    }
  }
  
  const validatePricing = (data, enforceValidation = false) => {
    const errors = {
      originalPrice: '',
      sellingPrice: ''
    }
    let isValid = true
    
    const originalPrice = Number(data.originalPrice || data.price || 0)
    const sellingPrice = Number(data.selling_price || 0)
    
    // Only validate if enforcement is enabled (pricing changed or new product)
    if (enforceValidation) {
      // Validate original price (MRP)
      if (originalPrice <= 0) {
        errors.originalPrice = 'MRP must be greater than 0'
        isValid = false
      }
      
      // Validate selling price
      if (sellingPrice > 0) {
        if (sellingPrice > originalPrice) {
          errors.sellingPrice = 'Selling price must be less than or equal to MRP'
          isValid = false
        }
      }
    } else {
      // Check for invalid pricing but don't block
      if (originalPrice <= 0 || (sellingPrice > 0 && sellingPrice > originalPrice)) {
        setShowInvalidPricingWarning(true)
      }
    }
    
    setPricingErrors(errors)
    setIsValidPricing(isValid)
    return isValid
  }
  
  const handleAutoCorrection = () => {
    const originalPrice = Number(formData.price || 0)
    const sellingPrice = Number(formData.selling_price || 0)
    
    if (sellingPrice > originalPrice && originalPrice > 0) {
      // Auto-swap values: make MRP the higher value
      setFormData(prev => ({
        ...prev,
        price: sellingPrice.toString(),      // MRP becomes the selling price
        selling_price: originalPrice.toString()  // Selling price becomes the MRP
      }))
      
      // Clear errors and validate new values
      setPricingErrors({ originalPrice: '', sellingPrice: '' })
      setIsValidPricing(true)
      setShowInvalidPricingWarning(false)
      
      setSuccess('Auto-corrected: Swapped MRP and selling price to maintain valid pricing')
      setTimeout(() => setSuccess(''), 3000)
    }
  }
  
  // STEP 7: OPTIONAL AUTO FIX
  const handleAutoFixInvalidPricing = () => {
    const originalPrice = Number(formData.price || formData.originalPrice || 0)
    const sellingPrice = Number(formData.selling_price || 0)
    
    if (originalPrice <= 0 && sellingPrice > 0) {
      // Fix MRP if it's invalid
      setFormData(prev => ({
        ...prev,
        price: sellingPrice.toString(),
        originalPrice: sellingPrice.toString()
      }))
      setSuccess('Auto-fixed: Set MRP equal to selling price')
      setShowInvalidPricingWarning(false)
    } else if (sellingPrice > originalPrice && originalPrice > 0) {
      // Use existing auto-correction
      handleAutoCorrection()
    }
  }

  const handleImageUpload = async (e, index) => {
    const file = e.target.files[0]
    if (!file) return

    setIsUploading(true)
    setError('')

    try {
      const imageUrl = await uploadToCloudinary(file)
      
      setFormData(prev => {
        const newImages = [...prev.images]
        if (index < newImages.length) {
          newImages[index] = imageUrl
        } else {
          newImages.push(imageUrl)
        }
        return { ...prev, images: newImages }
      })
      
      setSuccess(`Image ${index + 1} uploaded successfully!`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message || `Image ${index + 1} upload failed`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleAddNewImage = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (formData.images.length >= 4) {
      setError('Maximum 4 images allowed')
      return
    }

    setIsUploading(true)
    setError('')

    try {
      const imageUrl = await uploadToCloudinary(file)
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrl]
      }))
      setSuccess('Image added successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message || 'Image upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    setError('')
    setSuccess('')

    if (!formData.name || !formData.price || !formData.category || !formData.originalPrice) {
      setError('Please fill required fields')
      return
    }

    if (!formData.purchasePrice || Number(formData.purchasePrice) < 0) {
      setError('Purchase price must be a positive number')
      return
    }

    if (!formData.originalPrice || Number(formData.originalPrice) < 0) {
      setError('Original price (MRP) must be a positive number')
      return
    }

    if (formData.images.length === 0) {
      setError('At least one image is required')
      return
    }

    const price = Number(formData.price)
    const purchasePrice = Number(formData.purchasePrice)
    const originalPrice = Number(formData.originalPrice)
    
    if (price <= 0) {
      setError('Price must be greater than 0')
      return
    }

    if (formData.selling_price && Number(formData.selling_price) < purchasePrice) {
      setError('Selling price cannot be less than purchase price')
      return
    }

    // ✅ NEW VALIDATION: Selling price cannot be greater than MRP (original price)
    if (formData.selling_price && Number(formData.selling_price) > originalPrice) {
      setError('Selling price cannot be greater than MRP (original price)')
      return
    }

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('kk_admin_token')
      
      const payload = {
        ...formData,
        purchasePrice: Number(formData.purchasePrice) || 0,
        originalPrice: Number(formData.originalPrice) || 0,
        sellingPrice: formData.selling_price ? Number(formData.selling_price) : null,
        stock: formData.hasSizes ? 0 : (Number(formData.stock) || 1),
        weight: formData.weight ? Number(formData.weight) : undefined,
        discountPercentage: formData.discountPercentage ? Number(formData.discountPercentage) : 0,
        discountAmount: Number(formData.discountAmount) || 0,
        updatedAt: new Date().toISOString()
      }

      // Remove fields that shouldn't be sent
      delete payload.selling_price
      delete payload.price

      // Clean payload - remove empty strings and null values
      Object.keys(payload).forEach(key => {
        if (payload[key] === "" || payload[key] === null || payload[key] === undefined) {
          delete payload[key]
        }
      })

      console.log("FINAL PAYLOAD:", payload)

      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Failed to update product')
      }

      setSuccess('Product updated successfully!')
      
      // Trigger real-time sync event for customer side
      console.log('🔄 Triggering productUpdated event with data:', data.data?.product || data.data)
      events.productUpdated(data.data?.product || data.data)
      
      // Also trigger admin refresh
      console.log('🔄 Triggering adminProductUpdated event')
      window.dispatchEvent(new Event('adminProductUpdated'))
      
      setTimeout(() => {
        navigate('/admin/products')
      }, 1500)

    } catch (err) {
      setError(err.message || 'Failed to update product')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ae0b0b]"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/admin/products')}
            className="flex items-center gap-2 text-gray-600 hover:text-[#ae0b0b] mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Products</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-500 mt-2">Update product information</p>
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

        {showInvalidPricingWarning && (
          <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 text-yellow-700 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <span className="font-medium">⚠️ This product has invalid pricing. Please update it.</span>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={handleAutoFixInvalidPricing}
                  className="text-xs bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-colors"
                >
                  Auto-fix Pricing
                </button>
                <span className="text-xs text-yellow-600">or update pricing manually</span>
              </div>
            </div>
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
              <FormInput
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter product name"
                required
              />

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
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                <select
                  name="brand"
                  value={formData.brand ?? ""}
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

              <div>
                <FormInput
                  label="Original Price (MRP) (₹)"
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  required
                  inputClassName={pricingErrors.originalPrice ? 'border-red-500 focus:border-red-500 bg-red-50' : ''}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Original price before discount (MRP)
                </p>
                {pricingErrors.originalPrice && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {pricingErrors.originalPrice}
                  </p>
                )}
              </div>

              <div>
                <FormInput
                  label="Selling Price (₹)"
                  type="number"
                  name="selling_price"
                  value={formData.selling_price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="Leave empty if same as MRP"
                  inputClassName={pricingErrors.sellingPrice ? 'border-red-500 focus:border-red-500 bg-red-50' : ''}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Final price shown to customers
                </p>
                {pricingErrors.sellingPrice && (
                  <div className="space-y-2">
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {pricingErrors.sellingPrice}
                    </p>
                    <button
                      type="button"
                      onClick={handleAutoCorrection}
                      className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                    >
                      Auto-fix: Swap values
                    </button>
                  </div>
                )}
                {formData.selling_price && Number(formData.selling_price) > 0 && Number(formData.price) > 0 && Number(formData.selling_price) <= Number(formData.price) && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Valid pricing: Selling price ≤ MRP
                  </p>
                )}
              </div>

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
                  <option value="Diamond">Diamond</option>
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
                placeholder="Product SKU"
              />
            </div>
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
                      {formData.discountPercentage && formData.price ? (
                        <div className="space-y-1">
                          <p>Original: ₹{Number(formData.price).toLocaleString('en-IN')}</p>
                          <p className="text-red-600 font-semibold">
                            Discount: {formData.discountPercentage}% off
                          </p>
                          <p className="text-green-600 font-semibold">
                            Final: ₹{(formData.price * (1 - formData.discountPercentage / 100)).toLocaleString('en-IN')}
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status</h2>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-4 h-4 text-[#ae0b0b] border-gray-300 rounded focus:ring-[#ae0b0b]"
              />
              <span className="text-sm font-medium text-gray-700">Product is active and visible to customers</span>
            </label>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Size Management</h2>
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.hasSizes}
                  onChange={(e) => setFormData(prev => ({ ...prev, hasSizes: e.target.checked }))}
                  className="w-4 h-4 text-[#ae0b0b] border-gray-300 rounded focus:ring-[#ae0b0b]"
                />
                <span className="text-sm font-medium text-gray-700">This product has sizes</span>
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
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Current Sizes:</h4>
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
            <p className="text-sm text-gray-500 mb-4">Update or add product images (max 4)</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative group aspect-square">
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover rounded-xl border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-lg p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all shadow-lg"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                  <label className="absolute inset-0 cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, index)}
                      disabled={isUploading}
                      className="hidden"
                    />
                    <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                      <span className="text-white text-sm font-medium">Replace</span>
                    </div>
                  </label>
                </div>
              ))}
              
              {formData.images.length < 4 && (
                <label className="group relative block aspect-square border-2 border-dashed border-gray-300 rounded-xl hover:border-[#ae0b0b] cursor-pointer transition-all overflow-hidden">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAddNewImage}
                    disabled={isUploading}
                    className="hidden"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gray-50 group-hover:bg-red-50 transition-colors">
                    <PhotoIcon className="w-8 h-8 text-gray-400 group-hover:text-[#ae0b0b] mb-2" />
                    <span className="text-xs font-medium text-gray-500 group-hover:text-[#ae0b0b] text-center">
                      {isUploading ? 'Uploading...' : 'Add Image'}
                    </span>
                  </div>
                </label>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <AdminButton
              type="submit"
              loading={isSubmitting}
              disabled={isUploading || (isValidPricing === false && !showInvalidPricingWarning)}
              size="lg"
              className="flex-1"
            >
              {isSubmitting ? 'Updating Product...' : 'Update Product'}
            </AdminButton>

            <AdminButton
              type="button"
              variant="secondary"
              onClick={() => navigate('/admin/products')}
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

export default ProductEdit
