// NEW FILE - Admin Reviews Management
import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import api from '../../services/api'

const AdminReviews = () => {
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [filter, setFilter] = useState('pending') // pending, approved, rejected, all
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [selectedReview, setSelectedReview] = useState(null)
  const [showModerationModal, setShowModerationModal] = useState(false)
  const [moderationNote, setModerationNote] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check authentication on mount and before API calls
  useEffect(() => {
    const token = localStorage.getItem('kk_admin_token') || sessionStorage.getItem('kk_admin_token')
    setIsAuthenticated(!!token)
    
    if (token) {
      fetchReviews()
      fetchStats()
    } else {
      setLoading(false)
      toast.error('Please log in to access reviews')
    }
  }, [filter, page])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const endpoint = filter === 'pending' 
        ? `/reviews/admin/pending?page=${page}&limit=20`
        : `/reviews/admin/pending?page=${page}&limit=20` // For now, only pending reviews
      
      const response = await api.get(endpoint)
      
      if (page === 1) {
        setReviews(response.reviews || [])
      } else {
        setReviews(prev => [...prev, ...(response.reviews || [])])
      }
      
      setHasMore(response.pagination?.hasMore || false)
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
      // Don't show toast for token expiration - API handles redirect
      if (!error.message?.includes('Session expired')) {
        toast.error('Failed to load reviews')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/reviews/admin/stats')
      setStats(response)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      // Don't show toast for token expiration - API handles redirect
      if (!error.message?.includes('Session expired')) {
        toast.error('Failed to load statistics')
      }
    }
  }

  const handleApprove = async (reviewId, note = '') => {
    try {
      setActionLoading(true)
      const response = await api.patch(`/reviews/${reviewId}/approve`, {
        moderationNote: note
      })

      if (response.data.success) {
        toast.success('Review approved successfully')
        setReviews(prev => prev.filter(r => r._id !== reviewId))
        fetchStats()
      }
    } catch (error) {
      console.error('Failed to approve review:', error)
      toast.error(error.response?.data?.error || 'Failed to approve review')
    } finally {
      setActionLoading(false)
      setShowModerationModal(false)
      setSelectedReview(null)
      setModerationNote('')
    }
  }

  const handleReject = async (reviewId, note = '') => {
    try {
      setActionLoading(true)
      const response = await api.patch(`/reviews/${reviewId}/reject`, {
        moderationNote: note
      })

      if (response.data.success) {
        toast.success('Review rejected successfully')
        setReviews(prev => prev.filter(r => r._id !== reviewId))
        fetchStats()
      }
    } catch (error) {
      console.error('Failed to reject review:', error)
      toast.error(error.response?.data?.error || 'Failed to reject review')
    } finally {
      setActionLoading(false)
      setShowModerationModal(false)
      setSelectedReview(null)
      setModerationNote('')
    }
  }

  const openModerationModal = (review, action) => {
    setSelectedReview({ ...review, action })
    setShowModerationModal(true)
  }

  const confirmModeration = () => {
    if (!selectedReview) return

    if (selectedReview.action === 'approve') {
      handleApprove(selectedReview._id, moderationNote)
    } else {
      handleReject(selectedReview._id, moderationNote)
    }
  }

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1 text-sm">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
          >
            &#9733;
          </span>
        ))}
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const renderStatsCards = () => {
    if (!stats) return null

    const statusStats = stats.stats.reduce((acc, stat) => {
      acc[stat._id] = stat
      return acc
    }, {})

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
            </div>
            <div className="text-blue-500 text-2xl">!</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{statusStats.pending?.count || 0}</p>
            </div>
            <div className="text-yellow-500 text-2xl">!</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{statusStats.approved?.count || 0}</p>
            </div>
            <div className="text-green-500 text-2xl">!</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{statusStats.rejected?.count || 0}</p>
            </div>
            <div className="text-red-500 text-2xl">!</div>
          </div>
        </div>
      </div>
    )
  }

  const renderReviewCard = (review) => (
    <div key={review._id} className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
              {review.status}
            </span>
            {renderStars(review.rating)}
            <span className="text-sm text-gray-500">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
          
          <div className="space-y-1 text-sm text-gray-600">
            <p><strong>Email:</strong> {review.email}</p>
            <p><strong>Order ID:</strong> {review.orderId}</p>
            <p><strong>Product:</strong> {review.productId?.name || 'N/A'}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => openModerationModal(review, 'approve')}
            disabled={actionLoading}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            Approve
          </button>
          <button
            onClick={() => openModerationModal(review, 'reject')}
            disabled={actionLoading}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            Reject
          </button>
        </div>
      </div>

      <div className="border-t pt-4">
        <p className="text-gray-700 leading-relaxed mb-3">{review.comment}</p>
        
        {/* Display review images */}
        {review.images?.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-600 mb-2">Review Images:</p>
            <div className="grid grid-cols-4 gap-2">
              {review.images.map((img, i) => (
                <img
                  key={i}
                  src={img.url}
                  alt={`Review image ${i + 1}`}
                  className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(img.url, '_blank')}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {review.moderatedBy && (
        <div className="mt-4 pt-4 border-t text-sm text-gray-500">
          <p><strong>Moderated by:</strong> {review.moderatedBy?.name || 'Admin'}</p>
          {review.moderatedAt && (
            <p><strong>Moderated at:</strong> {new Date(review.moderatedAt).toLocaleDateString()}</p>
          )}
          {review.moderationNote && (
            <p><strong>Note:</strong> {review.moderationNote}</p>
          )}
        </div>
      )}
    </div>
  )

  if (loading && page === 1) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Show login message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Authentication Required</h3>
          <p className="text-yellow-700 mb-4">Please log in to access the Review Management panel.</p>
          <a 
            href="/admin-login" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            Go to Admin Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Review Management</h1>
        <p className="text-gray-600">Moderate and manage customer reviews</p>
      </div>

      {/* Stats Cards */}
      {renderStatsCards()}

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {['pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setFilter(status)
                  setPage(1)
                }}
                className={`py-4 px-6 border-b-2 font-medium text-sm capitalize ${
                  filter === status
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {status}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 text-4xl mb-4">!</div>
            <p className="text-gray-500">No {filter} reviews found</p>
          </div>
        ) : (
          reviews.map(renderReviewCard)
        )}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setPage(prev => prev + 1)}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {/* Moderation Modal */}
      {showModerationModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {selectedReview.action === 'approve' ? 'Approve Review' : 'Reject Review'}
            </h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Rating:</strong> {renderStars(selectedReview.rating)}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Comment:</strong> {selectedReview.comment}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Email:</strong> {selectedReview.email}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Moderation Note (optional)
              </label>
              <textarea
                value={moderationNote}
                onChange={(e) => setModerationNote(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a note for this moderation action..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModerationModal(false)
                  setSelectedReview(null)
                  setModerationNote('')
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmModeration}
                disabled={actionLoading}
                className={`px-4 py-2 rounded-md text-white transition-colors ${
                  selectedReview.action === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50`}
              >
                {actionLoading ? 'Processing...' : selectedReview.action === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminReviews
