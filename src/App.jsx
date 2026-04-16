import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import { CartProvider } from './context/CartContext'
import { ProductProvider } from './context/ProductContext'
import { CustomerOrderProvider } from './context/CustomerOrderContext'
import AdminProductProvider from './admin/context/AdminProductContext' // FIXED IMPORT
import { EnhancedOrderProvider } from './admin/context/EnhancedOrderContext'
import { AdminAuthProvider } from './admin/context/AdminAuthContext'
import { OrderProvider } from './admin/context/OrderContext'
import ScrollToTop from './components/ScrollToTop'

import Navbar from './customer/components/navigation/Navbar'
import Footer from './customer/components/Footer/Footer'

import HomePage from './customer/pages/HomePage/HomePage'

// Lazy load non-critical customer components
const OurStory = lazy(() => import('./customer/pages/OurStory/OurStory'))
const Cart = lazy(() => import('./customer/components/Cart/Cart'))
const Checkout = lazy(() => import('./customer/components/Checkout/Checkout'))
const Payment = lazy(() => import('./customer/components/Payment/Payment'))
const PaymentConfirmation = lazy(() => import('./customer/pages/PaymentConfirmation/PaymentConfirmation'))
const OrderSuccess = lazy(() => import('./customer/pages/OrderSuccess/OrderSuccess'))
const Orders = lazy(() => import('./customer/pages/Orders/Orders'))
const OrderTrack = lazy(() => import('./customer/pages/OrderTrack/OrderTrack'))
const TrackOrderPage = lazy(() => import('./customer/pages/TrackOrder/TrackOrderPage'))

// Legal Pages - lazy loaded
const PrivacyPolicy = lazy(() => import('./customer/pages/Legal/PrivacyPolicy'))
const TermsAndConditions = lazy(() => import('./customer/pages/Legal/TermsAndConditions'))
const RefundPolicy = lazy(() => import('./customer/pages/Legal/RefundPolicy'))
const ShippingPolicy = lazy(() => import('./customer/pages/Legal/ShippingPolicy'))

// Contact Page - lazy loaded
const Contact = lazy(() => import('./customer/pages/Contact/Contact'))

import AdminRoute from './admin/AdminRoute'

// Lazy load admin components
const AdminLogin = lazy(() => import('./admin/AdminLogin'))
const AdminOnlyLayout = lazy(() => import('./admin/AdminOnlyLayout.jsx'))

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ae0b0b] mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
)

// Lazy imports
const ProductDetails = lazy(() =>
  import('./customer/components/ProductDetails.jsx/ProductDetails')
)
const ShopPage = lazy(() => import('./customer/pages/Shop/ShopPage'))

// Admin lazy
const Dashboard = lazy(() => import('./admin/layout/Dashboard.jsx'))
const ProductsManagement = lazy(() => import('./admin/layout/ProductsManagement.jsx'))
const Analytics = lazy(() => import('./admin/layout/Analytics.jsx'))
const AdminReports = lazy(() => import('./admin/pages/AdminReports.jsx'))
const ProductUpload = lazy(() => import('./admin/ProductUpload.jsx'))
const ProductEdit = lazy(() => import('./admin/ProductEdit.jsx'))
const AdminOrders = lazy(() => import('./admin/pages/AdminOrders.jsx'))
const OrderConfirmation = lazy(() => import('./admin/pages/OrderConfirmation.jsx'))
const AdminCustomers = lazy(() => import('./admin/pages/AdminCustomers.jsx'))
const AdminSettings = lazy(() => import('./admin/pages/AdminSettings.jsx'))
const CouponManagement = lazy(() => import('./admin/pages/CouponManagement.jsx'))
const HomePageEditor = lazy(() => import('./admin/layout/HomePageEditor.jsx'))
const FooterEditor = lazy(() => import('./admin/layout/FooterEditor.jsx'))
const OurStoryEditor = lazy(() => import('./admin/layout/OurStoryEditor.jsx'))
const Pages = lazy(() => import('./admin/layout/Pages.jsx'))
const ContactMessages = lazy(() => import('./admin/pages/ContactMessages.jsx'))
const BrandsManagement = lazy(() => import('./admin/layout/BrandsManagement.jsx'))
const CategoriesManagement = lazy(() => import('./admin/layout/CategoriesManagement.jsx'))

// Customer Layout
const CustomerLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
    <Footer />
  </>
)

