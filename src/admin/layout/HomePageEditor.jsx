'use client'

import { useState, useEffect } from 'react'
import AdminCard from './AdminCard'
import AdminButton from './AdminButton'
import { API_BASE_URL } from '../../config/api'

const API_URL = `${API_BASE_URL}/content/home`

export default function HomePageEditor() {
  const [content, setContent] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const DEFAULT_HOME = {
    announcement: 'Get 10% off on First Purchase',
  }

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(API_URL)
        const json = await res.json()
        const saved = json?.data?.data
        setContent(saved && typeof saved === 'object' ? { ...DEFAULT_HOME, ...saved } : DEFAULT_HOME)
      } catch {
        setContent(DEFAULT_HOME)
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

  const handleSectionChange = (index, field, value) => {
    const updated = [...content.sections]
    updated[index] = { ...updated[index], [field]: value }

    setContent(prev => ({
      ...prev,
      sections: updated,
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
        setMessage('✅ Homepage content saved successfully!')
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

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Home Page Editor
        </h1>
        <p className="text-gray-600 mt-1">
          Edit announcement and section titles shown on the homepage
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

      {/* Announcement */}
      <AdminCard>
        <h2 className="text-lg font-semibold mb-4">Announcement Bar</h2>

        <input
          type="text"
          value={content.announcement || ''}
          onChange={(e) =>
            handleFieldChange('announcement', e.target.value)
          }
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="Enter announcement text"
        />
      </AdminCard>

      {/* Sections */}
      <AdminCard>
        <h2 className="text-lg font-semibold mb-4">Product Sections</h2>

        {content.sections?.map((section, index) => (
          <div key={section.id} className="pb-4 border-b last:border-b-0">

            <input
              type="text"
              value={section.name}
              onChange={(e) =>
                handleSectionChange(index, 'name', e.target.value)
              }
              className="w-full px-3 py-2 border rounded-lg mb-2"
            />

            <textarea
              value={section.description}
              onChange={(e) =>
                handleSectionChange(index, 'description', e.target.value)
              }
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        ))}
      </AdminCard>

      {/* Save */}
      <AdminButton
        onClick={handleSave}
        disabled={saving}
        className="w-full"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </AdminButton>
    </div>
  )
}
