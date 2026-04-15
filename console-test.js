// Test Order Success Page with Confetti
// Run this in the browser console on http://localhost:5174

console.log('Starting Order Success test...');

// Test 1: Test confetti library
console.log('Testing confetti library...');
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js';
script.onload = function() {
    console.log('Confetti library loaded!');
    
    // Test confetti animation
    console.log('Firing confetti animation...');
    confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 }
    });
    
    // Continuous bursts
    const duration = 3000;
    const end = Date.now() + duration;
    
    const interval = setInterval(() => {
        if (Date.now() > end) {
            clearInterval(interval);
            console.log('Confetti animation completed!');
            return;
        }
        
        confetti({
            particleCount: 30,
            spread: 70,
            origin: {
                x: Math.random(),
                y: Math.random() - 0.2
            }
        });
    }, 300);
    
    setTimeout(() => {
        clearInterval(interval);
    }, duration);
};
document.head.appendChild(script);

// Test 2: Test Order Success page navigation
console.log('Testing Order Success page navigation...');
const orderId = 'TEST' + Date.now().toString().slice(-8).toUpperCase();
const paymentId = 'PAY' + Date.now().toString().slice(-8).toUpperCase();

console.log('Test Order ID:', orderId);
console.log('Test Payment ID:', paymentId);

// Navigate to Order Success page
console.log('Navigating to Order Success page...');
window.location.href = `/order-success?orderId=${orderId}&paymentId=${paymentId}&paymentMethod=razorpay`;
