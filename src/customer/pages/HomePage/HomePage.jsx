'use client'

import { memo, lazy, Suspense, useEffect, useState, useMemo, useRef } from 'react'
import MainCarosal from '../../components/HomeCarosal/MainCarosal'
import HomeSectionCarosal from '../../components/HomeSectionCarosal/HomeSectionCarosal'
import HomeSectionCard from '../../components/HomeSectionCard/HomeSectionCard'
import TrackOrderInput from '../../components/TrackOrder/TrackOrderInput'
import { useProduct } from '../../../context/ProductContext'
import { API_BASE_URL } from '@config/api.js'
import { HomePageSkeleton, CategorySkeleton } from '../../../components/LoadingSkeletons.jsx'
import { dataSyncEvents, EVENT_TYPES } from '../../../utils/eventSystem.js'

// Lazy-load non-critical sections
const LazyHomeSection = lazy(() =>
  import('../../components/HomeSectionCarosal/HomeSectionCarosal')
)

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
      console.log('🏠 HomePage received product update event:', productData)
      // STEP 3: FIX CONTEXT - Use refreshProducts from context
      refreshProducts()
    })

    const unsubscribeCreated = dataSyncEvents.subscribe(EVENT_TYPES.PRODUCT_CREATED, (productData) => {
      console.log('🏠 HomePage received product creation event:', productData)
      // STEP 3: FIX CONTEXT - Use refreshProducts from context
      refreshProducts()
    })

    const unsubscribeDeleted = dataSyncEvents.subscribe(EVENT_TYPES.PRODUCT_DELETED, (productData) => {
      console.log('🏠 HomePage received product deletion event:', productData)
      // STEP 3: FIX CONTEXT - Use refreshProducts from context
      refreshProducts()
    })

    // Cleanup all listeners on unmount
    return () => {
      unsubscribeUpdated()
      unsubscribeCreated()
      unsubscribeDeleted()
    }
  }, [])

  // STEP 1: FORCE REFETCH - Ensure products are fetched on mount
  useEffect(() => {
    const fetchCategoriesAndProducts = async () => {
      try {
        setLoading(true)
        
        // Fetch all categories
        const catResponse = await fetch(`${API_BASE_URL}/categories`)
        const catData = await catResponse.json()
        
        // Debug: Log the actual response structure
        console.log('Categories API Response:', catData)
        
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
          console.warn('Unexpected categories response structure:', catData)
          cats = []
        }
        
        console.log('Extracted categories:', cats)
        setCategories(cats)

        // Fetch products per category for COMPLETE coverage
        try {
          const productsMap = {}
          
          if (cats.length > 0) {
            console.log('Fetching products per category for complete coverage...')
            
            // Fetch products for each category individually
            await Promise.all(
              cats.map(async (cat) => {
                try {
                  // Fetch products specifically for this category
                  const prodResponse = await fetch(`${API_BASE_URL}/products?category=${cat._id}&limit=100`)
                  const prodData = await prodResponse.json()
                   
                  console.log(`Products API response for ${cat.name}:`, prodData)
                   
                  const prods = prodData?.data?.products 
                             || prodData?.products 
                             || prodData?.data 
                             || prodData 
                             || []
                   
                  const categoryProducts = Array.isArray(prods) ? prods : []
                  
                  console.log(`Category "${cat.name}" (${cat._id}):`)
                  console.log("- Products found:", categoryProducts.length)
                  console.log("- Product IDs:", categoryProducts.map(p => p._id).slice(0, 5))
                  
                  if (categoryProducts.length > 0) {
                    productsMap[cat._id] = categoryProducts
                    console.log(`Added ${categoryProducts.length} products to category ${cat.name}`)
                  } else {
                    console.log(`No products found for category ${cat.name}`)
                  }
                } catch (err) {
                  console.error(`Failed to fetch products for category ${cat.name}:`, err)
                }
              })
            )
          }
          
          // STEP 5: DEBUG LOG
          console.log("STEP 5: DEBUG - Homepage products:", productsMap)
          console.log('Products by category map:', productsMap)
          console.log('Final verification - Categories with products:', Object.keys(productsMap).length)
          Object.keys(productsMap).forEach(catId => {
            console.log(`Category ${catId}: ${productsMap[catId].length} products`)
          })
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

    // STEP 1: FORCE REFETCH - Call refreshProducts on mount
    fetchCategoriesAndProducts()
    refreshProducts() // Also call context refresh for fresh data
  }, []) // Empty dependency array ensures it runs on mount

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
            
            // STEP 4: DEBUG LOG - Verify category separation
            console.log("=== RENDER DEBUG ===")
            console.log("Category:", cat.name)
            console.log("Category ID:", cat._id)
            console.log("Products in this category:", catProducts?.length || 0)
            if (catProducts && catProducts.length > 0) {
              console.log("Product IDs:", catProducts.map(p => p._id).slice(0, 3))
            }
            
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

      {/* ================= TRACK YOUR ORDER SECTION ================= */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Track Your Order
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Stay updated with your order status. Enter your Order ID to get real-time tracking information.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 sm:p-8">
            <TrackOrderInput />
            
            <div className="mt-6 text-center">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2z" clipRule="evenodd" />
                  </svg>
                  <span>Real-time Updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267.651-.13.835-.238.835-.238 0 0 .646.326 1.447.559.795.233 1.34.617 1.34.617 0 0-.415.233-.8.617C11.447 6.868 9.824 6.5 8 6.5c-1.824 0-3.447.368-4.782 1.117-.395.232-.745.617-.745.617 0 .415.233.8.617 1.34.617.495.13.835.238.835.238 0 0 .412-.164.567-.267.218-.103.412-.196.567-.267z" />
                  </svg>
                  <span>Email Notifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                  <span>Delivery Alerts</span>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">
                  <strong>Where to find your Order ID:</strong>
                </p>
                <ul className="text-xs text-gray-600 space-y-1 text-left max-w-md mx-auto">
                  <li>• Check your confirmation email</li>
                  <li>• View in SMS notifications</li>
                  <li>• Check your account order history</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(HomePage)
