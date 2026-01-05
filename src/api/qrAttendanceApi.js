// src/api/qrAttendanceApi.js
import axiosInstance from "./axios";

const BASE_URL = "/qr-attendance";

export const createAttendanceQR = (payload) => {
  return axiosInstance.post(`${BASE_URL}/admin/qr`, payload);
};

export const getAttendanceQRsByDate = (date) => {
  return axiosInstance.get(`${BASE_URL}/admin/qr`, { params: { date } });
};

export const getActiveAttendanceQRs = (date) => {
  return axiosInstance.get(`${BASE_URL}/admin/qr/active`, { params: { date } });
};

export const getRecentQRScans = (limit = 20) => {
  return axiosInstance.get(`${BASE_URL}/admin/scans/recent`, { params: { limit } });
};

export const getQRImageUrl = (qrCode, width = 320, height = 320) => {
  const params = new URLSearchParams({ qrCode, w: String(width), h: String(height) });
  const base = axiosInstance.defaults.baseURL || "";
  return `${base}/qr-attendance/admin/qr/image?${params.toString()}`;
};

export const getQRImageBlob = (qrCode, width = 320, height = 320) => {
  return axiosInstance.get(`${BASE_URL}/admin/qr/image`, {
    params: { qrCode, w: width, h: height },
    responseType: 'blob',
  });
};
