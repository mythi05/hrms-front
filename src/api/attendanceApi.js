// src/api/attendanceApi.js
import axiosInstance from "./axios";

const API_BASE_URL = "/attendance"; // axiosInstance baseURL = https://app-f9bfc784-6639-4f0e-919c-b5ed407f3a5b.cleverapps.io/api

// Hàm hỗ trợ để lấy ngày hiện tại ở định dạng YYYY-MM-DD (dùng cho việc hiển thị trong AttendanceMonth/History nếu cần)
const formatDate = (dateString) => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    // Tùy chỉnh định dạng ngày theo yêu cầu của bạn, ở đây dùng định dạng dd/MM/yyyy
    return date.toLocaleDateString('vi-VN');
  } catch (error) {
    return dateString;
  }
};

// --- API dành cho Nhân viên (Employee) ---

export const checkIn = (employeeId) => {
  return axiosInstance.post(`${API_BASE_URL}/check-in/${employeeId}`);
};

export const checkOut = (employeeId) => {
  return axiosInstance.post(`${API_BASE_URL}/check-out/${employeeId}`);
};

export const getTodayAttendance = (employeeId) => {
  return axiosInstance.get(`${API_BASE_URL}/today/${employeeId}`);
};

export const getAttendanceHistory = (employeeId) => {
  // Lấy lịch sử, có thể cần thêm tham số limit/offset hoặc mặc định lấy 10 bản ghi gần nhất.
  // Ở đây giả định API trả về danh sách lịch sử.
  return axiosInstance.get(`${API_BASE_URL}/history/${employeeId}`);
};

export const getAttendanceOfMonth = (employeeId, month, year) => {
  return axiosInstance.get(`${API_BASE_URL}/month/${employeeId}`, {
    params: { month, year },
  });
};

// --- API dành cho Quản trị viên (Admin) ---

export const adminGetAllAttendance = () => {
  return axiosInstance.get(`${API_BASE_URL}/admin/all`);
};

export const adminCreateAttendance = (attendanceData) => {
  return axiosInstance.post(`${API_BASE_URL}/admin`, attendanceData);
};

export const adminUpdateAttendance = (id, attendanceData) => {
  return axiosInstance.put(`${API_BASE_URL}/admin/${id}`, attendanceData);
};

export const adminDeleteAttendance = (id) => {
  return axiosInstance.delete(`${API_BASE_URL}/admin/${id}`);
};

export const adminDeleteAllAttendance = () => {
  return axiosInstance.delete(`${API_BASE_URL}/admin/all`);
};

// --- API Import/Export Excel ---

export const exportAttendanceToExcel = (params = {}) => {
  return axiosInstance.get(`${API_BASE_URL}/admin/export`, {
    params,
    responseType: 'blob' // Quan trọng để download file
  });
};

export const importAttendanceFromExcel = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return axiosInstance.post(`${API_BASE_URL}/admin/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const downloadAttendanceTemplate = () => {
  return axiosInstance.get(`${API_BASE_URL}/admin/template`, {
    responseType: 'blob' // Quan trọng để download file
  });
};

export const scanAttendanceQR = (payload) => {
  return axiosInstance.post(`/qr-attendance/scan`, payload);
};

// Giả định thêm một hàm lấy thống kê nhanh (không có trong controller, cần bổ sung ở backend)
export const getEmployeeStats = async (employeeId) => {
  // Giả định trả về dữ liệu mẫu nếu API chưa có:
  // Thường backend sẽ có 1 API riêng cho thống kê
  return {
    data: {
      weeklyHours: "40h",
      onTime: "18/20",
      lateCount: "2",
      overtime: "8h",
    },
  };
};

// Hàm này có thể dùng chung cho cả Employee và Admin để format dữ liệu
export const formatAttendanceRecords = (records) => {
  return records.map(record => ({
    ...record,
    date: formatDate(record.date), // Format ngày nếu cần
    // Tùy chỉnh các trường khác nếu cần thiết
  }));
};