import React from 'react'
import { AdminAuthProvider } from './AdminAuthContext'
import { OrderProvider } from './OrderContext'
import { AdminProductProvider } from './AdminProductContext'

// Combined provider to handle context hierarchy
export const AdminContextProvider = ({ children }) => {
  return (
    <AdminAuthProvider>
      <AdminProductProvider>
        <OrderProvider>
          {children}
        </OrderProvider>
      </AdminProductProvider>
    </AdminAuthProvider>
  )
}

export default AdminContextProvider
