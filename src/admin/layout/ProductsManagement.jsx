import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAdminProduct } from '../context/AdminProductContext'
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
import adminApi from '../utils/adminApiService'
import toast from 'react-hot-toast'
import {
  safeArray,
  safeString,
  safeNumber,
  safeCurrency,
  safeProductName,
  safeCategoryName,
  logAdminData
} from '../utils/adminSafetyUtils'

export default function ProductsManagement() {
  const { products, loading, refreshProducts, getStockStatus, getTotalStock, getTotalSold, getStockOutCount } = useAdminProduct()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [deletingId, setDeletingId] = useState(null) // Track which product is being deleted
  const [currentPage, setCurrentPage] = useState(1) // Track current page for pagination

  // Safe data handling
  const safeProducts = safeArray(products)
  logAdminData('ProductsManagement', safeProducts, 'load')

  // Refresh products when component mounts (only once to prevent flickering)
  useEffect(() => {
    const timer = setTimeout(() => {
      refreshProducts()
    }, 500) // Increased delay to prevent 429 errors
    return () => clearTimeout(timer)
  }, []) // Empty dependency array - only run once

  // 🔥 Unique categories
  const categories = useMemo(() => {
    const categoryList = safeProducts.map(p => safeCategoryName(p.category || p.categoryId)).filter(Boolean)
    return [...new Set(categoryList)]
  }, [safeProducts])

  // 🔥 Filter + Sort
  const filteredProducts = useMemo(() => {
    let result = [...safeProducts]

    if (searchQuery) {
      result = result.filter(product =>
        safeProductName(product).toLowerCase().includes(searchQuery.toLowerCase()) ||
        safeCategoryName(product.category).toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedCategory) {
      result = result.filter(p => safeCategoryName(p.category) === selectedCategory)
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
    
    // Prevent multiple deletions of the same product
    if (deletingId === id) {
      console.log('Product already being deleted:', id)
      return
    }

    try {
      setDeletingId(id) // Set loading state
      await adminApi.deleteProduct(id)
      toast.success('Product deleted successfully')
      refreshProducts() // Refresh products list
    } catch (err) {
      console.error(err)
      if (err.message?.includes('Product not found')) {
        toast.error('Product was already deleted')
        refreshProducts() // Refresh to update UI
      } else {
        toast.error('Failed to delete product')
      }
    } finally {
      setDeletingId(null) // Clear loading state
    }
  }

  const fetchPage = async (page) => {
    try {
      setCurrentPage(page)
      const response = await adminApi.getProducts({ page, limit: 1000 })
      let list = []
      if (response?.data?.products) list = response.data.products
      else if (Array.isArray(response?.data)) list = response.data
      else if (Array.isArray(response)) list = response
      
      // Update products in context
      if (window.updateAdminProducts) {
        window.updateAdminProducts(list)
      } else {
        // Fallback if context update function not available
        console.log('Updating products with pagination:', list.length, 'items')
      }
    } catch (error) {
      console.error('Failed to fetch page:', error)
    }
  }

  // 🔥 Get image (Cloudinary support) - Fixed to handle space-separated strings
  const getProductImage = (product) => {
    // Handle space-separated string images (common issue in the database)
    if (product.images && typeof product.images === 'string' && product.images.trim()) {
      const imageArray = product.images.trim().split(/\s+/).filter(img => img);
      if (imageArray.length > 0) {
        return imageArray[0];
      }
    }
    
    // Handle array images (normal case)
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0];
    }
    
    return (
      product.image ||       // old single image
      product.imageUrl ||    // fallback
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
          <p className="text-gray-500 mt-2">Showing all {filteredProducts.length} products</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshProducts}
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

      {/* Stock Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{safeProducts.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {safeProducts.reduce((total, product) => {
                  return total + (product.availableStock || product.stock || 0)
                }, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sold</p>
              <p className="text-2xl font-bold text-gray-900">
                {getTotalSold().toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-red-50 rounded-lg">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Stock Out Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {getStockOutCount().toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {safeProducts.filter(product => 
                  (product.stockStatus !== 'Out of Stock') && 
                  ((product.availableStock || product.stock || 0) > 0) && 
                  ((product.availableStock || product.stock || 0) <= 10)
                ).length}
              </p>
            </div>
          </div>
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
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">SELLING PRICE</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">MRP</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
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
                        {safeCategoryName(product.category)}
                      </span>
                    </td>

                    {/* SELLING PRICE */}
                    <td className="px-6 py-4 text-right">
                      <span className="font-medium text-gray-700">
                        ₹{(product.sellingPrice || 0).toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* MRP (Original Price) */}
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-gray-900">
                        ₹{(product.originalPrice || 0).toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* Stock */}
                    <td className="px-6 py-4 text-center">
                      <div>
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          product.stockStatus === 'Out of Stock'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : product.stock <= 10
                            ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                            : 'bg-green-50 text-green-700 border border-green-200'
                        }`}>
                          {product.availableStock || product.stock || 0}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {product.stockStatus || (stockStatus === 'out' ? 'Out of Stock' : stockStatus === 'low' ? 'Low Stock' : 'In Stock')}
                        </p>
                        {product.sold > 0 && (
                          <p className="text-xs text-blue-600 mt-1">
                            Sold: {product.sold}
                          </p>
                        )}
                      </div>
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
                          disabled={deletingId === product._id}
                          className={`p-2 rounded-lg transition-colors ${
                            deletingId === product._id
                              ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                          title={deletingId === product._id ? 'Deleting...' : 'Delete product'}
                        >
                          {deletingId === product._id ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-red-600"></div>
                          ) : (
                            <TrashIcon className="h-5 w-5" />
                          )}
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

        {/* Pagination Controls */}
        {products.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing {filteredProducts.length} products
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchPage(1)}
                disabled={true}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                First
              </button>
              <button
                onClick={() => fetchPage(Math.max(1, (currentPage || 1) - 1))}
                disabled={(currentPage || 1) <= 1}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {currentPage || 1}
              </span>
              <button
                onClick={() => fetchPage((currentPage || 1) + 1)}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Next
              </button>
              <button
                onClick={() => fetchPage(999)}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </AdminCard>
    </div>
  )
}
