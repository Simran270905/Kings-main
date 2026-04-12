import React from 'react'
import { AdminAuthProvider } from './AdminAuthContext'
import { OrderProvider } from './OrderContext'

// Combined provider to handle context hierarchy
export const AdminContextProvider = ({ children }) => {
  return (
    <AdminAuthProvider>
      <OrderProvider>
        {children}
      </OrderProvider>
    </AdminAuthProvider>
  )
}

export default AdminContextProvider
