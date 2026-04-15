import React, { useState } from 'react';
import toast from 'react-hot-toast';

const TestAnimations = () => {
  const [cartBounce, setCartBounce] = useState(false);
  const [added, setAdded] = useState(false);

  const testToast = () => {
    console.log('Testing toast...');
    toast.success('Test toast notification!');
  };

  const testCartBounce = () => {
    console.log('Testing cart bounce...');
    setCartBounce(true);
    setTimeout(() => setCartBounce(false), 400);
  };

  const testButtonAnimation = () => {
    console.log('Testing button animation...');
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const testAll = () => {
    console.log('Testing all animations...');
    testToast();
    setTimeout(() => testCartBounce(), 200);
    setTimeout(() => testButtonAnimation(), 400);
  };

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh' }}>
      <h1>Animation Test Component</h1>
      
      {/* Test Cart Icon */}
      <div 
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          width: '40px',
          height: '40px',
          background: '#ae0b0b',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold'
        }}
        className={cartBounce ? 'cart-bounce' : ''}
      >
        Cart
      </div>

      {/* Test Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
        <button 
          onClick={testToast}
          style={{
            background: '#10b981',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Toast
        </button>

        <button 
          onClick={testCartBounce}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Cart Bounce
        </button>

        <button 
          onClick={testButtonAnimation}
          style={{
            background: added ? '#10b981' : '#ae0b0b',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          className={added ? 'cart-button-success' : ''}
        >
          {added ? 'Added!' : 'Test Button Animation'}
        </button>

        <button 
          onClick={testAll}
          style={{
            background: '#8b5cf6',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test All Animations
        </button>
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>Open browser console (F12) to see debug logs</p>
        <p>Each button should trigger its respective animation</p>
      </div>
    </div>
  );
};

export default TestAnimations;
