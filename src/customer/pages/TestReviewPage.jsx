import React, { useState, useEffect } from 'react'

const TestReviewPage = () => {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    testDirectAPI()
  }, [])

  const testDirectAPI = async () => {
    setLoading(true)
    try {
      const orderId = '69e679bf0a9eb574729bbd7e'
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmRlcklkIjoiNjllNjc5YmYwYTllYjU3NDcyOWJiZDdlIiwiZW1haWwiOiJjdXN0b21lckBleGFtcGxlLmNvbSIsImV4cGlyZXMiOjE3Nzc0OTE2NzI2MTUsImdlbmVyYXRlZCI6MTc3Njg4Njg3MjYxNn0.42578fb38e70f6fa957ec0e702b4e84709116a0bc6103f164f3724d6aca91f62'
      
      console.log('=== DIRECT API TEST ===')
      console.log('Order ID:', orderId)
      console.log('Token:', token)
      
      const url = `https://api.kkingsjewellery.com/api/reviews/verify-token?orderId=${orderId}&token=${token}`
      console.log('Full URL:', url)
      
      const response = await fetch(url)
      const data = await response.json()
      
      console.log('Response status:', response.status)
      console.log('Response data:', data)
      
      setResult({
        status: response.status,
        data: data,
        success: response.ok
      })
    } catch (error) {
      console.error('Test error:', error)
      setResult({
        error: error.message,
        success: false
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Direct API Test</h1>
      {loading ? (
        <p>Testing...</p>
      ) : result ? (
        <div>
          <h3>Result:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      ) : (
        <p>No result yet</p>
      )}
    </div>
  )
}

export default TestReviewPage
