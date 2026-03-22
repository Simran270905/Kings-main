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
        <div key={index} className="relative w-full h-[60vh] md:h-screen">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover"
            loading={index === 0 ? 'eager' : 'lazy'}
          />

          <div className="absolute inset-0 bg-black/40" />

          <div className="absolute inset-0 flex items-center justify-center text-center px-4">
            <div className="text-white max-w-3xl">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-semibold tracking-widest uppercase">
                {item.title}
              </h1>

              <p className="mt-4 text-sm md:text-lg text-gray-200 tracking-wide">
                {item.subtitle}
              </p>

              <button className="mt-8 px-8 py-3 border border-white text-white uppercase tracking-wider hover:bg-white hover:text-black transition">
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
