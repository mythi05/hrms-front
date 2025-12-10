import axios from "axios";

const axiosInstance = axios.create({
baseURL: "https://app-f9bfc784-6639-4f0e-919c-b5ed407f3a5b.cleverapps.io/api",});

// Gửi token tự động nếu có
axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --- API Employee ---
export const createEmployee = (employeeData) => axiosInstance.post("/admin/employees", employeeData);
export const listEmployees = () => axiosInstance.get("/admin/employees");
export const updateEmployee = (id, employeeData) => axiosInstance.put(`/admin/employees/${id}`, employeeData);
export const deleteEmployee = (id) => axiosInstance.delete(`/admin/employees/${id}`);

export default axiosInstance;
