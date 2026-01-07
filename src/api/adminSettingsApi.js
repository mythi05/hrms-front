import axiosInstance from './axios';

export const getAdminSettings = () => axiosInstance.get('/admin/settings');
export const updateAdminSettings = (data) => axiosInstance.put('/admin/settings', data);
export const getAdminSettingsOverview = () => axiosInstance.get('/admin/settings/overview');
