
import React, { useState, useEffect } from 'react'
import { AdminAuthContext } from './AdminAuthContextObject'
import { API_BASE_URL } from '../../config/api'

const API_URL = `${API_BASE_URL}/admin`

export function AdminAuthProvider({ children }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [adminLoading, setAdminLoading] = useState(true)
  const [orderRefreshCallback, setOrderRefreshCallback] = useState(null)

  // Production-ready: verify token on mount and on storage change
  useEffect(() => {
    const verifyToken = async () => {
      setAdminLoading(true);
      const token = localStorage.getItem('kk_admin_token');
      if (!token || token === "undefined") {
        setIsAdminAuthenticated(false);
        setAdminLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setIsAdminAuthenticated(true);
        } else {
          localStorage.removeItem('kk_admin_token');
          setIsAdminAuthenticated(false);
        }
      } catch {
        localStorage.removeItem('kk_admin_token');
        setIsAdminAuthenticated(false);
      } finally {
        setAdminLoading(false);
      }
    };

    // Listen for storage changes (multi-tab support)
    window.addEventListener('storage', verifyToken);
    // Run on mount
    verifyToken();
    return () => window.removeEventListener('storage', verifyToken);
  }, []);

  // ✅ LOGIN (FIXED)
  const loginAdmin = async (password) => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Save correct token
      const token = data.data.token;
      localStorage.setItem('kk_admin_token', token);
      // Force re-verify in all tabs/contexts
      window.dispatchEvent(new Event('storage'));
      setIsAdminAuthenticated(true);
      setAdminLoading(false);

      // Trigger order refresh if callback is set
      if (orderRefreshCallback) {
        orderRefreshCallback();
      }

      return { success: true };

    } catch (error) {
      console.error('❌ Admin login failed:', error.message);
      return { success: false, error: error.message };
    }
  };

  // ✅ LOGOUT
  const logoutAdmin = () => {
    localStorage.removeItem('kk_admin_token')
    setIsAdminAuthenticated(false)
  }

  // ✅ VERIFY TOKEN MANUALLY
  const verifyAdminToken = async () => {
    try {
      const token = localStorage.getItem('kk_admin_token')
      if (!token || token === "undefined") return false

      const res = await fetch(`${API_URL}/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        localStorage.removeItem('kk_admin_token')
        setIsAdminAuthenticated(false)
        return false
      }

      return true
    } catch {
      return false
    }
  }

  return (
    <AdminAuthContext.Provider
      value={{
        isAdminAuthenticated,
        adminLoading,
        loginAdmin,
        logoutAdmin,
        verifyAdminToken,
        setOrderRefreshCallback,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}