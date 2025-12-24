import axiosInstance from './axios';

const API_BASE = '/performance';

const performanceApi = {
  list: (params) => axiosInstance.get(API_BASE, { params }),
  myReviews: () => axiosInstance.get(`${API_BASE}/my`),
  adminList: (period) => axiosInstance.get(`${API_BASE}/admin`, { params: { period } }),
  getById: (id) => axiosInstance.get(`${API_BASE}/${id}`),
  createOrUpdateAdmin: (dto) => axiosInstance.post(`${API_BASE}/admin`, dto),
  createOrUpdate: (dto) => axiosInstance.post(API_BASE, dto),
  submit: (id) => axiosInstance.post(`${API_BASE}/${id}/submit`),
  approve: (id) => axiosInstance.post(`${API_BASE}/${id}/approve`),
  remove: (id) => axiosInstance.delete(`${API_BASE}/${id}`),
};

export default performanceApi;

