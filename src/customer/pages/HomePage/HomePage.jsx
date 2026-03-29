'use client'

import { memo, lazy, Suspense, useEffect, useState, useMemo } from 'react'
import MainCarosal from '../../components/HomeCarosal/MainCarosal'
import HomeSectionCarosal from '../../components/HomeSectionCarosal/HomeSectionCarosal'
import { useProduct } from '../../context/ProductContext'
import { API_BASE_URL } from '@config/api.js'
import { HomePageSkeleton, CategorySkeleton } from '../../../components/LoadingSkeletons.jsx'

// Lazy-load non-critical sections
const LazyHomeSection = lazy(() =>
  import('../../components/HomeSectionCarosal/HomeSectionCarosal')
)

function HomePage() {
  const { products, loading: productsLoading } = useProduct()
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  // Memoize category products to avoid recalculation
  const productsByCategory = useMemo(() => {
    if (!products || products.length === 0) return {}
    
    const categoryMap = {}
    categories.forEach(cat => {
      categoryMap[cat.name] = products.filter(p =>
        p.category && p.category.toLowerCase() === cat.name.toLowerCase()
      )
    })
    return categoryMap
  }, [products, categories])

  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true)
      try {
        const res = await fetch(`${API_BASE_URL}/categories`)
        const data = await res.json()
        // Handle both old and new response structures
        let categories = [];
        
        // New structure: { success: true, data: [categories] }
        if (Array.isArray(data?.data)) {
          categories = data.data;
        }
        // Old structure: { success: true, data: { categories: [categories] } }
        else if (data?.data?.categories && Array.isArray(data.data.categories)) {
          categories = data.data.categories;
        }
        
        setCategories(Array.isArray(categories) ? categories : [])
      } catch (error) {
        console.error('❌ Error fetching categories:', error)
        setCategories([]) // Always ensure array
      } finally {
        setCategoriesLoading(false)
      }
    }
    fetchCategories()
  }, [])

  // Show skeleton while loading products
  if (productsLoading && categoriesLoading) {
    return <HomePageSkeleton />
  }

  return (
    <div className="mt-0">
      {/* ================= HERO (Critical) ================= */}
      <MainCarosal />

      {/* ================= SECTIONS ================= */}
      <div className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-16">
          
          {/* Categories Loading State */}
          {categoriesLoading ? (
            <CategorySkeleton />
          ) : !productsLoading && products.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-500 text-lg">No products available at the moment.</div>
              <div className="text-gray-400 text-sm mt-2">Please check back later.</div>
            </div>
          ) : (
            <>
              {/* Categories Only - No Products */}
              {categories.slice(0, 2).map((cat) => {
                return (
                  <div key={cat._id} className="space-y-8">
                    <div className="text-center">
                      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        {cat.name.toUpperCase()}
                      </h2>
                      <div className="w-24 h-1 bg-red-600 mx-auto"></div>
                    </div>
                    <div className="text-center py-12">
                      <p className="text-gray-600 text-lg">
                        Explore our {cat.name} collection
                      </p>
                      <a
                        href={`/shop/${cat.name.toLowerCase()}`}
                        className="inline-block mt-4 px-6 py-3 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors"
                      >
                        Shop {cat.name}
                      </a>
                    </div>
                  </div>
                )
              })}

              {/* Remaining Categories - Lazy Load */}
              <Suspense fallback={<CategorySkeleton />}>
                {categories.slice(2).map((cat) => {
                  return (
                    <div key={cat._id} className="space-y-8">
                      <div className="text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                          {cat.name.toUpperCase()}
                        </h2>
                        <div className="w-24 h-1 bg-red-600 mx-auto"></div>
                      </div>
                      <div className="text-center py-12">
                        <p className="text-gray-600 text-lg">
                          Explore our {cat.name} collection
                        </p>
                        <a
                          href={`/shop/${cat.name.toLowerCase()}`}
                          className="inline-block mt-4 px-6 py-3 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors"
                        >
                          Shop {cat.name}
                        </a>
                      </div>
                    </div>
                  )
                })}
              </Suspense>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default memo(HomePage)
