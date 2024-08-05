// src/utils/axiosInstance.ts
import axios from 'axios';
import useUserStore from '../store/useUserStore';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:7000/api', // Adjust according to your server setup
});

// Request interceptor for adding token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useUserStore.getState().token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      await useUserStore.getState().refreshAccessToken();
      originalRequest.headers['Authorization'] = `Bearer ${useUserStore.getState().token}`;
      return axiosInstance(originalRequest);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
