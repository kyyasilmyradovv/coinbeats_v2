// src/store/useUserStore.ts

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import axiosInstance from '../api/axiosInstance'
import useSessionStore from './useSessionStore'

type UserRole = 'USER' | 'CREATOR' | 'ADMIN' | 'SUPERADMIN'

interface UserState {
    // Basic user identity
    userId: number | null
    telegramUserId: bigint | null
    username: string
    email: string
    emailConfirmed: boolean
    roles: UserRole[]

    // Points, raffles, tasks
    totalPoints: number
    totalRaffles: number
    points: any[]
    userPoints: any[]
    userRaffles: any[]
    bookmarks: Array<any>

    // Auth & other state
    authenticated: boolean
    token: string | null
    hasAcademy: boolean
    sidebarOpened: boolean
    referralPointsAwarded: number
    referralCode: string | null
    loginStreakData: any

    // Twitter auth
    twitterAuthenticated: boolean
    twitterUsername: string | null
    twitterUserId: string | null

    // Wallet addresses
    erc20WalletAddress: string | null
    solanaWalletAddress: string | null
    tonWalletAddress: string | null

    // Character level
    characterLevelId: number | null
    characterLevelName: string | null

    // *** NEW FIELDS ***
    registrationIp: string | null
    registrationFingerprint: string | null
    isBanned: boolean // default false

    // Referral
    referralCompletionChecked: boolean

    // Methods
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
        // Not strictly needed here, but you could add the new fields if you pass them in loginUser
    }) => void

    logoutUser: () => void
    updateUserRoles: (roles: UserRole[]) => void
    toggleSidebar: () => void
    resetReferralPointsAwarded: () => void
    setUserReferralCompletionChecked: (checked: boolean) => void
    checkReferralCompletion: (userId: number) => Promise<void>
    setTwitterAuthenticated: (authenticated: boolean) => void
    setTwitterUserData: (username: string, userId: string) => void

    updateWalletAddresses: (addresses: { erc20WalletAddress?: string; solanaWalletAddress?: string; tonWalletAddress?: string }) => Promise<void>

    // API
    fetchUser: (telegramUserId: number) => Promise<void>
    registerUser: (telegramUserId: number, username: string, referralCode?: string | null, fingerprint?: string | null) => Promise<void>
    handleLoginStreak: () => Promise<{ userVerification: any; point: any }>
    getCurrentUser: () => Promise<void>
    addBookmark: (academyId: number) => Promise<void>
    fetchBookmarkedAcademies: (userId: number) => Promise<void>
    fetchUserPoints: (userId: number) => Promise<void>
    fetchUserRaffles: (userId: number) => Promise<void>
    fetchTwitterAuthStatus: () => Promise<void>
    removeTwitterAccount: () => Promise<string>
    fetchUserLevel: () => Promise<void>

    updateTotalPoints: (points: number) => void
    updateTotalRaffles: (amount: number) => void

    updateUserIpFingerprint: (fingerprint: string) => Promise<void>
}

