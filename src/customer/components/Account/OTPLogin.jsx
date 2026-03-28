import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { EyeIcon, EyeSlashIcon, ExclamationCircleIcon, UserIcon, LockClosedIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

const OTPLogin = () => {
  const navigate = useNavigate();
  const { authenticateWithOTP } = useAuth();

  // Form states
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Verify OTP
  const [otpSent, setOtpSent] = useState(false);

  // Handle OTP sending
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!email.trim()) {
        throw new Error("Email is required");
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        throw new Error("Invalid email format");
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/customers/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim(),
          name: 'User', // Default name
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send OTP');
      }

      setOtpSent(true);
      setStep(2);
      setError("");

    } catch (err) {
      console.error("❌ Send OTP error:", err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!otp.trim()) {
        throw new Error("OTP is required");
      }

      if (!/^\d{6}$/.test(otp.trim())) {
        throw new Error("OTP must be 6 digits");
      }

      const result = await authenticateWithOTP({
        email: email.trim(),
        otp: otp.trim()
      });

      if (result && result.success) {
        navigate("/");
      } else {
        setError(result.error || "Invalid OTP");
      }

    } catch (err) {
      console.error("❌ Verify OTP error:", err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/customers/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim()
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to resend OTP');
      }

      setError("");
      // Show success message
      setError("OTP resent successfully!");
      setTimeout(() => setError(""), 3000);

    } catch (err) {
      console.error("❌ Resend OTP error:", err.message);
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
            <p className="text-gray-600 text-sm">
              {step === 1 ? "Enter your email to receive OTP" : "Enter the OTP sent to your email"}
            </p>
          </Link>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-[#f0e0c0] px-10 py-12">

          {/* Error Message */}
          {error && (
            <div className={`mb-6 p-4 ${error.includes('successfully') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'} rounded-xl flex items-start gap-3`}>
              <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {step === 1 ? (
            // Send OTP Form
            <form onSubmit={handleSendOTP} className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#ae0b0b] focus:ring-2 focus:ring-[#ae0b0b]/10 transition-all"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Send OTP Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-[#ae0b0b] text-white text-base font-bold rounded-xl hover:bg-[#8f0a0a] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#ae0b0b]/20"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Sending OTP...
                  </span>
                ) : (
                  "Send OTP"
                )}
              </button>
            </form>
          ) : (
            // Verify OTP Form
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              {/* Email Display */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-gray-700">{email}</p>
                </div>
              </div>

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
                    placeholder="Enter 6-digit OTP"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#ae0b0b] focus:ring-2 focus:ring-[#ae0b0b]/10 transition-all"
                    maxLength="6"
                    required
                  />
                </div>
              </div>

              {/* Verify OTP Button */}
              <button
                type="submit"
                disabled={isLoading}
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
            </form>
          )}

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400">or</span>
            </div>
          </div>

          {/* Back Button */}
          <div className="text-center">
            <button
              onClick={() => {
                setStep(1);
                setOtpSent(false);
                setError("");
              }}
              className="text-gray-600 hover:text-[#ae0b0b] transition-colors"
            >
              ← Back to Email
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

export default OTPLogin;
