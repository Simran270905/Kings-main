'use client'

import { useState, useEffect } from 'react'
import { PencilIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import AdminCard from './AdminCard'
import AdminButton from './AdminButton'
import { API_BASE_URL } from '../../config/api'

const API_BASE = `${API_BASE_URL}/content`

const PAGES = [
  { id: 'home', name: 'Home', description: 'Homepage announcement and section titles' },
  { id: 'our-story', name: 'Our Story', description: 'Our Story hero, sections, and timeline' },
  { id: 'footer', name: 'Footer', description: 'Footer brand info, links, and contact' },
]

export default function Pages() {
  const [editingPage, setEditingPage] = useState(null)

  const handleEditPage = async (page) => {
    try {
      const res = await fetch(`${API_BASE}/${page.id}`)
      const data = await res.json()

      setEditingPage({
        ...page,
        content: data || {
          title: page.name,
          sections: [],
        }
      })
    } catch (err) {
      console.error(err)
    }
  }

  const handleSavePage = async () => {
    try {
      const token = localStorage.getItem('kk_admin_token')

      const res = await fetch(`${API_BASE}/${editingPage.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingPage.content),
      })

      if (res.ok) {
        toast.success(`${editingPage.name} saved successfully!`)
        setEditingPage(null)
      } else {
        toast.error('Failed to save')
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (editingPage) {
    return (
      <PageEditor
        page={editingPage}
        onSave={handleSavePage}
        onClose={() => setEditingPage(null)}
      />
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Website Pages</h1>

      <div className="grid md:grid-cols-2 gap-4">
        {PAGES.map(page => (
          <AdminCard key={page.id} hover>
            <h2 className="font-semibold">{page.name}</h2>
            <p className="text-sm text-gray-600">{page.description}</p>

            <AdminButton
              onClick={() => handleEditPage(page)}
              className="mt-4 w-full"
              icon={PencilIcon}
            >
              Edit Page
            </AdminButton>
          </AdminCard>
        ))}
      </div>
    </div>
  )
}

// ================= EDITOR =================

function PageEditor({ page, onSave, onClose }) {
  const [content, setContent] = useState(page.content)
  const [saving, setSaving] = useState(false)

  const handleAddSection = () => {
    setContent(prev => ({
      ...prev,
      sections: [
        ...(prev.sections || []),
        {
          id: Date.now().toString(),
          type: 'text',
          title: '',
          content: '',
        }
      ]
    }))
  }

  const handleUpdateSection = (i, field, value) => {
    const updated = [...content.sections]
    updated[i] = { ...updated[i], [field]: value }

    setContent(prev => ({ ...prev, sections: updated }))
  }

  const handleRemoveSection = (i) => {
    setContent(prev => ({
      ...prev,
      sections: prev.sections.filter((_, idx) => idx !== i)
    }))
  }

  const handleSaveClick = async () => {
    setSaving(true)
    await onSave()
    setSaving(false)
  }

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold">Editing {page.name}</h1>

      <AdminCard>
        <input
          value={content.title || ''}
          onChange={(e) =>
            setContent(prev => ({ ...prev, title: e.target.value }))
          }
          className="w-full px-3 py-2 border rounded-lg"
        />
      </AdminCard>

      <AdminCard>
        <AdminButton onClick={handleAddSection}>
          + Add Section
        </AdminButton>

        {content.sections?.map((section, i) => (
          <div key={section.id} className="mt-4">

            <input
              value={section.title}
              onChange={(e) =>
                handleUpdateSection(i, 'title', e.target.value)
              }
              className="w-full px-3 py-2 border mb-2"
            />

            <textarea
              value={section.content}
              onChange={(e) =>
                handleUpdateSection(i, 'content', e.target.value)
              }
              className="w-full px-3 py-2 border"
            />

            <button onClick={() => handleRemoveSection(i)}>
              Remove
            </button>
          </div>
        ))}
      </AdminCard>

      <div className="flex gap-2">
        <AdminButton onClick={handleSaveClick} loading={saving}>
          Save
        </AdminButton>

        <AdminButton variant="secondary" onClick={onClose}>
          Cancel
        </AdminButton>
      </div>
    </div>
  )
}
