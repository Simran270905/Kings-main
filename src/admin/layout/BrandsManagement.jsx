import { useState, useEffect } from 'react'
import AdminCard from './AdminCard'
import { API_BASE_URL } from '@config/api.js'
import toast from 'react-hot-toast'
import { PlusCircleIcon, PencilIcon, TrashIcon, TagIcon } from '@heroicons/react/24/outline'

export default function BrandsManagement() {
  // ✅ STEP 4: FIX STATE INITIALIZATION
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBrand, setEditingBrand] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })

  // ✅ ADD BRAND LISTING DEBUG FUNCTION
  const debugBrandsList = async () => {
    console.log("🔍 COMPREHENSIVE BRANDS DEBUG:")
    console.log("📊 Current brands state:", brands)
    console.log("📊 Brands length:", brands.length)
    
    if (brands.length > 0) {
      console.log("📋 EXISTING BRANDS LIST:")
      brands.forEach((brand, index) => {
        console.log(`${index + 1}. Name: "${brand.name}"`)
        console.log(`   ID: ${brand._id}`)
        console.log(`   Description: ${brand.description || 'No description'}`)
        console.log(`   Active: ${brand.isActive || 'Unknown'}`)
        console.log(`   Created: ${brand.createdAt || 'Unknown'}`)
        console.log(`   ---`)
      })
    } else {
      console.log("❌ NO BRANDS FOUND IN STATE")
    }
    
    // Also try direct API call to verify database contents
    try {
      const token = localStorage.getItem('kk_admin_token')
      console.log("� DIRECT API CALL TO VERIFY DATABASE:")
      
      // Test all possible endpoints
      const endpoints = ['/api/brands', '/brands', '/brands/admin/all']
      
      for (const endpoint of endpoints) {
        try {
          console.log(`📡 Testing ${endpoint}:`)
          const res = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          const data = await res.json()
          console.log(`📦 Response from ${endpoint}:`, data)
          
          if (data?.data && Array.isArray(data.data)) {
            console.log(`📋 BRANDS FROM ${endpoint}:`)
            data.data.forEach((brand, index) => {
              console.log(`${index + 1}. "${brand.name}" (ID: ${brand._id})`)
            })
          } else if (data?.brands && Array.isArray(data.brands)) {
            console.log(`� BRANDS FROM ${endpoint} (data.brands):`)
            data.brands.forEach((brand, index) => {
              console.log(`${index + 1}. "${brand.name}" (ID: ${brand._id})`)
            })
          }
        } catch (err) {
          console.log(`❌ Failed ${endpoint}:`, err.message)
        }
      }
    } catch (error) {
      console.error('❌ Debug API call failed:', error)
    }
  }

  // ✅ CALL DEBUG FUNCTION ON COMPONENT RENDER
  useEffect(() => {
    debugBrandsList()
  }, [brands])

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('kk_admin_token')
      
      // ✅ TRY MULTIPLE ENDPOINTS TO FIND THE CORRECT ONE
      console.log("🔍 TESTING MULTIPLE BRANDS API ENDPOINTS:")
      
      let brandsData = []
      
      // Try endpoint 1: /api/brands
      try {
        console.log("📡 Trying endpoint: /api/brands")
        const res1 = await fetch(`${API_BASE_URL}/api/brands`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data1 = await res1.json()
        console.log("📦 Response from /api/brands:", data1)
        
        if (data1?.data && Array.isArray(data1.data)) {
          brandsData = data1.data
          console.log("✅ SUCCESS: Got brands from /api/brands")
        }
      } catch (err1) {
        console.log("❌ Failed /api/brands:", err1.message)
      }
      
      // Try endpoint 2: /brands (THIS ONE WORKS!)
      if (brandsData.length === 0) {
        try {
          console.log("📡 Trying endpoint: /brands")
          const res2 = await fetch(`${API_BASE_URL}/brands`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          const data2 = await res2.json()
          console.log("📦 Response from /brands:", data2)
          
          // ✅ CHECK ALL POSSIBLE DATA STRUCTURES FROM WORKING ENDPOINT
          if (data2?.data && Array.isArray(data2.data)) {
            brandsData = data2.data
            console.log("✅ SUCCESS: Got brands from /brands (data.data)")
          } else if (data2?.brands && Array.isArray(data2.brands)) {
            brandsData = data2.brands
            console.log("✅ SUCCESS: Got brands from /brands (data.brands)")
          } else if (data2?.data?.brands && Array.isArray(data2.data.brands)) {
            brandsData = data2.data.brands
            console.log("✅ SUCCESS: Got brands from /brands (data.data.brands)")
          } else {
            console.log("🔍 Checking all possible structures in /brands response:")
            console.log("📦 data2 keys:", Object.keys(data2 || {}))
            console.log("📦 data2.data keys:", Object.keys(data2?.data || {}))
            console.log("📦 data2.data type:", typeof data2?.data)
            
            // Try to find brands in any nested structure
            const findBrands = (obj, path = "") => {
              if (Array.isArray(obj)) {
                console.log(`✅ Found array at ${path}:`, obj)
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
            
            const foundBrands = findBrands(data2)
            if (foundBrands) {
              brandsData = foundBrands
              console.log("✅ SUCCESS: Found brands in nested structure")
            }
          }
        } catch (err2) {
          console.log("❌ Failed /brands:", err2.message)
        }
      }
      
      // Try endpoint 3: /brands/admin/all
      if (brandsData.length === 0) {
        try {
          console.log("📡 Trying endpoint: /brands/admin/all")
          const res3 = await fetch(`${API_BASE_URL}/brands/admin/all`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          const data3 = await res3.json()
          console.log("📦 Response from /brands/admin/all:", data3)
          
          if (data3?.data?.brands && Array.isArray(data3.data.brands)) {
            brandsData = data3.data.brands
            console.log("✅ SUCCESS: Got brands from /brands/admin/all")
          }
        } catch (err3) {
          console.log("❌ Failed /brands/admin/all:", err3.message)
        }
      }
      
      console.log("📊 FINAL BRANDS DATA:", brandsData)
      console.log("📊 FINAL BRANDS LENGTH:", brandsData.length)
      
      setBrands(brandsData)
    } catch (error) {
      console.error('❌ Failed to load brands:', error)
      toast.error('Failed to load brands')
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => {
    setEditingBrand(null)
    setForm({ name: '', description: '' })
    setShowModal(true)
  }

  const openEdit = (brand) => {
    setEditingBrand(brand)
    setForm({ name: brand.name, description: brand.description || '' })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingBrand(null)
    setForm({ name: '', description: '' })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Brand name is required')
      return
    }

    // ✅ RE-ENABLE DUPLICATE CHECK WITH BETTER LOGIC
    console.log("🔍 DUPLICATE VALIDATION DEBUG:")
    console.log("📊 Current brands:", brands)
    console.log("📊 Brands length:", brands.length)
    console.log("📊 Form name:", form.name)
    console.log("📊 Form name trimmed:", form.name.trim())
    console.log("📊 Editing brand ID:", editingBrand?._id)
    
    // Only check for duplicates if we have brands loaded
    if (brands.length > 0) {
      const existingBrand = brands.find(brand => {
        console.log(`🔍 Checking brand: ${brand.name} vs ${form.name.trim()}`)
        console.log(`🔍 Comparison: ${brand.name.toLowerCase()} === ${form.name.trim().toLowerCase()}`)
        console.log(`🔍 ID check: ${brand._id} !== ${editingBrand?._id}`)
        
        const matches = brand.name.toLowerCase() === form.name.trim().toLowerCase() && 
                       brand._id !== editingBrand?._id
        
        console.log(`🔍 Matches: ${matches}`)
        return matches
      })
      
      console.log("📊 Found existing brand:", existingBrand)
      
      if (existingBrand) {
        console.log("❌ DUPLICATE DETECTED - Blocking save")
        toast.error(`Brand "${form.name}" already exists`)
        return
      } else {
        console.log("✅ NO DUPLICATE - Proceeding with save")
      }
    } else {
      console.log("ℹ️ NO BRANDS LOADED - Skipping duplicate check")
    }

    setSaving(true)
    try {
      const token = localStorage.getItem('kk_admin_token')
      // ✅ USE THE WORKING ENDPOINT FOR BRAND CREATION
      const url = editingBrand
        ? `${API_BASE_URL}/brands/${editingBrand._id}`
        : `${API_BASE_URL}/brands`
      const method = editingBrand ? 'PUT' : 'POST'

      console.log(`🔧 ${method} Brand:`, form)
      console.log("📡 Using endpoint:", url)

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      })
      const data = await res.json()

      console.log("📦 Brand Save Response:", data)

      if (!res.ok) {
        // ✅ Handle specific duplicate key error
        if (data.message && data.message.includes('duplicate key') && data.message.includes('name')) {
          toast.error(`Brand "${form.name}" already exists. Please choose a different name.`)
        } else {
          toast.error(data.message || 'Failed to save brand')
        }
        return
      }

      toast.success(editingBrand ? 'Brand updated successfully' : 'Brand created successfully')
      closeModal()
      fetchBrands() // Refresh brands list
    } catch (error) {
      console.error('❌ Save brand error:', error)
      toast.error('Failed to save brand')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (brand) => {
    if (!window.confirm(`Delete brand "${brand.name}"? This cannot be undone.`)) return
    try {
      const token = localStorage.getItem('kk_admin_token')
      const res = await fetch(`${API_BASE_URL}/brands/${brand._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        toast.success('Brand deleted')
        fetchBrands()
      } else {
        toast.error('Failed to delete brand')
      }
    } catch {
      toast.error('Network error')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#ae0b0b] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Brands</h1>
          <p className="text-gray-500 mt-1">{brands.length} brand{brands.length !== 1 ? 's' : ''} total</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#ae0b0b] text-white rounded-lg font-medium hover:bg-[#8e0909] transition-colors"
        >
          <PlusCircleIcon className="h-5 w-5" />
          Add Brand
        </button>
      </div>

      {brands.length === 0 ? (
        <AdminCard>
          <div className="text-center py-16">
            <TagIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">No brands yet</p>
            <p className="text-gray-400 text-sm mt-1">Create your first brand to assign to products.</p>
            <button
              onClick={openAdd}
              className="mt-4 px-5 py-2.5 bg-[#ae0b0b] text-white rounded-lg font-medium hover:bg-[#8e0909]"
            >
              Add First Brand
            </button>
          </div>
        </AdminCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map(brand => (
            <AdminCard key={brand._id} padding="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block w-2 h-2 rounded-full ${brand.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <h3 className="font-semibold text-gray-900 truncate">{brand.name}</h3>
                  </div>
                  {brand.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{brand.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Created {new Date(brand.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEdit(brand)}
                    className="p-2 text-gray-400 hover:text-[#ae0b0b] hover:bg-red-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(brand)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </AdminCard>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {editingBrand ? 'Edit Brand' : 'Add New Brand'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. KKings Gold"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ae0b0b] focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Optional brand description..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ae0b0b] focus:border-transparent outline-none resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-[#ae0b0b] text-white rounded-lg font-medium hover:bg-[#8e0909] disabled:opacity-60"
                >
                  {saving ? 'Saving...' : (editingBrand ? 'Update Brand' : 'Create Brand')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
