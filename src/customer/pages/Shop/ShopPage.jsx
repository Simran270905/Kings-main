"use client"

import React, { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import HomeSectionCard from '../../components/HomeSectionCard/HomeSectionCard'
import { useProduct } from '../../context/ProductContext'
import { AdjustmentsHorizontalIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

const sortOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
]

export default function ShopPage() {
  const { category } = useParams() || {}
  const [sort, setSort] = useState('newest')
  const { products: allProducts, loading } = useProduct()
  const cat = category ? category.toLowerCase() : null

  const baseProducts = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return []
    if (!cat) return allProducts
    
    // Filter products by category (case-insensitive match)
    return allProducts.filter(product => {
      if (!product.category) return false
      const productCat = product.category.toLowerCase()
      return productCat.includes(cat) || cat.includes(productCat)
    })
  }, [allProducts, cat])

  const products = useMemo(() => {
    const arr = [...baseProducts]
    if (sort === 'price_asc') arr.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0))
    if (sort === 'price_desc') arr.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0))
    return arr
  }, [baseProducts, sort])

  const title = cat
    ? cat.replace(/-/g, ' ').replace(/\b\w/g, (s) => s.toUpperCase())
    : 'All Products'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Link to="/" className="hover:text-[#ae0b0b] transition-colors">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-[#ae0b0b] transition-colors">Shop</Link>
            {cat && <><span>/</span><span className="text-gray-900 font-medium">{title}</span></>}
          </nav>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-serif font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-500 mt-1">{products.length} product{products.length !== 1 ? 's' : ''}</p>
            </div>
            {/* Sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:border-[#ae0b0b] bg-white cursor-pointer"
              >
                {sortOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Products grid */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#ae0b0b]"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <AdjustmentsHorizontalIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No products found</h2>
            <p className="text-gray-500 mb-6">Try a different category.</p>
            <Link to="/shop" className="inline-block px-6 py-3 bg-[#ae0b0b] text-white font-bold rounded-xl hover:bg-[#8f0a0a] transition-colors">
              View All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {products.map((p) => (
              <Link key={p.id} to={`/product/${p.id}`}>
                <HomeSectionCard product={p} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
