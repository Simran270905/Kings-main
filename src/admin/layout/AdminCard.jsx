'use client'

import { forwardRef } from 'react'

const AdminCard = forwardRef(({ 
  children, 
  className = '', 
  padding = 'p-6',
  hover = false,
  border = true 
}, ref) => {
  return (
    <div
      ref={ref}
      className={`
        bg-white rounded-xl 
        ${border ? 'border border-gray-200' : ''}
        shadow-sm
        ${padding}
        ${hover ? 'hover:shadow-lg hover:border-gray-300 transition-all duration-200' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
})

AdminCard.displayName = 'AdminCard'

export default AdminCard
