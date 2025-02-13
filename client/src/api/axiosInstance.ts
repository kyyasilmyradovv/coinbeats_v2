// client/src/api/axiosInstance.ts

import axios from 'axios'
import useAuthStore from '../store/useAuthStore'
import useSessionStore from '../store/useSessionStore'

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL
})

// Request interceptor for adding token to requests
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = useAuthStore.getState().accessToken || localStorage.getItem('accessToken')
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`
        }

        const privyToken = localStorage.getItem('privyAccessToken')

        if (privyToken) {
            config.headers['Authorization'] = `Privy ${privyToken}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor for handling token refresh and logout on failure
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
        const authStore = useAuthStore.getState()

        // If the response status is 401, attempt to refresh the token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                // Call the refresh token method to get a new access token
                await authStore.refreshAccessToken()
                const newAccessToken = useAuthStore.getState().accessToken

                if (newAccessToken) {
                    // Retry the original request with the new access token
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
                    return axiosInstance(originalRequest)
                }
            } catch (refreshError) {
                console.error('Refresh token process failed:', refreshError)
                authStore.logout() // Clear tokens and force a logout if refresh fails
            }
        }

        return Promise.reject(error)
    }
)

// Request interceptor for adding tokens to requests
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = useAuthStore.getState().accessToken || localStorage.getItem('accessToken')
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`
        }

        const telegramUserId = useSessionStore.getState().userId
        if (telegramUserId) {
            config.headers['X-Telegram-User-Id'] = telegramUserId
        }
        return config
    },
    (error) => Promise.reject(error)
)

export default axiosInstance
