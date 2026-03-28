'use client'

import React, { useRef, useState, useCallback } from 'react'
import AliceCarousel from 'react-alice-carousel'
import HomeSectionCard from '../HomeSectionCard/HomeSectionCard'
import { Link } from 'react-router-dom'
import { Button } from '@mui/material'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import { chains } from '../../data/chains'
import { bracelets } from '../../data/bracelet'

const HomeSectionCarousel = ({ sectionName }) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const carouselRef = useRef(null)

  const responsive = {
    0: { items: 2 },
    640: { items: 3 },
    1024: { items: 4 },
  }

  // ================= DATA =================
  const baseProducts =
    sectionName?.toLowerCase() === 'bracelets'
      ? bracelets.slice(0, 10)
      : chains.slice(0, 10)

  const products = baseProducts.map((product, index) => ({
    ...product,
    isBestSeller: index === 1 || index === 4,
    isOnSale: index === 2 || index === 6,
  }))

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
      className="relative w-full px-4 sm:px-6 lg:px-14 py-12 lg:py-16 bg-gradient-to-b from-[#ffffff] via-[#fffaf3] to-[#fdf6ec]"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#f3e6cf]/20 via-transparent to-[#f3e6cf]/20" />

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
        <Button
          onClick={handleNext}
          aria-label="Next products"
          sx={{
            position: 'absolute',
            top: '50%',
            right: '-2.5rem',
            transform: 'translateY(-50%)',
            minWidth: 48,
            width: 48,
            height: 48,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,250,240,0.95)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 12px 28px rgba(180,140,90,0.25)',
            color: '#7a2e2e',
            '&:hover': { backgroundColor: '#b91c1c', color: '#fff' },
          }}
        >
          <KeyboardArrowRightIcon />
        </Button>

        {/* PREV */}
        <Button
          onClick={handlePrev}
          aria-label="Previous products"
          sx={{
            position: 'absolute',
            top: '50%',
            left: '-2.5rem',
            transform: 'translateY(-50%)',
            minWidth: 48,
            width: 48,
            height: 48,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,250,240,0.95)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 12px 28px rgba(0,0,0,0.25)',
            color: '#7a2e2e',
            '&:hover': { backgroundColor: '#b91c1c', color: '#fff' },
          }}
        >
          <KeyboardArrowLeftIcon />
        </Button>
      </div>
    </section>
  )
}

export default HomeSectionCarousel
