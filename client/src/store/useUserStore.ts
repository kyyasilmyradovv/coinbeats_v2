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
    bookmarks: Array<any>
    authenticated: boolean
    token: string | null
    hasAcademy: boolean
    sidebarOpened: boolean
    referralPointsAwarded: number // Added this line

    setUser: (update: Partial<UserState> | ((state: UserState) => Partial<UserState>)) => void

    setBookmarks: (bookmarks: Array<any>) => void

    loginUser: (data: {
        userId: number
        username: string
        email: string
        emailConfirmed: boolean
        role: UserRole
        totalPoints: number
        points: any[]
        bookmarks: Array<any>
        token: string
        hasAcademy: boolean
    }) => void

    logoutUser: () => void
    updateUserRole: (role: UserRole) => void

    toggleSidebar: () => void

    resetReferralPointsAwarded: () => void // Added this function
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
        bookmarks: [],
        authenticated: false,
        token: null,
        hasAcademy: false,
        sidebarOpened: false,
        referralPointsAwarded: 0, // Initialize to 0

        setUser: (update) => set((state) => (typeof update === 'function' ? { ...state, ...update(state) } : { ...state, ...update })),

        setBookmarks: (bookmarks) => set({ bookmarks }),

        loginUser: ({ userId, username, email, emailConfirmed, role, totalPoints, points, bookmarks, token, hasAcademy }) =>
            set({
                userId,
                username,
                email,
                emailConfirmed,
                role,
                totalPoints,
                points,
                bookmarks,
                authenticated: true,
                token,
                hasAcademy,
                referralPointsAwarded: 0 // Reset on login
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
                bookmarks: [],
                authenticated: false,
                token: null,
                hasAcademy: false,
                sidebarOpened: false,
                referralPointsAwarded: 0
            }),

        updateUserRole: (role) => set({ role: role || 'USER' }),

        toggleSidebar: () => set((state) => ({ sidebarOpened: !state.sidebarOpened })),

        resetReferralPointsAwarded: () => set({ referralPointsAwarded: 0 }) // Implementation
    }))
)

export default useUserStore
