// client/src/store/useAuthStore.ts

import { create } from 'zustand'
import axios from '../api/axiosInstance'
import { jwtDecode } from 'jwt-decode'
import { devtools } from 'zustand/middleware'

// Define the structure of the auth state
interface AuthState {
    accessToken: string | null
    refreshToken: string | null
    userRoles: string[] // Updated to an array of strings
    login: (email: string, password: string) => Promise<void>
    logout: () => void
    refreshAccessToken: () => Promise<void>
    initializeAuth: () => void
}

// Create the zustand store
const useAuthStore = create<AuthState>()(
    devtools(
        (set) => ({
            accessToken: null,
            refreshToken: null,
            userRoles: ['USER'], // Initialize as an empty array

            // Login method to authenticate user
            login: async (email, password) => {
                try {
                    console.log('Attempting to log in...')
                    const response = await axios.post('/api/auth/login', { email, password })
                    const { accessToken, refreshToken } = response.data
                    const decodedToken: any = jwtDecode(accessToken)

                    console.log('Login successful, setting tokens and roles.')
                    set({ accessToken, refreshToken, userRoles: decodedToken.roles || [] })
                    localStorage.setItem('accessToken', accessToken)
                    localStorage.setItem('refreshToken', refreshToken)

                    console.log('Access Token:', accessToken)
                    console.log('Refresh Token:', refreshToken)
                    console.log('User Roles:', decodedToken.roles)
                } catch (error) {
                    console.error('Login failed:', error)
                    throw new Error('Login failed')
                }
            },

            // Logout method to clear tokens and user info
            logout: () => {
                console.log('Logging out and clearing tokens...')
                set({ accessToken: null, refreshToken: null, userRoles: ['USER'] })
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
            },

            setUserRoles: (roles: string[]) => set({ userRoles: roles }),

            refreshAccessToken: async () => {
                try {
                    console.log('Attempting to refresh access token...')
                    const refreshToken = localStorage.getItem('refreshToken')
                    if (!refreshToken) throw new Error('No refresh token available')

                    const response = await axios.post('/api/auth/refresh', { refreshToken })
                    const { accessToken } = response.data

                    if (!accessToken) throw new Error('No access token returned from refresh.')

                    const decodedToken: any = jwtDecode(accessToken)

                    set({ accessToken, userRoles: decodedToken.roles || [] })
                    localStorage.setItem('accessToken', accessToken)

                    console.log('Access token refreshed:', accessToken)
                } catch (error) {
                    console.error('Token refresh failed, logging out user:', error)
                    set({ accessToken: null, refreshToken: null, userRoles: [] })
                    localStorage.removeItem('accessToken')
                    localStorage.removeItem('refreshToken')

                    // Optionally, you can redirect the user to the login page here
                    // window.location.href = '/login'; // This ensures the user is forced to log in again
                }
            },

            // Initialize auth state from localStorage
            initializeAuth: () => {
                console.log('Initializing authentication...')
                const accessToken = localStorage.getItem('accessToken')
                const refreshToken = localStorage.getItem('refreshToken')

                if (accessToken) {
                    try {
                        const decodedToken: any = jwtDecode(accessToken)
                        set({
                            accessToken,
                            refreshToken,
                            userRoles: decodedToken.roles || []
                        })
                        console.log('Initialized auth state from localStorage.')
                    } catch (error) {
                        console.error('Error decoding token:', error)
                        set({ accessToken: null, refreshToken: null, userRoles: [] })
                        localStorage.removeItem('accessToken')
                        localStorage.removeItem('refreshToken')
                    }
                }
            }
        }),
        { name: 'AuthStore' }
    )
)

export default useAuthStore
