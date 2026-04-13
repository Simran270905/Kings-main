import { useEffect } from "react"

export default function RazorpayTest() {
  const handleTestPayment = async () => {
    try {
      // Step 1: Create order
      const res = await fetch("http://localhost:5000/api/payments/create-order", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          amount: 1, // ₹1 test
          currency: "INR" 
        })
      })
      const order = await res.json()
      console.log("Order created:", order)

      if (!order.data?.razorpayOrderId) {
        console.error("Order ID missing — backend issue")
        alert("❌ Order ID missing — backend issue")
        return
      }

      // Step 2: Load Razorpay script
      const scriptLoaded = await new Promise((resolve) => {
        if (window.Razorpay) {
          resolve(true)
          return
        }
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.onload = () => resolve(true)
        script.onerror = () => resolve(false)
        document.body.appendChild(script)
      })

      if (!scriptLoaded) {
        console.error("Failed to load Razorpay script")
        alert("❌ Failed to load Razorpay script")
        return
      }

      // Step 3: Open Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.data.amount, // Already in paise from backend - DON'T multiply again
        currency: "INR",
        order_id: order.data.razorpayOrderId,
        name: "Test Payment",
        description: "Razorpay Debug Test",
        handler: async (response) => {
          console.log("Payment Success Response:", response)

          // Step 4: Verify
          const verifyRes = await fetch("http://localhost:5000/api/payments/verify", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              cartItems: [{
                productId: 'test-product',
                name: 'Test Item',
                price: 1,
                quantity: 1,
                subtotal: 1
              }],
              customer: {
                firstName: 'Test',
                lastName: 'User',
                email: 'test@test.com',
                mobile: '9999999999',
                streetAddress: 'Test Address',
                city: 'Test City',
                state: 'Test State',
                zipCode: '123456'
              },
              totalAmount: 1
            })
          })
          const verifyData = await verifyRes.json()
          console.log("Verification Result:", verifyData)

          if (verifyData.success) {
            alert("✅ Razorpay Test PASSED — Payment verified successfully")
          } else {
            alert("❌ Razorpay Test FAILED — Signature verification failed")
          }
        },
        prefill: {
          name: "Test User",
          email: "test@test.com",
          contact: "9999999999"
        },
        theme: { color: "#3399cc" }
      }

      const rzp = new window.Razorpay(options)
      rzp.on("payment.failed", (response) => {
        console.error("Payment Failed:", response.error)
        alert("❌ Payment Failed: " + response.error.description)
      })
      rzp.open()

    } catch (err) {
      console.error("Razorpay Test Error:", err)
      alert("❌ Error: " + err.message)
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Razorpay Test Mode Check</h2>
      <p>Uses test card: 4111 1111 1111 1111 | Expiry: 12/28 | CVV: 123 | OTP: 1234</p>
      <button 
        onClick={handleTestPayment} 
        style={{ 
          padding: "10px 20px", 
          fontSize: 16,
          backgroundColor: "#ae0b0b",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        Run ₹1 Test Payment
      </button>
      <p style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
        TODO: Remove before production
      </p>
    </div>
  )
}
