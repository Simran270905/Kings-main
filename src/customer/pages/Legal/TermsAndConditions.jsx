import React from 'react'
import { Link } from 'react-router-dom'

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms & Conditions</h1>
          
          <div className="prose prose-sm max-w-none text-gray-600 space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Acceptance of Terms</h2>
              <p>
                By accessing and using KKings Jewellery's website and services, you accept and 
                agree to be bound by the terms and conditions of this Agreement. If you do not 
                agree to abide by the above, please do not use this service.
              </p>
              <p className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">About KKings Jewellery</h2>
              <p>
                KKings Jewellery is an Indian e-commerce platform specializing in premium jewellery 
                products. We operate through our website kkingsjewellery.com and offer a curated 
                collection of jewellery items including chains, rings, pendants, bracelets, and more.
              </p>
              <div className="bg-gray-50 p-4 rounded mt-3">
                <p><strong>Business Details:</strong></p>
                <p>Company Name: KKings Jewellery</p>
                <p>Business Type: E-commerce Jewellery Retail</p>
                <p>Registered Address: Mumbai, Maharashtra, India</p>
                <p>Email: support@kkingsjewellery.com</p>
                <p>Phone: +91 8329972432</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Products and Services</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-2">Product Information</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>All products are described with accurate specifications</li>
                <li>Prices are inclusive of applicable taxes</li>
                <li>Product images are for representation purposes</li>
                <li>We reserve the right to modify product specifications without prior notice</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">Pricing</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>All prices are listed in Indian Rupees (INR)</li>
                <li>Prices are subject to change without notice</li>
                <li>We offer secure payment processing through Razorpay</li>
                <li>Additional charges may apply for shipping and handling</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">User Account</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-2">Registration</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>You must provide accurate and complete information</li>
                <li>You are responsible for maintaining account security</li>
                <li>You must be at least 18 years old to create an account</li>
                <li>One person or entity may hold only one account</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">Account Responsibilities</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Maintain confidentiality of account credentials</li>
                <li>Provide accurate and up-to-date information</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of unauthorized use</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Orders and Payment</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-2">Order Process</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Orders are subject to product availability</li>
                <li>We reserve the right to refuse or cancel orders</li>
                <li>Order confirmation will be sent via email</li>
                <li>Order details can be accessed through your account</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">Payment Terms</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Payment must be made in full at time of purchase</li>
                <li>We accept payments through Razorpay secure gateway</li>
                <li>All payment information is encrypted and secure</li>
                <li>We do not store credit card information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Shipping and Delivery</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>We ship to all major cities in India</li>
                <li>Delivery timelines are estimates and not guaranteed</li>
                <li>Shipping charges may apply based on location</li>
                <li>We are not liable for delays beyond our control</li>
                <li>Order tracking information will be provided</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Returns and Refunds</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Returns are accepted within 7 days of delivery</li>
                <li>Products must be unused and in original packaging</li>
                <li>Refunds will be processed to original payment method</li>
                <li>Shipping charges for returns are non-refundable</li>
                <li>Customized items are not eligible for return</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Intellectual Property</h2>
              <p>
                All content on this website, including logos, images, text, and designs, 
                is the property of KKings Jewellery and is protected by intellectual property laws. 
                You may not use, reproduce, or distribute any content without our written permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Prohibited Activities</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Use the website for illegal purposes</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with the proper working of the website</li>
                <li>Post or transmit harmful or offensive content</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Limitation of Liability</h2>
              <p>
                KKings Jewellery shall not be liable for any direct, indirect, incidental, or 
                consequential damages arising from your use of our website or products. Our total 
                liability shall not exceed the amount paid for the specific product in question.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Dispute Resolution</h2>
              <p>
                Any disputes arising from these terms or your use of our services shall be governed 
                by the laws of India and subject to the exclusive jurisdiction of courts in Mumbai, Maharashtra.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Termination</h2>
              <p>
                We reserve the right to terminate or suspend your account and access to our services 
                at our sole discretion, without notice, for conduct that we believe violates these 
                terms or is harmful to other users or us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Changes will be effective 
                immediately upon posting on our website. Your continued use of our services constitutes 
                acceptance of any modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Information</h2>
              <p>
                If you have any questions about these Terms & Conditions, please contact us:
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

export default TermsAndConditions
