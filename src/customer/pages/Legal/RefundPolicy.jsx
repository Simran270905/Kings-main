import React from 'react'
import { Link } from 'react-router-dom'

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Refund & Cancellation Policy</h1>
          
          <div className="prose prose-sm max-w-none text-gray-600 space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Policy Overview</h2>
              <p>
                At KKings Jewellery, we are committed to ensuring your satisfaction with every purchase. 
                This Refund & Cancellation Policy outlines the conditions under which you may cancel 
                orders and request refunds for products purchased from our website.
              </p>
              <p className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Order Cancellation</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-2">Before Shipment</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Orders can be cancelled within 24 hours of placement</li>
                <li>Full refund will be processed to original payment method</li>
                <li>Refund processing time: 5-7 business days</li>
                <li>Cancellation requests after 24 hours may not be accepted</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">After Shipment</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Orders cannot be cancelled once shipped</li>
                <li>Customer must follow the return process instead</li>
                <li>Return policy applies for post-shipment cancellations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Returns Policy</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-2">Return Eligibility</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Returns accepted within 7 days of delivery</li>
                <li>Product must be unused and in original condition</li>
                <li>Original packaging, tags, and labels must be intact</li>
                <li>Proof of purchase (order ID) is required</li>
                <li>Return shipping charges are borne by the customer</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">Non-Returnable Items</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Customized or personalized jewellery</li>
                <li>Items damaged due to customer misuse</li>
                <li>Products without original packaging</li>
                <li>Earrings and other intimate items for hygiene reasons</li>
                <li>Items returned after the 7-day window</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Return Process</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-2">Step 1: Initiate Return</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Contact our customer support via email or phone</li>
                <li>Provide order ID and reason for return</li>
                <li>Our team will review your return request</li>
                <li>Return approval will be sent via email</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">Step 2: Package the Item</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Securely pack the item in original packaging</li>
                <li>Include all accessories and documentation</li>
                <li>Attach the return shipping label (if provided)</li>
                <li>Ensure proper packaging to prevent damage</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">Step 3: Ship the Item</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Ship the item to our return address</li>
                <li>Use a reliable courier service with tracking</li>
                <li>Keep the tracking number for reference</li>
                <li>Share tracking details with our support team</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">Step 4: Quality Check</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Returned item undergoes quality inspection</li>
                <li>Inspection takes 2-3 business days</li>
                <li>You will be notified of inspection results</li>
                <li>Refund processed if return is approved</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Refund Process</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-2">Refund Timeline</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Refund initiated within 2 business days of approval</li>
                <li>Refund processed to original payment method</li>
                <li>Bank transfers: 5-7 business days</li>
                <li>Credit/Debit cards: 7-10 business days</li>
                <li>Wallet refunds: 2-3 business days</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">Refund Amount</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Full product price will be refunded</li>
                <li>Original shipping charges are non-refundable</li>
                <li>Return shipping charges are non-refundable</li>
                <li>Any applicable taxes will be refunded</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Exchange Policy</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-2">Exchange Eligibility</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Exchanges accepted within 7 days of delivery</li>
                <li>Product must meet return eligibility criteria</li>
                <li>Exchange allowed for same product in different size/variant</li>
                <li>Price difference will be charged or refunded as applicable</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">Exchange Process</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Follow the same return process for exchanges</li>
                <li>Specify the product variant you want instead</li>
                <li>Exchange shipping charges may apply</li>
                <li>Exchange subject to product availability</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Damaged or Defective Items</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-2">Reporting Issues</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Report damaged items within 48 hours of delivery</li>
                <li>Provide photos of damaged product and packaging</li>
                <li>Include order ID and detailed description of issue</li>
                <li>Our team will investigate and respond within 24 hours</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">Resolution Options</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Full refund including shipping charges</li>
                <li>Replacement of the damaged item</li>
                <li>Store credit for future purchases</li>
                <li>Repair service (if applicable and feasible)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Refund Exceptions</h2>
              <p>Refunds will not be provided in the following cases:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Return request made after 7 days of delivery</li>
                <li>Product shows signs of wear and tear</li>
                <li>Original packaging or tags are missing</li>
                <li>Product damaged due to improper handling by customer</li>
                <li>Customized or personalized items</li>
                <li>Items returned without proper documentation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Customer Support</h2>
              <p>
                Our customer support team is available to assist you with any refund or return-related queries:
              </p>
              <div className="bg-gray-50 p-4 rounded mt-3">
                <p><strong>Support Channels:</strong></p>
                <p>Email: support@kkingsjewellery.com</p>
                <p>Phone: +91 8329972432</p>
                <p>WhatsApp: +91 8329972432</p>
                <p>Support Hours: 10:00 AM - 7:00 PM (IST)</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Important Notes</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>This policy is subject to change without prior notice</li>
                <li>KKings Jewellery reserves the right to modify return conditions</li>
                <li>Disputes will be resolved as per applicable laws</li>
                <li>Final decision on returns rests with KKings Jewellery management</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Information</h2>
              <p>
                For any questions about our Refund & Cancellation Policy, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded mt-3">
                <p><strong>KKings Jewellery</strong></p>
                <p>Email: support@kkingsjewellery.com</p>
                <p>Phone: +91 8329972432</p>
                <p>Address: Mumbai, Maharashtra, India</p>
              </div>
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
