
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle unauthorized responses
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthEndpoint = err.config?.url?.includes('/auth/');

    const isAuthPage = [
      '/login',
      '/register',
      '/forgot-password',
    ].includes(window.location.pathname);

    if (
      err.response?.status === 401 &&
      !isAuthEndpoint &&
      !isAuthPage
    ) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  adminLogin: (data) => api.post('/admin/auth/login', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Dashboard
export const dashboardAPI = {
  get: () => api.get('/dashboard'),
};

// Customers
export const customerAPI = {
  getAll: () => api.get('/customers'),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
};

// Suppliers
export const supplierAPI = {
  getAll: () => api.get('/suppliers'),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
};

// Products
export const productAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  getLowStock: () => api.get('/products/low-stock'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// Expenses
export const expenseAPI = {
  getAll: () => api.get('/expenses'),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
};

// Invoices
export const invoiceAPI = {
  getAll: () => api.get('/invoices'),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  delete: (id) => api.delete(`/invoices/${id}`),
};

// AI
export const aiAPI = {
  generate: (data) => api.post('/ai/generate', data),
  getHistory: () => api.get('/ai/history'),
};

// Admin
export const adminAPI = {
  getBusinesses: () => api.get('/admin/businesses'),
  deleteBusiness: (id) => api.delete(`/admin/businesses/${id}`),
  getAiUsage: () => api.get('/admin/ai-usage'),
  getStats: () => api.get('/admin/stats'),

  getSubscriptions: () => api.get('/admin/subscriptions'),
  createSubscription: (data) => api.post('/admin/subscriptions', data),
  updateSubscription: (id, data) =>
    api.put(`/admin/subscriptions/${id}`, data),
  deleteSubscription: (id) =>
    api.delete(`/admin/subscriptions/${id}`),

  // Subscription requests
  getPendingSubscriptionRequests: () =>
    api.get('/admin/subscription-requests'),

  approveSubscriptionRequest: (id, adminNote = '') =>
    api.put(`/admin/subscription-requests/${id}/approve`, null, {
      params: { adminNote },
    }),

  rejectSubscriptionRequest: (id, adminNote = '') =>
    api.put(`/admin/subscription-requests/${id}/reject`, null, {
      params: { adminNote },
    }),

  // Payments - Admin
  getPendingPayments: () =>
    api.get('/admin/payments/pending'),

  approvePayment: (id, adminNote = '') =>
    api.put(`/admin/payments/${id}/approve`, null, {
      params: { adminNote },
    }),

  rejectPayment: (id, adminNote = '') =>
    api.put(`/admin/payments/${id}/reject`, null, {
      params: { adminNote },
    }),
};

// Business Profile
export const businessProfileAPI = {
  get: () => api.get('/business/profile'),
  update: (data) => api.put('/business/profile', data),
};

// Subscription
export const subscriptionAPI = {
  getStatus: () => api.get('/subscription/status'),
  getPlans: () => api.get('/subscription/plans'),

  requestUpgrade: (subscriptionId) =>
    api.post(`/subscription/upgrade-request/${subscriptionId}`),

  getMyUpgradeRequests: () =>
    api.get('/subscription/upgrade-requests'),
};

// Payments - Business
export const paymentAPI = {
  // Create a payment request for a selected subscription plan
  createPayment: (subscriptionId) =>
    api.post(`/payments/create/${subscriptionId}`),

  // Development/testing only - simulate successful payment
  simulatePaymentSuccess: (paymentId) =>
    api.post(`/mock-payments/${paymentId}/success`),

  // Development/testing only - simulate failed payment
  simulatePaymentFailure: (paymentId) =>
    api.post(`/mock-payments/${paymentId}/failure`),
};

export default api;
