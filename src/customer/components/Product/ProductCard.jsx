import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HeartIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'
import { optimizeCloudinaryUrl } from '../../../utils/cloudinary'
// ✅ IMPORT SHARED HELPERS
import {
  getProductImage,
  getSellingPrice,
  getOriginalPrice,
  getDiscountPercentage,
  getProductName,
  getProductBrand,
  getProductMaterial,
  getProductPurity,
  getProductWeight,
  isProductInStock,
  formatPrice,
  formatProductDetails,
  debugProductFields
} from '../../../utils/productHelpers'

const ProductCard = ({ product, onAddToCart }) => {
  const [imgError, setImgError] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);

  // 🔍 DEBUG: Log full product object from LISTING component
  debugProductFields(product, 'PRODUCT CARD (LISTING)');

  // ✅ FIXED: Use shared helpers for consistent field mapping
  const productImage = optimizeCloudinaryUrl(getProductImage(product));
  const title = getProductName(product);
  const brand = getProductBrand(product);
  const sellingPrice = getSellingPrice(product);
  const originalPrice = getOriginalPrice(product);
  const discount = getDiscountPercentage(product);
  
  const isBestSeller = product.isBestSeller || false;
  const isOnSale = product.isOnSale || false;
  const discountPercentage = product.discountPercentage || discount;

  const formatPrice = (p) =>
    typeof p === "number"
      ? `₹${p.toLocaleString("en-IN")}`
      : String(p);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (onAddToCart) onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">

      {/* Wishlist */}
      <button
        onClick={(e) => { e.preventDefault(); setWishlisted(!wishlisted); }}
        className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all"
      >
        {wishlisted
          ? <HeartSolid className="h-4 w-4 text-[#ae0b0b]" />
          : <HeartIcon className="h-4 w-4 text-gray-500" />}
      </button>

      {/* Badges - Prioritize On Sale if both are present */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {isOnSale && (
          <span className="bg-[#ae0b0b] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            💸 -{discountPercentage}%
          </span>
        )}
        {isBestSeller && !isOnSale && (
          <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            🔥 Best Seller
          </span>
        )}
      </div>

      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {productImage && !imgError ? (
          <img
            src={productImage}
            alt={title}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              setImgError(true);
              e.target.src = 'https://via.placeholder.com/400x400?text=No+Image'
            }}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <ShoppingBagIcon className="h-12 w-12 text-gray-300" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-4 flex flex-col flex-1">
        {brand && <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{brand}</p>}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug flex-1">{title}</h3>

        {/* ✅ UPDATED: New pricing display with MRP strikethrough - Match HomeSectionCard pattern */}
        <div className="mt-2">
          {originalPrice && originalPrice > sellingPrice ? (
            <div className="flex items-center gap-2">
              <span className="text-red-700 font-bold text-base">
                ₹{parseFloat(sellingPrice).toLocaleString('en-IN')}
              </span>
              <span className="text-gray-400 line-through text-sm">
                ₹{parseFloat(originalPrice).toLocaleString('en-IN')}
              </span>
            </div>
          ) : (
            <span className="text-red-700 font-bold text-base">
              ₹{parseFloat(sellingPrice).toLocaleString('en-IN')}
            </span>
          )}
          {discount > 0 && (
            <div className="text-green-600 text-xs font-medium">
              Save {discount}%
            </div>
          )}
        </div>

        {/* ✅ FIXED: Use shared helper for product details */}
        {formatProductDetails(product) && (
          <p className="text-xs text-gray-500 mt-1">
            {formatProductDetails(product)}
          </p>
        )}

        <p className={`text-sm font-semibold mt-2 ${isProductInStock(product) ? 'text-emerald-700' : 'text-red-600'}`}>
          {isProductInStock(product) ? 'In Stock' : 'Out of Stock'}
        </p>

        <button
          onClick={handleAddToCart}
          className={`mt-3 w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
            added
              ? 'bg-green-600 text-white'
              : 'bg-[#ae0b0b] hover:bg-[#8f0a0a] text-white'
          }`}
        >
          <ShoppingBagIcon className="h-4 w-4" />
          {added ? 'Added!' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;