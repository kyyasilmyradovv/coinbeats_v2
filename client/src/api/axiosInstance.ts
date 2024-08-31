// client/src/api/axiosInstance.ts
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';

const axiosInstance = axios.create({
  baseURL: 'https://subscribes.lt',
  // baseURL: 'http://localhost:4000',
});

// Request interceptor for adding token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken || localStorage.getItem('authToken');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    } else {
      console.warn('No auth token found. Request may be unauthorized.');
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
      try {
        await useAuthStore.getState().refreshAccessToken();
        const newAccessToken = useAuthStore.getState().accessToken;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
