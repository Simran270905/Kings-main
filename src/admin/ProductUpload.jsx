'use client'

import { useState, useEffect } from 'react'
import { uploadToCloudinary } from "../utils/cloudinaryUpload"
import AdminCard from './layout/AdminCard'
import AdminButton from './layout/AdminButton'
import FormInput from './components/FormInput'
import FormTextarea from './components/FormTextarea'
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { API_BASE_URL } from '../config/api'

const ProductUpload = () => {
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          fetch(`${API_BASE_URL}/categories`),
          fetch(`${API_BASE_URL}/brands`)
        ])
        const catData = await catRes.json()
        const brandData = await brandRes.json()
        setCategories(catData.data?.categories || [])
        setBrands(brandData.data?.brands || [])
      } catch (e) {
        console.error('Failed to load categories/brands', e)
      }
    }
    fetchOptions()
  }, [])

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
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
    sku: ''
  })

  const [sizeInput, setSizeInput] = useState({ size: '', stock: '' })

  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
    setSuccess('')
  }

  const handleImageUpload = async (e, index) => {
    const file = e.target.files[0]
    if (!file) return

    setIsUploading(true)
    setError('')

    try {
      const imageUrl = await uploadToCloudinary(file)
      
      // Update specific image in the images array
      setFormData(prev => {
        const newImages = [...prev.images]
        newImages[index] = imageUrl
        return { ...prev, images: newImages }
      })
      
      setSuccess(`Image ${index + 1} uploaded successfully!`)
    } catch {
      setError(`Image ${index + 1} upload failed. Try again.`)
    } finally {
      setIsUploading(false)
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    setError('')
    setSuccess('')

    if (!formData.name || !formData.price || !formData.category) {
      setError('Please fill in all required fields: Name, Price, and Category')
      return
    }

    if (!formData.description) {
      setError('Product description is required')
      return
    }

    const price = Number(formData.price)
    if (price <= 0) {
      setError('Price must be greater than 0')
      return
    }

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
        price,
        selling_price: formData.selling_price ? Number(formData.selling_price) : null,
        category: formData.category,
        brand: formData.brand || null,
        images: validImages,
        stock: formData.hasSizes ? 0 : (Number(formData.stock) || 1),
        hasSizes: formData.hasSizes,
        sizes: formData.sizes,
        material: formData.material || 'Gold',
        purity: formData.purity || null,
        weight: formData.weight ? Number(formData.weight) : null,
        sku: formData.sku || undefined
      }

      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok) {
        const errMsg = data.message || data.error || 'Failed to add product'
        setError(errMsg)
        return
      }

      setFormData({
        name: '',
        description: '',
        price: '',
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
        sku: ''
      })

      setSuccess('✅ Product added successfully! It will now appear in the Products list and on the website.')
      setTimeout(() => setSuccess(''), 5000)

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
                    <option key={cat._id} value={cat.name}>{cat.name}</option>
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
                    <option key={brand._id} value={brand.name}>{brand.name}</option>
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
                label="Original Price (₹)"
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                required
              />

              <FormInput
                label="Selling Price (₹)"
                type="number"
                name="selling_price"
                value={formData.selling_price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                placeholder="Leave empty if same as price"
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
                    <label className="group relative block aspect-square border-2 border-dashed border-gray-300 rounded-xl hover:border-[#ae0b0b] cursor-pointer transition-all overflow-hidden">
                      <input
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
                  ) : (
                    <div className="relative group aspect-square">
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
                      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs font-medium px-2 py-1 rounded">
                        Image {index + 1}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-200">
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
