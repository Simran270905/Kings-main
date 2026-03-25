import React from 'react'

export const ProductSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
    <div className="h-4 bg-gray-300 rounded mb-2"></div>
    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
  </div>
)

export const CategorySkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-300 rounded mb-6 w-1/3"></div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-gray-300 h-64 rounded-lg"></div>
      ))}
    </div>
  </div>
)

export const HomePageSkeleton = () => (
  <div className="space-y-10 py-20">
    {/* Hero Skeleton */}
    <div className="animate-pulse">
      <div className="bg-gray-300 h-96 rounded-lg"></div>
    </div>
    
    {/* Category Sections Skeleton */}
    {[...Array(3)].map((_, i) => (
      <CategorySkeleton key={i} />
    ))}
  </div>
)

export default { ProductSkeleton, CategorySkeleton, HomePageSkeleton }
