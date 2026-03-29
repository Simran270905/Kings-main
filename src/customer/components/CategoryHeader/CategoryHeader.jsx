import React from 'react'
import { Link } from 'react-router-dom'

const CategoryHeader = ({ title, showExploreButton = true }) => {
  console.log('🎯 CategoryHeader rendering:', { title, showExploreButton })
  
  return (
    <div className="relative mb-8 lg:mb-12 flex items-center justify-between">
      <div>
        <h2 className="text-2xl lg:text-3xl font-semibold tracking-wide text-[#ae0b0b]">
          {title}
        </h2>
        <span className="mt-3 block h-1 w-16 rounded-full bg-gradient-to-r from-[#b91c1c] to-[#d4af37]" />
      </div>

      {showExploreButton && (
        <Link
          to={`/shop/${String(title).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '')}`}
          className="text-sm font-medium text-[#ae0b0b] hidden sm:inline-flex"
        >
          Explore →
        </Link>
      )}
    </div>
  )
}

export default CategoryHeader
