import axiosInstance from "./axios";


const API_BASE_URL = '/payroll';

export const getMyCurrentPayroll = (employeeId, month, year) => {
  const params = {};
  if (month) params.month = month;
  if (year) params.year = year;
  return axiosInstance.get(`${API_BASE_URL}/employee/${employeeId}/current`, { params });
};

export const getMyPayrollHistory = (employeeId, months = 6) => {
  return axiosInstance.get(`${API_BASE_URL}/employee/${employeeId}/history`, {
    params: { months },
  });
};

export const adminCreateOrUpdatePayroll = (payload) => {
  return axiosInstance.post(`${API_BASE_URL}/admin`, payload);
};

export const adminGetPayrollByMonth = (month, year) => {
  const params = {};
  if (month) params.month = month;
  if (year) params.year = year;
  return axiosInstance.get(`${API_BASE_URL}/admin/month`, { params });
};

export const adminGetAllPayroll = () => {
  return axiosInstance.get(`${API_BASE_URL}/admin`);
};

export const adminMarkPayrollPaid = (id) => {
  return axiosInstance.post(`${API_BASE_URL}/admin/${id}/mark-paid`);
};

export const adminMarkPayrollPending = (id) => {
  return axiosInstance.post(`${API_BASE_URL}/admin/${id}/mark-pending`);
};

export const downloadPayslip = async (payroll) => {
  // Tạo file JSON đơn giản từ dữ liệu bảng lương để người dùng tải về
  const dataStr = JSON.stringify(payroll, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const monthLabel = `${String(payroll.month).padStart(2, '0')}-${payroll.year}`;
  a.download = `payslip-${monthLabel}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};
