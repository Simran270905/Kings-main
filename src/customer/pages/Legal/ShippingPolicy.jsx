import React from 'react'
import { Link } from 'react-router-dom'

const ShippingPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Shipping Policy</h1>
          
          <div className="prose prose-sm max-w-none text-gray-600 space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Order Processing</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Orders are processed within <strong>1–3 business days</strong> after confirmation.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Delivery Timelines</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Standard Delivery:</strong> 5–10 business days</li>
                <li><strong>Express Delivery:</strong> 3–5 business days</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Order Tracking</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Tracking details will be shared via <strong>email/SMS</strong> once the order has been dispatched.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Important Note</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>We are not responsible for delays caused by courier services, natural disruptions, or unforeseen circumstances beyond our control.</li>
              </ul>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link 
              to="/" 
              className="text-[#ae0b0b] hover:text-[#8f0a0a] font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShippingPolicy
