// src/api/axiosInstance.ts

import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:7000', // Set the base URL for your API
});

// Add a request interceptor to include the JWT token
instance.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken'); // Ensure token is set
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Attach the token to headers
    console.log('Token attached to request:', token); // Log token usage
  } else {
    console.warn('No auth token found. Request may be unauthorized.');
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default instance;
