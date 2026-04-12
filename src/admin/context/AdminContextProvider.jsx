import React from 'react'

// Simplified combined provider to avoid circular dependencies
export const AdminContextProvider = ({ children }) => {
  return (
    <React.Fragment>
      {children}
    </React.Fragment>
  )
}

export default AdminContextProvider
