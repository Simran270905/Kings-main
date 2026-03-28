import { useState, useEffect, useMemo } from 'react'
import useRealAnalytics from '../hooks/useRealAnalytics'
import { useProduct } from '../../customer/context/ProductContext'
import { useOrder } from '../context/OrderContext'
import AdminCard from '../layout/AdminCard'
import AdminButton from '../layout/AdminButton'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  ChartBarIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  UsersIcon,
  CalendarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'

export default function AdminReports() {
  const { products } = useProduct()
  
  // ✅ STEP 3: FIX ADMIN REPORTS DATA SOURCE
  // DO NOT use raw API or analytics
  // USE ONLY: const { orders } = useOrderContext();
  const { orders } = useOrder()
  const analytics = useRealAnalytics()

  const [timeRange, setTimeRange] = useState('30days')
  const [selectedPeriod, setSelectedPeriod] = useState('revenue')
  
  // ✅ STEP 2: CREATE CLEAN STATE
  const [chartData, setChartData] = useState([])

  // Calculate metrics from orders data (must be defined before useMemo hooks)
  const totalRevenue = (orders || []).reduce((sum, order) => {
    return sum + (order.totalAmount || 0);
  }, 0);

  const totalOrders = orders?.length || 0;

  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // ✅ STEP 4: FORCE ARRAY NORMALIZATION
  const safeOrders = Array.isArray(orders) ? orders : [];

  // ✅ STEP 9: DEBUG (MANDATORY)
  console.log("ORDERS:", orders);
  console.log("IS ARRAY:", Array.isArray(orders));
  console.log("SAFE ORDERS:", safeOrders);
  console.log("SAFE ORDERS LENGTH:", safeOrders.length);

  // ✅ DEBUG: Inspect first order to understand data structure
  if (safeOrders.length > 0) {
    console.log('ORDER SAMPLE:', safeOrders[0]);
    console.log('ORDER FIELDS:', Object.keys(safeOrders[0]));
  } else {
    console.log('NO ORDERS TO INSPECT');
  }

  // ✅ DEBUG: Inspect products structure for categories
  if (products && Array.isArray(products) && products.length > 0) {
    console.log('PRODUCT SAMPLE:', products[0]);
    console.log('PRODUCT FIELDS:', Object.keys(products[0]));
    console.log('PRODUCT CATEGORY FIELD:', products[0].category || products[0].categoryId || products[0].categoryName || 'NO CATEGORY FIELD');
  } else {
    console.log('NO PRODUCTS TO INSPECT');
  }

  // ✅ STEP 5: CREATE CHART DATA (ONLY FROM safeOrders)
  useEffect(() => {
    console.log("🔧 CRITICAL FIX: Creating chart data from safeOrders...")
    
    if (!safeOrders || safeOrders.length === 0) {
      console.log("📊 No safe orders, setting empty chart data")
      setChartData([]);
      return;
    }

    const newChartData = safeOrders.map((o, index) => {
      console.log(`📊 Processing order ${index}:`, o)
      console.log(`📊 Order ${index} createdAt:`, o.createdAt)
      console.log(`📊 Order ${index} totalAmount:`, o.totalAmount)
      
      const chartItem = {
        name: new Date(o.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: Number(o.totalAmount) || 0,
        orders: 1
      }
      
      console.log(`📊 Chart item ${index}:`, chartItem)
      return chartItem
    });

    console.log("📊 New chart data:", newChartData)
    console.log("📊 New chart data length:", newChartData.length)
    setChartData(newChartData);
    
  }, [safeOrders]);

  // ✅ STEP 6: HARD GUARD BEFORE RENDER
  if (!Array.isArray(chartData)) {
    console.error("❌ chartData is not an array:", chartData)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold">Invalid chart data</div>
          <div className="text-gray-500 text-sm mt-2">Please refresh the page</div>
        </div>
      </div>
    )
  }

  // ✅ STEP 7: DEBUG LOGS
  console.log("FINAL chartData:", chartData);
  console.log("IS ARRAY:", Array.isArray(chartData));

  // 📊 Bar Chart Data
  const barChartData = useMemo(() => {
    // Convert totalRevenue to array format for BarChart
    return [
      {
        month: 'Revenue',
        revenue: totalRevenue || 0,
        orders: totalOrders || 0
      }
    ]
  }, [totalRevenue, totalOrders])

  // 📊 Category Distribution (moved above debug logs to fix TDZ error)
  const categoryData = useMemo(() => {
    console.log("🔧 CATEGORY DATA TRANSFORMATION START")
    console.log("📊 Products:", products)
    console.log("📊 Products type:", typeof products)
    console.log("📊 Products isArray:", Array.isArray(products))
    
    if (!products || !Array.isArray(products) || products.length === 0) {
      console.log("📊 Category Chart: No products available, returning empty array")
      return []
    }

    console.log("📊 Category Chart Data Processing:", products.length, "products")

    const categories = {}

    products.forEach((p, index) => {
      console.log(`📊 Processing product ${index}:`, p)
      console.log(`📊 Product ${index} category field:`, p.category)
      console.log(`📊 Product ${index} all fields:`, Object.keys(p))
      
      if (p.category) {
        categories[p.category] = (categories[p.category] || 0) + 1
        console.log(`📊 Product ${index} category "${p.category}" count:`, categories[p.category])
      } else {
        console.log(`📊 Product ${index} has no category field`)
      }
    })

    console.log("📊 Categories object:", categories)

    const result = Object.entries(categories).map(([name, value]) => ({
      name,
      value,
    }))
    
    console.log("📊 Final Category Data:", result)
    console.log("📊 Final Category Data length:", result.length)
    return result
  }, [products])

  // ✅ DEBUG: Verify all chart data (moved after all declarations)
  console.log("🔍 CHART DATA VERIFICATION:")
  console.log("chartData:", chartData, "isArray:", Array.isArray(chartData))
  console.log("barChartData:", barChartData, "isArray:", Array.isArray(barChartData))
  console.log("categoryData:", categoryData, "isArray:", Array.isArray(categoryData))

  const COLORS = ['#ae0b0b', '#b91c1c', '#f59e0b', '#10b981', '#3b82f6']

  const formatCurrency = (amount) =>
    `₹${(amount || 0).toLocaleString('en-IN')}`

  // Export functionality
  const convertToCSV = (data) => {
    if (!data || data.length === 0) return ''
    
    const headers = Object.keys(data[0]).join(",")
    const rows = data.map(row =>
      Object.values(row).map(value => 
        typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value
      ).join(",")
    )
    return [headers, ...rows].join("\n")
  }

  const downloadCSV = () => {
    if (!orders || orders.length === 0) {
      alert("No data to export")
      return
    }

    // Prepare export data
    const exportData = orders.map(order => ({
      OrderID: order._id?.toString().slice(-8).toUpperCase() || 'N/A',
      Customer: order.user?.name || order.customer?.name || "Guest",
      Email: order.customer?.email || order.user?.email || "N/A",
      Amount: order.totalAmount || 0,
      PaymentMethod: order.paymentMethod || "N/A",
      PaymentStatus: order.paymentStatus || "N/A",
      OrderStatus: order.status || "N/A",
      Date: new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN'),
      Time: new Date(order.createdAt || Date.now()).toLocaleTimeString('en-IN')
    }))

    const csv = convertToCSV(exportData)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `orders-report-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Admin Reports
          </h1>
          <p className="mt-2 text-gray-600">
            Real-time analytics from your store
          </p>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
          </select>

          <AdminButton 
            variant="secondary"
            onClick={analytics.refresh}
            disabled={analytics.loading}
          >
            <ArrowTrendingUpIcon className="h-4 w-4 mr-2" />
            {analytics.loading ? 'Refreshing...' : 'Refresh'}
          </AdminButton>

          <AdminButton 
            variant="secondary"
            onClick={downloadCSV}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Export
          </AdminButton>
        </div>
      </div>

      {/* Charts Section */}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            title: 'Revenue',
            value: formatCurrency(analytics.data.revenue),
            icon: CurrencyDollarIcon,
          },
          {
            title: 'Orders',
            value: analytics.data.totalOrders || 0,
            icon: ShoppingBagIcon,
          },
          {
            title: 'Avg Order',
            value: formatCurrency(analytics.data.avgOrderValue),
            icon: ChartBarIcon,
          },
          {
            title: 'Users',
            value: analytics.data.totalUsers || 0,
            icon: UsersIcon,
          },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <AdminCard key={i}>
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <Icon className="h-6 w-6 text-[#ae0b0b]" />
              </div>
            </AdminCard>
          )
        })}
      </div>

      {/* Line Chart */}
      <AdminCard>
        <div className="flex justify-between mb-4">
          <h2 className="font-semibold">Sales Trends</h2>

          <div className="flex gap-2">
            <AdminButton
              size="sm"
              variant={selectedPeriod === 'revenue' ? 'primary' : 'secondary'}
              onClick={() => setSelectedPeriod('revenue')}
            >
              Revenue
            </AdminButton>

            <AdminButton
              size="sm"
              variant={selectedPeriod === 'orders' ? 'primary' : 'secondary'}
              onClick={() => setSelectedPeriod('orders')}
            >
              Orders
            </AdminButton>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          {chartData.length > 0 ? (
            <>
              <LineChart
                key={chartData.length}
                data={Array.isArray(chartData) ? chartData : []}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={selectedPeriod}
                  stroke="#ae0b0b"
                  strokeWidth={3}
                />
              </LineChart>
              <div className="mt-2 text-center text-xs text-gray-500">
                📊 Line Chart: {chartData.length} data points
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-gray-400 text-sm">No data available</div>
                <div className="text-xs text-gray-400 mt-1">Chart will appear when orders are available</div>
              </div>
            </div>
          )}
        </ResponsiveContainer>
      </AdminCard>

      {/* Bar + Pie */}
      <div className="grid md:grid-cols-2 gap-6">
        <AdminCard>
          <h2 className="mb-4 font-semibold">Orders</h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={Array.isArray(barChartData) ? barChartData : []}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#ae0b0b" />
            </BarChart>
            <div className="mt-2 text-center text-xs text-gray-500">
              📊 Bar Chart: {barChartData.length} data points
            </div>
          </ResponsiveContainer>
        </AdminCard>

        <AdminCard>
          <h2 className="mb-4 font-semibold">Categories</h2>

          <ResponsiveContainer width="100%" height={300}>
            {categoryData.length > 0 ? (
              <>
                <PieChart>
                  <Pie 
                    data={Array.isArray(categoryData) ? categoryData : []} 
                    dataKey="value" 
                    outerRadius={100}
                  >
                    {categoryData.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
                <div className="mt-2 text-center text-xs text-gray-500">
                  📊 Pie Chart: {categoryData.length} categories
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-gray-400 text-sm">No category data available</div>
                  <div className="text-xs text-gray-400 mt-1">Check products and categories</div>
                </div>
              </div>
            )}
          </ResponsiveContainer>
        </AdminCard>
      </div>
    </div>
  )
}
