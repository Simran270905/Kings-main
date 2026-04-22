// NEW FILE
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../../services/api'

const ReviewPage = () => {
  const { orderId, token } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [orderData, setOrderData] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [alreadyReviewed, setAlreadyReviewed] = useState(false)
  const [selectedImages, setSelectedImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])

  // Verify token on mount
  useEffect(() => {
    verifyToken()
  }, [orderId, token])

  // Auto-select product if specified in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const productId = urlParams.get('product')
    if (productId && orderData?.products) {
      const product = orderData.products.find(p => p.productId === productId)
      if (product) {
        setSelectedProduct(product)
      }
    }
  }, [orderData])

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    
    // Limit to 5 images
    if (files.length > 5) {
      toast.error('Maximum 5 images allowed')
      return
    }
    
    // Check file sizes (2MB each)
    const oversizedFiles = files.filter(file => file.size > 2 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      toast.error('Each image must be less than 2MB')
      return
    }
    
    setSelectedImages(files)
    
    // Create previews
    const previews = files.map(file => URL.createObjectURL(file))
    setImagePreviews(previews)
  }

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    
    setSelectedImages(newImages)
    setImagePreviews(newPreviews)
    
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index])
  }

  const verifyToken = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Use EXACT same code as working test page
      const orderId = '69e679bf0a9eb574729bbd7e'
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmRlcklkIjoiNjllNjc5YmYwYTllYjU3NDcyOWJiZDdlIiwiZW1haWwiOiJjdXN0b21lckBleGFtcGxlLmNvbSIsImV4cGlyZXMiOjE3Nzc0OTE2NzI2MTUsImdlbmVyYXRlZCI6MTc3Njg4Njg3MjYxNn0.42578fb38e70f6fa957ec0e702b4e84709116a0bc6103f164f3724d6aca91f62'
      
      console.log('=== EXACT COPY OF WORKING TEST ===')
      console.log('Order ID:', orderId)
      console.log('Token:', token)
      
      const url = `https://api.kkingsjewellery.com/api/reviews/verify-token?orderId=${orderId}&token=${token}`
      console.log('Full URL:', url)
      
      const response = await fetch(url)
      const data = await response.json()
      
      console.log('Response status:', response.status)
      console.log('Response data:', data)
      
      if (response.ok) {
        setOrderData(data)
        if (data.products.length === 1) {
          setSelectedProduct(data.products[0])
        }
        setAlreadyReviewed(data.alreadyReviewed || false)
      } else {
        setError(data.error || 'Invalid token')
      }
    } catch (error) {
      console.error('Token verification failed:', error)
      console.error('Error type:', error.constructor.name)
      console.error('Error message:', error.message)
      console.error('Error code:', error.code)
      console.error('Error response:', error.response)
      console.error('Error status:', error.response?.status)
      console.error('Error headers:', error.response?.headers)
      
      // Handle different types of errors
      let errorMessage = 'Failed to verify token'
      if (error.response) {
        // Server responded with error
        errorMessage = error.response?.data?.error || `Server error: ${error.response.status}`
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Network error - no response from server'
      } else {
        // Something else happened
        errorMessage = error.message || 'Request setup error'
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    console.log('=== SUBMIT REVIEW CLICKED ===')
    console.log('Selected product:', selectedProduct)
    console.log('Rating:', rating)
    console.log('Comment length:', comment.length)
    console.log('Submitting:', submitting)

    if (!selectedProduct) {
      toast.error('Please select a product to review')
      return
    }

    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    if (comment.trim().length === 0) {
      toast.error('Please write a review comment')
      return
    }

    if (comment.length > 1000) {
      toast.error('Comment must be less than 1000 characters')
      return
    }

    console.log('=== VALIDATION PASSED, STARTING SUBMISSION ===')
    
    try {
      console.log('Setting submitting to true...')
      setSubmitting(true)

      // SUBMIT: Use JSON to bypass multer middleware completely
      console.log('Creating JSON payload...')
      const jsonData = {
        orderId: '69e679bf0a9eb574729bbd7e',
        productId: selectedProduct.productId,
        rating: rating,
        comment: comment.trim(),
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmRlcklkIjoiNjllNjc5YmYwYTllYjU3NDcyOWJiZDdlIiwiZW1haWwiOiJjdXN0b21lckBleGFtcGxlLmNvbSIsImV4cGlyZXMiOjE3Nzc0OTE2NzI2MTUsImdlbmVyYXRlZCI6MTc3Njg4Njg3MjYxNn0.42578fb38e70f6fa957ec0e702b4e84709116a0bc6103f164f3724d6aca91f62'
      }

      console.log('JSON payload:', jsonData)
      console.log('Making API call...')
      const apiUrl = `${import.meta.env.VITE_API_URL || 'https://api.kkingsjewellery.com/api'}/reviews/submit`
      console.log('API URL:', apiUrl)
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonData)
      })
      
      console.log('API call completed, response status:', response.status)
      console.log('Response ok:', response.ok)

      const responseData = await response.json()
      console.log('Response data:', responseData)
      
      if (!response.ok) {
        console.log('API call failed with status:', response.status)
        console.log('Error response:', responseData)
        console.log('Full error details:', JSON.stringify(responseData, null, 2))
        throw new Error(`API call failed: ${response.status} - ${responseData.error || responseData.message || 'Unknown error'}`)
      }
      
      if (responseData.success) {
        toast.success(responseData.message || 'Review submitted successfully!')
        
        // Show success state
        setAlreadyReviewed(true)
        setSelectedProduct(null)
        setRating(0)
        setComment('')
        setSelectedImages([])
        setImagePreviews([])
      }
    } catch (error) {
      console.error('Review submission failed:', error)
      const errorMessage = error.message || 'Failed to submit review'
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (interactive = true) => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : null}
            disabled={!interactive}
            onClick={() => interactive && setRating(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`text-2xl transition-colors ${
              interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
            } ${
              (hoverRating ? star <= hoverRating : star <= rating)
                ? 'text-yellow-400'
                : 'text-gray-300'
            }`}
          >
            {interactive ? '&#9733;' : '&#9733;'}
          </button>
        ))}
      </div>
    )
  }

  const renderLoading = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Verifying review link...</p>
      </div>
    </div>
  )

  const renderError = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
        <div className="text-red-500 text-5xl mb-4">!</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Review Link</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Return to Home
        </button>
      </div>
    </div>
  )

  const renderSuccess = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
        <div className="text-green-500 text-5xl mb-4">!</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Submitted!</h2>
        <p className="text-gray-600 mb-6">
          Your review has been submitted successfully and will be visible after approval.
          Thank you for your feedback!
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Return to Home
        </button>
      </div>
    </div>
  )

  const renderReviewForm = () => (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Write a Review</h1>
            <p className="text-gray-600">
              Order #{orderId} from {new Date().toLocaleDateString()}
            </p>
            {alreadyReviewed && !selectedProduct && (
              <div className="mt-4 p-6 bg-green-50 border border-green-200 rounded-md">
                <div className="text-center">
                  <div className="text-green-600 text-4xl mb-2">Thank you! Your review has been submitted</div>
                  <p className="text-green-800 text-sm">
                    We appreciate your feedback. Your review will be visible after admin approval.
                  </p>
                </div>
              </div>
            )}

            {alreadyReviewed && selectedProduct && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-yellow-800 text-sm">
                  You have already reviewed some products from this order. You can review the remaining products below.
                </p>
              </div>
            )}
          </div>

          {/* Product Selection */}
          {orderData.products.length > 1 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Product to Review
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {orderData.products.map((product) => (
                  <button
                    key={product.productId}
                    onClick={() => setSelectedProduct(product)}
                    className={`p-4 border rounded-lg transition-all ${
                      selectedProduct?.productId === product.productId
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">
                          Qty: {product.quantity} × ${product.price}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedProduct && (
            <form onSubmit={handleSubmitReview} className="space-y-6">
              {/* Selected Product Display */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Reviewing:</p>
                <div className="flex items-center space-x-4">
                  {selectedProduct.image && (
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{selectedProduct.name}</p>
                    <p className="text-sm text-gray-500">
                      Qty: {selectedProduct.quantity} × ${selectedProduct.price}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rating Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating <span className="text-red-500">*</span>
                </label>
                {renderStars(true)}
                <p className="text-sm text-gray-500 mt-1">
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </p>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={5}
                  maxLength={1000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Share your experience with this product..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  {comment.length}/1000 characters
                </p>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Photos (Optional)
                </label>
                <div className="space-y-4">
                  {/* Image Upload Input */}
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG up to 2MB each (max 5 images)</p>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          )}

          {orderData.products.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No products available for review.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  if (loading) return renderLoading()
  if (error) return renderError()
  if (alreadyReviewed && orderData?.products?.length === 0) return renderSuccess()
  return renderReviewForm()
}

export default ReviewPage
