import api from './api'

export const authService = {
  login: (email, password) => api.post('/customers/login', { email, password }),

  register: (data) => api.post('/customers/register', data),

  getProfile: () => api.get('/customers/profile'),

  updateProfile: (data) => api.put('/customers/profile', data),

  changePassword: (currentPassword, newPassword, confirmPassword) =>
    api.post('/customers/change-password', { currentPassword, newPassword, confirmPassword }),

  adminLogin: (password) => api.post('/admin/login', { password }),

  verifyAdminToken: () => api.get('/admin/verify'),

  adminLogout: () => api.post('/admin/logout', {})
}

export default authService
