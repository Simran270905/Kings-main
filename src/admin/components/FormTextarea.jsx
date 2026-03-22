'use client'

import { forwardRef } from 'react'

const FormTextarea = forwardRef(({ 
  label,
  error,
  helpText,
  required = false,
  className = '',
  textareaClassName = '',
  rows = 4,
  ...props 
}, ref) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={`
          w-full px-4 py-2.5 
          border-2 rounded-xl
          ${error ? 'border-red-300 bg-red-50' : 'border-gray-200'}
          focus:outline-none focus:ring-2 
          ${error ? 'focus:ring-red-500' : 'focus:ring-[#ae0b0b]'}
          focus:border-transparent
          transition-all duration-200
          disabled:bg-gray-100 disabled:cursor-not-allowed
          resize-none
          ${textareaClassName}
        `}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-600 font-medium">{error}</p>
      )}
      {helpText && !error && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  )
})

FormTextarea.displayName = 'FormTextarea'

export default FormTextarea
