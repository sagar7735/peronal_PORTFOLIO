import api from './api'

export const profileApi = {
  get: () => api.get('/api/profile'),
}
export const skillsApi = {
  getAll: () => api.get('/api/skills'),
}
export const experienceApi = {
  getAll: () => api.get('/api/experience'),
}
export const projectsApi = {
  getAll: (params) => api.get('/api/projects', { params }),
  getBySlug: (slug) => api.get(`/api/projects/${slug}`),
}
export const servicesApi = {
  getAll: () => api.get('/api/services'),
}
export const testimonialsApi = {
  getAll: () => api.get('/api/testimonials'),
  submit: (data) => api.post('/api/testimonials', data),
}
export const freelanceApi = {
  apply: (data) => api.post('/api/freelance/apply', data),
}
export const contactApi = {
  send: (data) => api.post('/api/contact', data),
}
export const analyticsApi = {
  track: (page) => api.post('/api/analytics/track', { page }),
}
