import axiosInstance from './axios';

const API_BASE_URL = '/departments';

export const departmentApi = {
  // Lấy tất cả phòng ban
  getAll: () => {
    return axiosInstance.get(API_BASE_URL);
  },

  // Lấy phòng ban theo ID
  getById: (id) => {
    return axiosInstance.get(`${API_BASE_URL}/${id}`);
  },

  // Tạo phòng ban mới
  create: (data) => {
    return axiosInstance.post(API_BASE_URL, data);
  },

  // Cập nhật phòng ban
  update: (id, data) => {
    return axiosInstance.put(`${API_BASE_URL}/${id}`, data);
  },

  // Xóa phòng ban
  delete: (id) => {
    return axiosInstance.delete(`${API_BASE_URL}/${id}`);
  },

  // Lấy thống kê phòng ban
  getStats: () => {
    return axiosInstance.get(`${API_BASE_URL}/stats`);
  },

  // Lấy thống kê chi tiết phòng ban (lương, phép, etc.)
  getDetailedStats: (departmentId) => {
    return axiosInstance.get(`${API_BASE_URL}/${departmentId}/detailed-stats`);
  },

  // Lấy nhân viên trong phòng ban
  getEmployees: (departmentId) => {
    return axiosInstance.get(`${API_BASE_URL}/${departmentId}/employees`);
  },

  // Lấy danh sách phòng ban với số lượng nhân viên
  getWithEmployeeCount: () => {
    return axiosInstance.get(`${API_BASE_URL}/with-count`);
  }
};
