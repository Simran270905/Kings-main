/**
 * Shared product helper functions to ensure consistent field mapping
 * across all components (ProductCard, ProductDetails, etc.)
 */

// ✅ IMAGE HELPERS
export const getProductImage = (product) => {
  if (!product) return '/placeholder.jpg';
  
  return product.images?.[0] || 
         product.image || 
         product.imageUrl || 
         product.thumbnail || 
         '/placeholder.jpg';
};

export const getProductImages = (product) => {
  if (!product) return [];
  
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    return product.images.map((img, index) => ({
      src: img,
      alt: `${getProductName(product)} - Image ${index + 1}`,
    }));
  }
  
  // Fallback to single image
  const singleImage = getProductImage(product);
  if (singleImage && singleImage !== '/placeholder.jpg') {
    return [{
      src: singleImage,
      alt: getProductName(product),
    }];
  }
  
  return [];
};

// ✅ PRICE HELPERS - Updated for new pricing structure
export const getSellingPrice = (product) => {
  if (!product) return 0;
  
  // This is the ACTUAL SELLING PRICE (what customer actually pays)
  return product.sellingPrice || 
         product.selling_price || 
         product.discountedPrice || 
         product.salePrice || 
         0;
};

export const getOriginalPrice = (product) => {
  if (!product) return null;
  
  // This is now the ORIGINAL PRICE / MRP (strikethrough price)
  return product.originalPrice || 
         product.original_price || 
         product.mrp || 
         null;
};

export const getDiscountPercentage = (product) => {
  const sellingPrice = getSellingPrice(product);  // Discounted Price
  const originalPrice = getOriginalPrice(product); // Original Price / MRP
  
  if (!originalPrice || !sellingPrice || originalPrice <= sellingPrice) {
    return 0;
  }
  
  return Math.round(((originalPrice - sellingPrice) / originalPrice) * 100);
};

// ✅ NEW HELPER: Get purchase price (internal only)
export const getPurchasePrice = (product) => {
  if (!product) return 0;
  
  // This is the COST PRICE - never shown to customers
  return product.purchasePrice || 
         product.cost_price || 
         product.wholesalePrice || 
         0;
};

// ✅ NEW HELPER: Calculate profit per unit
export const calculateProfit = (product) => {
  const sellingPrice = getSellingPrice(product);  // What customer pays
  const purchasePrice = getPurchasePrice(product); // What we paid
  
  return sellingPrice - purchasePrice;
};

// ✅ PRODUCT INFO HELPERS
export const getProductName = (product) => {
  if (!product) return 'Product';
  
  return product.name || 
         product.title || 
         product.productName || 
         'Product';
};

export const getProductBrand = (product) => {
  if (!product) return '';
  
  return product.brand || 
         product.category || 
         '';
};

export const getProductMaterial = (product) => {
  if (!product) return 'Gold';
  
  return product.material || 'Gold';
};

export const getProductPurity = (product) => {
  if (!product) return null;
  
  return product.purity || null;
};

export const getProductWeight = (product) => {
  if (!product) return null;
  
  return product.weight || null;
};

export const getProductDescription = (product) => {
  if (!product) return '';
  
  return product.description || '';
};

export const getProductCategory = (product) => {
  if (!product) return null;
  
  return product.category?.name || 
         product.categoryName || 
         product.category || 
         null;
};

// ✅ STOCK HELPERS
export const isProductInStock = (product) => {
  if (!product) return false;
  
  if (product.hasSizes && product.sizes) {
    return product.sizes.some(size => size.stock > 0);
  }
  
  return product.inStock !== false && (product.stock || 0) > 0;
};

export const getProductStock = (product) => {
  if (!product) return 0;
  
  if (product.hasSizes && product.sizes) {
    return product.sizes.reduce((total, size) => total + (size.stock || 0), 0);
  }
  
  return product.stock || 0;
};

// ✅ FORMATTING HELPERS
export const formatPrice = (price) => {
  if (typeof price !== "number" || isNaN(price) || price === null || price === undefined) {
    return "₹0";
  }
  
  return `₹${price.toLocaleString("en-IN")}`;
};

export const formatProductDetails = (product) => {
  const details = [];
  
  const material = getProductMaterial(product);
  if (material) details.push(material);
  
  const purity = getProductPurity(product);
  if (purity) details.push(purity);
  
  const weight = getProductWeight(product);
  if (weight) details.push(`${weight}g`);
  
  return details.join(' · ');
};

// ✅ DEBUG HELPER (Disabled to prevent console spam)
export const debugProductFields = (product, componentName = 'Unknown') => {
  // Debug logging disabled to prevent console spam
  return;
};
