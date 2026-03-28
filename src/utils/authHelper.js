// Check if user is logged in
export const isUserLoggedIn = () => {
  const token = localStorage.getItem('token');
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  return !!(token && isAuthenticated);
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
