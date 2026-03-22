'use client'

import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAdminAuth } from './context/useAdminAuth'

/**
 * 🔐 AdminRoute (Protected Route Wrapper)
 * ======================================
 * Protects admin routes from unauthorized access
 *
 * FLOW:
 * 1. Check loading state
 * 2. Check if admin is authenticated
 * 3. If not → redirect to /admin-login
 * 4. If yes → render children
 *
 * NOTE:
 * - Backend token verification happens in AdminOnlyLayout
 * - This component only handles frontend protection
 */

export function AdminRoute({ children }) {
  const { isAdminAuthenticated, adminLoading } = useAdminAuth()

  /**
   * ⏳ Loading State
   */
  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 border-4 border-[#ae0b0b] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 text-sm">Checking admin access...</p>
        </div>
      </div>
    )
  }

  /**
   * ❌ Not Authenticated → Redirect
   */
  if (!isAdminAuthenticated) {
    return <Navigate to="/admin-login" replace />
  }

  /**
   * ✅ Authenticated → Render Protected Content
   */
  return children
}

export default AdminRoute
