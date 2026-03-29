'use client'

import { memo } from 'react'
import { useCart } from '../../context/useCart'
import { optimizeCloudinaryUrl } from '../../../utils/cloudinary'

const HomeSectionCard = ({ product }) => {
  const {
    image,
    images,
    name,
    title,
    brand,
    originalPrice,
    sellingPrice,
    price,
    selling_price,
    disscount,
    isBestSeller,
    isOnSale,
  } = product

  // Use proper field mapping with fallbacks
  const productName = name || title
  const displayPrice = sellingPrice || selling_price || price || 0
  const originalPriceDisplay = originalPrice || (displayPrice !== price ? price : null)

  console.log('🛍️ Product Card Debug:', {
    productId: product.id || product._id,
    name,
    title,
    productName,
    originalPrice,
    sellingPrice,
    price,
    selling_price,
    displayPrice,
    originalPriceDisplay
  })

  const { addToCart } = useCart()

  return (
    <div
      className="
        group cursor-pointer
        w-full max-w-60 sm:max-w-none
        rounded-2xl
        bg-gradient-to-b
        from-[#ffffff]
        via-[#fffaf3]
        to-[#fdf2e6]

        p-2 sm:p-3
        border border-transparent
        hover:border-[#e7d6a7]

        shadow-[0_4px_14px_rgba(180,140,90,0.12)]
        sm:shadow-[0_6px_18px_rgba(180,140,90,0.12)]
        sm:hover:shadow-[0_10px_28px_rgba(180,140,90,0.22)]

        transition-all duration-300
        sm:hover:-translate-y-0.5
      "
    >
      {/* ================= IMAGE ================= */}
      <div
        className="
          relative w-full
          h-52 sm:h-68
          rounded-xl
          overflow-hidden
          border border-[#ead9ad]
          bg-[#fffaf3]
        "
      >
        {/* ✨ Inner highlight */}
        <div className="absolute inset-0 pointer-events-none rounded-xl ring-1 ring-white/40" />

        {/* 🔥 BADGES */}
        {isBestSeller && (
          <span className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20
                           rounded-full bg-gradient-to-r from-[#d4af37] to-[#b8860b]
                           px-2.5 py-0.5 text-[9px] sm:text-[10px]
                           font-semibold tracking-wide text-white shadow-sm">
            BEST SELLER
          </span>
        )}

        {isOnSale && (
          <span className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20
                           rounded-full bg-[#b91c1c]
                           px-2.5 py-0.5 text-[9px] sm:text-[10px]
                           font-semibold tracking-wide text-white shadow-sm">
            ON SALE
          </span>
        )}

        <img
          src={image}
          alt={title}
          loading="lazy"
          className="
            w-full h-full object-cover object-top
            transition-transform duration-500
            sm:group-hover:scale-[1.03]
          "
        />

        {/* ✨ Soft gold glow (desktop only) */}
        <div
          className="
            absolute inset-0
            bg-gradient-to-t from-[#f3e6cf]/25 via-transparent to-transparent
            opacity-0 sm:group-hover:opacity-100
            transition-opacity duration-300
          "
        />
      </div>

      {/* ================= CONTENT ================= */}
      <div className="px-1.5 sm:px-2 pt-3 sm:pt-4 pb-2.5 sm:pb-3 text-center space-y-1">
        <h3 className="text-[14px] sm:text-[15px] font-semibold tracking-wide text-[#3b1d1d]">
          {brand}
        </h3>

        <p className="text-[13px] sm:text-sm text-[#5c3a2e] leading-snug sm:leading-relaxed line-clamp-2">
          {productName}
        </p>

        <div className="flex items-center justify-center gap-1.5 sm:gap-2 pt-1.5 sm:pt-2">
          <span className="text-[#b91c1c] font-semibold text-sm sm:text-base">
            ₹{parseFloat(displayPrice || 0).toLocaleString('en-IN')}
          </span>
          {originalPriceDisplay && parseFloat(originalPriceDisplay) !== parseFloat(displayPrice) && (
            <span className="text-[#9c7c4a] line-through text-xs sm:text-sm">
              ₹{parseFloat(originalPriceDisplay).toLocaleString('en-IN')}
            </span>
          )}
        </div>

        <p className="text-green-700 text-[11px] sm:text-xs font-medium pt-0.5">
          {disscount}
        </p>
        <button
          onClick={(e) => {
            e.preventDefault()
            addToCart(product, 1)
          }}
          className="mt-3 w-full rounded-md bg-[#ae0b0b] py-2 text-white font-medium hover:opacity-90"
        >
          Add to Cart
        </button>
      </div>
    </div>
  )
}

export default memo(HomeSectionCard)
