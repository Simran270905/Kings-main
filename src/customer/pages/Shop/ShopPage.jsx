"use client"

import React, { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronDownIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'
import { useProduct } from '../../context/ProductContext'
import HomeSectionCarosal from '../../components/HomeSectionCarosal/HomeSectionCarosal'
import CategoryHeader from '../../components/CategoryHeader/CategoryHeader'
import { CategorySkeleton } from '../../../components/LoadingSkeletons'

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' }
]

export default function ShopPage() {
  const { category } = useParams() || {}
  const [sort, setSort] = useState('newest')
  const { products: allProducts, loading } = useProduct()
  console.log('🛍️ ShopPage - Raw allProducts:', allProducts)
  console.log('🛍️ ShopPage - Loading:', loading)
  const cat = category ? category.toLowerCase() : null

  const baseProducts = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return []
    if (!cat) {
      // Remove duplicates from all products view
      const uniqueProducts = []
      const seenIds = new Set()
      
      for (const product of allProducts) {
        const productId = product.id || product._id
        if (!seenIds.has(productId)) {
          seenIds.add(productId)
          uniqueProducts.push(product)
        }
      }
      
      console.log(`🛍️ Shop Page: All Products - Found ${uniqueProducts.length} unique products from ${allProducts.length} total`)
      return uniqueProducts
    }
    
    // Filter products by category (case-insensitive match)
    const filtered = allProducts.filter(product => {
      if (!product.category) return false
      const productCat = product.category.toLowerCase()
      return productCat.includes(cat) || cat.includes(productCat)
    })
    
    // Remove duplicates based on product ID
    const uniqueProducts = []
    const seenIds = new Set()
    
    for (const product of filtered) {
      const productId = product.id || product._id
      if (!seenIds.has(productId)) {
        seenIds.add(productId)
        uniqueProducts.push(product)
      }
    }
    
    console.log(`🛍️ Shop Page: ${cat} - Found ${uniqueProducts.length} unique products from ${filtered.length} filtered`)
    return uniqueProducts
  }, [allProducts, cat])

  const products = useMemo(() => {
    const arr = [...baseProducts]
    if (sort === 'price_asc') arr.sort((a, b) => (Number(a.sellingPrice) || 0) - (Number(b.sellingPrice) || 0))
    if (sort === 'price_desc') arr.sort((a, b) => (Number(b.sellingPrice) || 0) - (Number(a.sellingPrice) || 0))
    console.log('🛍️ ShopPage - Final products array:', arr)
    return arr
  }, [baseProducts, sort])

  const title = cat
    ? cat.replace(/-/g, ' ').replace(/\b\w/g, (s) => s.toUpperCase())
    : 'All Products'

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ffffff] via-[#fffaf3] to-[#fdf6ec]">
      {/* Page header */}
      <div className="relative w-full px-4 sm:px-6 lg:px-14 py-12 lg:py-16">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#f3e6cf]/20 via-transparent to-[#f3e6cf]/20" />
        
        <div className="relative">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Link to="/" className="hover:text-[#ae0b0b] transition-colors">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-[#ae0b0b] transition-colors">Shop</Link>
            {cat && <><span>/</span><span className="text-gray-900 font-medium">{title}</span></>}
          </nav>
          
          <div className="flex items-end justify-between gap-4">
            <CategoryHeader title={title} showExploreButton={false} />
            <p className="text-sm text-gray-500">{products.length} product{products.length !== 1 ? 's' : ''}</p>
            
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

      {/* Products carousel - Same as homepage */}
      <div className="relative w-full px-4 sm:px-6 lg:px-14 pb-12 lg:pb-16">
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
          <HomeSectionCarosal 
            data={products} 
            sectionName={title}
            showExploreButton={false}
          />
        )}
      </div>
    </div>
  )
}
