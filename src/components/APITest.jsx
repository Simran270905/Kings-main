// API Test Component - Development only
import React, { useState, useEffect } from 'react'
import { API_BASE_URL } from '../config/api.js'

const APITest = () => {
  const [testResults, setTestResults] = useState({})

  useEffect(() => {
    // Only run in development
    if (!import.meta.env.DEV) return

    const testAPI = async () => {
      const results = {}

      // Test products endpoint
      try {
        const productsRes = await fetch(`${API_BASE_URL}/products`)
        results.products = {
          status: productsRes.status,
          ok: productsRes.ok,
          data: await productsRes.json()
        }
      } catch (error) {
        results.products = { error: error.message }
      }

      // Test categories endpoint
      try {
        const categoriesRes = await fetch(`${API_BASE_URL}/categories`)
        results.categories = {
          status: categoriesRes.status,
          ok: categoriesRes.ok,
          data: await categoriesRes.json()
        }
      } catch (error) {
        results.categories = { error: error.message }
      }

      setTestResults(results)
    }

    testAPI()
  }, [])

  // Only show in development
  if (!import.meta.env.DEV) {
    return null
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      left: '10px',
      background: 'rgba(0,0,0,0.9)',
      color: 'white',
      padding: '15px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '400px',
      maxHeight: '300px',
      overflow: 'auto'
    }}>
      <h4>API Test (Dev Only):</h4>
      <p><strong>API URL:</strong> {API_BASE_URL}</p>
      <pre>{JSON.stringify(testResults, null, 2)}</pre>
    </div>
  )
}

export default APITest
