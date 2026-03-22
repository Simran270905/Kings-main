'use client'

import React, { useRef, useState, useCallback } from 'react'
import AliceCarousel from 'react-alice-carousel'
import HomeSectionCard from '../HomeSectionCard/HomeSectionCard'
import { Link } from 'react-router-dom'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'

const HomeSectionCarousel = ({ sectionName, data = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const carouselRef = useRef(null)

  const count = Math.min((data || []).length, 10)

  const responsive = {
    0: { items: Math.min(2, count) },
    640: { items: Math.min(3, count) },
    1024: { items: Math.min(4, count) },
  }

  // ================= DATA =================
  // Products now come from props (API data), not hardcoded arrays
  const products = (data || []).slice(0, 10).map((product, index) => ({
    ...product,
    isBestSeller: index === 1 || index === 4,
    isOnSale: index === 2 || index === 6,
  }))

  // Don't render if no products
  if (!products || products.length === 0) return null

  const items = products.map((item, index) => (
    <div key={index} className="px-3 lg:px-4">
      <Link to={`/product/${item.id}`}>
        <HomeSectionCard product={item} />
      </Link>
    </div>
  ))

  // Grid layout for small counts (avoids AliceCarousel stretch)
  if (products.length <= 3) {
    return (
      <section className="relative w-full px-4 sm:px-6 lg:px-14 py-12 lg:py-16 bg-gradient-to-b from-[#ffffff] via-[#fffaf3] to-[#fdf6ec]">
        <div className="mb-8 lg:mb-12 flex items-center justify-between">
          <div>
            <h2 className="text-2xl lg:text-3xl font-semibold tracking-wide text-[#ae0b0b]">{sectionName}</h2>
            <span className="mt-3 block h-1 w-16 rounded-full bg-gradient-to-r from-[#b91c1c] to-[#d4af37]" />
          </div>
          <Link to={`/shop/${String(sectionName).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '')}`} className="text-sm font-medium text-[#ae0b0b] hidden sm:inline-flex">Explore →</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 lg:gap-6">
          {products.map((item, index) => (
            <Link key={index} to={`/product/${item.id}`}>
              <HomeSectionCard product={item} />
            </Link>
          ))}
        </div>
      </section>
    )
  }

  // ================= HANDLERS =================
  const handleNext = useCallback(() => {
    carouselRef.current?.slideNext()
  }, [])

  const handlePrev = useCallback(() => {
    carouselRef.current?.slidePrev()
  }, [])

  // ================= KEYBOARD SUPPORT =================
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'ArrowRight') {
        handleNext()
      }
      if (e.key === 'ArrowLeft') {
        handlePrev()
      }
    },
    [handleNext, handlePrev]
  )

  return (
    <section
      className="relative w-full px-4 sm:px-6 lg:px-14 py-12 lg:py-16
                 bg-gradient-to-b from-[#ffffff] via-[#fffaf3] to-[#fdf6ec]"
    >
      <div className="pointer-events-none absolute inset-0
                      bg-gradient-to-r from-[#f3e6cf]/20 via-transparent to-[#f3e6cf]/20" />

      {/* ================= HEADING ================= */}
      <div className="relative mb-8 lg:mb-12 flex items-center justify-between">
        <div>
            <h2 className="text-2xl lg:text-3xl font-semibold tracking-wide text-[#ae0b0b]">
              {sectionName}
            </h2>
            <span className="mt-3 block h-1 w-16 rounded-full bg-gradient-to-r from-[#b91c1c] to-[#d4af37]" />
        </div>

        <Link
          to={`/shop/${String(sectionName).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '')}`}
          className="text-sm font-medium text-[#ae0b0b] hidden sm:inline-flex"
        >
          Explore →
        </Link>
      </div>

      {/* ================= CAROUSEL ================= */}
      <div
        className="relative outline-none"
        tabIndex={0}                // ✅ focusable
        onKeyDown={handleKeyDown}   // ✅ keyboard arrows
        aria-label={`${sectionName} product carousel`}
      >
        <AliceCarousel
          ref={carouselRef}
          items={items}
          disableButtonsControls
          disableDotsControls
          responsive={responsive}
          activeIndex={activeIndex}
          onSlideChanged={(e) => setActiveIndex(e.item)}
          stagePadding={{ paddingLeft: 16, paddingRight: 16 }}
        />

        {/* NEXT */}
        <button
          onClick={handleNext}
          aria-label="Next products"
          className="absolute top-1/2 -right-4 lg:-right-5 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm shadow-lg border border-[#e7d6a7] text-[#7a2e2e] flex items-center justify-center hover:bg-[#b91c1c] hover:text-white hover:border-transparent transition-all duration-200 z-10"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>

        {/* PREV */}
        <button
          onClick={handlePrev}
          aria-label="Previous products"
          className="absolute top-1/2 -left-4 lg:-left-5 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm shadow-lg border border-[#e7d6a7] text-[#7a2e2e] flex items-center justify-center hover:bg-[#b91c1c] hover:text-white hover:border-transparent transition-all duration-200 z-10"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
      </div>
    </section>
  )
}

export default HomeSectionCarousel
