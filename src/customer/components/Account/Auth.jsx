import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { ExclamationCircleIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { API_BASE_URL } from "@config/api.js";

const Auth = () => {
  const navigate = useNavigate();
  const { authenticateWithOTP } = useAuth();

  // Form states
  const [step, setStep] = useState(1); // 1: Enter details, 2: Verify OTP
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle send OTP
  const handleSendOTP = async (e) => {
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

      // Send OTP request
      const payload = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined
      };

      const response = await fetch(`${API_BASE_URL}/otp/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send OTP');
      }

      // Check if email was actually sent
      if (result.data && result.data.emailSent) {
        setSuccess('OTP sent successfully to your email!');
        setStep(2);
      } else {
        // This should not happen with the new backend logic, but handle it just in case
        throw new Error('OTP was not sent. Please try again.');
      }

    } catch (err) {
      console.error("❌ Send OTP error:", err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!otp.trim()) {
        throw new Error("OTP is required");
      }

      if (!/^\d{4,6}$/.test(otp.trim())) {
        throw new Error("Invalid OTP format");
      }

      const payload = {
        otp: otp.trim(),
        email: email.trim()
      };

      // Use the new OTP authentication method
      const result = await authenticateWithOTP(payload);

      if (result.success) {
        navigate("/account");
      } else {
        setError(result.error || 'OTP verification failed');
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
    setSuccess("");
    setIsLoading(true);

    try {
      const payload = {
        email: email.trim(),
        phone: phone.trim() || undefined
      };

      const response = await fetch(`${API_BASE_URL}/otp/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to resend OTP');
      }

      // Check if email was actually resent
      if (result.data && result.data.emailSent) {
        setSuccess('OTP resent successfully to your email!');
      } else {
        // This should not happen with the new backend logic, but handle it just in case
        throw new Error('OTP was not resent. Please try again.');
      }

    } catch (err) {
      console.error("❌ Resend OTP error:", err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset to step 1
  const handleBack = () => {
    setStep(1);
    setOtp("");
    setError("");
    setSuccess("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf6ec] to-[#fff1e6] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/">
            <h1 className="text-3xl font-serif font-bold text-[#ae0b0b] tracking-wide">KKings Jewellery</h1>
            <p className="text-gray-500 text-sm mt-1">
              {step === 1 ? 'Enter your details to continue' : 'Verify your identity'}
            </p>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-[#f0e0c0] px-8 py-10">

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3">
              <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium">
              {success}
            </div>
          )}

          {step === 1 ? (
            // Step 1: Enter details
            <form onSubmit={handleSendOTP} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#ae0b0b] focus:ring-2 focus:ring-[#ae0b0b]/10 transition-all"
                  autoComplete="name"
                />
              </div>

              {/* Email Address (Required) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#ae0b0b] focus:ring-2 focus:ring-[#ae0b0b]/10 transition-all"
                  autoComplete="email"
                  required
                />
              </div>

              {/* Phone Number (Optional) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter 10-digit phone number"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#ae0b0b] focus:ring-2 focus:ring-[#ae0b0b]/10 transition-all"
                  autoComplete="tel"
                  maxLength="10"
                />
                <p className="text-xs text-gray-500 mt-1">Phone number will be saved for delivery notifications</p>
              </div>

              {/* Send OTP Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#ae0b0b] text-white text-base font-bold rounded-xl hover:bg-[#8f0a0a] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#ae0b0b]/20 mt-2"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Sending OTP...
                  </span>
                ) : "Send OTP"}
              </button>
            </form>
          ) : (
            // Step 2: Verify OTP
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              {/* Contact Info Display */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">
                  We've sent a 6-digit OTP to:
                </p>
                <p className="font-semibold text-gray-800 mt-1">
                  {email}
                </p>
              </div>

              {/* OTP Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#ae0b0b] focus:ring-2 focus:ring-[#ae0b0b]/10 transition-all text-center text-lg font-semibold tracking-widest"
                  autoComplete="one-time-code"
                  maxLength="6"
                />
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#ae0b0b] text-white text-base font-bold rounded-xl hover:bg-[#8f0a0a] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#ae0b0b]/20"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Verifying...
                  </span>
                ) : "Verify OTP"}
              </button>

              {/* Back and Resend */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#ae0b0b] transition-colors"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Back
                </button>
                
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="text-sm text-[#ae0b0b] hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
