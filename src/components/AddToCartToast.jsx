import React from 'react';
import toast from 'react-hot-toast';

const AddToCartToast = ({ productName, t }) => (
  <div className="flex items-center gap-3 bg-white rounded-lg shadow-lg border border-gray-100 px-4 py-3 min-w-[250px]">
    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-900">Added to cart!</p>
      <p className="text-xs text-gray-500 truncate">{productName}</p>
    </div>
  </div>
);

export const showAddToCartToast = (productName) => {
  console.log('showAddToCartToast called with productName:', productName);
  return toast.custom((t) => (
    <AddToCartToast productName={productName} t={t} />
  ), {
    duration: 2000,
    position: 'top-right',
  });
};

export default AddToCartToast;
