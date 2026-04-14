// Use relative URL in development to work with Vite proxy
// Use absolute URL in production
const isDevelopment = import.meta.env.DEV;
const raw = isDevelopment 
  ? "/api"  // Relative URL for Vite proxy
  : (import.meta.env.VITE_API_URL || "https://api.kkingsjewellery.com/api");

// Remove trailing slashes
const cleaned = raw.replace(/\/+$/, "");

export const API_BASE_URL = cleaned;

export const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_SITfLVVfxHyUDe'

export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dkbxrhe1v'

export const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'kkings_uploads'
