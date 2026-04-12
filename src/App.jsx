import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import { CartProvider } from './context/CartContext'
import { ProductProvider } from './context/ProductContext'
import { CustomerOrderProvider } from './context/CustomerOrderContext'
import { AuthProvider } from './context/AuthContext'
import { AdminAuthProvider } from './admin/context/AdminAuthContext'
import { OrderProvider } from './admin/context/OrderContext'
import AdminProductProvider from './admin/context/AdminProductContext' // ✅ FIXED IMPORT
import { EnhancedOrderProvider } from './admin/context/EnhancedOrderContext'
import ScrollToTop from './components/ScrollToTop'

import Navbar from './customer/components/navigation/Navbar'
import Footer from './customer/components/Footer/Footer'
import DebugInfo from './components/DebugInfo'
import RazorpayTest from './components/debug/RazorpayTest'

import HomePage from './customer/pages/HomePage/HomePage'
import OurStory from './customer/pages/OurStory/OurStory'
import Cart from './customer/components/Cart/Cart'
import Checkout from './customer/components/Checkout/Checkout'
import Login from './customer/components/Account/Login'
import Auth from './customer/components/Account/Auth'
import SignIn from './customer/components/Account/SignIn'
import Account from './customer/components/Account/Account'
import Payment from './customer/components/Payment/Payment'
import OrderSuccess from './customer/pages/OrderSuccess/OrderSuccess'
import Orders from './customer/pages/Orders/Orders'
import OrderTrack from './customer/pages/OrderTrack/OrderTrack'
import TrackOrderPage from './customer/pages/TrackOrder/TrackOrderPage'

// Legal Pages
import PrivacyPolicy from './customer/pages/Legal/PrivacyPolicy'
import TermsAndConditions from './customer/pages/Legal/TermsAndConditions'
import RefundPolicy from './customer/pages/Legal/RefundPolicy'
import ShippingPolicy from './customer/pages/Legal/ShippingPolicy'

// Contact Page
import Contact from './customer/pages/Contact/Contact'

