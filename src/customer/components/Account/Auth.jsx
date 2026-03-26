
Copy

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { ExclamationCircleIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { API_BASE_URL } from "@config/api.js";
 
const Auth = () => {
  const navigate = useNavigate();
  const { authenticateWithOTP } = useAuth();
 
  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
 
  // Handle direct login (no OTP)
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);
 
    try {
      // Validation
      if (!name.trim()) {
        throw new Error("Name is required");
      }
 
      if (!email.trim()) {
        throw new Error("Email is required");
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        throw new Error("Invalid email format");
      }
 
      if (!phone.trim()) {
        throw new Error("Phone number is required");
      }
 
      if (!/^\d{10}$/.test(phone.trim())) {
        throw new Error("Phone number must be 10 digits");
      }
 
      // Create user payload
      const payload = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim()
      };
 
      console.log("🔍 Creating user account:", JSON.stringify(payload, null, 2));
 
      // Ensure API_BASE_URL has the correct format
      let baseUrl = API_BASE_URL;
      if (!baseUrl.endsWith('/api')) {
        baseUrl = baseUrl.replace(/\/$/, '') + '/api';
      }
      const apiEndpoint = `${baseUrl.replace(/\/$/, '')}/auth/register-or-login`;
      console.log("🔍 Login API URL:", apiEndpoint);
 
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
 
      console.log("🔍 Response status:", response.status);
      console.log("🔍 Response headers:", Object.fromEntries(response.headers.entries()));
 
      const result = await response.json();
      console.log("🔍 Full API response:", JSON.stringify(result, null, 2));
 
      if (!response.ok) {
        console.error('API Error:', response.status, result);
        
        if (response.status === 500) {
          setError('Server error. Please try again in a moment.');
        } else if (response.status === 400) {
          setError(result.message || 'Invalid request. Please check your input.');
        } else if (response.status === 0) {
          setError('Network error. Please check your internet connection.');
        } else {
          setError(result.message || `Server error (${response.status}). Please try again.`);
        }
        return;
      }
 
      if (result.success && result.data) {
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        setSuccess('Account created successfully! Redirecting...');
        
        setTimeout(() => {
          navigate("/account");
        }, 1500);
      } else {
        console.error('Unexpected response structure:', result);
        throw new Error('Login failed. Please try again.');
      }
 
    } catch (err) {
      console.error("❌ Login error:", JSON.stringify(err, null, 2));
      console.error("❌ Error stack:", err.stack);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to KKings Jewellery
          </h1>
          <p className="text-gray-600">
            Create your account to get started
          </p>
        </div>
 
        {/* Success Message */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-center">{success}</p>
          </div>
        )}
 
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-center flex items-center justify-center">
              <ExclamationCircleIcon className="w-5 h-5 mr-2" />
              {error}
            </p>
          </div>
        )}
 
        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent transition duration-200"
              placeholder="Enter your full name"
              required
              disabled={isLoading}
            />
          </div>
 
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent transition duration-200"
              placeholder="Enter your email"
              required
              disabled={isLoading}
            />
          </div>
 
          {/* Phone Field */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent transition duration-200"
              placeholder="Enter 10-digit phone number"
              maxLength="10"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">10-digit mobile number</p>
          </div>
 
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-700 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </span>
            ) : (
              'Create Account & Login'
            )}
          </button>
        </form>
 
        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="text-red-600 hover:text-red-700 font-medium">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-red-600 hover:text-red-700 font-medium">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
 
export default Auth;