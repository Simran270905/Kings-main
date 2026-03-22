'use client'

import { useState } from 'react'
import AdminCard from '../layout/AdminCard'
import AdminButton from '../layout/AdminButton'
import FormInput from '../components/FormInput'
import { API_BASE_URL } from '../../config/api'
import { KeyIcon, InformationCircleIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

const AdminSettings = () => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [saving, setSaving] = useState(false)

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type })
    setTimeout(() => setMsg({ text: '', type: '' }), 4000)
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!currentPassword || !newPassword || !confirmPassword) {
      return showMsg('All fields are required.', 'error')
    }
    if (newPassword !== confirmPassword) {
      return showMsg('New passwords do not match.', 'error')
    }
    if (newPassword.length < 6) {
      return showMsg('New password must be at least 6 characters.', 'error')
    }

    setSaving(true)
    try {
      const token = localStorage.getItem('kk_admin_token')
      const res = await fetch(`${API_BASE_URL}/admin/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed')
      showMsg('Password updated successfully.', 'success')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      showMsg(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-2">Manage admin account settings and preferences</p>
      </div>

      {msg.text && (
        <div className={`p-4 rounded-xl flex items-start gap-3 ${
          msg.type === 'success'
            ? 'bg-green-50 border-2 border-green-200 text-green-700'
            : 'bg-red-50 border-2 border-red-200 text-red-700'
        }`}>
          {msg.type === 'success' ? (
            <CheckCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
          ) : (
            <XCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
          )}
          <span className="font-medium">{msg.text}</span>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <AdminCard>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#ae0b0b]/10 rounded-xl">
              <KeyIcon className="h-6 w-6 text-[#ae0b0b]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
              <p className="text-sm text-gray-500">Update your admin password</p>
            </div>
          </div>
          
          <form onSubmit={handleChangePassword} className="space-y-4">
            <FormInput
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              required
            />
            
            <FormInput
              label="New Password"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              helpText="Must be at least 6 characters"
              required
            />
            
            <FormInput
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
            />
            
            <div className="pt-2">
              <AdminButton
                type="submit"
                loading={saving}
                size="lg"
                className="w-full"
              >
                Update Password
              </AdminButton>
            </div>
          </form>
        </AdminCard>

        <AdminCard>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 rounded-xl">
              <InformationCircleIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">System Info</h2>
              <p className="text-sm text-gray-500">Application details</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">API Endpoint</p>
              <p className="text-sm font-mono text-gray-900 break-all">{API_BASE_URL}</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Environment</p>
              <p className="text-sm font-semibold text-gray-900">
                {import.meta.env.MODE === 'production' ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Production
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    Development
                  </span>
                )}
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Version</p>
              <p className="text-sm font-semibold text-gray-900">v1.0.0</p>
            </div>
          </div>
        </AdminCard>
      </div>

      <AdminCard>
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <InformationCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Security Best Practices</h3>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Use a strong password with at least 8 characters</li>
              <li>Include uppercase, lowercase, numbers, and special characters</li>
              <li>Change your password regularly</li>
              <li>Never share your admin credentials</li>
            </ul>
          </div>
        </div>
      </AdminCard>
    </div>
  )
}

export default AdminSettings
