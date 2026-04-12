import React from 'react'

/**
 * AdminAuthContext
 * Manages admin authentication state and token validation
 * Implements token-based session persistence
 */
export const AdminAuthContext = React.createContext({
  isAdminAuthenticated: false,
  adminLoading: true,
  loginAdmin: () => {},
  logoutAdmin: () => {},
  verifyAdminToken: () => false,
})
