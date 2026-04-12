import React from 'react'
import { Link } from 'react-router-dom'

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Refund & Return Policy</h1>
          
          <div className="prose prose-sm max-w-none text-gray-600 space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Returns</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Returns are accepted within <strong>7 days of delivery</strong> for <strong>damaged or defective items only</strong>.</li>
                <li>Items must be <strong>unused</strong> and in their <strong>original packaging</strong>.</li>
                <li>Proof of damage such as <strong>photo/video evidence</strong> is required for approval.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Exchanges & Replacements</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Requests for exchange or replacement must be made within <strong>7 days of delivery</strong>.</li>
                <li>Approved replacements are dispatched within <strong>2–3 business days</strong> after we receive the returned item.</li>
                <li>The total timeline for replacement delivery is typically <strong>7–10 business days</strong>.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Refunds</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Once approved, refunds are processed within <strong>3–5 business days</strong>.</li>
                <li>Credits will appear in your original mode of payment within <strong>7–10 business days</strong>, depending on your bank.</li>
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

export default RefundPolicy
