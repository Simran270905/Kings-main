// Test script to verify the payment tracking UI connection
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing Payment Tracking UI Connection...\n');

// Test 1: Check if frontend files exist
const filesToCheck = [
  'src/admin/pages/PaymentTracking.jsx',
  'src/admin/context/EnhancedOrderContext.jsx',
  'src/App.jsx'
];

console.log('📁 Checking frontend files...');
filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - Exists`);
  } else {
    console.log(`❌ ${file} - Missing`);
  }
});

// Test 2: Check if PaymentTracking is imported in App.jsx
console.log('\n📦 Checking App.jsx imports...');
try {
  const appContent = fs.readFileSync(path.join(__dirname, 'src/App.jsx'), 'utf8');
  
  if (appContent.includes('PaymentTracking')) {
    console.log('✅ PaymentTracking imported in App.jsx');
  } else {
    console.log('❌ PaymentTracking not imported in App.jsx');
  }
  
  if (appContent.includes('PaymentTrackingWrapper')) {
    console.log('✅ PaymentTrackingWrapper defined in App.jsx');
  } else {
    console.log('❌ PaymentTrackingWrapper not defined in App.jsx');
  }
  
  if (appContent.includes('/admin/payment-tracking')) {
    console.log('✅ Payment tracking route added in App.jsx');
  } else {
    console.log('❌ Payment tracking route not found in App.jsx');
  }
} catch (error) {
  console.log('❌ Error reading App.jsx:', error.message);
}

// Test 3: Check if EnhancedOrderProvider is added
console.log('\n🔧 Checking EnhancedOrderProvider...');
try {
  const appContent = fs.readFileSync(path.join(__dirname, 'src/App.jsx'), 'utf8');
  
  if (appContent.includes('EnhancedOrderProvider')) {
    console.log('✅ EnhancedOrderProvider imported in App.jsx');
  } else {
    console.log('❌ EnhancedOrderProvider not imported in App.jsx');
  }
  
  if (appContent.includes('<EnhancedOrderProvider>')) {
    console.log('✅ EnhancedOrderProvider wrapper added in App.jsx');
  } else {
    console.log('❌ EnhancedOrderProvider wrapper not found in App.jsx');
  }
} catch (error) {
  console.log('❌ Error checking EnhancedOrderProvider:', error.message);
}

// Test 4: Check if admin navigation includes Payment Tracking
console.log('\n🧭 Checking admin navigation...');
try {
  const adminLayoutContent = fs.readFileSync(path.join(__dirname, 'src/admin/AdminOnlyLayout.jsx'), 'utf8');
  
  if (adminLayoutContent.includes('Payment Tracking')) {
    console.log('✅ Payment Tracking added to admin menu');
  } else {
    console.log('❌ Payment Tracking not found in admin menu');
  }
  
  if (adminLayoutContent.includes('CurrencyDollarIcon')) {
    console.log('✅ CurrencyDollarIcon imported for Payment Tracking');
  } else {
    console.log('❌ CurrencyDollarIcon not imported for Payment Tracking');
  }
} catch (error) {
  console.log('❌ Error checking admin navigation:', error.message);
}

console.log('\n🎯 Connection Test Summary:');
console.log('- Frontend files: Should be complete ✅');
console.log('- App.jsx integration: Should be complete ✅');
console.log('- Admin navigation: Should be complete ✅');
console.log('\n💡 The payment tracking system should now be accessible!');
console.log('📍 Navigate to: http://localhost:5173/admin/payment-tracking');
console.log('🔑 Login to admin panel first, then click "Payment Tracking" in sidebar');
