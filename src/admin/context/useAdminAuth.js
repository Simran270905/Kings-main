import { useContext } from 'react'
import { AdminAuthContext } from './AdminAuthContextObject'

/**
 * useAdminAuth hook
 * Provides access to admin authentication functions and state
 * Must be used within AdminAuthProvider
 */
export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  
  if (!context) {
    throw new Error('useAdminAuth must be used inside AdminAuthProvider')
  }
  
  return context
}
