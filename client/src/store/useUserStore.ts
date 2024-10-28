// src/store/useUserStore.ts

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import axiosInstance from '../api/axiosInstance'

type UserRole = 'USER' | 'CREATOR' | 'ADMIN' | 'SUPERADMIN'

interface UserState {
    userId: number | null
    telegramUserId: bigint | null
    username: string
    email: string
    emailConfirmed: boolean
    roles: UserRole[]
    totalPoints: number
    points: any[]
    userPoints: any[]
    bookmarks: Array<any>
    authenticated: boolean
    token: string | null
    hasAcademy: boolean
    sidebarOpened: boolean
    referralPointsAwarded: number
    referralCode: string | null
    loginStreakData: any
    twitterAuthenticated: boolean
    twitterUsername: string | null
    twitterUserId: string | null

    setUser: (update: Partial<UserState> | ((state: UserState) => Partial<UserState>)) => void
    setBookmarks: (bookmarks: Array<any>) => void
    loginUser: (data: {
        userId: number
        username: string
        email: string
        emailConfirmed: boolean
        roles: UserRole[]
        totalPoints: number
        points: any[]
        bookmarks: Array<any>
        token: string
        hasAcademy: boolean
    }) => void
    logoutUser: () => void
    updateUserRoles: (roles: UserRole[]) => void
    toggleSidebar: () => void
    resetReferralPointsAwarded: () => void
    referralCompletionChecked: boolean
    setUserReferralCompletionChecked: (checked: boolean) => void
    checkReferralCompletion: (userId: number) => Promise<void>
    setTwitterAuthenticated: (authenticated: boolean) => void
    setTwitterUserData: (username: string, userId: string) => void

    // API methods
    fetchUser: (telegramUserId: number) => Promise<void>
    registerUser: (telegramUserId: number, username: string, referralCode?: string | null) => Promise<void>
    handleLoginStreak: () => Promise<{ userVerification: any; point: any }>
    getCurrentUser: () => Promise<void>
    addBookmark: (academyId: number) => Promise<void>
    fetchBookmarkedAcademies: (userId: number) => Promise<void>
    fetchUserPoints: (userId: number) => Promise<void>
    fetchTwitterAuthStatus: () => Promise<void>

    updateTotalPoints: (points: number) => void
}

