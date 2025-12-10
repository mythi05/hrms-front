import axios from "axios";

const axiosInstance = axios.create({
baseURL: "https://app-f9bfc784-6639-4f0e-919c-b5ed407f3a5b.cleverapps.io/api",
});

// Gửi token tự động nếu có
axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});


export default axiosInstance;
