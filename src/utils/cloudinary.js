/**
 * Cloudinary image optimization helper
 * Adds f_auto,q_auto transforms for automatic format and quality optimization
 */

export const optimizeCloudinaryUrl = (url) => {
  if (!url || typeof url !== 'string') return url
  
  // Check if it's a Cloudinary URL
  if (!url.includes('res.cloudinary.com')) return url
  
  // Check if optimization already applied
  if (url.includes('f_auto') || url.includes('q_auto')) return url
  
  // Insert transforms after /upload/
  const optimized = url.replace(
    /\/upload\//,
    '/upload/f_auto,q_auto,c_limit,w_800/'
  )
  
  return optimized
}

export const optimizeCloudinaryUrlWithSize = (url, width = 800) => {
  if (!url || typeof url !== 'string') return url
  if (!url.includes('res.cloudinary.com')) return url
  if (url.includes('f_auto')) return url
  
  const optimized = url.replace(
    /\/upload\//,
    `/upload/f_auto,q_auto,c_limit,w_${width}/`
  )
  
  return optimized
}
