// src/store/useUserStore.ts

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import axiosInstance from '../api/axiosInstance'
import useSessionStore from './useSessionStore'

type UserRole = 'USER' | 'CREATOR' | 'ADMIN' | 'SUPERADMIN'

interface UserState {
    userId: number | null
    telegramUserId: bigint | null
    username: string
    email: string
    emailConfirmed: boolean
    roles: UserRole[]
    totalPoints: number
    totalRaffles: number
    points: any[]
    userPoints: any[]
    userRaffles: any[]
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

    erc20WalletAddress: string | null
    solanaWalletAddress: string | null
    tonWalletAddress: string | null

    // New properties for level-up functionality
    characterLevelId: number | null
    characterLevelName: string | null

    setUser: (update: Partial<UserState> | ((state: UserState) => Partial<UserState>)) => void
    setBookmarks: (bookmarks: Array<any>) => void
    loginUser: (data: {
        userId: number
        telegramUserId: bigint
        username: string
        email: string
        emailConfirmed: boolean
        roles: UserRole[]
        totalPoints: number
        totalRaffles: number
        points: any[]
        bookmarks: Array<any>
        token: string
        hasAcademy: boolean
        erc20WalletAddress?: string | null
        solanaWalletAddress?: string | null
        tonWalletAddress?: string | null
        characterLevelId?: number | null
        characterLevelName?: string | null
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

    updateWalletAddresses: (addresses: { erc20WalletAddress?: string; solanaWalletAddress?: string; tonWalletAddress?: string }) => Promise<void>

    // API methods
    fetchUser: (telegramUserId: number) => Promise<void>
    registerUser: (telegramUserId: number, username: string, referralCode?: string | null) => Promise<void>
    handleLoginStreak: () => Promise<{ userVerification: any; point: any }>
    getCurrentUser: () => Promise<void>
    addBookmark: (academyId: number) => Promise<void>
    fetchBookmarkedAcademies: (userId: number) => Promise<void>
    fetchUserPoints: (userId: number) => Promise<void>
    fetchUserRaffles: (userId: number) => Promise<void>
    fetchTwitterAuthStatus: () => Promise<void>
    removeTwitterAccount: () => Promise<string>

    fetchUserLevel: () => Promise<void> // New method to fetch user level

    updateTotalPoints: (points: number) => void
    updateTotalRaffles: (amount: number) => void
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
        totalRaffles: 0,
        points: [],
        userPoints: [],
        userRaffles: [],
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

        erc20WalletAddress: null,
        solanaWalletAddress: null,
        tonWalletAddress: null,

        characterLevelId: null, // New property
        characterLevelName: null, // New property

        setUser: (update) => set((state) => (typeof update === 'function' ? { ...state, ...update(state) } : { ...state, ...update })),

        setBookmarks: (bookmarks) => set({ bookmarks }),

        setTwitterAuthenticated: (authenticated) => set({ twitterAuthenticated: authenticated }),

        setTwitterUserData: (username, userId) => set({ twitterUsername: username, twitterUserId: userId }),

        loginUser: ({
            userId,
            telegramUserId,
            username,
            email,
            emailConfirmed,
            roles,
            totalPoints,
            totalRaffles,
            points,
            bookmarks,
            token,
            hasAcademy,
            erc20WalletAddress,
            solanaWalletAddress,
            tonWalletAddress,
            characterLevelId,
            characterLevelName
        }) =>
            set({
                userId,
                telegramUserId,
                username,
                email,
                emailConfirmed,
                roles,
                totalPoints,
                totalRaffles,
                points,
                userPoints: [],
                userRaffles: [],
                bookmarks,
                authenticated: true,
                token,
                hasAcademy,
                referralPointsAwarded: 0,
                referralCode: null,
                loginStreakData: null,
                erc20WalletAddress: erc20WalletAddress || null,
                solanaWalletAddress: solanaWalletAddress || null,
                tonWalletAddress: tonWalletAddress || null,
                characterLevelId: characterLevelId || null,
                characterLevelName: characterLevelName || null
            }),

        logoutUser: () =>
            set({
                userId: null,
                username: '',
                email: '',
                emailConfirmed: false,
                roles: ['USER'],
                totalPoints: 0,
                totalRaffles: 0,
                points: [],
                userPoints: [],
                userRaffles: [],
                bookmarks: [],
                authenticated: false,
                token: null,
                hasAcademy: false,
                sidebarOpened: false,
                referralPointsAwarded: 0,
                referralCode: null,
                loginStreakData: null,
                erc20WalletAddress: null,
                solanaWalletAddress: null,
                tonWalletAddress: null,
                characterLevelId: null,
                characterLevelName: null
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
                    const {
                        id,
                        name,
                        email,
                        roles,
                        points,
                        bookmarkedAcademies,
                        academies,
                        emailConfirmed,
                        referralCode,
                        referralCompletionChecked,
                        erc20WalletAddress,
                        solanaWalletAddress,
                        tonWalletAddress,
                        characterLevel, // Include character level
                        raffleAmount
                    } = response.data
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
                        totalRaffles: raffleAmount,
                        points: points || [],
                        userPoints: [],
                        userRaffles: [],
                        bookmarks: bookmarkedAcademies || [],
                        authenticated: true,
                        hasAcademy: hasAcademy,
                        referralCode: referralCode || null,
                        referralPointsAwarded: 0,
                        referralCompletionChecked: referralCompletionChecked,
                        erc20WalletAddress: erc20WalletAddress || null,
                        solanaWalletAddress: solanaWalletAddress || null,
                        tonWalletAddress: tonWalletAddress || null,
                        characterLevelId: characterLevel?.id || null,
                        characterLevelName: characterLevel?.levelName || null
                    })
                }
            } catch (error: any) {
                console.error('Error fetching user:', error)
                throw error
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
                    totalRaffles: userData.raffleAmount,
                    points: userData.points || [],
                    userPoints: [],
                    userRaffles: [],
                    bookmarks: userData.bookmarkedAcademies || [],
                    authenticated: true,
                    hasAcademy: hasAcademy,
                    referralPointsAwarded: pointsAwardedToUser || 0,
                    referralCode: userData.referralCode || null,
                    erc20WalletAddress: userData.erc20WalletAddress || null,
                    solanaWalletAddress: userData.solanaWalletAddress || null,
                    tonWalletAddress: userData.tonWalletAddress || null,
                    characterLevelId: userData.characterLevel?.id || null,
                    characterLevelName: userData.characterLevel?.levelName || null
                }))

                // Log the updated state
                console.log('Updated User State:', get())
            } catch (error: any) {
                console.error('Error registering user:', error)
                throw error
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
                        totalRaffles: get().totalRaffles || 0 + point / 100,
                        points: [...currentPoints, point],
                        loginStreakData: userVerification // Store login streak data if needed
                    })

                    // Fetch updated user level after awarding points
                    await get().fetchUserLevel()
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
                    telegramUserId: userData.telegramUserId,
                    username: userData.name,
                    email: userData.email,
                    emailConfirmed: userData.emailConfirmed,
                    roles: userData.roles,
                    totalPoints: userData.points ? userData.points.reduce((sum: number, point: any) => sum + point.value, 0) : 0,
                    points: userData.points || [],
                    totalRaffles: userData?.raffleAmount,
                    userPoints: [],
                    userRaffles: [],
                    bookmarks: userData.bookmarkedAcademies || [],
                    authenticated: true,
                    hasAcademy: userData.academies && userData.academies.length > 0,
                    referralCode: userData.referralCode || null,
                    erc20WalletAddress: userData.erc20WalletAddress || null,
                    solanaWalletAddress: userData.solanaWalletAddress || null,
                    tonWalletAddress: userData.tonWalletAddress || null,
                    characterLevelId: userData.characterLevel?.id || null,
                    characterLevelName: userData.characterLevel?.levelName || null
                })
            } catch (error: any) {
                console.error('Error fetching current user:', error)
            }
        },

        // Adds a bookmark to an academy for the user
        addBookmark: async (academyId) => {
            try {
                const telegramUserId = get().telegramUserId
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
                // Endpoint: GET /api/users/${userId}/bookmarked-academies
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

        // Fetches user raffles
        fetchUserRaffles: async (userId) => {
            if (!userId) {
                console.error('User ID is null or undefined, not fetching user points.')
                return
            }

            try {
                const response = await axiosInstance.get(`/api/raffle?userId=${userId}`)
                console.log('Fetched Raffles:', response.data)
                set({ userRaffles: response.data })
            } catch (error) {
                console.error('Error fetching user points:', error)
            }
        },

        updateTotalPoints: (points) => {
            set((state) => ({ totalPoints: state.totalPoints + points, totalRaffles: state.totalRaffles + points / 100 }))
        },

        updateTotalRaffles: (amount) => {
            set((state) => ({ totalRaffles: state.totalRaffles + amount }))
        },

        fetchTwitterAuthStatus: async () => {
            try {
                const telegramUserId = get().telegramUserId?.toString()
                if (!telegramUserId) {
                    console.error('Telegram user ID is not available in the store.')
                    return
                }
                const response = await axiosInstance.get('/api/users/twitter/status', {
                    headers: {
                        'X-Telegram-User-Id': telegramUserId
                    }
                })
                const { twitterAuthenticated, twitterUsername, twitterUserId } = response.data

                set({
                    twitterAuthenticated,
                    twitterUsername,
                    twitterUserId
                })
            } catch (error) {
                console.error('Error fetching Twitter authentication status:', error)
            }
        },

        removeTwitterAccount: async () => {
            try {
                const telegramUserId = get().telegramUserId?.toString()
                if (!telegramUserId) {
                    console.error('Telegram user ID is not available in the store.')
                    return 'Telegram user ID is required to remove X account.'
                }
                const response = await axiosInstance.post('/api/users/twitter/remove', null, {
                    headers: {
                        'X-Telegram-User-Id': telegramUserId
                    }
                })

                if (response.status === 200) {
                    set({
                        twitterAuthenticated: false,
                        twitterUsername: null,
                        twitterUserId: null
                    })
                    return 'X account removed successfully.'
                } else {
                    const data = response.data
                    return data.error || 'Failed to remove X account.'
                }
            } catch (error: any) {
                console.error('Error removing X account:', error)
                return 'An error occurred while removing X account.'
            }
        },

        updateWalletAddresses: async (addresses) => {
            try {
                const telegramUserId = get().telegramUserId

                if (!telegramUserId) {
                    console.error('Telegram User ID is required to update wallet addresses.')
                    return
                }

                const response = await axiosInstance.post('/api/users/update-wallet-addresses', addresses, {
                    headers: {
                        'X-Telegram-User-Id': telegramUserId.toString()
                    }
                })

                if (response.status === 200) {
                    // Update the store with the new addresses
                    set({
                        erc20WalletAddress: addresses.erc20WalletAddress || get().erc20WalletAddress,
                        solanaWalletAddress: addresses.solanaWalletAddress || get().solanaWalletAddress,
                        tonWalletAddress: addresses.tonWalletAddress || get().tonWalletAddress
                    })
                } else if (response.status === 404) {
                    console.error('Failed to update wallet addresses:', response.data)
                    // Handle user not found scenario
                    // Show notification to user if necessary
                }
            } catch (error: any) {
                console.error('Error updating wallet addresses:', error)
            }
        },

        // New method to fetch user level
        fetchUserLevel: async () => {
            try {
                const telegramUserId = get().telegramUserId
                if (!telegramUserId) {
                    console.error('Telegram User ID is required to fetch user level.')
                    return
                }

                const response = await axiosInstance.get(`/api/users/${telegramUserId}`)
                if (response.status === 200 && response.data) {
                    const { characterLevel } = response.data
                    set({
                        characterLevelId: characterLevel?.id || null,
                        characterLevelName: characterLevel?.levelName || null
                    })
                }
            } catch (error) {
                console.error('Error fetching user level:', error)
            }
        }
    }))
)

export default useUserStore
