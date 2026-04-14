import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";
import { ExclamationCircleIcon, UserIcon } from "@heroicons/react/24/outline";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form state
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle login - send OTP first
  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Prevent multiple calls
    if (isLoading) {
      console.log('Login already in progress, ignoring click');
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const input = identifier.trim();
      
      if (!input) {
        setError("Please enter email or mobile");
        return;
      }

      console.log('🔐 LOGIN: Sending OTP for:', input);

      // Prepare name from email or use default
      const name = input.includes("@") ? input.split('@')[0] : `User${input.slice(-4)}`;
      
      // Send OTP first
      const otpResponse = await fetch(`${API_BASE_URL}/otp/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name,
          email: input.includes("@") ? input : `${name}@temp.com`,
          phone: input.includes("@") ? undefined : input
        })
      });

      const otpResult = await otpResponse.json();

      if (!otpResponse.ok) {
        throw new Error(otpResult.message || 'Failed to send OTP');
      }

      console.log('✅ OTP sent successfully');
      
      // Store the identifier for OTP verification
      sessionStorage.setItem('loginIdentifier', input);
      sessionStorage.setItem('loginName', name);

      // Redirect to OTP verification
      navigate("/verify-otp", { 
        state: { 
          identifier: input, 
          name: name,
          isLogin: true 
        } 
      });

    } catch (err) {
      console.error("❌ Login error:", err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf6ec] to-[#fff1e6] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/">
            <h1 className="text-4xl font-serif font-bold text-[#ae0b0b] tracking-wide mb-2">KKings Jewellery</h1>
            <p className="text-gray-600 text-sm">Welcome back! Sign in to your account</p>
          </Link>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-[#f0e0c0] px-10 py-12">

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3">
              <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Email / Phone Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email or Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter email or 10-digit phone"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#ae0b0b] focus:ring-2 focus:ring-[#ae0b0b]/10 transition-all"
                  autoComplete="email"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Enter your email address or 10-digit mobile number</p>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[#ae0b0b] text-white text-base font-bold rounded-xl hover:bg-[#8f0a0a] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#ae0b0b]/20"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400">or</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link 
                to="/signup" 
                className="text-[#ae0b0b] font-bold hover:underline transition-colors"
              >
                Create one here
              </Link>
            </p>
          </div>

          {/* Quick Links */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex justify-center space-x-6 text-sm">
              <Link 
                to="/" 
                className="text-gray-500 hover:text-[#ae0b0b] transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-gray-400">
          <p>© 2026 KKings Jewellery. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;