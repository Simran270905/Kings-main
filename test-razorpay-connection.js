// Test Razorpay Connection
console.log('Testing Razorpay Connection...');

// Check environment variables
console.log('Environment Variables:');
console.log('VITE_RAZORPAY_KEY_ID:', import.meta.env?.VITE_RAZORPAY_KEY_ID);
console.log('VITE_API_URL:', import.meta.env?.VITE_API_URL);

// Test Razorpay key format
const razorpayKey = import.meta.env?.VITE_RAZORPAY_KEY_ID;
if (razorpayKey) {
  console.log('Razorpay Key Found:', razorpayKey);
  
  // Check if it's a live or test key
  if (razorpayKey.startsWith('rzp_live_')) {
    console.log('LIVE KEY DETECTED - Production Mode');
  } else if (razorpayKey.startsWith('rzp_test_')) {
    console.log('TEST KEY DETECTED - Development Mode');
  } else {
    console.log('INVALID KEY FORMAT');
  }
  
  // Test Razorpay script loading
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload = () => {
    console.log('Razorpay script loaded successfully');
    if (window.Razorpay) {
      console.log('Razorpay object available:', typeof window.Razorpay);
      
      // Test creating Razorpay instance (without opening)
      try {
        const testOptions = {
          key: razorpayKey,
          amount: 100, // 1 rupee
          currency: 'INR',
          name: 'Test Payment',
          description: 'Testing connection',
          handler: function(response) {
            console.log('Payment successful:', response);
          }
        };
        
        const rzp = new window.Razorpay(testOptions);
        console.log('Razorpay instance created successfully');
        console.log('Connection test PASSED! Razorpay is properly configured.');
        
      } catch (error) {
        console.error('Error creating Razorpay instance:', error);
      }
    } else {
      console.error('Razorpay object not available');
    }
  };
  script.onerror = () => {
    console.error('Failed to load Razorpay script');
  };
  document.head.appendChild(script);
  
} else {
  console.error('No Razorpay key found in environment variables');
  console.log('Please check your .env file for VITE_RAZORPAY_KEY_ID');
}
