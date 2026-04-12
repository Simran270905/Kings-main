import api from './api'

export const productService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return api.get(`/products${query ? `?${query}` : ''}`)
  },

  getById: (id) => api.get(`/products/${id}`),

  getByCategory: (category, limit = 10) =>
    api.get(`/products/category/${category}?limit=${limit}`),

  create: (productData) => api.post('/products', productData),

  update: (id, updates) => api.put(`/products/${id}`, updates),

  delete: (id) => api.delete(`/products/${id}`),

  getStats: () => api.get('/products/stats')
}

export default productService
