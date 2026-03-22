'use client'

import { memo, lazy, Suspense, useEffect, useState } from 'react'
import MainCarosal from '../../components/HomeCarosal/MainCarosal'
import HomeSectionCarosal from '../../components/HomeSectionCarosal/HomeSectionCarosal'
import { useProduct } from '../../context/ProductContext'
import { API_BASE_URL } from '../../../config/api'



// Lazy-load non-critical sections
const LazyHomeSection = lazy(() =>
  import('../../components/HomeSectionCarosal/HomeSectionCarosal')
)

function HomePage() {
  const { products, loading: productsLoading } = useProduct()
  const [categories, setCategories] = useState([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/categories`)
        const data = await res.json()
        setCategories(data.data?.categories || [])
      } catch {
        setCategories([])
      }
    }
    fetchCategories()
  }, [])

  const getProductsByCategory = (categoryName) => {
    if (!products || products.length === 0) return []
    return products.filter(p =>
      p.category && p.category.toLowerCase() === categoryName.toLowerCase()
    )
  }

  return (
    <div className="mt-0">
      {/* ================= HERO (Critical) ================= */}
      <MainCarosal />

      {/* ================= SECTIONS ================= */}
      <div className="space-y-10 py-20 flex flex-col justify-center px-5 lg:px-10">
        
        {productsLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#ae0b0b]"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : (
          <>
            {categories.slice(0, 2).map((cat) => {
              const catProducts = getProductsByCategory(cat.name)
              if (catProducts.length === 0) return null
              return (
                <HomeSectionCarosal
                  key={cat._id}
                  data={catProducts}
                  sectionName={cat.name.toUpperCase()}
                />
              )
            })}

            <Suspense fallback={null}>
              {categories.slice(2).map((cat) => {
                const catProducts = getProductsByCategory(cat.name)
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

      {/* Footer moved to App-level router */}
    </div>
  )
}

export default memo(HomePage)