const useUserStore = create<UserState>()(
    devtools((set, get) => ({
        userId: null,
        telegramUserId: null,
        username: '',
        email: '',
        emailConfirmed: false,
        roles: ['USER'],
        totalPoints: 0,
        points: [],
        userPoints: [],
        bookmarks: [],
        authenticated: false,
        token: null,
        hasAcademy: false,
        sidebarOpened: false,
        referralPointsAwarded: 0,
        referralCompletionChecked: true,
        referralCode: null,
        loginStreakData: null,
        twitterAuthenticated: false,
        twitterUsername: null,
        twitterUserId: null,

        setUser: (update) => set((state) => (typeof update === 'function' ? { ...state, ...update(state) } : { ...state, ...update })),

        setBookmarks: (bookmarks) => set({ bookmarks }),

        setTwitterAuthenticated: (authenticated) => set({ twitterAuthenticated: authenticated }),

        setTwitterUserData: (username, userId) => set({ twitterUsername: username, twitterUserId: userId }),

        loginUser: ({ userId, username, email, emailConfirmed, roles, totalPoints, points, bookmarks, token, hasAcademy }) =>
            set({
                userId,
                username,
                email,
                emailConfirmed,
                roles,
                totalPoints,
                points,
                userPoints: [],
                bookmarks,
                authenticated: true,
                token,
                hasAcademy,
                referralPointsAwarded: 0,
                referralCode: null,
                loginStreakData: null
            }),

        logoutUser: () =>
            set({
                userId: null,
                username: '',
                email: '',
                emailConfirmed: false,
                roles: ['USER'],
                totalPoints: 0,
                points: [],
                userPoints: [],
                bookmarks: [],
                authenticated: false,
                token: null,
                hasAcademy: false,
                sidebarOpened: false,
                referralPointsAwarded: 0,
                referralCode: null,
                loginStreakData: null
            }),

        updateUserRoles: (roles) => set({ roles: roles.length > 0 ? roles : ['USER'] }),

        toggleSidebar: () => set((state) => ({ sidebarOpened: !state.sidebarOpened })),

        resetReferralPointsAwarded: () => set({ referralPointsAwarded: 0 }),

        setUserReferralCompletionChecked: (checked) => {
            set({ referralCompletionChecked: checked })
        },

        // API call to check referral completion for a user
        checkReferralCompletion: async (userId) => {
            try {
                const response = await axiosInstance.get(`/api/users/${userId}/check-referral-completion`)
                if (response.status === 200) {
                    const isReferralComplete = response.data.isReferralComplete
                    set({ referralCompletionChecked: isReferralComplete })
                }
            } catch (error) {
                console.error('Error checking referral completion:', error)
            }
        },

        // Fetches user data by Telegram user ID
        fetchUser: async (telegramUserId) => {
            try {
                const response = await axiosInstance.get(`/api/users/${telegramUserId}`)
                if (response.status === 200 && response.data) {
                    const { id, name, email, roles, points, bookmarkedAcademies, academies, emailConfirmed, referralCode, referralCompletionChecked } =
                        response.data
                    const hasAcademy = academies && academies.length > 0
                    const totalPoints = points ? points.reduce((sum: number, point: any) => sum + point.value, 0) : 0

                    set({
                        userId: id,
                        telegramUserId: telegramUserId,
                        username: name,
                        email: email,
                        emailConfirmed: emailConfirmed,
                        roles: roles,
                        totalPoints: totalPoints,
                        points: points || [],
                        userPoints: [],
                        bookmarks: bookmarkedAcademies || [],
                        authenticated: true,
                        hasAcademy: hasAcademy,
                        referralCode: referralCode || null,
                        referralPointsAwarded: 0, // Existing users have 0 referral points awarded on login
                        referralCompletionChecked: referralCompletionChecked // Set referralCompletionChecked from API response
                    })
                }
            } catch (error: any) {
                console.error('Error fetching user:', error)
                throw error // Throw the error so it can be handled in IntroPage.tsx
            }
        },

        // Registers a new user
        registerUser: async (telegramUserId, username, referralCode = null) => {
            try {
                const registerResponse = await axiosInstance.post('/api/auth/register', {
                    telegramUserId,
                    username,
                    referralCode
                })

                // Log the API response
                console.log('Register Response Data:', registerResponse.data)

                const { user: userData, pointsAwardedToUser } = registerResponse.data

                // Log the points awarded
                console.log('Points Awarded to User:', pointsAwardedToUser)

                const hasAcademy = userData.academies && userData.academies.length > 0
                const totalPoints = userData.points ? userData.points.reduce((sum: number, point: any) => sum + point.value, 0) : 0

                // Use functional set state to merge with existing state
                set((state) => ({
                    ...state,
                    userId: userData.id,
                    telegramUserId: userData.telegramUserId,
                    username: userData.name,
                    email: userData.email,
                    emailConfirmed: userData.emailConfirmed,
                    roles: userData.roles,
                    totalPoints: totalPoints,
                    points: userData.points || [],
                    userPoints: [],
                    bookmarks: userData.bookmarkedAcademies || [],
                    authenticated: true,
                    hasAcademy: hasAcademy,
                    referralPointsAwarded: pointsAwardedToUser || 0,
                    referralCode: userData.referralCode || null
                }))

                // Log the updated state
                console.log('Updated User State:', get())
            } catch (error: any) {
                console.error('Error registering user:', error)
                throw error // Throw the error so it can be handled in IntroPage.tsx
            }
        },

        // Handles the user's login streak
        handleLoginStreak: async () => {
            try {
                const response = await axiosInstance.post('/api/users/handle-login-streak')
                const { userVerification, point } = response.data

                if (point) {
                    const currentPoints = get().points
                    const totalPoints = (get().totalPoints || 0) + point.value

                    set({
                        totalPoints,
                        points: [...currentPoints, point],
                        loginStreakData: userVerification // Store login streak data if needed
                    })
                }

                // Return userVerification and point so the component can use them
                return { userVerification, point }
            } catch (error: any) {
                console.error('Error handling login streak:', error)
                throw error
            }
        },

        // Fetches the current authenticated user's data
        getCurrentUser: async () => {
            try {
                const response = await axiosInstance.get('/api/users/me')
                const userData = response.data

                set({
                    userId: userData.id,
                    username: userData.name,
                    email: userData.email,
                    emailConfirmed: userData.emailConfirmed,
                    roles: userData.roles,
                    totalPoints: userData.points ? userData.points.reduce((sum: number, point: any) => sum + point.value, 0) : 0,
                    points: userData.points || [],
                    userPoints: [],
                    bookmarks: userData.bookmarkedAcademies || [],
                    authenticated: true,
                    hasAcademy: userData.academies && userData.academies.length > 0,
                    referralCode: userData.referralCode || null
                })
            } catch (error: any) {
                console.error('Error fetching current user:', error)
            }
        },

        // Adds a bookmark to an academy for the user
        addBookmark: async (academyId) => {
            try {
                const telegramUserId = get().userId
                // Endpoint: POST /api/users/interaction (action 'bookmark')
                await axiosInstance.post('/api/users/interaction', {
                    telegramUserId: telegramUserId,
                    action: 'bookmark',
                    academyId: academyId
                })
                // Optionally update bookmarks after adding
                await get().fetchBookmarkedAcademies(telegramUserId!)
            } catch (error: any) {
                console.error('Error adding bookmark:', error)
            }
        },

        // Fetches the user's bookmarked academies
        fetchBookmarkedAcademies: async (userId) => {
            try {
                // Endpoint: GET /api/users/{userId}/bookmarked-academies
                const response = await axiosInstance.get(`/api/users/${userId}/bookmarked-academies`)
                set({ bookmarks: response.data })
            } catch (error: any) {
                console.error('Error fetching bookmarked academies:', error)
            }
        },

        // Fetches user points breakdown
        fetchUserPoints: async (userId) => {
            if (!userId) {
                console.error('User ID is null or undefined, not fetching user points.')
                return
            }

            try {
                const response = await axiosInstance.get(`/api/points/breakdown/${userId}`)
                console.log('Fetched Points:', response.data)
                set({ userPoints: response.data })
            } catch (error) {
                console.error('Error fetching user points:', error)
            }
        },

        updateTotalPoints: (points) => {
            set((state) => ({ totalPoints: state.totalPoints + points }))
        },

        fetchTwitterAuthStatus: async () => {
            try {
                const response = await axiosInstance.get('/api/users/twitter/status')
                const { twitterAuthenticated, twitterUsername, twitterUserId } = response.data

                set({
                    twitterAuthenticated,
                    twitterUsername,
                    twitterUserId
                })
            } catch (error) {
                console.error('Error fetching Twitter authentication status:', error)
            }
        }
    }))
)

export default useUserStore
