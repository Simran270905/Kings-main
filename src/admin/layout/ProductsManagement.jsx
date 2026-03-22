'use client'

import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import AdminCard from './AdminCard'
import AdminButton from './AdminButton'
import StatusBadge from '../components/StatusBadge'
import {
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  PlusCircleIcon,
  FunnelIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline'
import { API_BASE_URL } from '../../config/api'
import toast from 'react-hot-toast'

const API_BASE = `${API_BASE_URL}/products`

export default function ProductsManagement() {
  const [products, setProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [loading, setLoading] = useState(true)

  // 🔥 Fetch products
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch(API_BASE)
      const data = await res.json()
      
      // Extract products array from response
      let productsArray = []
      if (data.success && data.data && data.data.products) {
        productsArray = data.data.products
      } else if (data.data && Array.isArray(data.data)) {
        productsArray = data.data
      } else if (data.products) {
        productsArray = data.products
      } else if (Array.isArray(data)) {
        productsArray = data
      }
      
      setProducts(productsArray)
    } catch (err) {
      console.error('❌ Error fetching products:', err)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  // 🔥 Unique categories
  const categories = useMemo(() => {
    if (!Array.isArray(products)) return []
    return [...new Set(products.map(p => p.category).filter(Boolean))]
  }, [products])

  // 🔥 Filter + Sort
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return []
    let result = [...products]

    if (searchQuery) {
      result = result.filter(product =>
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory)
    }

    result.sort((a, b) => {
      let aValue = a[sortBy] || ''
      let bValue = b[sortBy] || ''

      if (sortBy === 'price') {
        aValue = parseFloat(aValue) || 0
        bValue = parseFloat(bValue) || 0
      }

      return sortOrder === 'asc'
        ? aValue > bValue ? 1 : -1
        : aValue < bValue ? 1 : -1
    })

    return result
  }, [products, searchQuery, selectedCategory, sortBy, sortOrder])

  // 🔥 Delete product
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return

    try {
      const token = localStorage.getItem('kk_admin_token')

      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (res.ok) {
        toast.success('Product deleted successfully')
        fetchProducts()
      } else {
        toast.error('Delete failed')
      }
    } catch (err) {
      console.error(err)
    }
  }

  // 🔥 Stock helpers
  const getTotalStock = (product) => {
    if (product.sizes?.length) {
      return product.sizes.reduce((sum, s) => sum + (s.stock || 0), 0)
    }
    return product.stock || 0
  }

  const getStockStatus = (product) => {
    const total = getTotalStock(product)
    if (total <= 0) return 'out'
    if (total <= 5) return 'low'
    return 'ok'
  }

  // 🔥 Get image (Cloudinary support)
  const getProductImage = (product) => {
    return (
      product.images?.[0] || // ✅ new Cloudinary array
      product.image ||       // ✅ old single image
      product.imageUrl ||    // ✅ fallback
      ''
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#ae0b0b] border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-2">Manage your inventory ({filteredProducts.length} products)</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProducts}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <AdminButton
            href="/admin/upload"
            icon={PlusCircleIcon}
            size="lg"
          >
            Add Product
          </AdminButton>
        </div>
      </div>

      {/* Filters */}
      <AdminCard>
        <div className="flex items-center gap-2 mb-4">
          <FunnelIcon className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ae0b0b] focus:border-transparent"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ae0b0b] focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ae0b0b] focus:border-transparent"
          >
            <option value="createdAt">Newest First</option>
            <option value="name">Name (A-Z)</option>
            <option value="price">Price (Low to High)</option>
          </select>
        </div>
      </AdminCard>

      {/* Table */}
      <AdminCard padding="p-0">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <ShoppingBagIcon className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium mb-2">No products found</p>
            <p className="text-sm text-gray-400">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredProducts.map(product => {
                const stockStatus = getStockStatus(product)
                const totalStock = getTotalStock(product)
                const image = getProductImage(product)

                return (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    
                    {/* Product */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {image ? (
                          <img
                            src={image}
                            alt={product.name}
                            className="h-14 w-14 rounded-lg object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="h-14 w-14 bg-gray-100 rounded-lg flex items-center justify-center">
                            <ShoppingBagIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                          <p className="text-sm text-gray-500 truncate">
                            {product.description?.slice(0, 50) || 'No description'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <span className="inline-flex px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                        {product.category || '—'}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-gray-900">
                        ₹{(product.price || 0).toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* Stock */}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        stockStatus === 'out'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : stockStatus === 'low'
                          ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                          : 'bg-green-50 text-green-700 border border-green-200'
                      }`}>
                        {totalStock} {stockStatus === 'out' ? '(Out)' : stockStatus === 'low' ? '(Low)' : ''}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/products/edit/${product._id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit product"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id, product.name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete product"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        )}
      </AdminCard>
    </div>
  )
}
