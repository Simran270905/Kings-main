
import React, { createContext, useContext, useState, 
  useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api.js';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    const checkAdmin = async () => {
      // Emergency timeout - no matter what, stop loading after 8s
      const emergencyTimer = setTimeout(() => {
        setLoading(false);
        setIsAdmin(false);
        // Only redirect if we're not already on a public page
        if (window.location.pathname !== '/' && !window.location.pathname.startsWith('/customer')) {
          navigate('/admin-login');
        }
      }, 8000);

      try {
        // Try ALL possible token key names
        const token =
          localStorage.getItem('kk_admin_token') ||
          localStorage.getItem('adminToken') ||
          localStorage.getItem('token') ||
          localStorage.getItem('authToken') ||
          localStorage.getItem('jwt') ||
          localStorage.getItem('admin_token') ||
          sessionStorage.getItem('kk_admin_token') ||
          sessionStorage.getItem('adminToken') ||
          sessionStorage.getItem('token');

        if (!token) {
          console.log('No token - not logged in as admin');
          setIsAdmin(false);
          setLoading(false);
          clearTimeout(emergencyTimer);
          // Only redirect if we're trying to access admin pages
          if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin-login') {
            navigate('/admin-login');
          }
          return;
        }

        // Call verify API with 10s timeout
        const controller = new AbortController();
        const apiTimeout = setTimeout(() => 
          controller.abort(), 10000);

        // USE THE ACTUAL VERIFY ENDPOINT WITH FULL API URL
        const response = await fetch(
          `${API_BASE_URL}/admin/verify`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            signal: controller.signal
          }
        );
        clearTimeout(apiTimeout);

        if (response.ok) {
          const data = await response.json();
          // Check all possible admin field names
          const adminStatus = 
            data?.isAdmin || 
            data?.user?.isAdmin ||
            data?.data?.isAdmin ||
            data?.role === 'admin' ||
            data?.user?.role === 'admin' ||
            data?.data?.role === 'admin' ||
            data?.success === true ||
            false;

          setIsAdmin(adminStatus);
          if (!adminStatus) {
            // Only redirect if we're trying to access admin pages
            if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin-login') {
              navigate('/admin-login');
            }
          }
        } else {
          setIsAdmin(false);
          // Only redirect if we're trying to access admin pages
          if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin-login') {
            navigate('/admin-login');
          }
        }
      } catch (error) {
        console.error('Admin check failed:', error);
        setIsAdmin(false);
        // Only redirect if we're trying to access admin pages
        if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin-login') {
          navigate('/admin-login');
        }
      } finally {
        clearTimeout(emergencyTimer);
        setLoading(false); // ALWAYS runs no matter what
      }
    };

    checkAdmin();
  }, []); // empty - run ONCE only

  return (
    <AdminAuthContext.Provider value={{ isAdmin, loading, setIsAdmin, setLoading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);