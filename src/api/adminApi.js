import axiosInstance from "./axios";

// --- API Employee ---
export const createEmployee = (employeeData) => axiosInstance.post("/admin/employees", employeeData);
export const listEmployees = () => axiosInstance.get("/admin/employees");
export const updateEmployee = (id, employeeData) => axiosInstance.put(`/admin/employees/${id}`, employeeData);
export const deleteEmployee = (id) => axiosInstance.delete(`/admin/employees/${id}`);

export default axiosInstance;
