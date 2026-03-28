import React, { useState } from 'react'
import { useOrder } from '../context/OrderContext'
import AdminCard from '../layout/AdminCard'
import AdminButton from '../layout/AdminButton'

import {
  ShoppingBagIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  MagnifyingGlassIcon,
  DownloadIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert
} from '@mui/material'

// Import data extraction helper
import { extractData, logApiCall, logApiResponse } from '../../utils/dataExtractionHelper.js'

const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'warning'
    case 'confirmed': return 'info'
    case 'processing': return 'info'
    case 'shipped': return 'primary'
    case 'delivered': return 'success'
    case 'cancelled': return 'error'
    case 'refunded': return 'error'
    default: return 'default'
  }
}

const getPaymentStatusColor = (status) => {
  switch (status) {
    case 'paid': return 'success'
    case 'pending': return 'warning'
    case 'failed': return 'error'
    case 'refunded': 'warning'
    default: return 'default'
  }
}

const getPaymentMethodColor = (method) => {
  switch (method) {
    case 'razorpay': return 'primary'
    case 'cod': 'warning'
    case 'upi': 'info'
    case 'card': 'success'
    default: 'default'
  }
}

export default function EnhancedOrders() {
  const {
    orders,
    loading,
    fetchOrders,
    getOrderDetails,
    updateOrderStatus,
    getStats
  } = useOrder()

  // Local state for filters
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    paymentMethod: '',
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  // Calculate stats from orders
  const stats = getStats()

  // Calculate payment breakdown
  const paymentStatusBreakdown = orders.reduce((acc, order) => {
    const status = order.paymentStatus || 'pending'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})

  const paymentMethodBreakdown = orders.reduce((acc, order) => {
    const method = order.paymentMethod || 'unknown'
    acc[method] = (acc[method] || 0) + 1
    return acc
  }, {})

  console.log("EnhancedOrders - Orders:", orders)
  console.log("EnhancedOrders - Stats:", stats)

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value })
  }

  // Handle page change
  const handlePageChange = (event, newPage) => {
    setFilters({ ...filters, page: newPage })
  }

  // Handle order details
  const handleViewDetails = async (orderId) => {
    try {
      const order = await getOrderDetails(orderId)
      console.log(order)
    } catch (error) {
      console.error('Failed to fetch order details:', error)
    }
  }

  // Handle COD payment marking
  const handleMarkCODAsPaid = async (orderId) => {
    try {
      // Update order status to paid
      await updateOrderStatus(orderId, 'paid')
      
      // Show success message
      alert('COD order marked as paid successfully!')
    } catch (error) {
      console.error('Failed to mark COD order as paid:', error)
      alert('Failed to mark COD order as paid. Please try again.')
    }
  }

  // Handle export
  const handleExport = () => {
    try {
      exportPaymentReports({
        ...filters,
        startDate: filters.startDate || '',
        endDate: filters.endDate || ''
      })
    } catch (error) {
      console.error('Failed to export reports:', error)
      alert('Failed to export reports. Please try again.')
    }
  }

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString('en-IN')}`
  }

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Format time
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading && orders.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Box textAlign="center">
          <ClockIcon className="h-12 w-12 text-gray-400 mb-4" />
          <Typography variant="h6" color="text.gray-500">
            Loading orders...
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" component="h2">
          Payment Tracking System
        </Typography>
        <Typography variant="body2" color="text.gray.600">
          Track all payment methods and transaction details
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box mb={3}>
        <Box display="grid" gridTemplateColumns={{ xs: 1, sm: 2, md: 4 }} gap={2}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="text.gray-600">
              Total Orders
            </Typography>
            <Typography variant="h4" color="text.primary">
              {stats.totalOrders}
            </Typography>
          </Paper>
          
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="text.gray-600">
              Total Revenue
            </Typography>
            <Typography variant="h4" color="success.main">
              {formatCurrency(stats.totalRevenue)}
            </Typography>
          </Paper>
          
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="text.gray-600">
              Paid Orders
            </Typography>
            <Typography variant="h4" color="success.main">
              {stats.paymentStatusBreakdown?.paid || 0}
            </Typography>
          </Paper>
          
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            < Typography variant="h6" color="text.gray-600">
              Pending Orders
            </Typography>
            <Typography variant="h4" color="warning.main">
              {stats.paymentStatusBreakdown?.pending || 0}
            </Typography>
          </Paper>
        </Box>
      </Box>

      {/* Filters */}
      <Box mb={3}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" mb={2}>
            Filters
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel size="small">Status</InputLabel>
              <Select
                size="small"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="shipped">Shipped</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="refunded">Refunded</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel size="small">Payment Status</InputLabel>
              <Select
                size="small"
                value={filters.paymentStatus}
                onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
              >
                <MenuItem value="">All Payment Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="refunded">Refunded</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel size="small">Payment Method</InputLabel>
              <Select
                size="small"
                value={filters.paymentMethod}
                onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
              >
                <MenuItem value="">All Methods</MenuItem>
                <MenuItem value="cod">Cash on Delivery</MenuItem>
                <MenuItem value="razorpay">Razorpay</MenuItem>
                <MenuItem value="upi">UPI</MenuItem>
                <MenuItem value="card">Card</MenuItem>
              </Select>
            </FormControl>
            
            <Button
              variant="outlined"
              size="small"
              startIcon={<MagnifyingGlassIcon />}
              onClick={() => fetchOrders()}
            >
              Search
            </Button>
            
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport()}
            >
              Export
            </Button>
            
            <Button
              variant="outlined"
              size="small"
              startIcon={<ArrowTrendingUpIcon />}
              onClick={() => resetFilters()}
            >
              Reset
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Orders Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Payment Method</TableCell>
                <TableCell>Payment Status</TableCell>
                <TableCell>Amount Paid</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Transaction ID</TableCell>
                <TableCell>Payment Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>
                    <Typography variant="body2">
                      #{order._id.toString().slice(-8).toUpperCase()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {order.customer?.name || `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || 'Guest User'}
                    </Typography>
                    <Typography variant="caption" color="text.gray">
                      {order.customer?.email || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.paymentMethod?.toUpperCase() || 'N/A'}
                      color={getPaymentMethodColor(order.paymentMethod)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.paymentStatus?.toUpperCase() || 'N/A'}
                      color={getPaymentStatusColor(order.paymentStatus)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatCurrency(order.amountPaid)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatCurrency(order.totalAmount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" style={{ fontSize: '0.75rem' }}>
                      {order.razorpayPaymentId || order.razorpayOrderId || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {order.paymentDate ? formatDate(order.paymentDate) : 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.status?.toUpperCase() || 'N/A'}
                      color={getStatusColor(order.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(order._id)}
                        color="primary"
                      >
                        <MagnifyingGlassIcon fontSize="small" />
                      </IconButton>
                      
                      {order.paymentMethod === 'cod' && order.paymentStatus === 'pending' && order.status === 'delivered' && (
                        <IconButton
                          size="small"
                          onClick={() => handleMarkCODAsPaid(order._id)}
                          color="success"
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      )}
                      
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          // Handle order cancellation or other actions
                          console.log('Order actions for:', order._id)
                        }}
                      >
                        <XCircleIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 2, mb: 2 }}>
          <Typography variant="body2" color="text.gray-600">
            Showing {orders.length} of {stats.totalOrders} orders
          </Typography>
          <Box>
            <Button
              variant="outlined"
              size="small"
              disabled={filters.page <= 1}
              onClick={() => handlePageChange(null, parseInt(filters.page) - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handlePageChange(null, parseInt(filters.page) + 1)}
              disabled={orders.length < filters.limit}
            >
              Next
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4
          }}
          onClick={() => setSelectedOrder(null)}
        >
          <Paper sx={{ p: 4, maxWidth: 600, width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
            <Typography variant="h6" mb={2}>
              Order Details
            </Typography>
            
            {detailsLoading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <ClockIcon className="animate-spin" />
                <Typography ml={2}>Loading...</Typography>
              </Box>
            ) : (
              <Box>
                <Typography variant="subtitle1" gutterBottom={2}>
                  Order #{selectedOrder._id?.toString().slice(-8).toUpperCase()}
                </Typography>
                
                <Typography variant="body2" color="text.gray-600" gutterBottom={2}>
                  Customer: {selectedOrder.customer?.firstName} {selectedOrder.customer?.lastName}
                </Typography>
                
                <Typography variant="body2" color="text.gray-600" gutterBottom={2}>
                  Email: {selectedOrder.customer?.email}
                </Typography>
                
                <Typography variant="body2" color="text.gray-600" gutterBottom={2}>
                  Mobile: {selectedOrder.customer?.mobile}
                </Typography>
                
                <Typography variant="body2" color="text.gray-600" gutterBottom={2}>
                  Address: {selectedOrder.shippingAddress?.streetAddress}, {selectedOrder.shippingAddress?.city}
                </Typography>
                
                <Typography variant="h6" gutterBottom={2}>
                  Payment Information
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Payment Method:</Typography>
                    <Chip
                      label={selectedOrder.paymentMethod?.toUpperCase() || 'N/A'}
                      color={getPaymentMethodColor(selectedOrder.paymentMethod)}
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Payment Status:</Typography>
                    <Chip
                      label={selectedOrder.paymentStatus?.toUpperCase() || 'N/A'}
                      color={getPaymentStatusColor(selectedOrder.paymentStatus)}
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Amount Paid:</Typography>
                    <Typography variant="body2" color="success.main">
                      {formatCurrency(selectedOrder.amountPaid)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Total Amount:</Typography>
                    <Typography variant="body2" color="text.primary">
                      {formatCurrency(selectedOrder.totalAmount)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Transaction ID:</Typography>
                    <Typography variant="body2" style={{ fontSize: '0.75rem' }}>
                      {selectedOrder.razorpayPaymentId || selectedOrder.razorpayOrderId || 'N/A'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Payment Date:</Typography>
                    <Typography variant="body2">
                      {selectedOrder.paymentDate ? formatDate(selectedOrder.paymentDate) : 'N/A'}
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="h6" gutterBottom={2}>
                  Order Items
                </Typography>
                
                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {selectedOrder.items?.map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #e0e0e0' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2">{item.name}</Typography>
                        <Typography variant="caption" color="text.gray">
                          {item.quantity} x ₹{item.price}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2">
                          {formatCurrency(item.subtotal)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
                
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setSelectedOrder(null)}
                    fullWidth
                  >
                    Close
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>
      )}
    </Box>
  )
}
