import axiosInstance from './axios';

export const getMyNotifications = () => axiosInstance.get('/notifications');
export const markNotificationRead = (id) => axiosInstance.post(`/notifications/${id}/read`);
export const getUnreadCount = () => axiosInstance.get('/notifications/unread-count');
