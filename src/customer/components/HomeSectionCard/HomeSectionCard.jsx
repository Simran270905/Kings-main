'use client'

import { memo } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../../context/useCart'
import { optimizeCloudinaryUrl } from '../../../utils/cloudinary'
// ✅ IMPORT SHARED HELPERS
import {
  getProductImage,
  getSellingPrice,
  getOriginalPrice,
  getDiscountPercentage,
  getProductName,
  getProductBrand,
  debugProductFields
} from '../../../utils/productHelpers.js'

const HomeSectionCard = ({ product }) => {
  // 🔍 DEBUG: Log full product object
  debugProductFields(product, 'HOME SECTION CARD');

  // ✅ FIXED: Use shared helpers for consistent field mapping
  const productImage = optimizeCloudinaryUrl(getProductImage(product));
  const productName = getProductName(product);
  const brand = getProductBrand(product);
  const sellingPrice = getSellingPrice(product);
  const originalPrice = getOriginalPrice(product);
  const discount = getDiscountPercentage(product);
  
  const { addToCart } = useCart()

  return (
    <Link to={`/product/${product._id || product.id}`} className="block">
      <div
        className="
          group cursor-pointer
          w-full
          rounded-xl
          bg-white
          border border-gray-100
          shadow-sm hover:shadow-lg
          overflow-hidden
          transition-all duration-300
          hover:-translate-y-1
        "
      >
      {/* ================= IMAGE ================= */}
      <div
        className="
          relative w-full
          aspect-[3/4]
          overflow-hidden
          bg-gray-50
        "
      >
        {/* 🔥 BADGES */}
        {product.isBestSeller && (
          <span className="absolute top-2 left-2 z-20
                           rounded-full bg-gradient-to-r from-[#d4af37] to-[#b8860b]
                           px-2 py-0.5 text-[9px] sm:px-2.5 sm:py-0.5 sm:text-[10px]
                           font-bold tracking-wide text-white shadow-sm">
            BEST SELLER
          </span>
        )}

        {product.isOnSale && (
          <span className="absolute top-2 right-2 z-20
                           rounded-full bg-[#b91c1c]
                           px-2 py-0.5 text-[9px] sm:px-2.5 sm:py-0.5 sm:text-[10px]
                           font-bold tracking-wide text-white shadow-sm">
            ON SALE
          </span>
        )}

        <img
          src={productImage}
          alt={productName}
          loading="lazy"
          className="
            w-full h-auto object-cover
            transition-transform duration-500
            group-hover:scale-105
          "
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.classList.add('bg-gradient-to-br', 'from-gray-100', 'to-gray-200');
          }}
        />
      </div>

      {/* ================= CONTENT ================= */}
      <div className="p-3 sm:p-4 text-center space-y-1.5 sm:space-y-2">
        <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide">
          {brand || 'KKINGS JEWELLERY'}
        </h3>

        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
          {productName}
        </p>

        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
          {sellingPrice && sellingPrice > 0 ? (
            <>
              <span className="text-red-700 font-bold text-sm sm:text-base">
                ₹{(parseFloat(sellingPrice) || 0).toLocaleString('en-IN')}
              </span>
              {originalPrice && originalPrice > 0 && originalPrice !== sellingPrice && (
                <span className="text-gray-400 line-through text-xs sm:text-sm">
                  ₹{(parseFloat(originalPrice) || 0).toLocaleString('en-IN')}
                </span>
              )}
            </>
          ) : (
            <span className="text-gray-500 text-xs sm:text-sm">Price not available</span>
          )}
        </div>

        {discount > 0 && (
          <p className="text-green-600 text-xs sm:text-xs font-medium">
            Save {discount}%
          </p>
        )}
        
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation() // Prevent navigation when clicking Add to Cart
            addToCart(product, 1)
          }}
          className="w-full rounded-md bg-[#ae0b0b] py-1.5 sm:py-2 text-white text-xs sm:text-sm font-medium hover:bg-[#8f0a0a] transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
    </Link>
  )
}

export default memo(HomeSectionCard)
