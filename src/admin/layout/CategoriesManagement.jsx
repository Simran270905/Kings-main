'use client'

import { useState, useEffect } from 'react'
import AdminCard from './AdminCard'
import { API_BASE_URL } from '../../config/api'
import toast from 'react-hot-toast'
import { PlusCircleIcon, PencilIcon, TrashIcon, FolderIcon, PhotoIcon } from '@heroicons/react/24/outline'

export default function CategoriesManagement() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    image: '',
    imagePublicId: '',
    sortOrder: 0
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('kk_admin_token')
      const res = await fetch(`${API_BASE_URL}/categories/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setCategories(data.data?.categories || [])
    } catch {
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => {
    setEditingCategory(null)
    setForm({ name: '', description: '', image: '', imagePublicId: '', sortOrder: 0 })
    setShowModal(true)
  }

  const openEdit = (cat) => {
    setEditingCategory(cat)
    setForm({
      name: cat.name,
      description: cat.description || '',
      image: cat.image || '',
      imagePublicId: cat.imagePublicId || '',
      sortOrder: cat.sortOrder || 0
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingCategory(null)
    setForm({ name: '', description: '', image: '', imagePublicId: '', sortOrder: 0 })
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const token = localStorage.getItem('kk_admin_token')
      const formData = new FormData()
      formData.append('image', file)

      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.message || 'Image upload failed')
        return
      }

      // Delete old image if replacing
      if (form.imagePublicId && data.data?.publicId && form.imagePublicId !== data.data.publicId) {
        await fetch(`${API_BASE_URL}/upload/cloudinary`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ publicId: form.imagePublicId })
        })
      }

      setForm(prev => ({
        ...prev,
        image: data.data.url,
        imagePublicId: data.data.publicId
      }))
      toast.success('Image uploaded!')
    } catch {
      toast.error('Image upload failed')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = async () => {
    if (form.imagePublicId) {
      try {
        const token = localStorage.getItem('kk_admin_token')
        await fetch(`${API_BASE_URL}/upload/cloudinary`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ publicId: form.imagePublicId })
        })
      } catch {
        // Image deletion failed, continue anyway
      }
    }
    setForm(prev => ({ ...prev, image: '', imagePublicId: '' }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Category name is required')
      return
    }
    setSaving(true)
    try {
      const token = localStorage.getItem('kk_admin_token')
      const url = editingCategory
        ? `${API_BASE_URL}/categories/${editingCategory._id}`
        : `${API_BASE_URL}/categories`
      const method = editingCategory ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description,
          image: form.image || null,
          imagePublicId: form.imagePublicId || null,
          sortOrder: Number(form.sortOrder) || 0
        })
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.message || 'Failed to save category')
        return
      }

      toast.success(editingCategory ? 'Category updated!' : 'Category created!')
      closeModal()
      fetchCategories()
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"? This cannot be undone.`)) return
    try {
      const token = localStorage.getItem('kk_admin_token')
      const res = await fetch(`${API_BASE_URL}/categories/${cat._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        toast.success('Category deleted')
        fetchCategories()
      } else {
        toast.error('Failed to delete category')
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
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 mt-1">{categories.length} categor{categories.length !== 1 ? 'ies' : 'y'} total</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#ae0b0b] text-white rounded-lg font-medium hover:bg-[#8e0909] transition-colors"
        >
          <PlusCircleIcon className="h-5 w-5" />
          Add Category
        </button>
      </div>

      {categories.length === 0 ? (
        <AdminCard>
          <div className="text-center py-16">
            <FolderIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">No categories yet</p>
            <p className="text-gray-400 text-sm mt-1">Create categories with images to organize your products.</p>
            <button
              onClick={openAdd}
              className="mt-4 px-5 py-2.5 bg-[#ae0b0b] text-white rounded-lg font-medium hover:bg-[#8e0909]"
            >
              Add First Category
            </button>
          </div>
        </AdminCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map(cat => (
            <AdminCard key={cat._id} padding="p-0">
              <div className="relative">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-40 object-cover rounded-t-xl"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-100 rounded-t-xl flex items-center justify-center">
                    <FolderIcon className="h-12 w-12 text-gray-300" />
                  </div>
                )}
                <span className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-medium ${
                  cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {cat.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                {cat.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{cat.description}</p>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => openEdit(cat)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="flex items-center justify-center p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5">
              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Image</label>
                {form.image ? (
                  <div className="relative">
                    <img src={form.image} alt="Category" className="w-full h-48 object-cover rounded-xl" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-700"
                    >
                      &times;
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#ae0b0b] hover:bg-red-50 transition-colors">
                    {uploadingImage ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#ae0b0b] border-t-transparent" />
                    ) : (
                      <>
                        <PhotoIcon className="h-10 w-10 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Click to upload category image</span>
                        <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Chains"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ae0b0b] focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Optional category description..."
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ae0b0b] focus:border-transparent outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={e => setForm(p => ({ ...p, sortOrder: e.target.value }))}
                  min="0"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ae0b0b] focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">Lower number = appears first</p>
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
                  disabled={saving || uploadingImage}
                  className="flex-1 px-4 py-2.5 bg-[#ae0b0b] text-white rounded-lg font-medium hover:bg-[#8e0909] disabled:opacity-60"
                >
                  {saving ? 'Saving...' : (editingCategory ? 'Update Category' : 'Create Category')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
