import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HeartIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'
import { optimizeCloudinaryUrl } from '../../../utils/cloudinary'

const ProductCard = ({ product, onAddToCart }) => {
  const [imgError, setImgError] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);

  const productImage = optimizeCloudinaryUrl((product.images?.[0]) || product.image || null);
  const title = product.title || product.name || "Product";
  const brand = product.brand || product.category || "";
  const price = product.price || 0;
  const sellingPrice = product.selling_price || product.sellingPrice || price;
  const discount = price > sellingPrice
    ? Math.round(((price - sellingPrice) / price) * 100)
    : 0;

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

      {/* Discount badge */}
      {discount > 0 && (
        <span className="absolute top-3 left-3 z-10 bg-[#ae0b0b] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          -{discount}%
        </span>
      )}

      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {productImage && !imgError ? (
          <img
            src={optimizeCloudinaryUrl(productImage)}
            alt={product.name || product.title}
            loading="lazy"
            decoding="async"
            onError={(e) => {
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

        <div className="mt-3 flex items-center gap-2">
          <span className="text-base font-bold text-[#ae0b0b]">{formatPrice(sellingPrice)}</span>
          {discount > 0 && (
            <span className="text-xs text-gray-400 line-through">{formatPrice(price)}</span>
          )}
        </div>

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