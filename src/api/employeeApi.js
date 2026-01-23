import axiosInstance from './axios';

const API_BASE_URL = '/employees';

export const employeeApi = {
  getMe: () => {
    return axiosInstance.get(`${API_BASE_URL}/me`);
  },

  updateMe: (data) => {
    return axiosInstance.put(`${API_BASE_URL}/me`, data);
  },

  updateMyAvatar: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post(`${API_BASE_URL}/me/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Lấy tất cả nhân viên
  getAll: () => {
    return axiosInstance.get(API_BASE_URL);
  },

  // Lấy nhân viên theo ID
  getById: (id) => {
    return axiosInstance.get(`${API_BASE_URL}/${id}`);
  },

  // Tạo nhân viên mới
  create: (data) => {
    return axiosInstance.post(API_BASE_URL, data);
  },

  // Cập nhật nhân viên
  update: (id, data) => {
    return axiosInstance.put(`${API_BASE_URL}/${id}`, data);
  },

  updateAvatar: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post(`${API_BASE_URL}/${id}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Xóa nhân viên
  delete: (id) => {
    return axiosInstance.delete(`${API_BASE_URL}/${id}`);
  },

  // Lấy nhân viên theo department
  getByDepartment: (departmentId) => {
    return axiosInstance.get(`/departments/${departmentId}/employees`);
  },

  // Lấy thống kê nhân viên
  getStats: () => {
    return axiosInstance.get(`${API_BASE_URL}/stats`);
  },

  // Tìm kiếm nhân viên
  search: (keyword) => {
    return axiosInstance.get(`${API_BASE_URL}/search`, { params: { keyword } });
  },

  exportEmployees: () => {
    return axiosInstance.get(`${API_BASE_URL}/admin/export`, {
      responseType: 'blob'
    });
  },

  downloadEmployeeTemplate: () => {
    return axiosInstance.get(`${API_BASE_URL}/admin/template`, {
      responseType: 'blob'
    });
  },

  importEmployees: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post(`${API_BASE_URL}/admin/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  bulkDeleteEmployees: (ids) => {
    return axiosInstance.post('/admin/employees/bulk-delete', ids);
  }
};