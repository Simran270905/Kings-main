'use client'

import { useState, useEffect, useRef } from 'react'
import { API_BASE_URL } from '../../config/api'
import { PhotoIcon, PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'

const API_URL = `${API_BASE_URL}/content/our-story`
const UPLOAD_URL = `${API_BASE_URL}/upload`

const DEFAULT = {
  hero: { title: '', subtitle: '', bg: '#7a1c1c' },
  intro: { title: '', description: '' },
  sections: [],
  timeline: { title: '', items: [] },
}

export default function OurStoryEditor() {
  const [content, setContent] = useState(DEFAULT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingIdx, setUploadingIdx] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })
  const fileInputRef = useRef(null)
  const [activeUploadTarget, setActiveUploadTarget] = useState(null)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(API_URL)
        const json = await res.json()
        const saved = json?.data?.data
        if (saved && typeof saved === 'object') {
          setContent({ ...DEFAULT, ...saved })
        }
      } catch {}
      finally { setLoading(false) }
    }
    fetchContent()
  }, [])

  const showMsg = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 3500)
  }

  const set = (path, value) => {
    setContent(prev => {
      const next = { ...prev }
      const keys = path.split('.')
      let ref = next
      for (let i = 0; i < keys.length - 1; i++) {
        ref[keys[i]] = Array.isArray(ref[keys[i]]) ? [...ref[keys[i]]] : { ...ref[keys[i]] }
        ref = ref[keys[i]]
      }
      ref[keys[keys.length - 1]] = value
      return next
    })
  }

  const uploadImage = async (file, target) => {
    const token = localStorage.getItem('kk_admin_token')
    const form = new FormData()
    form.append('image', file)
    const res = await fetch(UPLOAD_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    })
    const data = await res.json()
    return data?.data?.url || data?.url || null
  }

  const handleImageClick = (target) => {
    setActiveUploadTarget(target)
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !activeUploadTarget) return
    setUploadingIdx(activeUploadTarget)
    try {
      const url = await uploadImage(file, activeUploadTarget)
      if (url) {
        if (activeUploadTarget.startsWith('section.')) {
          const idx = parseInt(activeUploadTarget.split('.')[1])
          const updated = [...content.sections]
          updated[idx] = { ...updated[idx], image: url }
          set('sections', updated)
        } else {
          set(activeUploadTarget, url)
        }
        showMsg('success', 'Image uploaded successfully')
      }
    } catch { showMsg('error', 'Image upload failed') }
    finally {
      setUploadingIdx(null)
      setActiveUploadTarget(null)
      e.target.value = ''
    }
  }

  const addSection = () => {
    set('sections', [...(content.sections || []), {
      id: Date.now().toString(),
      title: '',
      description: '',
      image: '',
      imageAlt: '',
      layout: 'image-left',
    }])
  }

  const updateSection = (idx, field, value) => {
    const updated = [...content.sections]
    updated[idx] = { ...updated[idx], [field]: value }
    set('sections', updated)
  }

  const removeSection = (idx) => {
    set('sections', content.sections.filter((_, i) => i !== idx))
  }

  const addTimelineItem = () => {
    set('timeline.items', [...(content.timeline?.items || []), { year: '', event: '' }])
  }

  const updateTimelineItem = (idx, field, value) => {
    const updated = [...(content.timeline?.items || [])]
    updated[idx] = { ...updated[idx], [field]: value }
    set('timeline.items', updated)
  }

  const removeTimelineItem = (idx) => {
    set('timeline.items', (content.timeline?.items || []).filter((_, i) => i !== idx))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('kk_admin_token')
      const res = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(content),
      })
      if (res.ok) showMsg('success', 'Our Story saved successfully!')
      else showMsg('error', 'Failed to save content')
    } catch (e) {
      showMsg('error', e.message)
    } finally { setSaving(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ae0b0b]" />
    </div>
  )

  return (
    <div className="space-y-6 max-w-4xl">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Our Story Editor</h1>
          <p className="text-sm text-gray-500 mt-1">Edit all content visible on the /our-story page</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-[#ae0b0b] text-white text-sm font-semibold rounded-lg hover:bg-[#8f0a0a] disabled:opacity-60 transition"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {message.text && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>{message.text}</div>
      )}

      {/* HERO SECTION */}
      <Section title="Hero Banner">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Hero Title">
            <input
              value={content.hero?.title || ''}
              onChange={e => set('hero.title', e.target.value)}
              placeholder="e.g. Wear Your Power"
              className={inputCls}
            />
          </Field>
          <Field label="Background Color">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={content.hero?.bg || '#7a1c1c'}
                onChange={e => set('hero.bg', e.target.value)}
                className="h-10 w-14 cursor-pointer rounded border"
              />
              <input
                value={content.hero?.bg || ''}
                onChange={e => set('hero.bg', e.target.value)}
                placeholder="#7a1c1c"
                className={`${inputCls} flex-1`}
              />
            </div>
          </Field>
        </div>
        <Field label="Hero Subtitle">
          <textarea
            value={content.hero?.subtitle || ''}
            onChange={e => set('hero.subtitle', e.target.value)}
            rows={2}
            placeholder="Short tagline under the title"
            className={inputCls}
          />
        </Field>
      </Section>

      {/* INTRO SECTION */}
      <Section title="Intro Block">
        <Field label="Intro Title">
          <input value={content.intro?.title || ''} onChange={e => set('intro.title', e.target.value)} placeholder="e.g. Born From Power" className={inputCls} />
        </Field>
        <Field label="Intro Description">
          <textarea value={content.intro?.description || ''} onChange={e => set('intro.description', e.target.value)} rows={3} placeholder="Opening paragraph..." className={inputCls} />
        </Field>
      </Section>

      {/* CONTENT SECTIONS */}
      <Section
        title="Content Sections"
        action={<button onClick={addSection} className="flex items-center gap-1.5 text-xs font-semibold text-[#ae0b0b] hover:opacity-80"><PlusIcon className="h-3.5 w-3.5" />Add Section</button>}
      >
        {(content.sections || []).length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No sections yet. Click "Add Section" to create one.</p>
        )}
        {(content.sections || []).map((section, idx) => (
          <div key={section.id || idx} className="border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Section {idx + 1}</span>
              <button onClick={() => removeSection(idx)} className="text-red-400 hover:text-red-600">
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Title">
                <input value={section.title || ''} onChange={e => updateSection(idx, 'title', e.target.value)} placeholder="Section title" className={inputCls} />
              </Field>
              <Field label="Layout">
                <select value={section.layout || 'image-left'} onChange={e => updateSection(idx, 'layout', e.target.value)} className={inputCls}>
                  <option value="image-left">Image Left</option>
                  <option value="image-right">Image Right</option>
                </select>
              </Field>
            </div>

            <Field label="Description">
              <textarea value={section.description || ''} onChange={e => updateSection(idx, 'description', e.target.value)} rows={3} placeholder="Section content..." className={inputCls} />
            </Field>

            <Field label="Section Image">
              <div className="flex items-start gap-3">
                {section.image ? (
                  <div className="relative group">
                    <img src={section.image} alt={section.title} className="h-24 w-32 object-cover rounded-lg border" />
                    <button
                      onClick={() => updateSection(idx, 'image', '')}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                    >
                      <XMarkIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="h-24 w-32 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center bg-gray-50">
                    <PhotoIcon className="h-6 w-6 text-gray-300" />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <button
                    onClick={() => handleImageClick(`section.${idx}`)}
                    disabled={uploadingIdx === `section.${idx}`}
                    className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#ae0b0b] hover:text-[#ae0b0b] transition disabled:opacity-60"
                  >
                    {uploadingIdx === `section.${idx}` ? 'Uploading...' : 'Upload Image'}
                  </button>
                  <input
                    value={section.image || ''}
                    onChange={e => updateSection(idx, 'image', e.target.value)}
                    placeholder="Or paste image URL"
                    className={inputCls}
                  />
                  <input
                    value={section.imageAlt || ''}
                    onChange={e => updateSection(idx, 'imageAlt', e.target.value)}
                    placeholder="Image alt text"
                    className={inputCls}
                  />
                </div>
              </div>
            </Field>
          </div>
        ))}
      </Section>

      {/* TIMELINE */}
      <Section
        title="Our Journey Timeline"
        action={<button onClick={addTimelineItem} className="flex items-center gap-1.5 text-xs font-semibold text-[#ae0b0b] hover:opacity-80"><PlusIcon className="h-3.5 w-3.5" />Add Item</button>}
      >
        <Field label="Timeline Section Title">
          <input value={content.timeline?.title || ''} onChange={e => set('timeline.title', e.target.value)} placeholder="e.g. Our Journey" className={inputCls} />
        </Field>

        <div className="space-y-2 mt-2">
          {(content.timeline?.items || []).map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <input
                value={item.year || ''}
                onChange={e => updateTimelineItem(idx, 'year', e.target.value)}
                placeholder="Year"
                className={`${inputCls} w-24`}
              />
              <input
                value={item.event || ''}
                onChange={e => updateTimelineItem(idx, 'event', e.target.value)}
                placeholder="Milestone description"
                className={`${inputCls} flex-1`}
              />
              <button onClick={() => removeTimelineItem(idx)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </Section>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 bg-[#ae0b0b] text-white font-semibold rounded-xl hover:bg-[#8f0a0a] disabled:opacity-60 transition"
      >
        {saving ? 'Saving...' : 'Save All Changes'}
      </button>
    </div>
  )
}

function Section({ title, children, action }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
        <h2 className="text-sm font-bold text-gray-800">{title}</h2>
        {action}
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ae0b0b]/30 focus:border-[#ae0b0b] bg-white'
