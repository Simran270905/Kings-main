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
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Introduction</h2>
              <p>
                These Terms and Conditions govern your use of this website and the purchase of products or services offered herein. By accessing or using this website, you agree to be bound by these terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. General Use</h2>
              <p>
                By using this website, you confirm that you are at least 18 years old or are using the website under the supervision of a parent or legal guardian. All content on this website is for informational purposes only and is subject to change without notice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. User Responsibilities</h2>
              <p>
                Users agree not to misuse the website by knowingly introducing viruses, trojans, or other malicious material. You must not attempt to gain unauthorized access to the server, database, or any part of the site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Product & Service Descriptions</h2>
              <p>
                All efforts are made to ensure accuracy in product descriptions, images, pricing, and availability. However, we do not warrant that product descriptions or other content are complete, current, or error-free.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Order Acceptance & Cancellation</h2>
              <p>
                Placing an order does not constitute a confirmed order. We reserve the right to refuse or cancel any order for reasons including product availability, pricing errors, or suspected fraud. Orders may not be canceled or modified once placed unless stated in the return policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Pricing and Payment</h2>
              <p>
                All prices are displayed in INR and are inclusive or exclusive of taxes as indicated. Payments must be made through secure and approved payment gateways. The website is not liable for payment gateway errors.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Intellectual Property</h2>
              <p>
                All text, graphics, logos, and images are the intellectual property of their respective owners. Unauthorized use or duplication is strictly prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Limitation of Liability</h2>
              <p>
                Liability is limited to the value of the product purchased. We are not responsible for indirect or consequential damages arising from the use of this website.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Governing Law</h2>
              <p>
                These terms shall be governed by and construed in accordance with the laws of India.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Contact Information</h2>
              <p>
                For any queries regarding these Terms, please contact:
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

export default TermsAndConditions
