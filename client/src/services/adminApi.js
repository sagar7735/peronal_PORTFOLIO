import api from './api'

export const authApi = {
  login: (data) => api.post('/api/auth/login', data),
  logout: () => api.post('/api/auth/logout'),
  me: () => api.get('/api/auth/me'),
  changePassword: (data) => api.put('/api/auth/change-password', data),
}

export const adminProfileApi = {
  update: (data) => api.put('/api/admin/profile', data),
}

export const adminSkillsApi = {
  getAll: () => api.get('/api/skills'),
  create: (data) => api.post('/api/admin/skills', data),
  update: (id, data) => api.put(`/api/admin/skills/${id}`, data),
  delete: (id) => api.delete(`/api/admin/skills/${id}`),
  reorder: (data) => api.patch('/api/admin/skills/reorder', data),
}

export const adminExperienceApi = {
  getAll: () => api.get('/api/experience'),
  create: (data) => api.post('/api/admin/experience', data),
  update: (id, data) => api.put(`/api/admin/experience/${id}`, data),
  delete: (id) => api.delete(`/api/admin/experience/${id}`),
  reorder: (data) => api.patch('/api/admin/experience/reorder', data),
}

export const adminProjectsApi = {
  getAll: (params) => api.get('/api/projects/admin', { params }),
  create: (data) => api.post('/api/projects', data),
  update: (id, data) => api.put(`/api/projects/${id}`, data),
  removeImage: (id, data) => api.delete(`/api/projects/${id}/image`, { data }),
  delete: (id) => api.delete(`/api/projects/${id}`),
  reorder: (data) => api.patch('/api/projects/reorder', data),
}

export const adminServicesApi = {
  getAll: () => api.get('/api/services/admin'),
  create: (data) => api.post('/api/services/admin', data),
  update: (id, data) => api.put(`/api/services/admin/${id}`, data),
  delete: (id) => api.delete(`/api/services/admin/${id}`),
  reorder: (data) => api.patch('/api/services/admin/reorder', data),
}

export const adminTestimonialsApi = {
  getAll: () => api.get('/api/testimonials/admin'),
  update: (id, data) => api.put(`/api/testimonials/admin/${id}`, data),
  delete: (id) => api.delete(`/api/testimonials/admin/${id}`),
  reorder: (data) => api.patch('/api/testimonials/admin/reorder', data),
}

export const adminFreelanceApi = {
  getAll: (params) => api.get('/api/freelance/admin', { params }),
  getOne: (id) => api.get(`/api/freelance/admin/${id}`),
  update: (id, data) => api.patch(`/api/freelance/admin/${id}`, data),
  delete: (id) => api.delete(`/api/freelance/admin/${id}`),
  exportCsv: () => api.get('/api/freelance/admin/export', { responseType: 'blob' }),
  getAttachmentUrl: (id) => `${import.meta.env.VITE_API_URL || 'https://peronal-portfolio-w98e.onrender.com'}/api/freelance/admin/${id}/attachment`,
}

export const adminMessagesApi = {
  getAll: (params) => api.get('/api/contact/admin', { params }),
  getOne: (id) => api.get(`/api/contact/admin/${id}`),
  update: (id, data) => api.patch(`/api/contact/admin/${id}`, data),
  delete: (id) => api.delete(`/api/contact/admin/${id}`),
}

export const adminAnalyticsApi = {
  getDashboardStats: () => api.get('/api/analytics/admin/dashboard-stats'),
}
