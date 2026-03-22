import React, { createContext, useState, useEffect } from 'react'
import { API_BASE_URL } from '../../config/api'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // ✅ Restore session + fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token')

        if (!token) {
          setLoading(false)
          return
        }

        const res = await fetch(`${API_BASE_URL}/customers/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const result = await res.json()

        if (res.ok) {
          setUser(result.data)
          setIsAuthenticated(true)
        } else {
          localStorage.removeItem('token')
        }

      } catch (error) {
        console.error('❌ Auto login failed:', error.message)
        localStorage.removeItem('token')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  // ✅ LOGIN
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

  // ✅ REGISTER
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
        updateProfile // ✅ NEW
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}