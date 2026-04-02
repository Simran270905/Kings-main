import React from 'react'
import { Link } from 'react-router-dom'

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-sm max-w-none text-gray-600 space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Introduction</h2>
              <p>
                KKings Jewellery ("we," "our," or "us") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
                when you visit our website kkingsjewellery.com and use our services.
              </p>
              <p className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Information We Collect</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-2">Personal Information</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Name and contact details (email, phone number)</li>
                <li>Shipping and billing address</li>
                <li>Payment information (processed securely by Razorpay)</li>
                <li>Account credentials and authentication tokens</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">Technical Information</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>IP address and browser information</li>
                <li>Device information and browsing behavior</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Usage data and analytics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Process and fulfill your orders</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Send transactional emails and order updates</li>
                <li>Improve our website and services</li>
                <li>Prevent fraud and ensure security</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Information Sharing</h2>
              <p>We do not sell, trade, or rent your personal information to third parties. We only share information:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>With payment processors (Razorpay) for secure payment processing</li>
                <li>With shipping partners for order delivery</li>
                <li>As required by law or to protect our rights</li>
                <li>With trusted service providers under strict confidentiality agreements</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Data Security</h2>
              <p>
                We implement appropriate security measures to protect your information, including:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>SSL encryption for data transmission</li>
                <li>Secure payment processing through Razorpay</li>
                <li>Regular security audits and updates</li>
                <li>Restricted access to personal information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Access and update your personal information</li>
                <li>Request deletion of your account and data</li>
                <li>Opt-out of marketing communications</li>
                <li>Know what data we collect and how it's used</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Cookies</h2>
              <p>
                We use cookies to enhance your experience, analyze site traffic, and personalize content. 
                You can control cookie settings through your browser preferences.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Third-Party Links</h2>
              <p>
                Our website may contain links to third-party websites. We are not responsible for 
                their privacy practices. Please review their privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Children's Privacy</h2>
              <p>
                Our services are not intended for children under 18. We do not knowingly collect 
                personal information from children.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any 
                material changes by posting the new policy on our website and updating the "last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy or want to exercise your rights, 
                please contact us:
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

export default PrivacyPolicy
