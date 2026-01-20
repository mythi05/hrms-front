import axiosInstance from './axios';

// ===== Admin / HR =====
export const adminGetAllTasks = () =>
  axiosInstance.get('/admin/tasks');

export const adminGetTasksByEmployee = (employeeId) =>
  axiosInstance.get(`/admin/tasks/employee/${employeeId}`);

export const adminCreateTask = (task) =>
  axiosInstance.post('/admin/tasks', task);

export const adminUpdateTask = (id, task) =>
  axiosInstance.put(`/admin/tasks/${id}`, task);

export const adminDeleteTask = (id) =>
  axiosInstance.delete(`/admin/tasks/${id}`);


// ===== Employee =====
export const getMyTasks = () =>
  axiosInstance.get('/tasks/my');

/**
 * ⚠️ FIX QUAN TRỌNG:
 * - KHÔNG dùng params
 * - Gửi status trong BODY (JSON)
 */
export const updateMyTaskStatus = (id, status) =>
  axiosInstance.patch(`/tasks/${id}/status`, {
    status
  });