const App = () => {
return (
  <Router>
    <ScrollToTop />
    <Toaster 
      position="top-right"
      toastOptions={{
        duration: 2000,
        style: {
          background: 'white',
          color: '#374151',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: 'white',
          },
        },
      }}
    />

    <AdminAuthProvider>
      <OrderProvider>
        <EnhancedOrderProvider>
          <AdminProductProvider>
            <CustomerOrderProvider>
              <ProductProvider>
                <CartProvider>

                <Suspense fallback={<LoadingFallback />}>

                  <Routes>

                    {/* ================= CUSTOMER ROUTES ================= */}
                    <Route path="/" element={<CustomerLayout><HomePage /></CustomerLayout>} />

                      <Route path="/product/:id" element={<CustomerLayout><ProductDetails /></CustomerLayout>} />
                      <Route path="/shop" element={<CustomerLayout><ShopPage /></CustomerLayout>} />
                      <Route path="/shop/:category" element={<CustomerLayout><ShopPage /></CustomerLayout>} />
                      <Route path="/our-story" element={<CustomerLayout><OurStory /></CustomerLayout>} />
                      <Route path="/cart" element={<CustomerLayout><Cart /></CustomerLayout>} />
                      <Route path="/checkout" element={<CustomerLayout><Checkout /></CustomerLayout>} />
                      <Route path="/payment" element={<CustomerLayout><Payment /></CustomerLayout>} />
                      <Route path="/payment-confirmation" element={<CustomerLayout><PaymentConfirmation /></CustomerLayout>} />
                      <Route path="/orders" element={<CustomerLayout><Orders /></CustomerLayout>} />
                      <Route path="/order-success" element={<CustomerLayout><OrderSuccess /></CustomerLayout>} />
                      <Route path="/orders/track" element={<CustomerLayout><TrackOrderPage /></CustomerLayout>} />
                      <Route path="/orders/track/:orderId" element={<CustomerLayout><OrderTrack /></CustomerLayout>} />

                      {/* Legal Pages */}
                      <Route path="/privacy-policy" element={<CustomerLayout><PrivacyPolicy /></CustomerLayout>} />
                      <Route path="/terms-and-conditions" element={<CustomerLayout><TermsAndConditions /></CustomerLayout>} />
                      <Route path="/refund-policy" element={<CustomerLayout><RefundPolicy /></CustomerLayout>} />
                      <Route path="/shipping-policy" element={<CustomerLayout><ShippingPolicy /></CustomerLayout>} />

                      {/* Contact Page */}
                      <Route path="/contact" element={<CustomerLayout><Contact /></CustomerLayout>} />

                      {/* ================= DEBUG ROUTES ================= */}
                      <Route path="/debug/razorpay" element={<RazorpayTest />} />
                      <Route path="/test-animations" element={<TestAnimations />} />

                      {/* ================= ADMIN LOGIN ================= */}
                      <Route path="/admin-login" element={<AdminLogin />} />

                      {/* ================= ADMIN ROUTES ================= */}
                      <Route element={<AdminRoute />}>
                        <Route path="/admin" element={<DashboardWrapper />} />
                        <Route path="/admin/products" element={<ProductsWrapper />} />
                        <Route path="/admin/products/edit/:id" element={<ProductEditWrapper />} />
                        <Route path="/admin/orders" element={<OrdersWrapper />} />
                        <Route path="/admin/orders/confirm/:orderId" element={<OrderConfirmationWrapper />} />
                                                <Route path="/admin/analytics" element={<AnalyticsWrapper />} />
                        <Route path="/admin/reports" element={<ReportsWrapper />} />
                        <Route path="/admin/upload" element={<UploadWrapper />} />
                        <Route path="/admin/cms/home" element={<HomeCMSWrapper />} />
                        <Route path="/admin/cms/footer" element={<FooterCMSWrapper />} />
                        <Route path="/admin/cms/our-story" element={<StoryCMSWrapper />} />
                        <Route path="/admin/pages" element={<PagesWrapper />} />
                        <Route path="/admin/contact-messages" element={<ContactMessagesWrapper />} />
                        <Route path="/admin/customers" element={<CustomersWrapper />} />
                        <Route path="/admin/settings" element={<SettingsWrapper />} />
                        <Route path="/admin/brands" element={<BrandsWrapper />} />
                        <Route path="/admin/categories" element={<CategoriesWrapper />} />
                        <Route path="/admin/coupons" element={<CouponWrapper />} />
                      </Route>

                      {/* Fallback */}
                      <Route path="*" element={<CustomerLayout><HomePage /></CustomerLayout>} />
                    </Routes>
                  </Suspense>

                </CartProvider>
              </ProductProvider>
            </CustomerOrderProvider>
          </AdminProductProvider>
        </EnhancedOrderProvider>
      </OrderProvider>
      </AdminAuthProvider>

    </Router>
  )
}