const useUserStore = create<UserState>()(
    devtools((set, get) => ({
        // Basic user identity
        userId: null,
        telegramUserId: null,
        username: '',
        email: '',
        emailConfirmed: false,
        roles: ['USER'],

        // Points, raffles, tasks
        totalPoints: 0,
        totalRaffles: 0,
        points: [],
        userPoints: [],
        userRaffles: [],
        bookmarks: [],

        // Auth & other state
        authenticated: false,
        token: null,
        hasAcademy: false,
        sidebarOpened: false,
        referralPointsAwarded: 0,
        referralCode: null,
        loginStreakData: null,

        // Twitter
        twitterAuthenticated: false,
        twitterUsername: null,
        twitterUserId: null,

        // Wallet addresses
        erc20WalletAddress: null,
        solanaWalletAddress: null,
        tonWalletAddress: null,

        // Character level
        characterLevelId: null,
        characterLevelName: null,

        // *** NEW FIELDS ***
        registrationIp: null,
        registrationFingerprint: null,
        isBanned: false, // default false

        // Referral
        referralCompletionChecked: true,

        // ==========================
        //           Methods
        // ==========================

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
                // If you want to set isBanned, registrationIp, or registrationFingerprint here,
                // you can do so if your login endpoint returns them.
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
                characterLevelName: null,
                registrationIp: null,
                registrationFingerprint: null,
                isBanned: false
            }),

        updateUserRoles: (roles) => set({ roles: roles.length > 0 ? roles : ['USER'] }),

        toggleSidebar: () => set((state) => ({ sidebarOpened: !state.sidebarOpened })),

        resetReferralPointsAwarded: () => set({ referralPointsAwarded: 0 }),

        setUserReferralCompletionChecked: (checked) => {
            set({ referralCompletionChecked: checked })
        },

        // Check referral completion
        checkReferralCompletion: async (userId: number) => {
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

        // ==========================
        //           API
        // ==========================

        // 1) fetchUser
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
                        characterLevel, // includes { id, levelName }
                        raffleAmount,
                        pointCount,

                        // *** NEW FIELDS from server ***
                        registrationIp,
                        registrationFingerprint,
                        isBanned
                    } = response.data

                    const hasAcademy = academies && academies.length > 0
                    const totalPoints = pointCount || 0

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
                        characterLevelName: characterLevel?.levelName || null,

                        // *** SET NEW FIELDS IN STATE ***
                        registrationIp: registrationIp || null,
                        registrationFingerprint: registrationFingerprint || null,
                        isBanned: typeof isBanned === 'boolean' ? isBanned : false
                    })
                }
            } catch (error: any) {
                console.error('Error fetching user:', error)
                throw error
            }
        },

        // 2) registerUser
        registerUser: async (telegramUserId: number, username: string, referralCode: string | null = null, fingerprint: string | null = null) => {
            try {
                // The server side captures IP, so we only pass the fingerprint (if any).
                const registerResponse = await axiosInstance.post('/api/auth/register', {
                    telegramUserId,
                    username,
                    referralCode,
                    fingerprint
                })

                console.log('Register Response Data:', registerResponse.data)
                const { user: userData, pointsAwardedToUser } = registerResponse.data
                console.log('Points Awarded to User:', pointsAwardedToUser)

                const {
                    id,
                    name,
                    email,
                    emailConfirmed,
                    roles,
                    academies,
                    points,
                    referralCode: userReferralCode,
                    raffleAmount,
                    erc20WalletAddress,
                    solanaWalletAddress,
                    tonWalletAddress,
                    characterLevel,
                    registrationIp,
                    registrationFingerprint,
                    isBanned
                } = userData

                const hasAcademy = academies && academies.length > 0
                const totalPoints = points ? points.reduce((sum: number, p: any) => sum + p.value, 0) : 0

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
                    characterLevelName: userData.characterLevel?.levelName || null,

                    // *** SET NEW FIELDS ***
                    registrationIp: registrationIp || null,
                    registrationFingerprint: registrationFingerprint || null,
                    isBanned: typeof isBanned === 'boolean' ? isBanned : false
                }))

                console.log('Updated User State:', get())
            } catch (error: any) {
                console.error('Error registering user:', error)
                throw error
            }
        },

        // 3) handleLoginStreak
        handleLoginStreak: async () => {
            try {
                const response = await axiosInstance.post('/api/users/handle-login-streak')
                const { userVerification, point } = response.data

                if (point) {
                    const currentPoints = get().points
                    const totalPoints = (get().totalPoints || 0) + point.value

                    set({
                        totalPoints,
                        totalRaffles: get().totalRaffles || 0 + point.value / 100,
                        points: [...currentPoints, point],
                        loginStreakData: userVerification
                    })

                    // Fetch updated user level after awarding points
                    await get().fetchUserLevel()
                }

                return { userVerification, point }
            } catch (error: any) {
                console.error('Error handling login streak:', error)
                throw error
            }
        },

        // 4) getCurrentUser
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
                    totalPoints: userData.points ? userData.points.reduce((sum: number, p: any) => sum + p.value, 0) : 0,
                    points: userData.points || [],
                    totalRaffles: userData.raffleAmount,
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
                    characterLevelName: userData.characterLevel?.levelName || null,

                    // If your back-end includes them in /me:
                    registrationIp: userData.registrationIp || null,
                    registrationFingerprint: userData.registrationFingerprint || null,
                    isBanned: typeof userData.isBanned === 'boolean' ? userData.isBanned : false
                })
            } catch (error: any) {
                console.error('Error fetching current user:', error)
            }
        },

        // 5) addBookmark
        addBookmark: async (academyId: number) => {
            try {
                const telegramUserId = get().telegramUserId
                await axiosInstance.post('/api/users/interaction', {
                    telegramUserId,
                    action: 'bookmark',
                    academyId
                })
                if (telegramUserId) {
                    await get().fetchBookmarkedAcademies(Number(telegramUserId))
                }
            } catch (error: any) {
                console.error('Error adding bookmark:', error)
            }
        },

        // 6) fetchBookmarkedAcademies
        fetchBookmarkedAcademies: async (userId: number) => {
            try {
                const response = await axiosInstance.get(`/api/users/${userId}/bookmarked-academies`)
                set({ bookmarks: response.data })
            } catch (error: any) {
                console.error('Error fetching bookmarked academies:', error)
            }
        },

        // 7) fetchUserPoints
        fetchUserPoints: async (userId: number) => {
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

        // 8) fetchUserRaffles
        fetchUserRaffles: async (userId: number) => {
            if (!userId) {
                console.error('User ID is null or undefined, not fetching user raffles.')
                return
            }
            try {
                const response = await axiosInstance.get(`/api/raffle?userId=${userId}`)
                console.log('Fetched Raffles:', response.data)
                set({ userRaffles: response.data })
            } catch (error) {
                console.error('Error fetching user raffles:', error)
            }
        },

        // Update total points/raffles in the store
        updateTotalPoints: (points: number) => {
            set((state) => ({
                totalPoints: state.totalPoints + points,
                totalRaffles: state.totalRaffles + points / 100
            }))
        },

        updateTotalRaffles: (amount: number) => {
            set((state) => ({
                totalRaffles: state.totalRaffles + amount
            }))
        },

        // 9) fetchTwitterAuthStatus
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

        // 10) removeTwitterAccount
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

        // 11) fetchUserLevel
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
        },

        updateUserIpFingerprint: async (fingerprint: string) => {
            try {
                const telegramUserId = get().telegramUserId
                if (!telegramUserId) {
                    console.error('No telegramUserId in store. Cannot update IP/fingerprint.')
                    return
                }

                // We'll assume you have an endpoint: POST /api/users/ip-fingerprint
                // that captures the IP from req.headers / remoteAddress and overwrites the user.
                await axiosInstance.post('/api/users/ip-fingerprint', {
                    telegramUserId: telegramUserId.toString(), // or number
                    fingerprint
                })

                // Optionally re-fetch user to get updated registrationIp/registrationFingerprint
                await get().fetchUser(Number(telegramUserId))
                console.log('IP and fingerprint overwritten in the DB.')
            } catch (error) {
                console.error('Error updating user IP/fingerprint:', error)
            }
        }
    }))
)

export default useUserStore
