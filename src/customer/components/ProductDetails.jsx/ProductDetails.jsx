import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { StarIcon } from '@heroicons/react/20/solid'

import { getAvailableSizes } from '../../utils/productSchemaNormalizer'
import HomeSectionCard from '../HomeSectionCard/HomeSectionCard'
import { useCart } from '../../context/useCart'
import { API_BASE_URL } from '../../../config/api'

const API_URL = `${API_BASE_URL}/products`

const fallbackProduct = {
  name: 'Demo Product',
  price: '₹0',
  images: [],
  description: '',
  highlights: [],
}

const reviewsSummary = { average: 4.6, totalCount: 196 }

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

// ✅ UPDATED normalize (backend compatible)
function normalize(raw) {
  if (!raw) return null

  const name = raw.title || raw.name || 'Product'
  
  // Handle selling_price vs price correctly
  const sellingPrice = raw.selling_price || raw.sellingPrice
  const originalPrice = raw.price
  
  const displayPrice = sellingPrice || originalPrice || 0

  const images =
    raw.images && Array.isArray(raw.images) && raw.images.length > 0
      ? raw.images.map((img, index) => ({
          src: img,
          alt: `${name} - Image ${index + 1}`,
        }))
      : []

  return {
    ...raw,
    id: raw._id || raw.id,
    name,
    price: originalPrice,
    selling_price: sellingPrice,
    displayPrice: `₹${displayPrice}`,
    images,
    description: raw.description || '',
    highlights: raw.highlights || [],
    material: raw.material || 'Gold',
    purity: raw.purity || null,
    weight: raw.weight || null,
    sizes: raw.sizes || [],
    hasSizes: raw.hasSizes || false,
    reviews: raw.reviews || [],
    averageRating: raw.averageRating || 0,
    totalReviews: raw.totalReviews || 0,
  }
}

export default function ProductDetails() {
  const { id } = useParams()
  const { addToCart } = useCart()

  const [currentProduct, setCurrentProduct] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [similarProducts, setSimilarProducts] = useState([])
  const [selectedSize, setSelectedSize] = useState(null)
  const [loading, setLoading] = useState(true)

  // 🔥 FETCH SINGLE PRODUCT
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/${id}`)
        const data = await res.json()

        // Handle different response structures
        const productData = data.data ? data.data : data
        const normalized = normalize(productData)
        setCurrentProduct(normalized)
        setSelectedImage(normalized?.images?.[0] || null)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchProduct()
  }, [id])

  // ESC fullscreen
  useEffect(() => {
    const esc = e => e.key === 'Escape' && setIsFullscreen(false)
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [])

  // 🔥 FETCH SIMILAR PRODUCTS
  useEffect(() => {
    if (!currentProduct) return

    const fetchSimilar = async () => {
      try {
        const res = await fetch(
          `${API_URL}?category=${currentProduct.category}`
        )
        const data = await res.json()

        // Handle different response structures
        const productsData = data.data?.products ? data.data.products : (Array.isArray(data) ? data : [])
        
        const filtered = productsData
          .filter(p => (p._id || p.id) !== currentProduct.id)
          .map(normalize)

        const shuffled = [...filtered]
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }

        setSimilarProducts(shuffled.slice(0, 8))
      } catch (err) {
        console.error(err)
      }
    }

    fetchSimilar()
  }, [currentProduct])

  // auto select size
  useEffect(() => {
    if (!currentProduct) return

    const sizes = getAvailableSizes(currentProduct)
    if (sizes.length > 0 && !selectedSize) {
      setSelectedSize(sizes[0].size)
    }
  }, [currentProduct, selectedSize])

  // 🔥 LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    )
  }

  // 🔥 NOT FOUND
  if (!currentProduct) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <Link to="/shop" className="bg-[#ae0b0b] text-white px-6 py-3 rounded-md">
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white">
      <div className="pt-6 max-w-7xl mx-auto px-4">

        {/* PRODUCT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Gallery */}
          <div className="flex flex-col items-center">
            {selectedImage && (
              <div className="relative w-full aspect-square max-w-md rounded-lg overflow-hidden border">
                <img
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  onDoubleClick={() => setIsFullscreen(true)}
                  className="absolute inset-0 w-full h-full object-cover cursor-zoom-in"
                />
              </div>
            )}

            <div className="mt-4 flex gap-4">
              {currentProduct.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={classNames(
                    selectedImage?.src === img.src
                      ? 'ring-2 ring-[#ae0b0b]'
                      : 'ring-1 ring-gray-200',
                    'h-20 w-20 rounded-md overflow-hidden'
                  )}
                >
                  <img src={img.src} alt={img.alt} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="mt-8">
            <h1 className="text-3xl font-bold text-gray-900">{currentProduct.name}</h1>
            <div className="mt-4 flex items-center gap-3">
              {currentProduct.selling_price && currentProduct.selling_price < currentProduct.price ? (
                <>
                  <p className="text-2xl font-semibold text-[#ae0b0b]">₹{currentProduct.selling_price}</p>
                  <p className="text-lg text-gray-500 line-through">₹{currentProduct.price}</p>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">
                    {Math.round(((currentProduct.price - currentProduct.selling_price) / currentProduct.price) * 100)}% OFF
                  </span>
                </>
              ) : (
                <p className="text-2xl font-semibold text-[#ae0b0b]">₹{currentProduct.price}</p>
              )}
            </div>

            <div className="mt-4 flex items-center">
              {[0,1,2,3,4].map(i => (
                <StarIcon
                  key={i}
                  className={classNames(
                    reviewsSummary.average > i
                      ? 'text-[#ae0b0b]'
                      : 'text-gray-200',
                    'h-5 w-5'
                  )}
                />
              ))}
              <span className="ml-3 text-sm text-[#ae0b0b]">
                {reviewsSummary.average} · {reviewsSummary.totalCount} reviews
              </span>
            </div>

            <p className="mt-6 text-gray-600">
              {currentProduct.description}
            </p>

            <button
              onClick={() =>
                addToCart({
                  ...currentProduct,
                  selectedSize,
                  quantity: 1,
                })
              }
              className="mt-8 w-full rounded-md bg-[#ae0b0b] py-3 text-white"
            >
              Add to Cart
            </button>
          </div>
        </div>

        {/* Similar */}
        <section className="pt-20">
          <h2 className="text-2xl font-bold mb-6">Similar Products</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {similarProducts.map(item => (
              <HomeSectionCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      </div>

      {/* Fullscreen */}
      {isFullscreen && selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center"
          onClick={() => setIsFullscreen(false)}
        >
          <img
            src={selectedImage.src}
            alt={selectedImage.alt}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
