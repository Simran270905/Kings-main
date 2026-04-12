import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'

// ✅ useAuth hook: Provides easy access to authentication functions and state
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  
  return context
}
