const raw = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Remove trailing slashes
const cleaned = raw.replace(/\/+$/, "");

export const API_BASE_URL = cleaned;

console.log("🌐 FINAL API_BASE_URL:", API_BASE_URL);
console.log("🌐 VITE_API_URL from env:", import.meta.env.VITE_API_URL);

export const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_SITfLVVfxHyUDe'

export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dkbxrhe1v'

export const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'kkings_uploads'
