/**
 * Content Storage Service
 * Persists page content using localStorage
 * Can be upgraded to backend API later
 */

const STORAGE_KEYS = {
  HOME_PAGE: 'cms_home_page',
  FOOTER: 'cms_footer',
  OUR_STORY: 'cms_our_story',
  PAGES: 'cms_pages',
}

// Default content definitions
export const DEFAULT_CONTENT = {
  homePage: {
    announcement: 'Get 10% off on First Purchase',
    heroCarousel: 'images/hero-carousel', // Placeholder
    sections: [
      {
        id: 'chains',
        name: 'Chains',
        description: 'Explore our collection of premium chains',
      },
      {
        id: 'bali',
        name: "Men's Bali",
        description: 'Traditional Bali designs for the modern man',
      },
      {
        id: 'rings',
        name: 'Rings',
        description: 'Exquisite ring collection',
      },
      {
        id: 'kada',
        name: 'Kada',
        description: 'Kada - A symbol of strength',
      },
      {
        id: 'bracelets',
        name: 'Bracelets',
        description: 'Elegant bracelets for every occasion',
      },
      {
        id: 'rudraksh',
        name: 'Rudraksh',
        description: 'Sacred Rudraksh beads and designs',
      },
    ],
  },

  footer: {
    brandName: '✨ KKings Jewellery',
    tagline: 'Premium Jewellery crafted with elegance and love.',
    trustline: 'Trusted by 2 Lakh+ Customers',
    
    quickLinks: [
      { label: 'Shop', url: '/shop' },
      { label: 'About Us', url: '/about' },
      { label: 'Contact', url: '/contact' },
      { label: 'FAQs', url: '/faq' },
    ],

    contact: {
      address: '📍 Mumbai, Maharashtra, India',
      phone: '📞 +91 8329972432',
      email: '✉️ support@kkingsjewellery.com',
    },

    socialLinks: {
      instagram: 'https://www.instagram.com/kkings_jewellery',
      whatsapp: 'https://wa.me/+918329972432',
    },

    copyright: '© {year} KKingsJewellery. All rights reserved. | Designed by StarX Innovations and IT Solutions',
  },

  ourStory: {
    hero: {
      title: 'OUR STORY',
      subtitle: 'Jewellery crafted for strength, identity, and legacy.',
      image: '/images/story-hero.jpg',
    },
    sections: [
      {
        id: 'section1',
        type: 'text_image',
        title: 'Born From Power',
        image: '/images/story-1.jpg',
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
        image: '/images/story-2.jpg',
        content:
          'Each piece is shaped by skilled artisans combining tradition with modern engineering. Weight, polish, and durability are tested rigorously. We create jewellery that outlasts trends.',
        imagePosition: 'left',
      },
      {
        id: 'timeline',
        type: 'timeline',
        title: 'Our Journey',
        items: [
          { year: '2023', text: 'Started with KKings Jewellery.' },
          { year: '2024', text: 'Brand officially launched.' },
          { year: '2025', text: 'Expanded premium collections.' },
          { year: 'Today', text: 'Trusted by thousands nationwide.' },
        ],
      },
      {
        id: 'quote',
        type: 'quote',
        quote:
          'Jewellery is not about shine — it\'s about presence.',
        author: '— Founder, KKings Jewellery',
      },
    ],
  },
}

// ============= Storage Operations =============

/**
 * Get content from localStorage with fallback to defaults
 */
export const getContent = (pageType) => {
  const key = STORAGE_KEYS[pageType]
  if (!key) {
    console.warn(`Unknown page type: ${pageType}`)
    return null
  }

  try {
    const stored = localStorage.getItem(key)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error(`Error reading content for ${pageType}:`, error)
  }

  // Return defaults
  const defaults = {
    HOME_PAGE: 'homePage',
    FOOTER: 'footer',
    OUR_STORY: 'ourStory',
  }
  return DEFAULT_CONTENT[defaults[pageType]] || null
}

/**
 * Save content to localStorage
 */
export const saveContent = (pageType, content) => {
  const key = STORAGE_KEYS[pageType]
  if (!key) {
    console.warn(`Unknown page type: ${pageType}`)
    return false
  }

  try {
    localStorage.setItem(key, JSON.stringify(content))
    return true
  } catch (error) {
    console.error(`Error saving content for ${pageType}:`, error)
    return false
  }
}

/**
 * Reset content to defaults
 */
export const resetContent = (pageType) => {
  const defaults = {
    HOME_PAGE: 'homePage',
    FOOTER: 'footer',
    OUR_STORY: 'ourStory',
  }
  const defaultContent = DEFAULT_CONTENT[defaults[pageType]]
  return saveContent(pageType, defaultContent)
}

/**
 * Reset all content
 */
export const resetAllContent = () => {
  Object.keys(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(STORAGE_KEYS[key])
  })
}
// ============= Page Management =============

/**
 * Get all pages from localStorage
 */
export const getAllPages = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PAGES)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error reading pages:', error)
  }
  return {}
}

/**
 * Get specific page content by ID
 */
export const getPageContent = (pageId) => {
  try {
    const pages = getAllPages()
    return pages[pageId] || null
  } catch (error) {
    console.error(`Error reading page ${pageId}:`, error)
    return null
  }
}

/**
 * Save or update specific page content
 */
export const savePageContent = (pageId, content) => {
  try {
    const pages = getAllPages()
    pages[pageId] = {
      ...content,
      metadata: {
        ...content.metadata,
        lastUpdated: new Date().toISOString(),
        lastUpdatedBy: 'admin'
      }
    }
    localStorage.setItem(STORAGE_KEYS.PAGES, JSON.stringify(pages))
    return true
  } catch (error) {
    console.error(`Error saving page ${pageId}:`, error)
    return false
  }
}

/**
 * Delete a page
 */
export const deletePage = (pageId) => {
  try {
    const pages = getAllPages()
    delete pages[pageId]
    localStorage.setItem(STORAGE_KEYS.PAGES, JSON.stringify(pages))
    return true
  } catch (error) {
    console.error(`Error deleting page ${pageId}:`, error)
    return false
  }
}