import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";
import { ExclamationCircleIcon, LockClosedIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { API_BASE_URL } from "../../../config/api.js";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authenticateWithOTP } = useAuth();

  // Debug: Verify API_BASE_URL is available
  console.log("🔐 VerifyOTP component - API_BASE_URL:", API_BASE_URL);

  // Get data from navigation state or sessionStorage
  const { identifier, name, isLogin } = location.state || {
    identifier: sessionStorage.getItem('loginIdentifier'),
    name: sessionStorage.getItem('loginName'),
    isLogin: true
  };

  // Form states
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle OTP verification
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      if (!otp.trim()) {
        throw new Error("OTP is required");
      }

      if (!/^\d{4,6}$/.test(otp.trim())) {
        throw new Error("Invalid OTP format");
      }

      console.log(' verifying OTP for:', identifier);

      // Use the correct email for OTP verification
      const emailForOTP = identifier.includes("@") ? identifier : `${name}@temp.com`;

      const result = await authenticateWithOTP({
        email: emailForOTP,
        otp: otp.trim()
      });

      console.log(' OTP verification result:', result);

      if (result && result.success) {
        setSuccess("OTP verified successfully!");
        
        // Clear sessionStorage
        sessionStorage.removeItem('loginIdentifier');
        sessionStorage.removeItem('loginName');

        // Redirect based on flow
        setTimeout(() => {
          if (isLogin) {
            navigate("/account");
          } else {
            navigate("/account");
          }
        }, 1000);

      } else {
        setError(result.error || "Invalid OTP. Please try again.");
      }

    } catch (err) {
      console.error(" Verify OTP error:", err.message);
      setError(err.message || "OTP verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      console.log(' resending OTP for:', identifier);

      // Use the correct email for OTP resend
      const emailForOTP = identifier.includes("@") ? identifier : `${name}@temp.com`;

      const response = await fetch(`${API_BASE_URL}/otp/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: emailForOTP
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to resend OTP');
      }

      setSuccess("OTP resent successfully!");
      setTimeLeft(300); // Reset timer
      setCanResend(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);

    } catch (err) {
      console.error(" Resend OTP error:", err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (isLogin) {
      navigate("/login");
    } else {
      navigate("/signup");
    }
  };

  // Redirect if no identifier
  useEffect(() => {
    if (!identifier) {
      navigate(isLogin ? "/login" : "/signup");
    }
  }, [identifier, isLogin, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf6ec] to-[#fff1e6] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-[#ae0b0b] tracking-wide mb-2">KKings Jewellery</h1>
          <p className="text-gray-600 text-sm">
            Enter the OTP sent to {identifier.includes("@") ? "your email" : "your phone"}
          </p>
        </div>

        {/* OTP Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-[#f0e0c0] px-10 py-12">

          {/* Identifier Display */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">OTP sent to:</p>
            <p className="text-gray-900 font-semibold">{identifier}</p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-start gap-3">
              <span className="text-sm font-medium">{success}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3">
              <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleVerifyOTP} className="space-y-6">
            
            {/* OTP Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                One-Time Password (OTP)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter OTP code"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#ae0b0b] focus:ring-2 focus:ring-[#ae0b0b]/10 transition-all text-center text-lg font-mono"
                  maxLength="6"
                  required
                  autoFocus
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {isLogin ? "Check your email for the OTP code" : "Check your email for the OTP code"}
              </p>
            </div>

            {/* Timer */}
            {!canResend && (
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Resend OTP in <span className="font-semibold text-[#ae0b0b]">{formatTime(timeLeft)}</span>
                </p>
              </div>
            )}

            {/* Verify OTP Button */}
            <button
              type="submit"
              disabled={isLoading || !otp}
              className="w-full py-4 bg-[#ae0b0b] text-white text-base font-bold rounded-xl hover:bg-[#8f0a0a] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#ae0b0b]/20"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Verifying...
                </span>
              ) : (
                "Verify OTP"
              )}
            </button>

            {/* Resend OTP */}
            {canResend && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="text-[#ae0b0b] font-bold hover:underline transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  Resend OTP
                </button>
              </div>
            )}
          </form>

          {/* Back Button */}
          <div className="mt-8 text-center">
            <button
              onClick={handleBack}
              className="text-gray-600 hover:text-[#ae0b0b] transition-colors"
            >
              ← Back to {isLogin ? "Login" : "Sign Up"}
            </button>
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

export default VerifyOTP;
