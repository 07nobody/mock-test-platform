import axios from "axios";

// Use environment variable for API URL, fallback to localhost for development
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add a request interceptor to include the Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized errors (e.g., token expired)
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;