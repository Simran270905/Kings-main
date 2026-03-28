// Check if user is logged in
export const isUserLoggedIn = () => {
  // Check for token in memory or session storage instead of localStorage
  const token = sessionStorage.getItem('token') || (typeof window !== 'undefined' && window.token);
  
  return !!token;
};

// Quick login function for testing (development only)
export const quickLogin = (name = "Test User", email = "test@kkings.com", phone = "9999999999") => {
  // This function should only be used in development
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️ quickLogin is for development only - remove in production');
    return null;
  }
  
  // In production, this should never be called
  throw new Error('quickLogin is not available in production');
};
