/**
 * Order validation utilities (FINAL VERSION)
 * =========================================
 * Production-ready validation for:
 * - Orders
 * - Payments (Razorpay)
 * - Totals integrity
 */

const VALID_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
const VALID_PAYMENT_STATUS = ['pending', 'paid', 'failed']

// ============================================================================
// MAIN VALIDATION
// ============================================================================

export const validateOrderData = (order) => {
  const errors = []

  if (!order) {
    return { valid: false, errors: ['Order is required'] }
  }

  // --------------------------------------------------------------------------
  // ORDER ID
  // --------------------------------------------------------------------------
  if (!order.orderId || typeof order.orderId !== 'string') {
    errors.push('Order ID must be a valid string')
  }

  // --------------------------------------------------------------------------
  // ITEMS
  // --------------------------------------------------------------------------
  if (!Array.isArray(order.items) || order.items.length === 0) {
    errors.push('Order must contain at least one item')
  } else {
    order.items.forEach((item, index) => {
      if (!item.id && !item.name) {
        errors.push(`Item ${index + 1}: missing id or name`)
      }

      if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
        errors.push(`Item ${index + 1}: invalid quantity`)
      }

      if (!Number.isFinite(item.price) || item.price < 0) {
        errors.push(`Item ${index + 1}: invalid price`)
      }
    })
  }

  // --------------------------------------------------------------------------
  // SHIPPING ADDRESS
  // --------------------------------------------------------------------------
  const addr = order.shippingAddress || {}

  if (!addr.firstName || !addr.lastName) {
    errors.push('Customer name required')
  }

  if (!addr.streetAddress) {
    errors.push('Street address required')
  }

  if (!addr.city || !addr.state) {
    errors.push('City and state required')
  }

  if (!addr.zipCode) {
    errors.push('ZIP code required')
  }

  // 🔥 Improved mobile validation (India-ready)
  if (!addr.mobile || !/^[6-9]\d{9}$/.test(addr.mobile)) {
    errors.push('Valid 10-digit mobile number required')
  }

  // --------------------------------------------------------------------------
  // TOTALS VALIDATION (🔥 IMPORTANT)
  // --------------------------------------------------------------------------
  if (!order.totals) {
    errors.push('Order totals missing')
  } else {
    const { subtotal, tax, total } = order.totals

    if (!Number.isFinite(subtotal)) {
      errors.push('Invalid subtotal')
    }

    if (!Number.isFinite(tax)) {
      errors.push('Invalid tax')
    }

    if (!Number.isFinite(total) || total < 0) {
      errors.push('Invalid total amount')
    }

    // 🔥 Validate math integrity
    const expectedTotal = Math.round((subtotal + tax) * 100) / 100

    if (Math.abs(expectedTotal - total) > 1) {
      errors.push('Total calculation mismatch')
    }
  }

  // --------------------------------------------------------------------------
  // STATUS
  // --------------------------------------------------------------------------
  if (order.status && !VALID_STATUSES.includes(order.status)) {
    errors.push(`Invalid order status`)
  }

  // --------------------------------------------------------------------------
  // 🔥 PAYMENT VALIDATION (RAZORPAY READY)
  // --------------------------------------------------------------------------
  if (order.paymentMethod) {
    const validMethods = ['COD', 'RAZORPAY']

    if (!validMethods.includes(order.paymentMethod)) {
      errors.push('Invalid payment method')
    }
  }

  if (order.paymentStatus && !VALID_PAYMENT_STATUS.includes(order.paymentStatus)) {
    errors.push('Invalid payment status')
  }

  // Razorpay-specific validation
  if (order.paymentMethod === 'RAZORPAY') {
    if (!order.razorpayOrderId) {
      errors.push('Missing Razorpay Order ID')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// ============================================================================
// DATE FORMATTERS
// ============================================================================

export const formatOrderDate = (isoDate) => {
  if (!isoDate) return 'N/A'

  try {
    const date = new Date(isoDate)
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return 'Invalid date'
  }
}

export const formatOrderTime = (isoDate) => {
  if (!isoDate) return 'N/A'

  try {
    const date = new Date(isoDate)
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return 'Invalid time'
  }
}

// ============================================================================
// STATUS COLORS
// ============================================================================

export const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'processing':
      return 'bg-blue-100 text-blue-800'
    case 'shipped':
      return 'bg-purple-100 text-purple-800'
    case 'delivered':
      return 'bg-green-100 text-green-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// ============================================================================
// PRICE FORMAT
// ============================================================================

export const formatPrice = (amount) => {
  return `₹${(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}

// ============================================================================
// SUMMARY
// ============================================================================

export const getOrderSummary = (order) => {
  if (!order) return 'Unknown order'

  const customer = order.shippingAddress
    ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`
    : 'Unknown'

  const itemCount = order.items?.length || 0
  const total = order.totals?.total || 0
  const status = order.status || 'unknown'

  return `${customer} • ${itemCount} item(s) • ${formatPrice(total)} • ${status}`
}
