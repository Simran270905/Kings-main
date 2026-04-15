import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from './context/AdminAuthContext'
import { API_BASE_URL } from '../config/api'

const API_BASE = `${API_BASE_URL}/admin`

const AdminLogin = () => {
  const navigate = useNavigate()
  const { setIsAdmin, setLoading } = useAdminAuth()

  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleAdminLogin = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (!password.trim()) {
        throw new Error('Password is required')
      }

      // Direct API call for login
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      })

      if (!response.ok) {
        throw new Error('Login failed')
      }

      const data = await response.json()
      
      if (!data.success || !data.data?.token) {
        throw new Error(data.message || 'Login failed')
      }

      // Save token with correct key
      localStorage.setItem('kk_admin_token', data.data.token)
      
      // Update context state
      setIsAdmin(true)
      setLoading(false)

      // Navigate to admin
      navigate('/admin')

    } catch (err) {
      console.error('Login error:', err.message)
      setError(err.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">

      <div className="mb-8 text-center">
        <div className="w-12 h-12 bg-[#ae0b0b] rounded-xl flex items-center justify-center mx-auto mb-3">
          <span className="text-white font-bold">KK</span>
        </div>
        <h1 className="text-2xl font-bold text-[#ae0b0b]">Admin Panel</h1>
        <p className="text-gray-500 text-sm">
          KKings Jewellery Management
        </p>
      </div>

      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8 border">

        <h2 className="text-xl font-semibold mb-6">Admin Login</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-5">

          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded mt-1 focus:ring-2 focus:ring-[#ae0b0b]"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#ae0b0b] text-white py-2 rounded hover:opacity-90"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>

        </form>

        <p className="text-xs text-gray-500 mt-6 text-center">
          Secure admin access only
        </p>

      </div>
    </div>
  )
}

export default AdminLogin