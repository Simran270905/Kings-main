// Debug script - Run this in browser console to test payment
// Copy and paste this into the browser console when on the payment page

console.log("🔧 Testing Payment Login Fix...");

// Import and use the helper function
const quickLogin = () => {
  const fakeToken = "kkings_user_token";
  const userData = {
    id: Date.now().toString(),
    name: "Test User",
    email: "test@kkings.com",
    phone: "9999999999",
    role: 'customer',
    createdAt: new Date().toISOString()
  };

  localStorage.setItem('token', fakeToken);
  localStorage.setItem('user', JSON.stringify(userData));
  localStorage.setItem('isAuthenticated', 'true');

  console.log("✅ Quick login completed:", userData);
  console.log("✅ Token set:", localStorage.getItem('token'));
  return userData;
};

// Execute quick login
quickLogin();

// Verify login state
console.log("🔍 Current login state:");
console.log("Token:", localStorage.getItem('token'));
console.log("User:", JSON.parse(localStorage.getItem('user') || 'null'));
console.log("Authenticated:", localStorage.getItem('isAuthenticated'));

console.log("🎯 Payment should now work! Try proceeding with payment.");
