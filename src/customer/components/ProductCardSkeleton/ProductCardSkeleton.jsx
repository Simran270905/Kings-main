import React from 'react'

const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 animate-pulse">
      {/* Image skeleton */}
      <div className="w-full h-64 bg-gray-300"></div>
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title skeleton */}
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        
        {/* Price skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
        
        {/* Material/Category skeleton */}
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        
        {/* Button skeleton */}
        <div className="h-10 bg-gray-300 rounded mt-4"></div>
      </div>
    </div>
  )
}

export default ProductCardSkeleton
