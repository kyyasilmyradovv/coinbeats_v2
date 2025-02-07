// client/src/api/cryptographyAxios.ts

import axios from 'axios'
import useAuthStore from '../store/useAuthStore'
import useSessionStore from '../store/useSessionStore'
import { decryptData, encryptAESKey, encryptData, generateAESKey } from './encryption'

async function storeAESKey(aesKey: CryptoKey) {
    const exportedKey = await window.crypto.subtle.exportKey('raw', aesKey)
    const keyString = btoa(String.fromCharCode(...new Uint8Array(exportedKey)))
    localStorage.setItem('userownwallet', keyString)
}

async function retrieveAESKey(): Promise<CryptoKey | null> {
    const keyString = localStorage.getItem('userownwallet')
    if (keyString) {
        const keyBuffer = Uint8Array.from(atob(keyString), (c) => c.charCodeAt(0))
        return await window.crypto.subtle.importKey('raw', keyBuffer, { name: 'AES-CBC' }, true, ['encrypt', 'decrypt'])
    }
    return null
}

const cryptographyAxios = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL
})

// Request interceptor for adding tokens to requests and handling encryption
cryptographyAxios.interceptors.request.use(
    async (config) => {
        const accessToken = useAuthStore.getState().accessToken || localStorage.getItem('accessToken')
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`
        }

        const telegramUserId = useSessionStore.getState().userId
        if (telegramUserId) {
            config.headers['X-Telegram-User-Id'] = telegramUserId
        }

        if (config.data) {
            const aesKey = await generateAESKey()
            const encryptedKey = await encryptAESKey(aesKey)
            const encryptedData = await encryptData(JSON.stringify(config.data), aesKey)

            // Add encrypted AES key to query parameters
            config.params = { ...config.params, key: encryptedKey }

            // Store the AES key
            await storeAESKey(aesKey)

            // Replace request body with encrypted data
            config.data = { data: encryptedData }
        }

        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor for handling token refresh and logout on failure
cryptographyAxios.interceptors.response.use(
    async (response) => {
        const encryptedAESKey = await retrieveAESKey()
        const decryptedData = await decryptData(response.data, encryptedAESKey)
        response.data = JSON.parse(decryptedData)

        return response
    },

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
                    return cryptographyAxios(originalRequest)
                }
            } catch (refreshError) {
                console.error('Refresh token process failed:', refreshError)
                authStore.logout() // Clear tokens and force a logout if refresh fails
            }
        }

        return Promise.reject(error)
    }
)

export default cryptographyAxios
