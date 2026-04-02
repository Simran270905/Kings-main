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
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Policy Overview</h2>
              <p>
                KKings Jewellery is committed to delivering your precious jewellery safely and securely 
                to your doorstep. This Shipping Policy outlines our shipping procedures, delivery timelines, 
                and related terms for all orders placed on our website.
              </p>
              <p className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Shipping Coverage</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-2">Service Areas</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>We ship to all major cities and towns across India</li>
                <li>Pan India delivery through trusted courier partners</li>
                <li>International shipping currently not available</li>
                <li>Service available in over 20,000 pin codes nationwide</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">Excluded Areas</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Remote locations not covered by our courier partners</li>
                <li>Areas with delivery restrictions for valuable items</li>
                <li>International destinations</li>
                <li>Locations requiring special permits for jewellery delivery</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Shipping Charges</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-2">Standard Shipping</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>₹99 for orders below ₹2,000</li>
                <li>Free shipping for orders ₹2,000 and above</li>
                <li>Delivery within 5-7 business days</li>
                <li>Tracking available for all orders</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">Express Shipping</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>₹199 for all order values</li>
                <li>Delivery within 2-3 business days</li>
                <li>Available for select cities only</li>
                <li>Priority handling and dispatch</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">Additional Charges</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Octroi/Entry Tax (if applicable) - borne by customer</li>
                <li>Special handling for high-value items - ₹50 extra</li>
                <li>Insurance for orders above ₹50,000 - ₹100 extra</li>
                <li>COD (Cash on Delivery) - ₹50 extra (where available)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Delivery Timeline</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-2">Processing Time</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Order processing: 1-2 business days</li>
                <li>Quality check and packaging: 1 business day</li>
                <li>Customized items: 5-7 additional business days</li>
                <li>Orders placed after 6 PM processed next business day</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">Transit Time</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Metropolitan cities: 2-3 business days</li>
                <li>Major cities: 3-5 business days</li>
                <li>Tier 2 & 3 cities: 4-7 business days</li>
                <li>Remote areas: 7-10 business days</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">Total Delivery Time</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Standard shipping: 5-7 business days total</li>
                <li>Express shipping: 3-4 business days total</li>
                <li>Customized items: 10-12 business days total</li>
                <li>Remote locations: 10-12 business days total</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Packaging & Security</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-2">Secure Packaging</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Tamper-proof packaging for all jewellery items</li>
                <li>Discreet outer packaging for security</li>
                <li>Inner cushioning to prevent damage during transit</li>
                <li>Water-resistant and crush-resistant materials</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">Insurance Coverage</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Automatic insurance for orders above ₹10,000</li>
                <li>Coverage against loss, theft, and damage in transit</li>
                <li>Claims processed within 7 business days</li>
                <li>Optional enhanced insurance available for high-value items</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Order Tracking</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-2">Tracking Information</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Tracking number sent via email and SMS</li>
                <li>Real-time tracking available on our website</li>
                <li>Multiple tracking checkpoints during transit</li>
                <li>Delivery confirmation via email and SMS</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">Tracking Stages</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Order Confirmed - Payment received and order processed</li>
                <li>Quality Check - Product inspection and packaging</li>
                <li>Dispatched - Handed over to courier partner</li>
                <li>In Transit - Package moving through courier network</li>
                <li>Out for Delivery - Package with delivery agent</li>
                <li>Delivered - Successfully delivered to customer</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Delivery Process</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-2">Delivery Attempt</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Delivery attempted during business hours (10 AM - 7 PM)</li>
                <li>Maximum 2 delivery attempts per order</li>
                <li>Customer notified via SMS and email for each attempt</li>
                <li>Rescheduling available through customer support</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">Failed Delivery</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Package returned to warehouse after 2 failed attempts</li>
                <li>Customer notified of return and rescheduling options</li>
                <li>Additional shipping charges may apply for re-delivery</li>
                <li>Order cancelled if no response within 7 days of return</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Special Circumstances</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-2">Weather Disruptions</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Delays possible during monsoon season (June-September)</li>
                <li>Extended timelines during festival seasons</li>
                <li>Customers notified of significant delays</li>
                <li>Option to cancel order without penalty for major delays</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">COVID-19 & Other Restrictions</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Following all government guidelines for safe delivery</li>
                <li>Contactless delivery options available</li>
                <li>Delays possible in containment zones</li>
                <li>Regular sanitization of packaging materials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">International Shipping</h2>
              <p>
                Currently, KKings Jewellery does not offer international shipping. We are working on 
                expanding our services to international markets. Please check our website for updates 
                on international shipping availability.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Shipping Support</h2>
              <p>
                For any shipping-related queries or assistance, please contact our customer support:
              </p>
              <div className="bg-gray-50 p-4 rounded mt-3">
                <p><strong>Shipping Support:</strong></p>
                <p>Email: support@kkingsjewellery.com</p>
                <p>Phone: +91 8329972432</p>
                <p>WhatsApp: +91 8329972432</p>
                <p>Support Hours: 10:00 AM - 7:00 PM (IST)</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Important Notes</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Delivery timelines are estimates and not guaranteed</li>
                <li>KKings Jewellery not liable for delays beyond our control</li>
                <li>Customers must provide accurate delivery address</li>
                <li>Orders may be split into multiple shipments for security</li>
                <li>Signature required for high-value deliveries</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Information</h2>
              <p>
                For any questions about our Shipping Policy, please contact us:
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

export default ShippingPolicy
