import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { EyeIcon, EyeSlashIcon, ExclamationCircleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

const Signup = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Handle sign up button click
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!phone.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
        throw new Error("All fields are required");
      }

      const phoneDigits = phone.replace(/\D/g, "");
      if (!/^\d{10}$/.test(phoneDigits)) {
        throw new Error("Phone must be exactly 10 digits");
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        throw new Error("Please enter a valid email address");
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(password)) {
        throw new Error("Password must be 8+ characters with uppercase, lowercase, and a number");
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // ✅ Fixed: await the async register call
      const result = await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phoneDigits,
        email: email.trim(),
        password,
        passwordConfirm: confirmPassword,
      });

      if (result.success) {
        navigate("/login");
      } else {
        setError(result.error || "Sign up failed");
      }
    } catch (err) {
      console.error("❌ Sign up error:", err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleSignupWrapped = async (e) => {
    e.preventDefault();
    await handleSignup(e);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf6ec] to-[#fff1e6] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/">
            <h1 className="text-3xl font-serif font-bold text-[#ae0b0b] tracking-wide">KKings Jewellery</h1>
            <p className="text-gray-500 text-sm mt-1">Create your account</p>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-[#f0e0c0] px-8 py-10">

          {/* Email Verification Notice */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl flex items-start gap-3">
            <CheckCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">Email Verification Required</p>
              <p className="text-blue-600">After registration, please verify your email address and phone number to activate your account.</p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3">
              <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#ae0b0b] focus:ring-2 focus:ring-[#ae0b0b]/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#ae0b0b] focus:ring-2 focus:ring-[#ae0b0b]/10 transition-all"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit phone number"
                maxLength={10}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#ae0b0b] focus:ring-2 focus:ring-[#ae0b0b]/10 transition-all"
                autoComplete="tel"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#ae0b0b] focus:ring-2 focus:ring-[#ae0b0b]/10 transition-all"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 chars, upper, lower & number"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#ae0b0b] focus:ring-2 focus:ring-[#ae0b0b]/10 transition-all pr-12"
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all pr-12 ${
                    confirmPassword && confirmPassword === password
                      ? 'border-green-400 focus:border-green-400 focus:ring-green-400/10'
                      : 'border-gray-200 focus:border-[#ae0b0b] focus:ring-[#ae0b0b]/10'
                  }`}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirm ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
                {confirmPassword && confirmPassword === password && (
                  <CheckCircleIcon className="absolute right-11 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#ae0b0b] text-white text-base font-bold rounded-xl hover:bg-[#8f0a0a] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#ae0b0b]/20 mt-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Creating account...
                </span>
              ) : "Create Account"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-400">or</span></div>
          </div>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-[#ae0b0b] font-bold hover:underline">Log in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;

