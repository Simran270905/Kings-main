import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";
import { useCustomerOrder } from "../../../context/CustomerOrderContext";
import { UserCircleIcon, EnvelopeIcon, PhoneIcon, ShoppingBagIcon, ArrowRightOnRectangleIcon, ClockIcon, CheckCircleIcon, TruckIcon, XCircleIcon } from "@heroicons/react/24/outline";

const AccountPage = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { orders: userOrders, loading: ordersLoading, fetchUserOrders } = useCustomerOrder();

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fdf6ec] to-[#fff1e6] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl border border-[#f0e0c0] p-12 text-center max-w-sm w-full">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4">
            <UserCircleIcon className="h-8 w-8 text-[#ae0b0b]" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-500 text-sm mb-6">Please log in to access your account</p>
          <Link to="/login"
            className="inline-block px-8 py-3 bg-[#ae0b0b] text-white font-bold rounded-xl hover:bg-[#8f0a0a] transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    const result = logout();
    if (result && result.success) {
      navigate("/login");
    }
  };

  const displayName = user.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user.email || user.phone || 'Customer';

  const initials = (user.firstName?.[0] || '') + (user.lastName?.[0] || '') || displayName[0]?.toUpperCase() || 'U';

  // Fetch user orders when component mounts or user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserOrders();
    }
  }, [isAuthenticated, user]); // Remove fetchUserOrders to prevent infinite loop

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4 space-y-6">

        {/* Profile header */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#ae0b0b] to-[#d4350b] rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
              <p className="text-gray-500 text-sm mt-1">KKings Jewellery Member</p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-auto flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-red-600 border-2 border-red-200 rounded-xl hover:bg-red-50 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Profile details */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Profile Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {user.phone && (
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <PhoneIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{user.phone}</p>
                </div>
              </div>
            )}
            {user.email && (
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <EnvelopeIcon className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{user.email}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {user.addresses && user.addresses.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Saved Addresses</h2>
            <div className="grid grid-cols-1 gap-4">
              {user.addresses.map((addr, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="font-semibold text-gray-800">{addr.firstName} {addr.lastName} {addr.isDefault && '(Default)'}</p>
                  <p className="text-sm text-gray-600">{addr.streetAddress}</p>
                  <p className="text-sm text-gray-600">{addr.city}, {addr.state} {addr.zipCode}</p>
                  <p className="text-sm text-gray-600">{addr.email} | {addr.mobile}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order History */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
            <Link to="/orders" className="text-sm text-[#ae0b0b] hover:text-[#8f0a0a] font-medium">
              View All Orders →
            </Link>
          </div>

          {ordersLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ae0b0b] mx-auto"></div>
              <p className="text-gray-500 text-sm mt-2">Loading orders...</p>
            </div>
          ) : userOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBagIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">No orders yet</p>
              <Link to="/shop" className="text-[#ae0b0b] hover:text-[#8f0a0a] text-sm font-medium mt-2 inline-block">
                Start shopping →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {userOrders.slice(0, 3).map((order) => (
                <div key={order._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#ae0b0b] rounded-lg flex items-center justify-center text-white text-sm font-bold">
                      {order.items?.length || 0}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Order #{order._id.slice(-8)}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()} • ₹{(order.totalAmount || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'pending' ? 'bg-gray-100 text-gray-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {order.status === 'delivered' && <CheckCircleIcon className="w-3 h-3" />}
                      {order.status === 'shipped' && <TruckIcon className="w-3 h-3" />}
                      {order.status === 'cancelled' && <XCircleIcon className="w-3 h-3" />}
                      {order.status === 'pending' && <ClockIcon className="w-3 h-3" />}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link to="/shop"
              className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-100 hover:border-[#ae0b0b] hover:bg-[#fdf6ec] transition-all group">
              <ShoppingBagIcon className="h-5 w-5 text-gray-400 group-hover:text-[#ae0b0b]" />
              <span className="font-medium text-gray-700 group-hover:text-[#ae0b0b]">Continue Shopping</span>
            </Link>
            <Link to="/cart"
              className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-100 hover:border-[#ae0b0b] hover:bg-[#fdf6ec] transition-all group">
              <ShoppingBagIcon className="h-5 w-5 text-gray-400 group-hover:text-[#ae0b0b]" />
              <span className="font-medium text-gray-700 group-hover:text-[#ae0b0b]">View Cart</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
