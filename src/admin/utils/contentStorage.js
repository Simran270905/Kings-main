// src/admin/utils/contentStorage.js

const STORAGE_KEY = 'cms_content_v1';

const DEFAULTS = {
  home: {
    announcement: 'Welcome to KKings Jewellery!',
    sections: [
      { id: 'chains', name: 'Chains', description: 'Premium chains' },
      { id: 'rings', name: 'Rings', description: 'Exquisite ring collection' },
      { id: 'bracelets', name: 'Bracelets', description: 'Elegant bracelets' },
      { id: 'kada', name: 'Kada', description: 'Kada - A symbol of strength' },
      { id: 'rudraksh', name: 'Rudraksh', description: 'Sacred Rudraksh beads' },
    ]
  },
  footer: {
    brandName: 'KKings Jewellery',
    tagline: 'Premium Jewellery crafted with elegance and love.',
    trustline: 'Trusted by 2 Lakh+ Customers',
    quickLinks: [
      { label: 'Shop', url: '/shop' },
      { label: 'About Us', url: '/about' },
      { label: 'Contact', url: '/contact' },
      { label: 'FAQs', url: '/faq' },
    ],
    contact: {
      address: 'Mumbai, Maharashtra, India',
      phone: '+91 8329972432',
      email: 'support@kkingsjewellery.com',
    },
    socialLinks: {
      instagram: 'https://www.instagram.com/kkings_jewellery',
      whatsapp: 'https://wa.me/+918329972432',
    },
    copyright: '© {year} KKingsJewellery. All rights reserved.',
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
          { year: '2019', text: 'First handcrafted gold chain created.' },
          { year: '2021', text: 'Brand officially launched.' },
          { year: '2023', text: 'Expanded premium collections.' },
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
  }
};

// Load all CMS content from localStorage, or seed defaults if missing/corrupt
export function getAllContent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      seedDefaultContent();
      return { ...DEFAULTS };
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch {
    seedDefaultContent();
    return { ...DEFAULTS };
  }
}

// Get content for a specific page
export function getContent(pageKey) {
  const all = getAllContent();
  return all[pageKey] || DEFAULTS[pageKey] || {};
}

// Update content for a specific page
export function updateContent(pageKey, data) {
  const all = getAllContent();
  all[pageKey] = data;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return true;
  } catch {
    return false;
  }
}

// Seed all default content (used on first load or reset)
export function seedDefaultContent() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULTS));
}
