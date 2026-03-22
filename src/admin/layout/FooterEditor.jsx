'use client'

import { useState, useEffect } from 'react'
import AdminCard from './AdminCard'
import AdminButton from './AdminButton'
import { API_BASE_URL } from '../../config/api'

const API_URL = `${API_BASE_URL}/content/footer`

export default function FooterEditor() {
  const [content, setContent] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const DEFAULT_FOOTER = {
    brandName: 'KKings Jewellery',
    tagline: 'Premium Jewellery crafted with elegance and love.',
    trustline: 'Trusted by 2 Lakh+ Customers',
    quickLinks: [
      { label: 'Shop', url: '/shop' },
      { label: 'Our Story', url: '/our-story' },
      { label: 'Cart', url: '/cart' },
    ],
    contact: { address: '', phone: '', email: '' },
    socialLinks: { instagram: '', whatsapp: '' },
    copyright: '© {year} KKings Jewellery. All rights reserved.',
  }

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(API_URL)
        const json = await res.json()
        const saved = json?.data?.data
        setContent(saved && typeof saved === 'object' ? { ...DEFAULT_FOOTER, ...saved } : DEFAULT_FOOTER)
      } catch {
        setContent(DEFAULT_FOOTER)
      }
    }
    fetchContent()
  }, [])

  const handleFieldChange = (field, value) => {
    setContent(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleContactChange = (field, value) => {
    setContent(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value,
      },
    }))
  }

  const handleLinkChange = (index, field, value) => {
    const updated = [...content.quickLinks]
    updated[index] = { ...updated[index], [field]: value }

    setContent(prev => ({
      ...prev,
      quickLinks: updated,
    }))
  }

  const handleSocialChange = (platform, value) => {
    setContent(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value,
      },
    }))
  }

  // 🔥 SAVE TO BACKEND
  const handleSave = async () => {
    setSaving(true)
    setMessage('')

    try {
      const token = localStorage.getItem('kk_admin_token')
      const res = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(content),
      })
      if (res.ok) {
        setMessage('✅ Footer content saved successfully!')
      } else {
        setMessage('❌ Failed to save content')
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`)
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  if (!content) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Footer Editor</h1>
        <p className="text-gray-600 mt-1">
          Edit brand information, links, and contact details in the footer
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('✅')
            ? 'bg-green-50 text-green-800'
            : 'bg-red-50 text-red-800'
        }`}>
          {message}
        </div>
      )}

      {/* Brand */}
      <AdminCard>
        <h2 className="text-lg font-semibold mb-4">Brand Information</h2>

        <input
          value={content.brandName || ''}
          onChange={(e) => handleFieldChange('brandName', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg mb-3"
        />

        <textarea
          value={content.tagline || ''}
          onChange={(e) => handleFieldChange('tagline', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg mb-3"
        />

        <input
          value={content.trustline || ''}
          onChange={(e) => handleFieldChange('trustline', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </AdminCard>

      {/* Save */}
      <AdminButton onClick={handleSave} disabled={saving} className="w-full">
        {saving ? 'Saving...' : 'Save Changes'}
      </AdminButton>
    </div>
  )
}
