import axios from "axios";

const axiosInstance = axios.create({
baseURL: "https://app-f9bfc784-6639-4f0e-919c-b5ed407f3a5b.cleverapps.io/api",
});
//http://localhost:8080/api/

axiosInstance.interceptors.request.use(config => {
  let token = localStorage.getItem("token");
  if (typeof token === "string") token = token.trim();

  if (!token || token === "undefined" || token === "null") return config;

  if (token.startsWith("Bearer ")) token = token.slice("Bearer ".length).trim();
  if (token.startsWith('"') && token.endsWith('"')) token = token.slice(1, -1);

  config.headers = config.headers ?? {};
  const value = `Bearer ${token}`;
  if (typeof config.headers.set === "function") {
    config.headers.set("Authorization", value);
  } else {
    config.headers.Authorization = value;
  }
  return config;
});


export default axiosInstance;
