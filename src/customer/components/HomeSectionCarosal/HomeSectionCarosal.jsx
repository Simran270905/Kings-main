'use client'

import React, { useRef } from 'react'
import HomeSectionCard from '../HomeSectionCard/HomeSectionCard'
import CategoryHeader from '../CategoryHeader/CategoryHeader'
import { Link } from 'react-router-dom'

const HomeSectionCarousel = ({ data, sectionName, showExploreButton = true }) => {
  console.log('🎠 HomeSectionCarosal - Received data:', data)
  console.log('🎠 HomeSectionCarosal - Section name:', sectionName)
  const scrollRef = useRef(null)

  // Scroll functions for manual navigation
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: -300,
        behavior: "smooth"
      })
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: 300,
        behavior: "smooth"
      })
    }
  }

  // ================= DATA =================
  const products = (data || []).map((product, index) => ({
    ...product,
    isBestSeller: index === 1 || index === 4,
    isOnSale: index === 2 || index === 6,
  }))

  // Grid layout for small counts (avoids AliceCarousel stretch)
  if (products.length <= 3) {
    return (
      <section className="relative w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-14 py-12 lg:py-16 bg-gradient-to-b from-[#ffffff] via-[#fffaf3] to-[#fdf6ec]">
        <div className="mb-8 lg:mb-12 flex items-center justify-between">
          <Link to={`/shop/${String(sectionName).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '')}`} className="text-sm font-medium text-[#ae0b0b] hidden sm:inline-flex">Explore →</Link>
        </div>
        <div className="relative">
          {/* LEFT BUTTON */}
          <button
            onClick={scrollLeft}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* SCROLLABLE ROW */}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-4 scroll-smooth snap-x snap-mandatory scrollbar-hide pb-2"
          >
            {products.map((item, index) => (
              <div key={index} className="flex-shrink-0 w-[50%] sm:w-[50%] md:w-[33.33%] lg:w-[25%] snap-start">
                <Link to={`/product/${item.id}`}>
                  <HomeSectionCard product={item} />
                </Link>
              </div>
            ))}
          </div>

          {/* RIGHT BUTTON */}
          <button
            onClick={scrollRight}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </section>
    )
  }

  return (
    <section
      className="relative w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-14 py-12 lg:py-16 bg-gradient-to-b from-[#ffffff] via-[#fffaf3] to-[#fdf6ec]"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#f3e6cf]/20 via-transparent to-[#f3e6cf]/20" />

      {/* ================= HEADING ================= */}
      <CategoryHeader title={sectionName} showExploreButton={showExploreButton} />

      {/* ================= HORIZONTAL SCROLL CAROUSEL ================= */}
      <div className="relative outline-none">
        {/* LEFT BUTTON */}
        <button
          onClick={scrollLeft}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* SCROLLABLE ROW */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 scroll-smooth snap-x snap-mandatory scrollbar-hide pb-2"
        >
          {products.map((item, index) => (
            <div key={index} className="flex-shrink-0 w-[50%] sm:w-[50%] md:w-[33.33%] lg:w-[25%] snap-start">
              <Link to={`/product/${item.id}`}>
                <HomeSectionCard product={item} />
              </Link>
            </div>
          ))}
        </div>

        {/* RIGHT BUTTON */}
        <button
          onClick={scrollRight}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  )
}

export default HomeSectionCarousel
