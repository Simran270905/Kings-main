'use client'

import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../../../config/api'

const DEFAULT = {
  hero: { title: 'Our Story', subtitle: 'Jewellery crafted for strength, identity, and legacy.', bg: '#7a1c1c' },
  intro: { title: '', description: '' },
  sections: [],
  timeline: { title: 'Our Journey', items: [] },
}

export default function OurStory() {
  const [content, setContent] = useState(DEFAULT)

  useEffect(() => {
    fetch(`${API_BASE_URL}/content/our-story`)
      .then(r => r.json())
      .then(json => {
        const saved = json?.data?.data
        if (saved && typeof saved === 'object') setContent({ ...DEFAULT, ...saved })
      })
      .catch(() => {})
  }, [])

  const { hero, intro, sections = [], timeline } = content

  return (
    <div className="bg-white text-gray-900">

      {/* HERO BANNER */}
      <section
        className="py-24 text-center text-white"
        style={{ backgroundColor: hero?.bg || '#7a1c1c' }}
      >
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{hero?.title || 'Our Story'}</h1>
          {hero?.subtitle && <p className="text-lg opacity-90">{hero.subtitle}</p>}
        </div>
      </section>

      {/* INTRO BLOCK */}
      {(intro?.title || intro?.description) && (
        <section className="max-w-4xl mx-auto px-6 py-16 text-center">
          {intro.title && <h2 className="text-3xl font-bold text-[#7a1c1c] mb-6">{intro.title}</h2>}
          {intro.description && <p className="text-lg leading-relaxed text-gray-700">{intro.description}</p>}
        </section>
      )}

      {/* DYNAMIC SECTIONS */}
      {sections.map((section, idx) => (
        <section
          key={section.id || idx}
          className="max-w-6xl mx-auto px-6 py-16"
        >
          <div className={`grid md:grid-cols-2 gap-12 items-center ${
            section.layout === 'image-right' ? '' : 'md:[&>*:first-child]:order-2'
          }`}>
            {/* Text */}
            <div>
              {section.title && (
                <h2 className="text-3xl font-bold text-[#7a1c1c] mb-5">{section.title}</h2>
              )}
              {section.description && (
                <p className="text-lg leading-relaxed text-gray-700">{section.description}</p>
              )}
            </div>
            {/* Image */}
            {section.image ? (
              <img
                src={section.image}
                alt={section.imageAlt || section.title || 'Section image'}
                className="rounded-xl shadow-lg w-full object-cover aspect-[4/3]"
              />
            ) : (
              <div className="rounded-xl bg-gray-100 aspect-[4/3] flex items-center justify-center">
                <span className="text-gray-300 text-sm">No image</span>
              </div>
            )}
          </div>
        </section>
      ))}

      {/* TIMELINE */}
      {(timeline?.items?.length > 0) && (
        <section className="bg-gray-50 py-20">
          <div className="max-w-4xl mx-auto px-6">
            {timeline.title && (
              <h2 className="text-3xl font-bold text-center text-[#7a1c1c] mb-12">{timeline.title}</h2>
            )}
            <div className="space-y-8">
              {timeline.items.map((item, i) => (
                <div key={i} className="flex gap-8 items-start">
                  <span className="text-lg font-bold text-[#7a1c1c] w-20 flex-shrink-0">{item.year}</span>
                  <p className="text-gray-700">{item.event}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty state when no CMS content */}
      {sections.length === 0 && !intro?.title && (
        <section className="max-w-4xl mx-auto px-6 py-20 text-center">
          <p className="text-gray-400 text-lg">Story content coming soon.</p>
          <p className="text-gray-300 text-sm mt-2">Admin can add content via Admin Panel → Content (CMS) → Our Story</p>
        </section>
      )}
    </div>
  )
}