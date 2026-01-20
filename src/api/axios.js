import axios from "axios";

const baseURL = (process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api").replace(/\/$/, "");

const axiosInstance = axios.create({
baseURL,
});
//http://localhost:8080/api/

axiosInstance.interceptors.request.use(config => {
  // ✅ Only add Authorization header if token exists and is valid
  let token = localStorage.getItem("token");
  if (typeof token === "string") token = token.trim();

  // Don't add header if no valid token
  if (!token || token === "undefined" || token === "null") {
    return config;
  }

  // Remove Bearer prefix if already present
  if (token.startsWith("Bearer ")) token = token.slice("Bearer ".length).trim();
  // Remove quotes if present
  if (token.startsWith('"') && token.endsWith('"')) token = token.slice(1, -1);

  // Add Authorization header with Bearer token
  config.headers = config.headers ?? {};
  const value = `Bearer ${token}`;
  if (typeof config.headers.set === "function") {
    config.headers.set("Authorization", value);
  } else {
    config.headers.Authorization = value;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } catch (_) {
        // ignore
      }

      const path = typeof window !== "undefined" ? window.location.pathname : "";
      const to = path.startsWith("/admin") ? "/admin/login" : "/login";
      if (typeof window !== "undefined" && window.location.pathname !== to) {
        window.location.href = to;
      }
    }
    return Promise.reject(error);
  }
);


export default axiosInstance;
