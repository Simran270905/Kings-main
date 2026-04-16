"use client"

import React, { useMemo, useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useProduct } from '../../../context/ProductContext'
import HomeSectionCard from '../../components/HomeSectionCard/HomeSectionCard'

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' }
]

export default function ShopPage() {
  const { category } = useParams() || {}
  const [sort, setSort] = useState('newest')
  const [selectedCategory, setSelectedCategory] = useState(category || 'all')
  const { products: allProducts, loading } = useProduct()

  // Update selected category when URL parameter changes
  useEffect(() => {
    if (category && typeof category === 'string') {
      setSelectedCategory(category.toLowerCase())
    } else {
      setSelectedCategory('all')
    }
  }, [category])

  // Get ALL products without filtering
  const allProductsList = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return []
    
    // Remove duplicates
    const uniqueProducts = []
    const seenIds = new Set()
    
    for (const product of allProducts) {
      const productId = product.id || product._id
      if (!seenIds.has(productId)) {
        seenIds.add(productId)
        uniqueProducts.push(product)
      }
    }
    
    return uniqueProducts
  }, [allProducts])

  // Extract unique categories from products
  const categories = useMemo(() => {
    const uniqueCats = ['all', ...new Set(allProductsList.map(p => p.category).filter(Boolean))]
    return uniqueCats
  }, [allProductsList])

  // Apply category filtering and sorting
  const products = useMemo(() => {
    let arr = [...allProductsList]
    
    // Filter by category
    if (selectedCategory !== 'all') {
      arr = arr.filter(item => 
        item.category?.toLowerCase() === selectedCategory.toLowerCase()
      )
    }
    
    // Apply sorting
    if (sort === 'price_asc') arr.sort((a, b) => (Number(a.sellingPrice) || 0) - (Number(b.sellingPrice) || 0))
    if (sort === 'price_desc') arr.sort((a, b) => (Number(b.sellingPrice) || 0) - (Number(a.sellingPrice) || 0))
    
    return arr
  }, [allProductsList, selectedCategory, sort])

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link to="/" className="hover:text-[#ae0b0b] transition-colors">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-[#ae0b0b] transition-colors">Shop</Link>
            {selectedCategory !== 'all' && (
              <>
                <span>/</span>
                <span className="text-gray-900 font-medium">
                  {typeof selectedCategory === 'string' ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) : 'All Products'}
                </span>
              </>
            )}
          </nav>
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {selectedCategory === 'all' ? 'All Products' : (typeof selectedCategory === 'string' ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) : 'All Products')}
              </h1>
              <p className="text-gray-600">
                {selectedCategory === 'all' ? 'Discover our complete collection' : `Discover our ${selectedCategory} collection`}
              </p>
            </div>
            
            {/* Sort Dropdown */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#ae0b0b] bg-white"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-[#ae0b0b] text-white shadow-md'
                    : 'bg-white border border-gray-300 text-gray-700 hover:border-[#ae0b0b] hover:text-[#ae0b0b]'
                }`}
              >
                {category === 'all' ? 'All Products' : (typeof category === 'string' ? category.charAt(0).toUpperCase() + category.slice(1) : 'All Products')}
              </button>
            ))}
          </div>
          
          {/* Product Count */}
          <p className="text-sm text-gray-500 mt-4">
            {products.length} product{products.length !== 1 ? 's' : ''} {selectedCategory === 'all' ? 'available' : `in ${selectedCategory}`}
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#ae0b0b]"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {selectedCategory === 'all' ? 'No products found' : `No products in ${selectedCategory}`}
            </h2>
            <p className="text-gray-500 mb-4">
              {selectedCategory === 'all' 
                ? 'Check back later for new arrivals.' 
                : `Try selecting a different category or view all products.`
              }
            </p>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="inline-block px-6 py-3 bg-[#ae0b0b] text-white font-bold rounded-xl hover:bg-[#8f0a0a] transition-colors"
              >
                View All Products
              </button>
            )}
          </div>
        ) : (
          /* Products Grid */
          <div className="products-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <HomeSectionCard key={product._id || product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
