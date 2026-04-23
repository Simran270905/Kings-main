'use client'

import { useEffect, useState } from 'react'
import { getContent } from '../../../utils/contentStorage'

const DEFAULT_OUR_STORY = {
  hero: {
    title: 'OUR STORY',
    subtitle: 'Jewellery crafted for strength, identity, and legacy.',
    video: 'https://res.cloudinary.com/dkbxrhe1v/video/upload/v1776971275/IMG_2682_ipj9lb.mov',
    image: 'https://res.cloudinary.com/dkbxrhe1v/image/upload/v1776971321/WhatsApp_Image_2026-03-28_at_10.19.25_PM_fb1qz9.jpg',
  },
  sections: [
    {
      id: 'section1',
      type: 'text_image',
      title: 'Born From Power',
      image: 'https://res.cloudinary.com/dkbxrhe1v/image/upload/v1776971470/WhatsApp_Image_2026-03-28_at_10.19.24_PM_kd1tfl.jpg',
      content:
        'KKings Jewellery was built for men who carry confidence in everything they wear. Our designs are bold, heavy, and timeless — created to express presence, not decoration.',
      imagePosition: 'right',
    },
    {
      id: 'feature',
      type: 'feature',
      title: 'Wear Your Power',
      content:
        'Every KKings piece is crafted to be worn daily, aged beautifully, and passed forward as legacy.',
    },
    {
      id: 'section2',
      type: 'text_image',
      title: 'Crafted With Precision',
      image: 'https://res.cloudinary.com/dkbxrhe1v/image/upload/v1776971470/WhatsApp_Image_2026-03-28_at_10.19.24_PM_kd1tfl.jpg',
      content:
        'Each piece is shaped by skilled artisans combining tradition with modern engineering. Weight, polish, and durability are tested rigorously. We create jewellery that outlasts trends.',
      imagePosition: 'left',
    },
    {
      id: 'timeline',
      type: 'timeline',
      title: 'Our Journey',
      items: [
        { year: '2019', text: 'First handcrafted gold chain created.' },
        { year: '2021', text: 'Brand officially launched.' },
        { year: '2023', text: 'Expanded premium collections.' },
        { year: 'Today', text: 'Trusted by thousands nationwide.' },
      ],
    },
    {
      id: 'quote',
      type: 'quote',
      quote: 'Jewellery is not about shine — it\'s about presence.',
      author: '— Founder, KKings Jewellery',
    },
  ],
}

export default function OurStory() {
  const [content, setContent] = useState(DEFAULT_OUR_STORY)

  useEffect(() => {
    try {
      // Clear any existing localStorage content to force fresh load
      localStorage.removeItem('cms_our_story')
      
      // Use our component defaults directly (which have Cloudinary URLs)
      setContent(DEFAULT_OUR_STORY)
      
      console.log('=== OUR STORY CONTENT DEBUG ===')
      console.log('Using component defaults with video:')
      console.log('Video URL:', DEFAULT_OUR_STORY.hero.video)
      console.log('Image URL:', DEFAULT_OUR_STORY.hero.image)
      console.log('================================')
    } catch (error) {
      console.warn('Failed to load OurStory content, using component defaults')
      setContent(DEFAULT_OUR_STORY)
    }
  }, [])

  return (
    <div className="bg-white text-gray-900">
      {/* HERO */}
      <section className="relative h-screen flex items-center justify-center">
        {content.hero.video ? (
          <video
            src={content.hero.video}
            autoPlay
            muted
            loop
            playsInline
            poster={content.hero.image}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              console.error('Video failed to load:', e);
              // Fallback to image if video fails
              e.target.style.display = 'none';
              const fallbackImg = document.createElement('img');
              fallbackImg.src = content.hero.image;
              fallbackImg.alt = 'KKings Story';
              fallbackImg.className = 'absolute inset-0 w-full h-full object-cover';
              e.target.parentNode.appendChild(fallbackImg);
            }}
            onLoadedData={() => {
              console.log('Video loaded successfully');
            }}
          />
        ) : (
          <img
            src={content.hero.image}
            alt="KKings Story"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative text-center max-w-3xl px-6 text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            {content.hero.title}
          </h1>
          <p className="text-lg opacity-90">
            {content.hero.subtitle}
          </p>
        </div>
      </section>

      {/* CONTENT */}
      {content.sections.map((section) => {
        if (section.type === 'text_image') {
          const isImageRight = section.imagePosition === 'right'

          return (
            <section
              key={section.id}
              className="max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-16 items-center"
            >
              {isImageRight ? (
                <>
                  <div>
                    <h2 className="text-4xl font-bold text-[#7a1c1c] mb-6">
                      {section.title}
                    </h2>
                    <p className="text-lg leading-relaxed text-gray-700">
                      {section.content}
                    </p>
                  </div>
                  <img
                    src={section.image}
                    alt={section.title}
                    className="rounded-lg shadow-xl"
                  />
                </>
              ) : (
                <>
                  <img
                    src={section.image}
                    alt={section.title}
                    className="rounded-lg shadow-xl"
                  />
                  <div>
                    <h2 className="text-4xl font-bold text-[#7a1c1c] mb-6">
                      {section.title}
                    </h2>
                    <p className="text-lg leading-relaxed text-gray-700">
                      {section.content}
                    </p>
                  </div>
                </>
              )}
            </section>
          )
        }

        if (section.type === 'feature') {
          return (
            <section
              key={section.id}
              className="bg-[#7a1c1c] text-white py-20 text-center"
            >
              <h2 className="text-4xl font-bold mb-6">{section.title}</h2>
              <p className="max-w-2xl mx-auto text-lg opacity-90">
                {section.content}
              </p>
            </section>
          )
        }

        if (section.type === 'timeline') {
          return (
            <section key={section.id} className="bg-gray-50 py-24">
              <div className="max-w-5xl mx-auto px-6">
                <h2 className="text-4xl font-bold text-center text-[#7a1c1c] mb-16">
                  {section.title}
                </h2>

                <div className="space-y-12">
                  {section.items.map((item, i) => (
                    <div key={i} className="flex gap-8 items-start">
                      <span className="text-xl font-bold text-[#7a1c1c] w-24">
                        {item.year}
                      </span>
                      <p className="text-gray-700 text-lg">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )
        }

        if (section.type === 'quote') {
          return (
            <section key={section.id} className="max-w-4xl mx-auto px-6 py-24 text-center">
              <blockquote className="text-2xl md:text-3xl font-semibold leading-relaxed">
                "{section.quote}"
              </blockquote>

              <p className="mt-6 text-[#7a1c1c] font-medium">
                {section.author}
              </p>
            </section>
          )
        }

        return null
      })}
    </div>
  )
}
