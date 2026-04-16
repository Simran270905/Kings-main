// Test script to find available endpoints
const API_BASE_URL = 'https://kingsbackend-y3fu.onrender.com/api';

async function testAvailableEndpoints() {
  console.log('🔍 Testing Available Endpoints...\n');
  
  const endpoints = [
    '/orders',
    '/admin/orders',
    '/admin/orders/stats',
    '/orders/stats',
    '/analytics',
    '/admin/analytics'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Testing ${endpoint}...`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      console.log(`Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${endpoint} - Working`);
        if (data.data && Array.isArray(data.data)) {
          console.log(`   Found ${data.data.length} items`);
        }
      } else {
        console.log(`❌ ${endpoint} - Failed`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - Error: ${error.message}`);
    }
    console.log('');
  }
}

// Run the test
testAvailableEndpoints().catch(console.error);
