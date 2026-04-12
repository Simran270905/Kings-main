'use client'

import { memo, lazy, Suspense, useEffect, useState, useMemo, useRef } from 'react'
import MainCarosal from '../../components/HomeCarosal/MainCarosal'
import HomeSectionCarosal from '../../components/HomeSectionCarosal/HomeSectionCarosal'
import HomeSectionCard from '../../components/HomeSectionCard/HomeSectionCard'
<<<<<<< HEAD
import { useProduct } from '../../../context/ProductContext'
import { API_BASE_URL } from '../../../config/api.js'
=======
import { useProduct } from '../../context/ProductContext'
import { API_BASE_URL } from '@config/api.js'
>>>>>>> 4969c802b413d50e828a9e734372265fe263f995
import { HomePageSkeleton, CategorySkeleton } from '../../../components/LoadingSkeletons.jsx'

// Lazy-load non-critical sections
const LazyHomeSection = lazy(() =>
  import('../../components/HomeSectionCarosal/HomeSectionCarosal')
)

function HomePage() {
  const { products, loading: productsLoading } = useProduct()
  const [categories, setCategories] = useState([])
  const [productsByCategory, setProductsByCategory] = useState({})
  const [loading, setLoading] = useState(true)
  const scrollRefs = useRef({})

  // Scroll functions for manual navigation
  const scrollLeft = (categoryId) => {
    const scrollRef = scrollRefs.current[categoryId]
    if (scrollRef) {
      scrollRef.scrollBy({
        left: -300,
        behavior: "smooth"
      })
    }
  }

  const scrollRight = (categoryId) => {
    const scrollRef = scrollRefs.current[categoryId]
    if (scrollRef) {
      scrollRef.scrollBy({
        left: 300,
        behavior: "smooth"
      })
    }
  }

  // Fetch categories and their products
  useEffect(() => {
    const fetchCategoriesAndProducts = async () => {
      try {
        setLoading(true)
        
        // Fetch all categories
        const catResponse = await fetch(`${API_BASE_URL}/categories`)
        const catData = await catResponse.json()
        
        // Debug: Log the actual response structure
        console.log('Categories API Response:', catData)
        
        // Handle different response structures
        let cats = []
        if (Array.isArray(catData)) {
          cats = catData
        } else if (catData?.data && Array.isArray(catData.data)) {
          cats = catData.data
        } else if (catData?.categories && Array.isArray(catData.categories)) {
          cats = catData.categories
        } else if (catData?.data?.categories && Array.isArray(catData.data.categories)) {
          cats = catData.data.categories
        } else {
          console.warn('Unexpected categories response structure:', catData)
          cats = []
        }
        
        console.log('Extracted categories:', cats)
        setCategories(cats)

        // For each category, fetch its products
        const productsMap = {}
        if (cats.length > 0) {
          await Promise.all(
            cats.map(async (cat) => {
              try {
                const prodResponse = await fetch(
                  `${API_BASE_URL}/products?category=${cat.name}&limit=8`
                )
                const prodData = await prodResponse.json()
                
                // Debug: Log products response
                console.log(`Products for category ${cat.name}:`, prodData)
                
                const prods = prodData.products 
                           || prodData.data?.products 
                           || prodData.data 
                           || prodData 
                           || []
                
                // Ensure products is an array
                const productsArray = Array.isArray(prods) ? prods : []
                
                if (productsArray.length > 0) {
                  productsMap[cat._id] = productsArray
                }
              } catch (err) {
                console.error(`Failed to fetch products for category ${cat.name}:`, err)
              }
            })
          )
        }
        
        console.log('Products by category map:', productsMap)
        setProductsByCategory(productsMap)
      } catch (err) {
        console.error('Failed to fetch categories/products:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCategoriesAndProducts()
  }, [])

  // Show loading state
  if (loading) {
    return (
      <div className="text-center py-8 sm:py-10 md:py-12 text-gray-500">
        Loading collections...
      </div>
    )
  }

  return (
    <div className="mt-0">
      {/* ================= HERO (Critical) ================= */}
      <MainCarosal />

      {/* ================= DYNAMIC CATEGORY SECTIONS ================= */}
      <div className="bg-gray-50 py-8 sm:py-10 md:py-12 px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          {categories.map(cat => {
            const catProducts = productsByCategory[cat._id];
            if (!catProducts || catProducts.length === 0) return null;

            return (
              <div key={cat._id} className="bg-[#faf9f6] rounded-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 md:mb-10">
                {/* Category Heading Row */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0 mb-4 sm:mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#c0392b] mb-2 capitalize">
                      {cat.name}
                    </h2>
                    <div className="w-12 h-0.5 sm:w-16 sm:h-1 bg-[#c0392b] rounded-sm" />
                  </div>
                  <a 
                    href={`/shop?category=${cat._id}`}
                    className="text-[#c0392b] font-medium text-sm hover:underline self-start sm:self-auto"
                  >
                    Explore →
                  </a>
                </div>

                {/* Products Grid */}
                <div className="relative">
                  {/* LEFT BUTTON */}
                  <button
                    onClick={() => scrollLeft(cat._id)}
                    className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* SCROLLABLE ROW */}
                  <div
                    ref={el => scrollRefs.current[cat._id] = el}
                    className="flex overflow-x-auto gap-4 scroll-smooth snap-x snap-mandatory scrollbar-hide pb-2"
                  >
                    {catProducts.map(product => (
                      <div key={product._id || product.id} className="flex-shrink-0 w-[50%] sm:w-[50%] md:w-[33.33%] lg:w-[25%] snap-start">
                        <HomeSectionCard product={product} />
                      </div>
                    ))}
                  </div>

                  {/* RIGHT BUTTON */}
                  <button
                    onClick={() => scrollRight(cat._id)}
                    className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}

          {/* Show message if no categories have products */}
          {categories.length > 0 && Object.keys(productsByCategory).length === 0 && (
            <div className="text-center py-8 sm:py-10 md:py-12 text-gray-500">
              No products available in any category at the moment.
            </div>
          )}

          {/* Show message if no categories */}
          {categories.length === 0 && (
            <div className="text-center py-8 sm:py-10 md:py-12 text-gray-500">
              No categories available at the moment.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default memo(HomePage)
