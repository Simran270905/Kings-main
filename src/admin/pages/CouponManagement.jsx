import { useState, useEffect } from 'react'
import { couponApi } from '../../services/apiService'
import toast from 'react-hot-toast'
import AdminCard from '../layout/AdminCard'
import AdminButton from '../layout/AdminButton'

export default function CouponManagement() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)
  
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    usageLimit: '',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    isActive: true,
  })

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      const response = await couponApi.getAll()
      setCoupons(response.data || [])
    } catch (error) {
      toast.error('Failed to fetch coupons')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const token = localStorage.getItem('adminToken')
    if (!token) {
      toast.error('Admin authentication required')
      return
    }

    try {
      const data = {
        ...formData,
        discountValue: Number(formData.discountValue),
        minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : 0,
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
      }

      if (editingCoupon) {
        await couponApi.update(editingCoupon._id, data, token)
        toast.success('Coupon updated successfully')
      } else {
        await couponApi.create(data, token)
        toast.success('Coupon created successfully')
      }

      resetForm()
      fetchCoupons()
    } catch (error) {
      toast.error(error.message || 'Failed to save coupon')
    }
  }

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount || '',
      maxDiscountAmount: coupon.maxDiscountAmount || '',
      usageLimit: coupon.usageLimit || '',
      validFrom: coupon.validFrom.split('T')[0],
      validUntil: coupon.validUntil.split('T')[0],
      isActive: coupon.isActive,
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return

    const token = localStorage.getItem('adminToken')
    try {
      await couponApi.delete(id, token)
      toast.success('Coupon deleted successfully')
      fetchCoupons()
    } catch (error) {
      toast.error('Failed to delete coupon')
    }
  }

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minOrderAmount: '',
      maxDiscountAmount: '',
      usageLimit: '',
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: '',
      isActive: true,
    })
    setEditingCoupon(null)
    setShowForm(false)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">Loading coupons...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coupon Management</h1>
          <p className="text-gray-500 mt-2">Create and manage discount coupons</p>
        </div>
        <AdminButton onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Create Coupon'}
        </AdminButton>
      </div>

      {showForm && (
        <AdminCard>
          <h2 className="text-xl font-bold mb-6">{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Coupon Code *</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="e.g., WELCOME10"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ae0b0b] focus:border-transparent uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="e.g., Welcome discount"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ae0b0b] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type *</label>
                <select
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ae0b0b] focus:border-transparent"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Value * {formData.discountType === 'percentage' ? '(%)' : '(₹)'}
                </label>
                <input
                  type="number"
                  name="discountValue"
                  value={formData.discountValue}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                  placeholder="0"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ae0b0b] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Order Amount (₹)</label>
                <input
                  type="number"
                  name="minOrderAmount"
                  value={formData.minOrderAmount}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="0"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ae0b0b] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Discount Amount (₹)</label>
                <input
                  type="number"
                  name="maxDiscountAmount"
                  value={formData.maxDiscountAmount}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="Optional"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ae0b0b] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Usage Limit</label>
                <input
                  type="number"
                  name="usageLimit"
                  value={formData.usageLimit}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="Unlimited"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ae0b0b] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valid From *</label>
                <input
                  type="date"
                  name="validFrom"
                  value={formData.validFrom}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ae0b0b] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valid Until *</label>
                <input
                  type="date"
                  name="validUntil"
                  value={formData.validUntil}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ae0b0b] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-4 h-4 text-[#ae0b0b] border-gray-300 rounded focus:ring-[#ae0b0b]"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
            </div>

            <div className="flex gap-4">
              <AdminButton type="submit">
                {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
              </AdminButton>
              {editingCoupon && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </AdminCard>
      )}

      <AdminCard>
        <h2 className="text-xl font-bold mb-6">All Coupons ({coupons.length})</h2>
        
        {coupons.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No coupons created yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Code</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Value</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Min Order</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Usage</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Valid Until</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono font-bold text-[#ae0b0b]">{coupon.code}</td>
                    <td className="py-3 px-4 capitalize">{coupon.discountType}</td>
                    <td className="py-3 px-4">
                      {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                    </td>
                    <td className="py-3 px-4">₹{coupon.minOrderAmount}</td>
                    <td className="py-3 px-4">
                      {coupon.usedCount} / {coupon.usageLimit || '∞'}
                    </td>
                    <td className="py-3 px-4">{new Date(coupon.validUntil).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(coupon)}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(coupon._id)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  )
}
