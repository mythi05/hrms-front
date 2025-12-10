import axiosInstance from "./axios";

const API_BASE_URL = "/leave-requests"; // baseURL = http://localhost:8080/api

// ========== EMPLOYEE ==========

export const createLeaveRequest = (data) => {
  return axiosInstance.post(API_BASE_URL, data);
};

export const getMyLeaveRequests = (employeeId) => {
  return axiosInstance.get(`${API_BASE_URL}/my/${employeeId}`);
};

// ========== ADMIN ==========

export const adminGetAllLeaveRequests = () => {
  return axiosInstance.get(`${API_BASE_URL}/admin/all`);
};

export const adminApproveLeave = (id, approverId, note) => {
  const params = {};
  if (approverId) params.approverId = approverId;
  if (note) params.note = note;
  return axiosInstance.post(`${API_BASE_URL}/admin/${id}/approve`, null, { params });
};

export const adminRejectLeave = (id, approverId, reason) => {
  const params = {};
  if (approverId) params.approverId = approverId;
  if (reason) params.reason = reason;
  return axiosInstance.post(`${API_BASE_URL}/admin/${id}/reject`, null, { params });
};
