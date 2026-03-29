'use client'

import { memo, lazy, Suspense, useEffect, useState, useMemo } from 'react'
import MainCarosal from '../../components/HomeCarosal/MainCarosal'
import HomeSectionCarosal from '../../components/HomeSectionCarosal/HomeSectionCarosal'
import HomeSectionCard from '../../components/HomeSectionCard/HomeSectionCard'
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
  const [productsByCategory, setProductsByCategory] = useState({})
  const [loading, setLoading] = useState(true)

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
      <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
        Loading collections...
      </div>
    )
  }

  return (
    <div className="mt-0">
      {/* ================= HERO (Critical) ================= */}
      <MainCarosal />

      {/* ================= DYNAMIC CATEGORY SECTIONS ================= */}
      <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {categories.map(cat => {
            const catProducts = productsByCategory[cat._id];
            if (!catProducts || catProducts.length === 0) return null;

            return (
              <div key={cat._id} style={{
                background: '#faf9f6',
                borderRadius: '16px',
                padding: '30px 20px',
                marginBottom: '40px'
              }}>
                {/* Category Heading Row */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '24px'
                }}>
                  <div>
                    <h2 style={{
                      fontSize: '28px',
                      fontWeight: '700',
                      color: '#c0392b',
                      margin: '0 0 8px 0',
                      textTransform: 'capitalize'
                    }}>
                      {cat.name}
                    </h2>
                    <div style={{
                      width: '50px',
                      height: '3px',
                      backgroundColor: '#c0392b',
                      borderRadius: '2px'
                    }} />
                  </div>
                  <a 
                    href={`/shop?category=${cat._id}`}
                    style={{
                      color: '#c0392b',
                      fontWeight: '500',
                      fontSize: '15px',
                      textDecoration: 'none'
                    }}
                  >
                    Explore →
                  </a>
                </div>

                {/* Products Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '20px'
                }}>
                  {catProducts.map(product => (
                    <HomeSectionCard key={product._id || product.id} product={product} />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Show message if no categories have products */}
          {categories.length > 0 && Object.keys(productsByCategory).length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
              No products available in any category at the moment.
            </div>
          )}

          {/* Show message if no categories */}
          {categories.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
              No categories available at the moment.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default memo(HomePage)
