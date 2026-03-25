// Debug component to check environment variables in production
import React from 'react'
import { API_BASE_URL, RAZORPAY_KEY, CLOUDINARY_CLOUD_NAME } from '../config/api.js'

const DebugInfo = () => {
  const envInfo = {
    API_BASE_URL,
    RAZORPAY_KEY,
    CLOUDINARY_CLOUD_NAME,
    NODE_ENV: import.meta.env.MODE,
    isProduction: import.meta.env.PROD,
    isDevelopment: import.meta.env.DEV
  }

  // Only show in development or if there's an issue
  if (import.meta.env.DEV || import.meta.env.PROD) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999,
        maxWidth: '300px'
      }}>
        <h4>Debug Info:</h4>
        <pre>{JSON.stringify(envInfo, null, 2)}</pre>
      </div>
    )
  }

  return null
}

export default DebugInfo
