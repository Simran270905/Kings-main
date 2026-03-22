'use client'
import React from 'react'
import { MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { optimizeCloudinaryUrlWithSize } from '../../../utils/cloudinary'

export default function CartItem({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}) {
  // FIXED: Use consistent pricing - selling_price takes priority over price
  const price = item.selling_price || item.price || 0
  const originalPrice = item.originalPrice || item.price || 0
  const discount = item.discount || 0
  const itemTotal = price * item.quantity

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 flex gap-4 shadow-sm hover:shadow-md transition-shadow">

      {/* IMAGE */}
      <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
        <img
          src={optimizeCloudinaryUrlWithSize(item.image, 200)}
          alt={item.name}
          loading="lazy"
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = '' }}
        />
      </div>

      {/* DETAILS */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 text-sm md:text-base line-clamp-2">{item.name}</h3>
          <button
            onClick={() => onRemove()}
            className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Remove"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>

        {(item.material || item.purity) && (
          <p className="text-xs text-gray-500 mt-1">
            {[item.material, item.purity].filter(Boolean).join(' · ')}
          </p>
        )}

        {/* PRICE */}
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <span className="text-base font-bold text-[#ae0b0b]">₹{price.toLocaleString()}</span>
          {originalPrice > price && (
            <span className="text-xs text-gray-400 line-through">₹{originalPrice.toLocaleString()}</span>
          )}
          {discount > 0 && (
            <span className="text-xs bg-green-100 text-green-700 font-semibold px-1.5 py-0.5 rounded">{discount}% off</span>
          )}
        </div>

        {/* QTY CONTROLS + SUBTOTAL */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1 border-2 border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => onDecrease()}
              disabled={item.quantity <= 1}
              className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <MinusIcon className="h-3.5 w-3.5" />
            </button>
            <span className="px-3 py-1.5 font-semibold text-sm min-w-[2rem] text-center">{item.quantity}</span>
            <button
              onClick={() => onIncrease()}
              className="px-3 py-1.5 text-[#ae0b0b] hover:bg-red-50 transition-colors"
            >
              <PlusIcon className="h-3.5 w-3.5" />
            </button>
          </div>

          <span className="font-bold text-gray-900">₹{itemTotal.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}
