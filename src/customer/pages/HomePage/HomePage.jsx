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
      <div className="space-y-10 py-20 flex flex-col justify-center px-5 lg:px-10">
        
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
            {/* First 2 Categories - Load Immediately */}
            {categories.slice(0, 2).map((cat) => {
              const catProducts = productsByCategory[cat.name] || []
              if (catProducts.length === 0) return null
              return (
                <HomeSectionCarosal
                  key={cat._id}
                  data={catProducts}
                  sectionName={cat.name.toUpperCase()}
                />
              )
            })}

            {/* Remaining Categories - Lazy Load */}
            <Suspense fallback={<CategorySkeleton />}>
              {categories.slice(2).map((cat) => {
                const catProducts = productsByCategory[cat.name] || []
                if (catProducts.length === 0) return null
                return (
                  <LazyHomeSection
                    key={cat._id}
                    data={catProducts}
                    sectionName={cat.name.toUpperCase()}
                  />
                )
              })}
            </Suspense>
          </>
        )}
      </div>
    </div>
  )
}

export default memo(HomePage)
