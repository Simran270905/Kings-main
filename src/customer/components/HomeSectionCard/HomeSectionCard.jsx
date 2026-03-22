'use client'

import { memo } from 'react'
import { useCart } from '../../context/useCart'
import { optimizeCloudinaryUrl } from '../../../utils/cloudinary'

const HomeSectionCard = ({ product }) => {
  const {
    image,
    images,
    title,
    brand,
    price,
    selling_price,
    disscount,
    isBestSeller,
    isOnSale,
  } = product

  const { addToCart } = useCart()

  // Support both single image and multiple images
  const cardImage = images && images.length > 0 ? images[0] : image
  const safeTitle = title || 'Product'
  const safeBrand = brand || 'Brand'
  const safeImage = cardImage || ''
  const safePrice = price || '₹0'
  const safeSellingPrice = selling_price || safePrice
  const safeDiscount = disscount || 0
  const safeIsBestSeller = isBestSeller || false
  const safeIsOnSale = isOnSale || false

  return (
    <div
      className="
        group cursor-pointer
        w-full max-w-60 sm:max-w-none
        h-full
        rounded-2xl
        bg-gradient-to-b
        from-[#ffffff]
        via-[#fffaf3]
        to-[#fdf2e6]
        p-2 sm:p-3
        border border-transparent
        hover:border-[#e7d6a7]
        shadow-[0_4px_14px_rgba(180,140,90,0.12)]
        sm:hover:shadow-[0_10px_28px_rgba(180,140,90,0.22)]
        transition-all duration-300
        flex flex-col
      "
    >

      {/* ================= IMAGE — LOCKED RATIO ================= */}
      <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden border border-[#ead9ad] bg-[#fffaf3] flex-shrink-0">

        <img
          src={optimizeCloudinaryUrl(safeImage)}
          alt={safeTitle}
          loading="eager"
          decoding="async"
          className="
            absolute inset-0
            w-full h-full
            object-cover object-center
            transition-transform duration-500
            sm:group-hover:scale-[1.03]
          "
          onError={(e) => {
            e.target.src =
              'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjYwIiB2aWV3Qm94PSIwIDAgMTAwIDYwIiBmaWxsPSIjZjJmMmYyIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZjJmMmYyIi8+PC9zdmc+'
          }}
        />

        {/* highlight */}
        <div className="absolute inset-0 pointer-events-none rounded-xl ring-1 ring-white/40" />

        {/* badges */}
        {safeIsBestSeller && (
          <span className="absolute top-3 left-3 z-20 rounded-full bg-gradient-to-r from-[#d4af37] to-[#b8860b] px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-sm">
            BEST SELLER
          </span>
        )}

        {safeIsOnSale && (
          <span className="absolute top-3 right-3 z-20 rounded-full bg-[#b91c1c] px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-sm">
            ON SALE
          </span>
        )}

        {/* hover glow */}
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
      <div className="px-2 pt-4 pb-3 text-center space-y-1 flex-1 flex flex-col">
        <h3 className="text-[15px] font-semibold text-[#3b1d1d]">
          {safeBrand}
        </h3>

        <p className="text-sm text-[#5c3a2e] line-clamp-2">
          {safeTitle}
        </p>

        <div className="flex items-center justify-center gap-2 pt-2">
          <span className="text-[#b91c1c] font-semibold text-base">
            {safeSellingPrice}
          </span>
          {safePrice !== safeSellingPrice && (
            <span className="text-[#9c7c4a] line-through text-sm">
              {safePrice}
            </span>
          )}
        </div>

        {safeDiscount > 0 && (
          <p className="text-green-700 text-xs font-medium">
            {safeDiscount}% OFF
          </p>
        )}

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
