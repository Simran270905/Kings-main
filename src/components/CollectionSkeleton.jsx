'use client'

import React from 'react'

const CollectionSkeleton = () => {
  return (
    <div className="bg-[#faf9f6] rounded-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 md:mb-10">
      {/* Category Heading Skeleton */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div>
          <div className="h-6 sm:h-8 md:h-10 w-32 sm:w-40 md:w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="w-12 h-0.5 sm:w-16 sm:h-1 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Products Grid Skeleton */}
      <div className="relative">
        {/* LEFT BUTTON SKELETON */}
        <div className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>

        {/* SCROLLABLE ROW SKELETON */}
        <div className="flex overflow-x-auto gap-4 pb-2">
          {/* Generate 4 skeleton cards to match grid layout */}
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="flex-shrink-0 w-[50%] sm:w-[50%] md:w-[33.33%] lg:w-[25%]">
              <div className="group cursor-pointer w-full rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                {/* Image Skeleton */}
                <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-200 animate-pulse"></div>
                
                {/* Content Skeleton */}
                <div className="p-3 sm:p-4 text-center space-y-1.5 sm:space-y-2">
                  <div className="h-3 sm:h-4 w-24 sm:w-28 mx-auto bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 sm:h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 sm:h-5 w-16 sm:w-20 mx-auto bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 sm:h-8 w-full bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT BUTTON SKELETON */}
        <div className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    </div>
  )
}

export default CollectionSkeleton
