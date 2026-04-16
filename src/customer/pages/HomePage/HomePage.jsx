'use client'

import { useEffect, useState, useRef } from 'react'
import MainCarosal from '../../components/HomeCarosal/MainCarosal'
import HomeSectionCarosal from '../../components/HomeSectionCarosal/HomeSectionCarosal'
import HomeSectionCard from '../../components/HomeSectionCard/HomeSectionCard'
import TrackOrderInput from '../../components/TrackOrder/TrackOrderInput'
import { useProduct } from '../../../context/ProductContext'
import { API_BASE_URL } from '@config/api.js'
import { HomePageSkeleton, CategorySkeleton } from '../../../components/LoadingSkeletons.jsx'
import { dataSyncEvents, EVENT_TYPES } from '../../../utils/eventSystem.js'


function HomePage() {
  const { products, loading: productsLoading, refreshProducts } = useProduct()
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

  // Listen for product changes from admin panel
  useEffect(() => {
    const unsubscribeUpdated = dataSyncEvents.subscribe(EVENT_TYPES.PRODUCT_UPDATED, (productData) => {
      refreshProducts()
    })

    const unsubscribeCreated = dataSyncEvents.subscribe(EVENT_TYPES.PRODUCT_CREATED, (productData) => {
      refreshProducts()
    })

    const unsubscribeDeleted = dataSyncEvents.subscribe(EVENT_TYPES.PRODUCT_DELETED, (productData) => {
      refreshProducts()
    })

    // Cleanup all listeners on unmount
    return () => {
      unsubscribeUpdated()
      unsubscribeCreated()
      unsubscribeDeleted()
    }
  }, [])

  // Fetch categories and products on mount
  useEffect(() => {
    const fetchCategoriesAndProducts = async () => {
      try {
        setLoading(true)
        
        // Fetch all categories
        const catResponse = await fetch(`${API_BASE_URL}/categories`)
        const catData = await catResponse.json()
        
        // Extract categories from API response
        let cats = []
        if (catData?.data?.categories && Array.isArray(catData.data.categories)) {
          cats = catData.data.categories
        } else if (catData?.categories && Array.isArray(catData.categories)) {
          cats = catData.categories
        } else if (catData?.data && Array.isArray(catData.data)) {
          cats = catData.data
        } else if (Array.isArray(catData)) {
          cats = catData
        } else {
          cats = []
        }
        
        setCategories(cats)

        // Fetch products per category
        try {
          const productsMap = {}
          
          if (cats.length > 0) {
            // Fetch products for each category individually
            await Promise.all(
              cats.map(async (cat) => {
                try {
                  // Fetch products specifically for this category
                  const prodResponse = await fetch(`${API_BASE_URL}/products?category=${cat._id}&limit=100`)
                  const prodData = await prodResponse.json()
                   
                  const prods = prodData?.data?.products 
                             || prodData?.products 
                             || prodData?.data 
                             || prodData 
                             || []
                   
                  const categoryProducts = Array.isArray(prods) ? prods : []
                  
                  if (categoryProducts.length > 0) {
                    productsMap[cat._id] = categoryProducts
                  }
                } catch (err) {
                  console.error(`Failed to fetch products for category ${cat.name}:`, err)
                }
              })
            )
          }
          
          setProductsByCategory(productsMap)
        } catch (err) {
          console.error('Failed to fetch products:', err)
        } finally {
          setLoading(false)
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCategoriesAndProducts()
    refreshProducts()
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

      {/* ================= ORDER TRACKING ================= */}
      <div className="bg-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <TrackOrderInput />
        </div>
      </div>

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
                    View All ({catProducts.length}) &rarr;
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
            <div className="text-center py-8 sm:py-10 md:py-12">
              <div className="text-gray-500 mb-4">
                <h3 className="text-xl font-semibold mb-2">No products in categories</h3>
                <p>Products need to be assigned to categories via the admin panel.</p>
              </div>
              <div className="text-sm text-gray-400 bg-gray-100 p-4 rounded-lg max-w-md mx-auto">
                <p className="font-medium mb-1">For Admin:</p>
                <p>Please edit products in the admin panel and assign appropriate categories.</p>
              </div>
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

export default HomePage
