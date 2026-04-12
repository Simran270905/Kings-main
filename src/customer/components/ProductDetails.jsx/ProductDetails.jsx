import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { StarIcon } from '@heroicons/react/20/solid'
import toast from 'react-hot-toast'

import { getAvailableSizes } from '../../utils/productSchemaNormalizer'
import HomeSectionCard from '../HomeSectionCard/HomeSectionCard'
import { useCart } from '../../context/useCart'
import { API_BASE_URL } from '@config/api.js'
// ✅ IMPORT SHARED HELPERS
import {
  getProductImage,
  getProductImages,
  getSellingPrice,
  getOriginalPrice,
  getDiscountPercentage,
  getProductName,
  getProductMaterial,
  getProductPurity,
  getProductWeight,
  getProductDescription,
  getProductCategory,
  isProductInStock,
  formatPrice,
  formatProductDetails,
  debugProductFields
} from '../../../utils/productHelpers.js'

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
  
  // STRICT mapping using correct backend field names
  const sellingPrice = raw.sellingPrice || raw.price || raw.selling_price  // Use sellingPrice, fallback to price, fallback to selling_price
  const originalPrice = raw.originalPrice  // Use originalPrice directly
  
  // Add debug validation
  console.log("=== PRODUCT DETAILS DEBUG ===")
  console.log("Product ID:", raw._id || raw.id)
  console.log("Name:", name)
  console.log("Available Fields:", Object.keys(raw))
  console.log("Price Fields:", {
    sellingPrice: raw.sellingPrice,
    originalPrice: raw.originalPrice,
    price: raw.price,
    selling_price: raw.selling_price,
    original_price: raw.original_price
  })
  console.log("Mapped Prices:", {
    mainPrice: sellingPrice,      // sellingPrice || price || selling_price - MAIN PRICE
    strikethroughPrice: originalPrice  // originalPrice - STRIKETHROUGH
  })
  console.log("===================")

  const images =
    raw.images && Array.isArray(raw.images) && raw.images.length > 0
      ? raw.images.map((img, index) => ({
          src: img,
          alt: `${name} - Image ${index + 1}`,
        }))
      : []

  const normalizedStock = raw.stock != null ? Number(raw.stock) : 0
  const sizeStock = Array.isArray(raw.sizes)
    ? raw.sizes.reduce((sum, s) => sum + (Number(s.stock) || 0), 0)
    : 0
  const inStock = raw.hasSizes ? sizeStock > 0 : normalizedStock > 0

  return {
    ...raw,
    id: raw._id || raw.id,
    name,
    originalPrice,
    selling_price: sellingPrice,
    displayPrice: sellingPrice && sellingPrice > 0 ? `₹${sellingPrice}` : 'Price unavailable',
    originalPriceDisplay: originalPrice && originalPrice > 0 ? `₹${originalPrice}` : null,
    images,
    description: raw.description || '',
    highlights: raw.highlights || [],
    material: raw.material || 'Gold',
    purity: raw.purity || null,
    weight: raw.weight || null,
    sizes: raw.sizes || [],
    hasSizes: raw.hasSizes || false,
    stock: normalizedStock,
    inStock,
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
        
        // 🔍 DEBUG: Log full product object from DETAIL page
        debugProductFields(productData, 'PRODUCT DETAILS PAGE');
        
        // ✅ FIXED: Use shared helpers instead of custom normalize
        const normalizedProduct = {
          ...productData,
          id: productData._id || productData.id,
          name: getProductName(productData),
          displayPrice: formatPrice(getSellingPrice(productData)),
          originalPriceDisplay: getOriginalPrice(productData) ? formatPrice(getOriginalPrice(productData)) : null,
          images: getProductImages(productData),
          description: getProductDescription(productData),
          material: getProductMaterial(productData),
          purity: getProductPurity(productData),
          weight: getProductWeight(productData),
          category: getProductCategory(productData),
          inStock: isProductInStock(productData),
          discountPercentage: getDiscountPercentage(productData)
        };
        
        setCurrentProduct(normalizedProduct)
        setSelectedImage(getProductImages(productData)[0] || null)
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
        
        // ✅ FIXED: Use shared helpers for similar products
        const filtered = productsData
          .filter(p => (p._id || p.id) !== currentProduct.id)
          .map(product => ({
            ...product,
            id: product._id || product.id,
            name: getProductName(product),
            sellingPrice: getSellingPrice(product),
            originalPrice: getOriginalPrice(product),
            images: getProductImages(product),
            inStock: isProductInStock(product)
          }))

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
              {currentProduct.originalPriceDisplay && (
                <p className="text-lg text-gray-400 line-through">{currentProduct.originalPriceDisplay}</p>
              )}
              <p className="text-3xl font-bold text-green-600">
                {currentProduct.displayPrice}
              </p>
              {currentProduct.discountPercentage > 0 && (
                <span className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full font-semibold">
                  ({currentProduct.discountPercentage}% OFF)
                </span>
              )}
            </div>

            <div className="mt-4 text-sm text-gray-700 space-y-1">
              <p><span className="font-semibold">Material:</span> {currentProduct.material}</p>
              {currentProduct.purity && <p><span className="font-semibold">Purity:</span> {currentProduct.purity}</p>}
              {currentProduct.weight != null && <p><span className="font-semibold">Weight:</span> {currentProduct.weight} g</p>}
              {currentProduct.category && <p><span className="font-semibold">Category:</span> {currentProduct.category}</p>}
              {currentProduct.brand && <p><span className="font-semibold">Brand:</span> {currentProduct.brand}</p>}
              {currentProduct.sku && <p><span className="font-semibold">SKU:</span> {currentProduct.sku}</p>}
              
              {/* ✅ FIXED: Use shared helper for product details */}
              <p className="text-gray-600">{formatProductDetails(currentProduct)}</p>

              {currentProduct.hasSizes && currentProduct.sizes && currentProduct.sizes.length > 0 ? (
                <div>
                  <p className="font-semibold">Available Sizes:</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {currentProduct.sizes.map((sizeItem) => (
                      <button
                        key={sizeItem.size}
                        type="button"
                        onClick={() => setSelectedSize(sizeItem.size)}
                        className={`px-3 py-1 text-xs font-semibold border rounded ${selectedSize === sizeItem.size ? 'bg-[#ae0b0b] text-white border-[#ae0b0b]' : 'bg-white text-gray-700 border-gray-300 hover:border-[#ae0b0b]'}`}
                        disabled={!sizeItem.stock}
                      >
                        {sizeItem.size} {sizeItem.stock != null && `(${sizeItem.stock})`}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Size chart not available for this item.</p>
              )}

              <p className={`font-semibold ${currentProduct.inStock ? 'text-emerald-600' : 'text-red-600'}`}>
                {currentProduct.inStock ? 'In Stock' : 'Out of Stock'}
              </p>
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
              onClick={() => {
                if (currentProduct.hasSizes && !selectedSize) {
                  toast.error('Please select a size before adding to cart.')
                  return
                }

                if (typeof addToCart === 'function') {
                  addToCart({
                    ...currentProduct,
                    selectedSize,
                    quantity: 1,
                  })
                } else {
                  console.error('addToCart is not a function')
                  toast.error('Unable to add to cart. Please refresh the page.')
                }
              }}
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
