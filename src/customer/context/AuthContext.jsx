import React, { createContext, useState, useEffect } from 'react'
import { API_BASE_URL } from '@config/api.js'

// CLIENT-SIDE JWT VALIDATION FUNCTION - SIMPLIFIED
const isTokenValid = (token) => {
  if (!token) return false
  
  try {
    // Simple format check - JWT should have 3 parts
    const parts = token.split('.')
    if (parts.length !== 3) return false
    
    // For now, just check if token exists and has valid format
    // We can add proper expiration checking later if needed
    return true
  } catch (error) {
    console.error(' JWT validation error:', error)
    return false
  }
}

export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: () => {},
  register: () => {},
  logout: () => {},
  updateProfile: () => {},
  authenticateWithOTP: () => {},
  simpleLogin: () => {}
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // IMPROVED SESSION RESTORATION
  useEffect(() => {
    const restoreSession = () => {
      try {
        // Check for simple login first (no token)
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
        const storedUser = localStorage.getItem('user')
        
        if (isAuthenticated && storedUser) {
          const user = JSON.parse(storedUser)
          setUser(user)
          setIsAuthenticated(true)
          setLoading(false)
          return
        }

        // CLIENT-SIDE TOKEN VALIDATION (no API call)
        const token = localStorage.getItem('token')

        if (!token) {
          setLoading(false)
          return
        }

        // Validate token client-side first
        if (!isTokenValid(token)) {
          console.log(' Token expired, clearing session')
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          localStorage.removeItem('isAuthenticated')
          setLoading(false)
          return
        }

        // TOKEN IS VALID - RESTORE SESSION IMMEDIATELY
        const storedUserData = localStorage.getItem('user')
        if (storedUserData) {
          const userData = JSON.parse(storedUserData)
          setUser(userData)
          setIsAuthenticated(true)
          console.log(' Session restored from localStorage')
        } else {
          // Token exists but no user data - clear token
          localStorage.removeItem('token')
        }

      } catch (error) {
        console.error(' Session restoration failed:', error)
        // Only clear on actual errors, not 404s
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('isAuthenticated')
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [])

  // OTP AUTHENTICATION
  const authenticateWithOTP = async (data) => {
    try {
      const res = await fetch(`${API_BASE_URL}/otp/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const result = await res.json()

      if (!res.ok) {
        return {
          success: false,
          error: result.message || 'Authentication failed'
        }
      }

      localStorage.setItem('token', result.data.token)
      localStorage.setItem('user', JSON.stringify(result.data.user))
      localStorage.setItem('isAuthenticated', 'true')

      setUser(result.data.user)
      setIsAuthenticated(true)

      return {
        success: true,
        user: result.data.user
      }

    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // SIMPLE LOGIN (name, email, phone only)
  const simpleLogin = async (data) => {
    try {
      // Try backend login
      const res = await fetch(`${API_BASE_URL}/customers/register-or-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const result = await res.json()

      if (res.ok) {
        // Store user info and real token
        localStorage.setItem('token', result.data.token)
        localStorage.setItem('user', JSON.stringify(result.data.user))
        localStorage.setItem('isAuthenticated', 'true')

        setUser(result.data.user)
        setIsAuthenticated(true)

        console.log("User logged in via backend:", result.data.user)

        return {
          success: true,
          user: result.data.user
        }
      } else {
        throw new Error(result.message || 'Login failed')
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Login failed. Please check your credentials and try again.'
      }
    }
  }

  // LOGIN (kept for backward compatibility)
  const login = async (data) => {
    try {
      const res = await fetch(`${API_BASE_URL}/customers/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password
        })
      })

      const result = await res.json()

      if (!res.ok) {
        return {
          success: false,
          error: result.message || 'Login failed'
        }
      }

      localStorage.setItem('token', result.data.token)
      localStorage.setItem('user', JSON.stringify(result.data.user))
      localStorage.setItem('isAuthenticated', 'true')

      setUser(result.data.user)
      setIsAuthenticated(true)

      return {
        success: true,
        user: result.data.user
      }

    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // REGISTER (kept for backward compatibility)
  const register = async (data) => {
    try {
      const res = await fetch(`${API_BASE_URL}/customers/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const result = await res.json()

      if (!res.ok) {
        return {
          success: false,
          error: result.message || 'Registration failed'
        }
      }

      return {
        success: true,
        data: result.data
      }

    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // ✅ UPDATE PROFILE (PUT)
  const updateProfile = async (data) => {
    try {
      const token = localStorage.getItem('token')

      const res = await fetch(`${API_BASE_URL}/customers/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })

      const result = await res.json()

      if (!res.ok) {
        return {
          success: false,
          error: result.message || 'Update failed'
        }
      }

      setUser(result.data)

      return {
        success: true,
        data: result.data
      }

    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // ✅ LOGOUT
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('isAuthenticated')
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        updateProfile, // Existing
        authenticateWithOTP, // Existing OTP method
        simpleLogin // NEW simple login method
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}