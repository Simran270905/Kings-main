'use client'

import { useState, useEffect, Fragment } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  MagnifyingGlassIcon,
  UserCircleIcon,
  ShoppingBagIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { Popover, Dialog, Transition } from '@headlessui/react'
import { useAuth } from '../../context/useAuth'
import { useCart } from '../../context/useCart'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [shopCategories, setShopCategories] = useState([])
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { cartItems } = useCart()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/categories`)
        const data = await res.json()
        setShopCategories(data.data?.categories || [])
      } catch {
        setShopCategories([])
      }
    }
    fetchCategories()
  }, [])
  const cartCount = cartItems?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0

  const handleAccountClick = () => {
    if (isAuthenticated) {
      navigate('/account')
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="sticky top-0 z-50 bg-white">

      {/* Announcement */}
      <header>
        <p className="flex h-10 items-center justify-center bg-[#ae0b0b] text-sm font-medium text-white">
          Get 10% off on First Purchase
        </p>
      </header>

      {/* Navbar */}
      <nav className="border-b border-gray-200">

        {/* Top Row */}
        <div className="relative max-w-7xl mx-auto px-4 lg:px-6 h-20 flex items-center justify-between">

          {/* Left */}
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-[#ae0b0b]"
              onClick={() => setMobileOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            <Link to="/">
              <img
                src="https://res.cloudinary.com/dkbxrhe1v/image/upload/v1768829821/logo1_xqrmjy.png"
                className="h-11"
                alt="KKings"
              />
            </Link>
          </div>

          {/* Brand */}
          <h1 className="hidden lg:block text-3xl font-serif font-bold text-[#ae0b0b]">
            KKings_Jewellery
          </h1>

          <h1 className="absolute left-1/2 -translate-x-1/2 lg:hidden text-lg font-serif font-bold text-[#ae0b0b]">
            KKings_Jewellery
          </h1>

          {/* Icons */}
          <div className="flex items-center gap-5 text-[#ae0b0b]">
            <button
              onClick={handleAccountClick}
              className="cursor-pointer hover:opacity-70 transition"
              title={isAuthenticated ? 'My Account' : 'Login'}
            >
              <UserCircleIcon className="h-6 w-6" />
            </button>

            <Link to="/cart" className="relative" title="Cart">
              <ShoppingBagIcon className="h-6 w-6 cursor-pointer" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#ae0b0b] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:block border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-center items-center gap-14">

            {/* Home */}
            <Link
              to="/"
              className="font-medium hover:text-[#ae0b0b]"
            >
              Home
            </Link>

            {/* Shop All */}
            <Popover className="relative">
              {({ close }) => (
                <>
                  <Popover.Button className="font-medium text-[#ae0b0b]">
                    Shop All
                  </Popover.Button>

                  <Transition as={Fragment}>
                    <Popover.Panel className="absolute left-1/2 -translate-x-1/2 top-full mt-6 w-[95vw] max-w-[1100px] max-h-[80vh] bg-white shadow-2xl border p-10 rounded-2xl z-50 overflow-y-auto">
                      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                        {shopCategories.length === 0 ? (
                          <div className="col-span-4 text-center py-8 text-gray-400">
                            <p>No categories available yet.</p>
                          </div>
                        ) : (
                          shopCategories.map((cat) => (
                            <Link
                              key={cat._id || cat.name}
                              to={`/shop/${cat.name.toLowerCase()}`}
                              onClick={() => close()}
                              className="text-center group"
                            >
                              {cat.image ? (
                                <img
                                  src={cat.image}
                                  alt={cat.name}
                                  className="rounded-xl aspect-square object-cover group-hover:scale-105 transition"
                                />
                              ) : (
                                <div className="rounded-xl aspect-square bg-gray-100 flex items-center justify-center group-hover:scale-105 transition">
                                  <span className="text-4xl font-bold text-gray-300">{cat.name[0]}</span>
                                </div>
                              )}
                              <p className="mt-3 font-medium">{cat.name}</p>
                              <span className="text-sm text-[#ae0b0b]">Explore →</span>
                            </Link>
                          ))
                        )}
                      </div>
                    </Popover.Panel>
                  </Transition>
                </>
              )}
            </Popover>

            {/* Our Story */}
            <Link
              to="/our-story"
              className="font-medium hover:text-[#ae0b0b]"
            >
              Our Story
            </Link>

          </div>
        </div>

        {/* Mobile Menu */}
        <Dialog open={mobileOpen} onClose={setMobileOpen} className="lg:hidden">
          <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" />
          <Dialog.Panel className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white z-50 flex flex-col">

            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-serif font-bold text-[#ae0b0b]">KKings Jewellery</h2>
              <button onClick={() => setMobileOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <XMarkIcon className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-6 space-y-2">
              <Link to="/" onClick={() => setMobileOpen(false)}
                className="flex items-center px-4 py-3 rounded-xl font-semibold text-gray-800 hover:bg-[#fdf6ec] hover:text-[#ae0b0b] transition-colors">
                Home
              </Link>
              <Link to="/shop" onClick={() => setMobileOpen(false)}
                className="flex items-center px-4 py-3 rounded-xl font-semibold text-[#ae0b0b] hover:bg-[#fdf6ec] transition-colors">
                Shop All
              </Link>
              <Link to="/our-story" onClick={() => setMobileOpen(false)}
                className="flex items-center px-4 py-3 rounded-xl font-semibold text-gray-800 hover:bg-[#fdf6ec] hover:text-[#ae0b0b] transition-colors">
                Our Story
              </Link>

              <div className="pt-4 border-t">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4">Categories</p>
                {shopCategories.map(cat => (
                  <Link
                    key={cat._id || cat.name}
                    to={`/shop/${cat.name.toLowerCase()}`}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-700 hover:bg-[#fdf6ec] hover:text-[#ae0b0b] transition-colors"
                  >
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-400">{cat.name[0]}</span>
                      </div>
                    )}
                    <span className="font-medium">{cat.name}</span>
                  </Link>
                ))}
              </div>
            </nav>

            <div className="p-6 border-t space-y-3">
              <button
                onClick={() => { handleAccountClick(); setMobileOpen(false); }}
                className="w-full py-3 border-2 border-[#ae0b0b] text-[#ae0b0b] font-semibold rounded-xl hover:bg-[#ae0b0b] hover:text-white transition-colors"
              >
                {isAuthenticated ? 'My Account' : 'Login / Sign Up'}
              </button>
              <Link to="/cart" onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#ae0b0b] text-white font-semibold rounded-xl hover:bg-[#8f0a0a] transition-colors">
                <ShoppingBagIcon className="h-5 w-5" />
                Cart {cartCount > 0 && `(${cartCount})`}
              </Link>
            </div>
          </Dialog.Panel>
        </Dialog>

      </nav>
    </div>
  )
}