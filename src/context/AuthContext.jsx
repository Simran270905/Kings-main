import React, { createContext, useState, useEffect, useContext } from 'react'
import { API_BASE_URL } from '../config/api.js'

export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: () => {},
  register: () => {},
  logout: () => {},
  updateProfile: () => {}
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // LOGIN FUNCTION - Identifier only, in-memory state
  const login = async (data) => {
    console.log(" AUTH CONTEXT - login() called with:", data)
    
    try {
      const res = await fetch(`${API_BASE_URL}/customers/login`, {
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
          message: result.message || "Login failed"
        }
      }

      // Set user in React state only (no localStorage)
      const userData = result?.data?.user
      if (userData) {
        setUser(userData)
        setIsAuthenticated(true)
        console.log(" User logged in:", userData.email)
      }

      setLoading(false)

      return {
        success: true,
        user: userData
      }

    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  }

  // REGISTER FUNCTION - Simple registration, in-memory state
  const register = async (data) => {
    console.log(" AUTH CONTEXT - register() called with:", data)
    
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

      // Set user in React state only (no localStorage)
      const userData = result?.data?.user
      if (userData) {
        setUser(userData)
        setIsAuthenticated(true)
        console.log(" User registered:", userData.email)
      }

      return {
        success: true,
        user: userData
      }

    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // LOGOUT FUNCTION - Clear in-memory state
  const logout = () => {
    console.log(" AUTH CONTEXT - logout() called")
    setUser(null)
    setIsAuthenticated(false)
    setLoading(false)
  }

  // UPDATE PROFILE FUNCTION - Update in-memory state
  const updateProfile = async (data) => {
    console.log(" AUTH CONTEXT - updateProfile() called with:", data)
    
    try {
      const res = await fetch(`${API_BASE_URL}/customers/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.token || 'no-token'}`
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

      // Update user in React state
      const userData = result?.data
      if (userData) {
        setUser(userData)
        console.log(" Profile updated:", userData.email)
      }

      return {
        success: true,
        data: userData
      }

    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
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
        updateProfile
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