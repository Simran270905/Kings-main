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
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Information We Collect</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Personal Information:</strong> Name, phone number, email, and shipping address.</li>
                <li><strong>Payment Information:</strong> Processed securely via third-party gateways.</li>
                <li><strong>Technical Data:</strong> IP address, browser type, and cookies.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>To process and deliver orders and send transactional updates.</li>
                <li>To respond to customer service requests.</li>
                <li>To improve website functionality and user experience.</li>
                <li>For marketing (only with your explicit consent).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Data Sharing & Security</h2>
              <p>
                We do not sell or rent your data. Information is shared only with necessary partners (delivery/payment providers) to fulfill orders. While we implement security measures, no online transmission is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Your Rights</h2>
              <p>
                You may request access to or correction of your personal data and opt out of marketing communications at any time.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Us</h2>
              <p>
                If you have questions about your privacy or data, please reach out:
              </p>
              <div className="bg-gray-50 p-4 rounded mt-3">
                <p><strong>Name:</strong> K Kings Jewellery by Harsh Manoj Rawal</p>
                <p><strong>Mobile:</strong> 9307229289</p>
                <p><strong>Email:</strong> <a href="mailto:kkingsjewellery@gmail.com" className="text-[#ae0b0b] hover:text-[#8f0a0a]">kkingsjewellery@gmail.com</a></p>
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