// ================= WRAPPERS (CLEAN FIX) =================

const DashboardWrapper = () => (
  <Suspense fallback={<LoadingFallback />}>
    <AdminOnlyLayout>
      <Dashboard />
    </AdminOnlyLayout>
  </Suspense>
)

const ProductsWrapper = () => (
  <Suspense fallback={<LoadingFallback />}>
    <AdminOnlyLayout>
      <ProductsManagement />
    </AdminOnlyLayout>
  </Suspense>
)

const ProductEditWrapper = () => (
  <Suspense fallback={<LoadingFallback />}>
    <AdminOnlyLayout>
      <ProductEdit />
    </AdminOnlyLayout>
  </Suspense>
)

const OrdersWrapper = () => (
  <Suspense fallback={<LoadingFallback />}>
    <AdminOnlyLayout>
      <AdminOrders />
    </AdminOnlyLayout>
  </Suspense>
)

const OrderConfirmationWrapper = () => (
  <Suspense fallback={<LoadingFallback />}>
    <AdminOnlyLayout>
      <OrderConfirmation />
    </AdminOnlyLayout>
  </Suspense>
)


const AnalyticsWrapper = () => (
  <Suspense fallback={<LoadingFallback />}>
    <AdminOnlyLayout>
      <Analytics />
    </AdminOnlyLayout>
  </Suspense>
)

const ReportsWrapper = () => (
  <Suspense fallback={<LoadingFallback />}>
    <AdminOnlyLayout>
      <AdminReports />
    </AdminOnlyLayout>
  </Suspense>
)

const UploadWrapper = () => (
  <Suspense fallback={<LoadingFallback />}>
    <AdminOnlyLayout>
      <ProductUpload />
    </AdminOnlyLayout>
  </Suspense>
)

const HomeCMSWrapper = () => (
  <Suspense fallback={<LoadingFallback />}>
    <AdminOnlyLayout>
      <HomePageEditor />
    </AdminOnlyLayout>
  </Suspense>
)

const FooterCMSWrapper = () => (
  <Suspense fallback={<LoadingFallback />}>
    <AdminOnlyLayout>
        <FooterEditor />
    </AdminOnlyLayout>
  </Suspense>
)

const StoryCMSWrapper = () => (
  <Suspense fallback={<LoadingFallback />}>
    <AdminOnlyLayout>
        <OurStoryEditor />
    </AdminOnlyLayout>
  </Suspense>
)

const PagesWrapper = () => (
  <Suspense fallback={<LoadingFallback />}>
    <AdminOnlyLayout>
      <Pages />
    </AdminOnlyLayout>
  </Suspense>
)

const ContactMessagesWrapper = () => (
  <Suspense fallback={<LoadingFallback />}>
    <AdminOnlyLayout>
      <ContactMessages />
    </AdminOnlyLayout>
  </Suspense>
)

const CustomersWrapper = () => (
  <Suspense fallback={<LoadingFallback />}>
    <AdminOnlyLayout>
      <AdminCustomers />
    </AdminOnlyLayout>
  </Suspense>
)

const SettingsWrapper = () => (
  <Suspense fallback={<LoadingFallback />}>
    <AdminOnlyLayout>
      <AdminSettings />
    </AdminOnlyLayout>
  </Suspense>
)

const CouponWrapper = () => (
  <Suspense fallback={<LoadingFallback />}>
    <AdminOnlyLayout>
        <CouponManagement />
    </AdminOnlyLayout>
  </Suspense>
)

const BrandsWrapper = () => (
  <Suspense fallback={<LoadingFallback />}>
    <AdminOnlyLayout>
      <BrandsManagement />
    </AdminOnlyLayout>
  </Suspense>
)

const CategoriesWrapper = () => (
  <Suspense fallback={<LoadingFallback />}>
    <AdminOnlyLayout>
      <CategoriesManagement />
    </AdminOnlyLayout>
  </Suspense>
)

export default App