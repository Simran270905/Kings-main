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
        <div key={index} className="relative w-full h-[70vh] md:h-[80vh] lg:h-screen">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover"
            loading={index === 0 ? 'eager' : 'lazy'}
          />

          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />

          <div className="absolute inset-0 flex items-center justify-center text-center px-4">
            <div className="text-white max-w-4xl">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-wide leading-tight mb-6">
                {item.title}
              </h1>

              <p className="text-lg md:text-xl lg:text-2xl text-gray-200 font-light leading-relaxed mb-8 max-w-2xl mx-auto">
                {item.subtitle}
              </p>

              <button className="px-10 py-4 bg-white text-black font-semibold text-sm md:text-base uppercase tracking-wider hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl">
                {item.cta}
              </button>
            </div>
          </div>
        </div>
      )),
    []
  )

  return (
    <Suspense fallback={
      <div className="relative w-full h-[70vh] md:h-[80vh] lg:h-screen bg-gray-900">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    }>
      <AliceCarousel
        items={items}
        disableButtonsControls
        disableDotsControls={false}
        dotsClass="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2"
        dotClass="w-3 h-3 bg-white/50 hover:bg-white rounded-full transition-colors cursor-pointer"
        activeDotClass="w-3 h-3 bg-white rounded-full"
        autoPlay
        autoPlayInterval={4000}
        infinite
        animationDuration={800}
        keyboardNavigation={true}
        touchTracking={true}
        responsive={[
          {
            0: { items: 1 },
            768: { items: 1 },
            1024: { items: 1 }
          }
        ]}
      />
    </Suspense>
  )
}

export default memo(MainCarosal)
