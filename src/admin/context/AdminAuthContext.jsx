
import React, { useState, useEffect } from 'react'
import { AdminAuthContext } from './AdminAuthContextObject'
import adminApi from '../utils/adminApiService'

console.log(' AdminAuthContext: adminApi imported:', adminApi);
console.log(' AdminAuthContext: adminApi.login method:', typeof adminApi.login);

export function AdminAuthProvider({ children }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [adminLoading, setAdminLoading] = useState(true)

  // Production-ready: verify token on mount and on storage change
  useEffect(() => {
    const verifyToken = async () => {
      setAdminLoading(true);
      try {
        const isValid = await adminApi.verifyToken();
        setIsAdminAuthenticated(isValid);
      } catch {
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

  //  LOGIN (FIXED)
  async function loginAdmin(password) {
    // STEP 7: FAIL SAFE UI - Wrap everything in try/catch
    try {
      console.log(' AdminAuthContext.loginAdmin called with password:', password);
      
      const result = await adminApi.login(password);
      
      console.log(' AdminAuthContext received result from adminApi.login:', result);
      
      // Validate result structure
      if (!result || typeof result !== 'object') {
        console.log(' AdminAuthContext: Invalid result structure:', result);
        throw new Error('Invalid login response from server');
      }
      
      if (!result.success) {
        console.log(' AdminAuthContext: result.success is false:', result);
        throw new Error(result.error || 'Login failed');
      }
      
      console.log(' AdminAuthContext: Login successful, updating state');
      
      // Force re-verify in all tabs/contexts
      window.dispatchEvent(new Event('storage'));
      setIsAdminAuthenticated(true);
      setAdminLoading(false);

      // Login successful - admin authenticated
      return { success: true };

    } catch (error) {
      console.error(' AdminAuthContext login failed:', error.message);
      setIsAdminAuthenticated(false);
      setAdminLoading(false);
      return { success: false, error: error.message };
    }
  };

  // ✅ LOGOUT
  const logoutAdmin = async () => {
    try {
      await adminApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsAdminAuthenticated(false)
    }
  }

  // ✅ VERIFY TOKEN MANUALLY
  const verifyAdminToken = async () => {
    try {
      return await adminApi.verifyToken()
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
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}