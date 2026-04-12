import axios from 'axios';
import { API_BASE_URL } from '../config/api.js';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle common responses
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Don't log expected 404 errors for footer content
    const isFooter404 = error.response?.status === 404 && error.config?.url?.includes('/content/footer');
    
    if (!isFooter404) {
      console.error('API Error:', error.message);
    }

    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  // Login with email or mobile
  login: async (payload) => {
    try {
      console.log(' Login API - Attempting login with payload:', payload);
      
      const response = await api.post('/customers/login', payload);
      console.log(' Login API Response:', response.data);
      
      // Check if response exists and has data
      if (!response || !response.data) {
        throw new Error("No response from server");
      }

      // Store token and user data
      if (response.data.data?.token) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        localStorage.setItem('isAuthenticated', 'true');
        console.log(' Login API - Token stored successfully');
      }

      // VERY IMPORTANT: RETURN THE ACTUAL RESPONSE DATA
      return response.data.data;
      
    } catch (error) {
      console.error(' Login API Error:', error.response?.data || error.message);
      return {
        error: true,
        message: error.response?.data?.message || error.message || 'Login failed'
      };
    }
  },

  // Register new user
  register: async (userData) => {
    try {
      console.log(' Register API - Attempting registration with:', userData);
      
      const response = await api.post('/customers/register', userData);
      console.log(' Register API Response:', response.data);
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error(' Register API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Registration failed'
      };
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/customers/profile');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error(' Get Profile Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/customers/profile', userData);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error(' Update Profile Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }
};

// Admin Auth API
export const adminAuthApi = {
  // Admin login
  login: async (password) => {
    try {
      console.log(' Admin Login API - Attempting login');
      
      const response = await api.post('/admin/login', { password });
      console.log(' Admin Login API Response:', response.data);
      
      // Store admin token
      if (response.data.data?.token) {
        localStorage.setItem('adminToken', response.data.data.token);
        localStorage.setItem('isAdminAuthenticated', 'true');
      }
      
      return {
        success: true,
        token: response.data.data?.token,
        data: response.data.data
      };
    } catch (error) {
      console.error(' Admin Login Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Admin login failed'
      };
    }
  },

  // Verify admin token
  verify: async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        return { success: false, error: 'No admin token found' };
      }

      const response = await api.get('/admin/verify');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error(' Admin Verify Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }
};

// Content API (for footer, etc.)
export const contentApi = {
  // Get content by type
  getContent: async (type) => {
    try {
      // Only log for debugging, not as errors
      if (type === 'footer') {
        console.log(` Content API - Getting ${type} content`);
      }
      
      const response = await api.get(`/content/${type}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      // Silently handle expected 404 for footer content
      if (type === 'footer' && error.response?.status === 404) {
        console.log(` Footer content not available, using default`);
        return {
          success: false,
          error: 'Content not found',
          data: null
        };
      }
      
      // Log other content errors normally
      console.error(` Content API Error for ${type}:`, error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: null
      };
    }
  }
};

// Utility function to validate login input
export const validateLoginInput = (input) => {
  const value = input.trim();
  
  if (!value) {
    return { valid: false, error: 'Email or mobile number is required' };
  }

  // Check if it's an email
  if (value.includes('@')) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return { valid: false, error: 'Invalid email format' };
    }
    return { valid: true, type: 'email', value };
  }

  // Check if it's a mobile number
  const phoneDigits = value.replace(/\D/g, '');
  if (!/^\d{10}$/.test(phoneDigits)) {
    return { valid: false, error: 'Mobile number must be 10 digits' };
  }
  
  return { valid: true, type: 'mobile', value: phoneDigits };
};

export default api;
