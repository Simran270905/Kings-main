import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAdminAuth } from './context/AdminAuthContext'
import AdminLayout from './layout/AdminLayout'

export default function AdminRoute() {
  const { isAdmin, loading } = useAdminAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ae0b0b] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" state={{ from: window.location.pathname }} replace />
  }

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  )
}
