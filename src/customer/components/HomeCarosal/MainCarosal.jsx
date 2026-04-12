'use client'

import { memo, useMemo, lazy, Suspense } from 'react'
import 'react-alice-carousel/lib/alice-carousel.css'
import { MainCarosalData } from '../../components/HomeCarosal/MainCarosalData'

// ✅ Vite-safe lazy loading
const AliceCarousel = lazy(() => import('react-alice-carousel'))

function MainCarosal() {
  const items = useMemo(
    () =>
      MainCarosalData.map((item, index) => (
        <div key={index} className="relative w-full h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-screen">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover"
            loading={index === 0 ? 'eager' : 'lazy'}
          />

          <div className="absolute inset-0 bg-black/40" />

          <div className="absolute inset-0 flex items-center justify-center text-center px-2 sm:px-4 md:px-6">
            <div className="text-white max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl xl:text-6xl font-semibold tracking-widest uppercase">
                {item.title}
              </h1>

              <p className="mt-2 sm:mt-3 md:mt-4 text-xs sm:text-sm md:text-base lg:text-lg text-gray-200 tracking-wide">
                {item.subtitle}
              </p>

              <button className="mt-4 sm:mt-6 md:mt-8 px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base border border-white text-white uppercase tracking-wider hover:bg-white hover:text-black transition">
                {item.cta}
              </button>
            </div>
          </div>
        </div>
      )),
    []
  )

  return (
    <Suspense fallback={null}>
      <AliceCarousel
        items={items}
        disableButtonsControls
        disableDotsControls
        autoPlay
        autoPlayInterval={3500}
        infinite
        animationDuration={1000}
      />
    </Suspense>
  )
}

export default memo(MainCarosal)
