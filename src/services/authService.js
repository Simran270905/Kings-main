import axiosInstance from "./axiosInstance"

export const login = async (identifier) => {
  try {
    let payload = {}

    // Detect mobile or email
    if (/^\d{10}$/.test(identifier)) {
      payload = { mobile: identifier }
    } else {
      payload = { email: identifier }
    }

    console.log(" Login payload:", payload)

    const response = await axiosInstance.post(
      "/customers/login",
      payload
    )

    console.log(" Login API response:", response)

    // Validate response
    if (!response || !response.data) {
      throw new Error("No response data from server")
    }

    // Save token
    if (response.data.data?.token) {
      localStorage.setItem("token", response.data.data.token)
    }

    // VERY IMPORTANT: RETURN DATA
    return response.data.data

  } catch (error) {
    console.error(" Login error full:", error)
    console.error(" Backend error:", error.response?.data)

    return {
      error: true,
      message: error.response?.data?.message || "Login failed"
    }
  }
}

export const authService = {
  login: (email, password) => api.post('/customers/login', { email, password }),

  register: (data) => api.post('/customers/register', data),

  getProfile: () => api.get('/customers/profile'),

  updateProfile: (data) => api.put('/customers/profile', data),

  changePassword: (currentPassword, newPassword, confirmPassword) =>
    api.post('/customers/change-password', { currentPassword, newPassword, confirmPassword }),

  adminLogin: (password) => api.post('/admin/login', { password }),

  verifyAdminToken: () => api.get('/admin/verify'),

  adminLogout: () => api.post('/admin/logout', {}),

  // ✅ NEW OTP METHODS
  sendOTP: (data) => api.post('/otp/send-otp', data),

  verifyOTP: (data) => api.post('/otp/verify-otp', data),

  resendOTP: (data) => api.post('/otp/resend-otp', data)
}

export default authService
