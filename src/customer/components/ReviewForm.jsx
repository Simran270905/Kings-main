import { useState } from 'react'
import { toast } from 'react-hot-toast'
import api from '../../services/api'

const ReviewForm = ({ productId, orderId, productName, productImage, onSubmit }) => {
  const [token] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('token');
  });
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [selectedImages, setSelectedImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])

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

  const handleSubmit = async (e) => {
    e.preventDefault()

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

    try {
      setSubmitting(true)

      // Submit review using FormData for image upload
      const formData = new FormData()
      formData.append('orderId', orderId)
      formData.append('productId', productId)
      formData.append('rating', rating)
      formData.append('comment', comment.trim())
      formData.append('token', token)

      // Add images to FormData
      selectedImages.forEach((image, index) => {
        formData.append(`images`, image)
      })

      const response = await api.post('/reviews/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.success) {
        toast.success(response.data.message || 'Review submitted successfully!')
        onSubmit()
      }
    } catch (error) {
      console.error('Review submission failed:', error)
      const errorMessage = error.response?.data?.error || 'Failed to submit review'
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product Display */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm font-medium text-gray-700 mb-2">Reviewing:</p>
        <div className="flex items-center space-x-4">
          {productImage && (
            <img
              src={productImage}
              alt={productName}
              className="w-12 h-12 object-cover rounded"
            />
          )}
          <div>
            <p className="font-medium text-gray-900">{productName}</p>
            <p className="text-sm text-gray-500">Order #{orderId}</p>
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
          onClick={onSubmit}
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
  )
}

export default ReviewForm