import AdminLogin from './admin/AdminLogin'
import { AdminRoute } from './admin/AdminRoute'
import ProtectedRoute from './customer/components/ProtectedRoute'

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
const AdminOnlyLayout = lazy(() => import('./admin/AdminOnlyLayout'))
const Dashboard = lazy(() => import('./admin/layout/Dashboard'))
const ProductsManagement = lazy(() => import('./admin/layout/ProductsManagement'))
const Analytics = lazy(() => import('./admin/layout/Analytics'))
const AdminReports = lazy(() => import('./admin/pages/AdminReports'))
const ProductUpload = lazy(() => import('./admin/ProductUpload'))
const ProductEdit = lazy(() => import('./admin/ProductEdit'))
const AdminOrders = lazy(() => import('./admin/pages/AdminOrders'))
const AdminCustomers = lazy(() => import('./admin/pages/AdminCustomers'))
const AdminSettings = lazy(() => import('./admin/pages/AdminSettings'))
const CouponManagement = lazy(() => import('./admin/pages/CouponManagement'))
const HomePageEditor = lazy(() => import('./admin/layout/HomePageEditor'))
const FooterEditor = lazy(() => import('./admin/layout/FooterEditor'))
const OurStoryEditor = lazy(() => import('./admin/layout/OurStoryEditor'))
const Pages = lazy(() => import('./admin/layout/Pages'))
const ContactMessages = lazy(() => import('./admin/pages/ContactMessages'))
const BrandsManagement = lazy(() => import('./admin/layout/BrandsManagement'))
const CategoriesManagement = lazy(() => import('./admin/layout/CategoriesManagement'))
const PaymentTracking = lazy(() => import('./admin/pages/PaymentTracking'))

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

    <AuthProvider> 
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
                          <Route path="/checkout" element={<CustomerLayout><ProtectedRoute><Checkout /></ProtectedRoute></CustomerLayout>} />
                          <Route path="/payment" element={<CustomerLayout><Payment /></CustomerLayout>} />
                          <Route path="/login" element={<CustomerLayout><Login /></CustomerLayout>} />
                          <Route path="/signup" element={<CustomerLayout><Auth /></CustomerLayout>} />
                          <Route path="/account" element={<CustomerLayout><ProtectedRoute><Account /></ProtectedRoute></CustomerLayout>} />
                          <Route path="/orders" element={<CustomerLayout><ProtectedRoute><Orders /></ProtectedRoute></CustomerLayout>} />
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

                          {/* ================= ADMIN LOGIN ================= */}
                          <Route path="/admin-login" element={<AdminLogin />} />

                          {/* ================= ADMIN ROUTES ================= */}

                          {/* Dashboard */}
                          <Route
                            path="/admin"
                            element={
                              <AdminRoute><DashboardWrapper /></AdminRoute>
                            }
                          />

                          {/* Products */}
                          <Route
                            path="/admin/products"
                            element={
                              <AdminRoute><ProductsWrapper /></AdminRoute>
                            }
                          />

                          {/* Product Edit */}
                          <Route
                            path="/admin/products/edit/:id"
                            element={
                              <AdminRoute><ProductEditWrapper /></AdminRoute>
                            }
                          />

                          {/* Orders */}
                          <Route
                            path="/admin/orders"
                            element={
                              <AdminRoute><OrdersWrapper /></AdminRoute>
                            }
                          />

                          {/* Payment Tracking */}
                          <Route
                            path="/admin/payment-tracking"
                            element={
                              <AdminRoute><PaymentTrackingWrapper /></AdminRoute>
                            }
                          />

                          {/* Analytics */}
                          <Route
                            path="/admin/analytics"
                            element={
                              <AdminRoute><AnalyticsWrapper /></AdminRoute>
                            }
                          />

                          {/* Reports */}
                          <Route
                            path="/admin/reports"
                            element={
                              <AdminRoute><ReportsWrapper /></AdminRoute>
                            }
                          />

                          {/* Upload */}
                          <Route
                            path="/admin/upload"
                            element={
                              <AdminRoute><UploadWrapper /></AdminRoute>
                            }
                          />

                          {/* CMS */}
                          <Route
                            path="/admin/cms/home"
                            element={<AdminRoute><HomeCMSWrapper /></AdminRoute>}
                          />
                          <Route
                            path="/admin/cms/footer"
                            element={<AdminRoute><FooterCMSWrapper /></AdminRoute>}
                          />
                          <Route
                            path="/admin/cms/our-story"
                            element={<AdminRoute><StoryCMSWrapper /></AdminRoute>}
                          />

                          {/* Pages */}
                          <Route
                            path="/admin/pages"
                            element={<AdminRoute><PagesWrapper /></AdminRoute>}
                          />

                          {/* Contact Messages */}
                          <Route
                            path="/admin/contact-messages"
                            element={<AdminRoute><ContactMessagesWrapper /></AdminRoute>}
                          />

                          {/* Customers */}
                          <Route
                            path="/admin/customers"
                            element={<AdminRoute><CustomersWrapper /></AdminRoute>}
                          />

                          {/* Settings */}
                          <Route
                            path="/admin/settings"
                            element={<AdminRoute><SettingsWrapper /></AdminRoute>}
                          />

                          {/* Brands */}
                          <Route
                            path="/admin/brands"
                            element={<AdminRoute><BrandsWrapper /></AdminRoute>}
                          />

                          {/* Categories */}
                          <Route
                            path="/admin/categories"
                            element={<AdminRoute><CategoriesWrapper /></AdminRoute>}
                          />

                          {/* Coupons */}
                          <Route
                            path="/admin/coupons"
                            element={<AdminRoute><CouponWrapper /></AdminRoute>}
                          />

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
    </AuthProvider>

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

const PaymentTrackingWrapper = () => (
  <Suspense fallback={<LoadingFallback />}>
    <AdminOnlyLayout>
      <PaymentTracking />
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