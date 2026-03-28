import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import { CartProvider } from './customer/context/CartContext'
import { ProductProvider } from './customer/context/ProductContext'
import { CustomerOrderProvider } from './customer/context/CustomerOrderContext'
import { AuthProvider } from './customer/context/AuthContext'
import { AdminAuthProvider } from './admin/context/AdminAuthContext'
import { OrderProvider } from './admin/context/OrderContext'
import { EnhancedOrderProvider } from './admin/context/EnhancedOrderContext'
import { AdminProductProvider } from './admin/context/AdminProductContext'

import Navbar from './customer/components/navigation/Navbar'
import Footer from './customer/components/Footer/Footer'
import DebugInfo from './components/DebugInfo'

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

import AdminLogin from './admin/AdminLogin'
import { AdminRoute } from './admin/AdminRoute'
import ProtectedRoute from './customer/components/ProtectedRoute'

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
      <AdminAuthProvider>
        <OrderProvider>
          <EnhancedOrderProvider>
            <AdminProductProvider>
              <AuthProvider>
                <CustomerOrderProvider>
                  <ProductProvider>
                    <CartProvider>

                      <Suspense fallback={<div className="p-6">Loading...</div>}>

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
        </AuthProvider>
      </AdminProductProvider>
    </EnhancedOrderProvider>
  </OrderProvider>
</AdminAuthProvider>
</Router>
  )
}

export default App

// ================= WRAPPERS (CLEAN FIX) =================

const DashboardWrapper = () => (
  <AdminOnlyLayout>
    <Dashboard />
  </AdminOnlyLayout>
)

const ProductsWrapper = () => (
  <AdminOnlyLayout>
    <ProductsManagement />
  </AdminOnlyLayout>
)

const ProductEditWrapper = () => (
  <AdminOnlyLayout>
    <ProductEdit />
  </AdminOnlyLayout>
)

const OrdersWrapper = () => (
  <AdminOnlyLayout>
    <AdminOrders />
  </AdminOnlyLayout>
)

const PaymentTrackingWrapper = () => (
  <AdminOnlyLayout>
    <PaymentTracking />
  </AdminOnlyLayout>
)

const AnalyticsWrapper = () => (
  <AdminOnlyLayout>
    <Analytics />
  </AdminOnlyLayout>
)

const ReportsWrapper = () => (
  <AdminOnlyLayout>
    <AdminReports />
  </AdminOnlyLayout>
)

const UploadWrapper = () => (
  <AdminOnlyLayout>
    <ProductUpload />
  </AdminOnlyLayout>
)

const HomeCMSWrapper = () => (
  <AdminOnlyLayout>
    <HomePageEditor />
  </AdminOnlyLayout>
)

const FooterCMSWrapper = () => (
  <AdminOnlyLayout>
    <FooterEditor />
  </AdminOnlyLayout>
)

const StoryCMSWrapper = () => (
  <AdminOnlyLayout>
    <OurStoryEditor />
  </AdminOnlyLayout>
)

const PagesWrapper = () => (
  <AdminOnlyLayout>
    <Pages />
  </AdminOnlyLayout>
)

const CustomersWrapper = () => (
  <AdminOnlyLayout>
    <AdminCustomers />
  </AdminOnlyLayout>
)

const SettingsWrapper = () => (
  <AdminOnlyLayout>
    <AdminSettings />
  </AdminOnlyLayout>
)

const CouponWrapper = () => (
  <AdminOnlyLayout>
    <CouponManagement />
  </AdminOnlyLayout>
)

const BrandsWrapper = () => (
  <AdminOnlyLayout>
    <BrandsManagement />
  </AdminOnlyLayout>
)

const CategoriesWrapper = () => (
  <AdminOnlyLayout>
    <CategoriesManagement />
  </AdminOnlyLayout>
)
