// NEW FILE
import React, { useState, useEffect } from 'react'
import api from '../../services/api'

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [productId, page])

  const refreshReviews = () => {
    console.log('🔄 Refreshing reviews for productId:', productId)
    setPage(1) // Reset to first page and trigger fetch
  }

  const fetchReviews = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔍 Fetching reviews for productId:', productId)
      const response = await api.get(`/reviews/product/${productId}?page=${page}&limit=10`)
      
      console.log('📊 API Response:', response)
      console.log('📝 Reviews received:', response.data?.reviews || [])
      console.log('📈 Stats received:', response.data || {})
      
      if (page === 1) {
        setReviews(response.data?.reviews || [])
      } else {
        setReviews(prev => [...prev, ...(response.data?.reviews || [])])
      }
      
      setStats(response.data || {})
      setHasMore(response.pagination?.hasMore || false)
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
      setError('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1)
    }
  }

  const renderStars = (rating, size = 'text-sm') => {
    return (
      <div className={`flex gap-1 ${size}`}>
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

  const renderRatingDistribution = () => {
    if (!stats || stats.totalReviews === 0) return null

    const ratingCounts = stats.ratingCounts || {}
    const ratingBars = [
      { stars: 5, count: ratingCounts['5'] || 0 },
      { stars: 4, count: ratingCounts['4'] || 0 },
      { stars: 3, count: ratingCounts['3'] || 0 },
      { stars: 2, count: ratingCounts['2'] || 0 },
      { stars: 1, count: ratingCounts['1'] || 0 }
    ]

    return (
      <div className="space-y-2">
        {ratingBars.map(({ stars, count }) => {
          const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0
          return (
            <div key={stars} className="flex items-center gap-2">
              <div className="flex items-center gap-1 w-16">
                <span className="text-sm text-gray-600">{stars}</span>
                <span className="text-yellow-400 text-sm">&#9733;</span>
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-yellow-400 h-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="w-12 text-right">
                <span className="text-sm text-gray-600">{count}</span>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderReviewItem = (review) => (
    <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {renderStars(review.rating)}
            {review.verifiedPurchase && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                &#10004; Verified Purchase
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">{review.displayName}</span>
            <span>·</span>
            <span>{review.formattedDate}</span>
          </div>
        </div>
        {review.helpful > 0 && (
          <div className="text-sm text-gray-500">
            {review.helpful} {review.helpful === 1 ? 'person' : 'people'} found this helpful
          </div>
        )}
      </div>
      <p className="text-gray-700 leading-relaxed mb-3">{review.comment}</p>
      
      {/* ADD: Display review images */}
      {review.images?.length > 0 && (
        <div className="review-images">
          <div className="grid grid-cols-3 gap-2 mt-3">
            {review.images.map((img, i) => (
              <img
                key={i}
                src={img.url}
                alt={`Review image ${i + 1}`}
                className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => {
                  // Simple image preview - could be enhanced with a modal
                  window.open(img.url, '_blank')
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )

  if (loading && page === 1) {
    return (
      <div className="py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-b border-gray-200 pb-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">{error}</p>
        <button
          onClick={fetchReviews}
          className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!stats || stats.totalReviews === 0) {
    return (
      <div className="py-8 text-center">
        <div className="text-gray-400 text-4xl mb-4">!</div>
        <p className="text-gray-500">No reviews yet for this product</p>
        <p className="text-sm text-gray-400 mt-2">Be the first to share your experience!</p>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Customer Reviews</h3>
        <button
          onClick={refreshReviews}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Refreshing...' : 'Refresh Reviews'}
        </button>
      </div>
      
      {/* Review Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Average Rating */}
        <div className="text-center">
          <div className="text-5xl font-bold text-gray-900 mb-2">
            {stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
          </div>
          {renderStars(Math.round(stats.averageRating || 0), 'text-2xl')}
          <p className="text-gray-600 mt-2">
            {stats.totalReviews || 0} {(stats.totalReviews || 0) === 1 ? 'Review' : 'Reviews'}
          </p>
        </div>

        {/* Rating Distribution */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Rating Distribution</h4>
          {renderRatingDistribution()}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {console.log('🎨 Rendering reviews list:', reviews.length, 'reviews')}
        {reviews.map(renderReviewItem)}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Loading...' : 'Load More Reviews'}
          </button>
        </div>
      )}

      {/* Reviews Count */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500 text-center">
          Showing {reviews.length} of {stats.totalReviews || 0} reviews
        </p>
      </div>
    </div>
  )
}

export default ProductReviews
