import axios from 'axios';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const uploadApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

uploadApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

uploadApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const gameService = {
  getAll: () => api.get('/games'),
  getBySlug: (slug) => api.get(`/games/${slug}`),
  create: (data) => api.post('/games', data),
  update: (id, data) => api.put(`/games/${id}`, data),
  delete: (id) => api.delete(`/games/${id}`),
};

export const accountService = {
  getAll: (params) => api.get('/accounts', { params }),
  getById: (id) => api.get(`/accounts/${id}`),
  create: (data) => api.post('/accounts', data),
  update: (id, data) => api.put(`/accounts/${id}`, data),
  updateStatus: (id, status) => api.patch(`/accounts/${id}/status`, { status }),
  delete: (id) => api.delete(`/accounts/${id}`),
};

export const orderService = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  confirmPayment: (id, data) => api.post(`/orders/${id}/confirm-payment`, data),
  getByCode: (code) => api.get(`/orders/confirm/${code}`),
  confirmPaymentByCode: (code, data) => api.post(`/orders/confirm/${code}/payment`, data),
};

export const paymentService = {
  getMethods: () => api.get('/payments/methods'),
  create: (data) => api.post('/payments/create', data),
  generateQris: (data) => api.post('/payments/qris/generate', data),
};

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getOrders: (status) => api.get('/admin/orders', { params: { status } }),
  updateOrderStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data),
  getUsers: () => api.get('/admin/users'),
  getMonthlyStats: () => api.get('/admin/stats/monthly'),
};

export const uploadService = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return uploadApi.post('/upload/image', formData);
  },
  uploadImages: (files) => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('images', file);
    });
    return uploadApi.post('/upload/images', formData);
  },
  deleteImage: (filename) => uploadApi.delete(`/upload/${filename}`),
};

export default api;
