// Emergency login helper - ensures user is logged in for payments
export const ensureUserLoggedIn = () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.log("No token found, creating emergency login...");
    
    // Generate token
    const fakeToken = "kkings_user_token";
    localStorage.setItem('token', fakeToken);
    
    // Create user data if not exists
    const existingUser = localStorage.getItem('user');
    if (!existingUser) {
      const userData = {
        id: Date.now().toString(),
        name: "Guest User",
        email: "guest@kkings.com", 
        phone: "0000000000",
        role: 'customer',
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isAuthenticated', 'true');
    }
    
    console.log("Emergency login created successfully");
    return true;
  }
  
  console.log("User already logged in");
  return true;
};

// Quick login function for testing
export const quickLogin = (name = "Test User", email = "test@kkings.com", phone = "9999999999") => {
  const fakeToken = "kkings_user_token";
  const userData = {
    id: Date.now().toString(),
    name: name,
    email: email,
    phone: phone,
    role: 'customer',
    createdAt: new Date().toISOString()
  };

  localStorage.setItem('token', fakeToken);
  localStorage.setItem('user', JSON.stringify(userData));
  localStorage.setItem('isAuthenticated', 'true');

  console.log("Quick login completed:", userData);
  return userData;
};
