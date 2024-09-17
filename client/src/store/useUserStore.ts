// client/src/store/useUserStore.ts

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type UserRole = 'USER' | 'CREATOR' | 'ADMIN' | 'SUPERADMIN'

interface UserState {
    userId: number | null
    username: string
    email: string
    emailConfirmed: boolean
    role: UserRole
    totalPoints: number
    points: any[]
    bookmarks: Array<any> // Add bookmarks
    authenticated: boolean
    token: string | null
    hasAcademy: boolean
    sidebarOpened: boolean

    setUser: (
        userId: number | null,
        username: string,
        email: string,
        emailConfirmed: boolean,
        role: UserRole,
        totalPoints: number,
        points: any[],
        bookmarks: Array<any>, // Add bookmarks parameter
        token: string | null,
        hasAcademy: boolean
    ) => void

    setBookmarks: (bookmarks: Array<any>) => void // Add setter for bookmarks

    loginUser: (data: {
        userId: number
        username: string
        email: string
        emailConfirmed: boolean
        role: UserRole
        totalPoints: number
        points: any[]
        bookmarks: Array<any> // Add bookmarks
        token: string
        hasAcademy: boolean
    }) => void

    logoutUser: () => void
    updateUserRole: (role: UserRole) => void

    toggleSidebar: () => void
}

const useUserStore = create<UserState>()(
    devtools((set) => ({
        userId: null,
        username: '',
        email: '',
        emailConfirmed: false,
        role: 'USER',
        totalPoints: 100,
        points: [],
        bookmarks: [], // Initialize bookmarks as empty
        authenticated: false,
        token: null,
        hasAcademy: false,
        sidebarOpened: false,

        setUser: (userId, username, email, emailConfirmed, role, totalPoints, points, bookmarks, token, hasAcademy) =>
            set({
                userId,
                username,
                email,
                emailConfirmed,
                role,
                totalPoints,
                points,
                bookmarks, // Update bookmarks when user is set
                token,
                hasAcademy
            }),

        setBookmarks: (bookmarks) => set({ bookmarks }), // Setter function to update bookmarks

        loginUser: ({ userId, username, email, emailConfirmed, role, totalPoints, points, bookmarks, token, hasAcademy }) =>
            set({
                userId,
                username,
                email,
                emailConfirmed,
                role,
                totalPoints,
                points,
                bookmarks, // Set bookmarks on login
                authenticated: true,
                token,
                hasAcademy
            }),

        logoutUser: () =>
            set({
                userId: null,
                username: '',
                email: '',
                emailConfirmed: false,
                role: 'USER',
                totalPoints: 100,
                points: [],
                bookmarks: [], // Clear bookmarks on logout
                authenticated: false,
                token: null,
                hasAcademy: false,
                sidebarOpened: false
            }),

        updateUserRole: (role) => set({ role: role || 'USER' }),

        toggleSidebar: () => set((state) => ({ sidebarOpened: !state.sidebarOpened }))
    }))
)

export default useUserStore
