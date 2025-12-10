import axiosInstance from "./axios";

const API_BASE_URL = "/dashboard";

// Admin Dashboard APIs
export const getAdminStats = () => {
  return axiosInstance.get(`${API_BASE_URL}/admin/stats`);
};

export const getRecentActivities = () => {
  return axiosInstance.get(`${API_BASE_URL}/admin/recent-activities`);
};

export const getDepartmentDistribution = () => {
  return axiosInstance.get(`${API_BASE_URL}/admin/department-distribution`);
};

export const getPendingRequests = () => {
  return axiosInstance.get(`${API_BASE_URL}/admin/pending-requests`);
};

export const getBirthdaysThisMonth = () => {
  return axiosInstance.get(`${API_BASE_URL}/admin/birthdays`);
};

export const getAttendanceStats = () => {
  return axiosInstance.get(`${API_BASE_URL}/admin/attendance-stats`);
};

export const getPayrollTrends = () => {
  return axiosInstance.get(`${API_BASE_URL}/admin/payroll-trends`);
};

// Employee Dashboard APIs
export const getEmployeeStats = (employeeId) => {
  return axiosInstance.get(`${API_BASE_URL}/employee/${employeeId}/stats`);
};

export const getEmployeePayrollTrends = (employeeId) => {
  return axiosInstance.get(`${API_BASE_URL}/employee/${employeeId}/payroll-trends`);
};
