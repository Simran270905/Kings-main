// 🛡️ Admin Panel Safety Utilities
// Prevents crashes and ensures safe data rendering

/**
 * Safe string getter with fallback
 */
export const safeString = (value, fallback = "N/A") => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  return String(value);
};

/**
 * Safe number getter with fallback
 */
export const safeNumber = (value, fallback = 0) => {
  const num = Number(value);
  return isNaN(num) ? fallback : num;
};

/**
 * Safe array getter with fallback
 */
export const safeArray = (value, fallback = []) => {
  if (!Array.isArray(value)) {
    console.log("Admin Safety: Expected array, got:", typeof value, value);
    return fallback;
  }
  return value;
};

/**
 * Safe object getter with fallback
 */
export const safeObject = (value, fallback = {}) => {
  if (value === null || value === undefined || typeof value !== 'object') {
    console.log("Admin Safety: Expected object, got:", typeof value, value);
    return fallback;
  }
  return value;
};

/**
 * Safe customer name extraction
 */
export const safeCustomerName = (order) => {
  if (!order) return "N/A";
  
  // Try customer.name first (new structure)
  if (order.customer?.name) {
    return safeString(order.customer.name);
  }
  
  // Fallback to firstName + lastName (old structure)
  const firstName = safeString(order.customer?.firstName, "");
  const lastName = safeString(order.customer?.lastName, "");
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`.trim();
  }
  
  return firstName || lastName || "Guest User";
};

/**
 * Safe customer email extraction
 */
export const safeCustomerEmail = (order) => {
  if (!order) return "N/A";
  return safeString(order.customer?.email || order.customer?.email);
};

/**
 * Safe customer phone extraction
 */
export const safeCustomerPhone = (order) => {
  if (!order) return "N/A";
  return safeString(order.customer?.phone || order.customer?.mobile);
};

/**
 * Safe order amount extraction
 */
export const safeOrderAmount = (order) => {
  if (!order) return 0;
  
  // Try different amount fields
  const amount = order.totalAmount || order.total || order.amount || 0;
  return safeNumber(amount);
};

/**
 * Safe order status extraction
 */
export const safeOrderStatus = (order) => {
  if (!order) return "unknown";
  return safeString(order.status, "pending");
};

/**
 * Safe order date extraction
 */
export const safeOrderDate = (order) => {
  if (!order) return null;
  
  const date = order.createdAt || order.date || order.created;
  return date ? new Date(date) : null;
};

/**
 * Safe product name extraction
 */
export const safeProductName = (product) => {
  if (!product) return "Unnamed Product";
  return safeString(product.name || product.title || product.productName);
};

/**
 * Safe category name extraction
 */
export const safeCategoryName = (category) => {
  if (!category) return "Unnamed Category";
  return safeString(category.name || category.categoryName);
};

/**
 * Safe brand name extraction
 */
export const safeBrandName = (brand) => {
  if (!brand) return "Unnamed Brand";
  return safeString(brand.name || brand.brandName);
};

/**
 * Admin data logger for debugging
 */
export const logAdminData = (component, data, operation = "load") => {
  console.log(`🔍 Admin [${component}] ${operation}:`, {
    dataType: typeof data,
    isArray: Array.isArray(data),
    length: Array.isArray(data) ? data.length : undefined,
    keys: data && typeof data === 'object' ? Object.keys(data) : undefined,
    data: data
  });
};

/**
 * Safe API response handler
 */
export const safeApiResponse = async (apiCall, componentName = "Unknown") => {
  try {
    const response = await apiCall;
    logAdminData(componentName, response, "success");
    return response;
  } catch (error) {
    console.error(`❌ Admin API Error [${componentName}]:`, error);
    return { success: false, error: error.message, data: null };
  }
};

/**
 * Extract unique customers from orders
 */
export const extractCustomersFromOrders = (orders) => {
  const safeOrders = safeArray(orders);
  const customerMap = new Map();
  
  safeOrders.forEach(order => {
    const email = safeCustomerEmail(order);
    const phone = safeCustomerPhone(order);
    const name = safeCustomerName(order);
    
    // Use email as primary key, phone as fallback
    const key = email !== "N/A" ? email : phone;
    
    if (!customerMap.has(key)) {
      customerMap.set(key, {
        name,
        email,
        phone,
        totalOrders: 1,
        totalSpent: safeOrderAmount(order),
        lastOrder: safeOrderDate(order),
        orders: [order]
      });
    } else {
      const customer = customerMap.get(key);
      customer.totalOrders += 1;
      customer.totalSpent += safeOrderAmount(order);
      customer.orders.push(order);
      
      // Update last order date if newer
      const orderDate = safeOrderDate(order);
      if (orderDate && (!customer.lastOrder || orderDate > customer.lastOrder)) {
        customer.lastOrder = orderDate;
      }
    }
  });
  
  return Array.from(customerMap.values());
};

/**
 * Safe currency formatter
 */
export const safeCurrency = (amount, currency = "₹") => {
  const safeAmount = safeNumber(amount);
  return `${currency}${safeAmount.toFixed(2)}`;
};

/**
 * Safe date formatter
 */
export const safeDate = (date, options = {}) => {
  if (!date) return "N/A";
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Invalid Date";
    
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    
    return d.toLocaleDateString('en-US', { ...defaultOptions, ...options });
  } catch (error) {
    console.error("Admin Date Format Error:", error);
    return "Date Error";
  }
};
