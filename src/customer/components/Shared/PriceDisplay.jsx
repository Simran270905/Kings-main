import React from 'react'

// Reusable Price Display Component - Matches existing product card style exactly
const PriceDisplay = ({ 
  sellingPrice, 
  originalPrice, 
  discount, 
  showDiscountBadge = true,
  showOriginalPrice = true,
  className = "",
  style = {}
}) => {
  const formatPrice = (p) =>
    typeof p === "number"
      ? `₹${p.toLocaleString('en-IN')}`
      : String(p)

  // If no discount applied, show single price
  if (!discount || discount <= 0 || !showOriginalPrice) {
    return (
      <span className={`text-red-700 font-bold text-base ${className}`} style={style}>
        {formatPrice(sellingPrice)}
      </span>
    )
  }

  // With discount - show the exact pattern from product cards
  return (
    <>
      <div className="flex items-center gap-2" style={style}>
        <span className="text-red-700 font-bold text-base">
          ₹{parseFloat(sellingPrice).toLocaleString('en-IN')}
        </span>
        <span className="text-gray-400 line-through text-sm">
          ₹{parseFloat(originalPrice).toLocaleString('en-IN')}
        </span>
      </div>
      {showDiscountBadge && discount > 0 && (
        <div className="text-green-600 text-xs font-medium">
          Save {discount}%
        </div>
      )}
    </>
  )
}

export default PriceDisplay
