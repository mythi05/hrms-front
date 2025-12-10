import axiosInstance from './axios';

// Admin/HR APIs
export const adminGetPerformanceReviews = (params = {}) =>
  axiosInstance.get('/admin/performance', { params });

export const adminCreateOrUpdatePerformance = (payload) =>
  axiosInstance.post('/admin/performance', payload);

// Employee APIs
export const getMyPerformanceReviews = () =>
  axiosInstance.get('/performance/my');

export const getMyPerformanceDetail = (id) =>
  axiosInstance.get(`/performance/${id}`);
