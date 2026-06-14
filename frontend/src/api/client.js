import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

// Request interceptor — attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tims_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor — handle 401 (token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || ''
    if (error.response?.status === 401 && !requestUrl.includes('/auth/login')) {
      localStorage.removeItem('tims_token')
      localStorage.removeItem('tims_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

export const authAPI = {
  // Backend uses OAuth2PasswordRequestForm: form-data with `username` field
  login: (employee_id, password) => {
    const formData = new URLSearchParams()
    formData.append('username', employee_id)
    formData.append('password', password)
    return api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
  },
  signup: (data) => api.post('/auth/signup', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  getNotifications: () => api.get('/auth/notifications'),
  markRead: (id) => api.put(`/auth/notifications/${id}/read`),
}

export const toolsAPI = {
  list: (params) => api.get('/tools', { params }),
  get: (id) => api.get(`/tools/${id}`),
  create: (data) => api.post('/tools', data),
  update: (id, data) => api.put(`/tools/${id}`, data),
}

export const requisitionsAPI = {
  list: (params) => api.get('/requisitions', { params }),
  get: (id) => api.get(`/requisitions/${id}`),
  create: (data) => api.post('/requisitions', data),
  approve: (id) => api.put(`/requisitions/${id}/approve`),
  reject: (id, reason) => api.put(`/requisitions/${id}/reject`, { reason }),
  cancel: (id) => api.put(`/requisitions/${id}/cancel`),
}

export const issuanceAPI = {
  list: (params) => api.get('/issuance', { params }),
  overdue: () => api.get('/issuance/overdue'),
  issue: (data) => api.post('/issuance', data),
}

export const returnsAPI = {
  processReturn: (issuance_id, data) => api.post(`/returns/${issuance_id}`, data),
}

export const dashboardAPI = {
  summary: () => api.get('/dashboard/summary'),
  myIssuances: () => api.get('/dashboard/my-issuances'),
}

export const reportsAPI = {
  stock: (params) => api.get('/reports/stock', { params }),
  issuanceHistory: (params) => api.get('/reports/issuance-history', { params }),
  overdue: () => api.get('/reports/overdue'),
  calibration: (params) => api.get('/reports/calibration', { params }),
  damagePenalty: () => api.get('/reports/damage-penalty'),
  utilization: (params) => api.get('/reports/utilization', { params }),
  depreciation: () => api.get('/reports/depreciation'),
}

export const calibrationAPI = {
  list: (params) => api.get('/calibration', { params }),
  record: (tool_id, data) => api.post(`/calibration/${tool_id}`, data),
  history: (tool_id) => api.get(`/calibration/${tool_id}/history`),
}

export const binsAPI = {
  list: () => api.get('/bins'),
  create: (data) => api.post('/bins', data),
  update: (id, data) => api.put(`/bins/${id}`, data),
}

export const damageAPI = {
  record: (issuance_id, data) => api.post(`/damage/${issuance_id}`, data),
  writeoff: (tool_id, data) => api.post(`/damage/writeoff/${tool_id}`, data),
}

export const usersAPI = {
  list: () => api.get('/users'),
  create: (data) => api.post('/users', data),
  toggleActive: (id) => api.put(`/users/${id}/toggle-active`),
}
