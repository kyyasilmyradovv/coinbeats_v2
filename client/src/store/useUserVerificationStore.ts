// src/store/useUserVerificationStore.ts

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import axiosInstance from '../api/axiosInstance'
import useUserStore from './useUserStore'

interface UserVerificationTask {
    id: number
    userId: number
    verificationTaskId: number
    academyId?: number
    verified: boolean
    createdAt: string
    completedAt: string | null
}

interface VerificationTask {
    id: number
    name: string
    description: string
    xp: number
    platform: string
    verificationMethod: string
    intervalType: string
    shortCircuit: boolean
    shortCircuitTimer: number | null
}

interface UserVerificationState {
    userVerificationTasks: UserVerificationTask[]
    fetchUserVerificationTasks: () => Promise<void>
    startTask: (taskId: number, academyId?: number) => Promise<void>
    submitTask: (taskId: number, submissionText: string) => Promise<void>
    completeTask: (taskId: number, academyId?: number) => Promise<string>
    getActionLabel: (verificationMethod: string) => string
    requiresInputField: (task: VerificationTask) => boolean
    getInputPlaceholder: (task: VerificationTask) => string
    performAction: (task: VerificationTask, referralCode?: string) => Promise<{ notificationText?: string; referralLink?: string }>
}

const useUserVerificationStore = create<UserVerificationState>()(
    devtools((set, get) => ({
        userVerificationTasks: [],
        fetchUserVerificationTasks: async () => {
            const { userId } = useUserStore.getState()
            if (!userId) {
                console.error('User ID is null or undefined, not fetching user verification tasks.')
                return
            }

            try {
                const response = await axiosInstance.post('/api/users/verification-tasks', { userId })
                set({ userVerificationTasks: response.data })
            } catch (error) {
                console.error('Error fetching user verification tasks:', error)
            }
        },
        startTask: async (taskId, academyId) => {
            const { userId } = useUserStore.getState()
            if (!userId) {
                console.error('User not authenticated.')
                throw new Error('User not authenticated.')
            }

            try {
                await axiosInstance.post('/api/users/start-task', { taskId, userId, academyId })
            } catch (error) {
                console.error('Error starting task:', error)
                throw error
            }
        },
        submitTask: async (taskId, submissionText) => {
            const { userId } = useUserStore.getState()
            if (!userId) {
                console.error('User not authenticated.')
                throw new Error('User not authenticated.')
            }

            try {
                await axiosInstance.post('/api/users/submit-task', { taskId, submissionText, userId })
            } catch (error) {
                console.error('Error submitting task:', error)
                throw error
            }
        },
        completeTask: async (taskId, academyId) => {
            const { userId } = useUserStore.getState()
            if (!userId) {
                console.error('User not authenticated.')
                throw new Error('User not authenticated.')
            }

            try {
                const response = await axiosInstance.post('/api/users/complete-task', { taskId, userId, academyId })
                const { message, pointsAwarded } = response.data

                if (pointsAwarded) {
                    const { totalRaffles, totalPoints } = useUserStore.getState()
                    useUserStore.setState({ totalPoints: totalPoints + pointsAwarded, totalRaffles: totalRaffles + pointsAwarded / 100 })
                }

                // Refresh user verification tasks
                await get().fetchUserVerificationTasks()

                return message
            } catch (error) {
                console.error('Error completing task:', error)
                throw error
            }
        },
        getActionLabel: (verificationMethod: string) => {
            switch (verificationMethod) {
                case 'TWEET':
                    return 'Tweet'
                case 'RETWEET':
                    return 'Retweet'
                case 'FOLLOW_USER':
                    return 'Follow'
                case 'LIKE_TWEET':
                    return 'Like'
                case 'COMMENT_ON_TWEET':
                    return 'Comment'
                case 'JOIN_TELEGRAM_CHANNEL':
                    return 'Join'
                case 'INVITE_TELEGRAM_FRIEND':
                    return 'Invite'
                case 'PROVIDE_EMAIL':
                    return 'Submit'
                case 'WATCH_YOUTUBE_VIDEO':
                    return 'Watch'
                case 'SUBSCRIBE_YOUTUBE_CHANNEL':
                    return 'Subscribe'
                case 'ADD_TO_BIO':
                    return 'Add to Bio'
                case 'LEAVE_FEEDBACK':
                    return 'Feedback'
                // Add other mappings as needed
                default:
                    return 'Action'
            }
        },
        requiresInputField: (task: VerificationTask): boolean => {
            const methodsRequiringInput = ['SHORT_CIRCUIT', 'PROVIDE_EMAIL', 'ADD_TO_BIO', 'SUBSCRIBE_YOUTUBE_CHANNEL']
            return methodsRequiringInput.includes(task.verificationMethod)
        },
        getInputPlaceholder: (task: VerificationTask): string => {
            switch (task.name) {
                case 'Shill CB in other TG channels':
                    return 'Paste the message URL here'
                case 'Create and post CoinBeats meme':
                    return 'Paste the link to your meme here'
                case 'Join our newsletter':
                    return 'Enter your email address here'
                case '“@CoinBeatsxyz Student” to X bio':
                    return 'Enter your X username here'
                case 'Subscribe to @CoinBeats Youtube':
                    return 'Paste your YouTube username here'
                default:
                    return 'Enter your submission here'
            }
        },
        performAction: async (
            task: VerificationTask,
            referralCode?: string,
            academyId?: number
        ): Promise<{ notificationText?: string; referralLink?: string }> => {
            const { startTask, fetchUserVerificationTasks } = get()
            if (get().requiresInputField(task)) {
                // Task requires input, return notification text
                return { notificationText: task.description }
            } else if (task.verificationMethod === 'LEAVE_FEEDBACK') {
                // Handle feedback separately in the component
                return { notificationText: '' } // Empty text, component can handle accordingly
            } else {
                // Direct the user to the appropriate action
                try {
                    switch (task.verificationMethod) {
                        case 'TWEET':
                            const tweetText = encodeURIComponent(task.description || '')
                            window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank')
                            break
                        case 'RETWEET':
                            const retweetId = '1843673683413610985' // Replace with actual tweet ID
                            window.open(`https://twitter.com/intent/retweet?tweet_id=${retweetId}`, '_blank')
                            break
                        case 'FOLLOW_USER':
                            const username = 'ClipFinance' // Replace with actual username
                            window.open(`https://twitter.com/${username}`, '_blank')
                            break
                        case 'LIKE_TWEET':
                            const likeTweetId = '1843673683413610985' // Replace with actual tweet ID
                            window.open(`https://twitter.com/intent/like?tweet_id=${likeTweetId}`, '_blank')
                            break
                        case 'COMMENT_ON_TWEET':
                            const commentTweetId = '1843673683413610985' // Replace with actual tweet ID
                            window.open(`https://twitter.com/intent/tweet?in_reply_to=${commentTweetId}`, '_blank')
                            break
                        case 'JOIN_TELEGRAM_CHANNEL':
                            const telegramChannelLink = 'https://t.me/coinbeatsdiscuss' // Replace with your Telegram channel link
                            window.open(telegramChannelLink, '_blank')
                            break
                        case 'INVITE_TELEGRAM_FRIEND':
                            if (!referralCode) {
                                return { notificationText: 'Referral code not available.' }
                            }
                            const botUsername = 'CoinbeatsMiniApp_bot/miniapp' // Replace with your bot's username
                            const referralLink = `https://t.me/${botUsername}?startapp=${referralCode}`
                            return { referralLink }
                        case 'SUBSCRIBE_YOUTUBE_CHANNEL':
                            const youtubeChannelUrl = 'https://www.youtube.com/@CoinBeats' // Replace with your YouTube channel URL
                            window.open(youtubeChannelUrl, '_blank')
                            break
                        case 'WATCH_YOUTUBE_VIDEO':
                            const youtubeVideoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' // Replace with your YouTube video URL
                            window.open(youtubeVideoUrl, '_blank')
                            break
                        case 'FOLLOW_INSTAGRAM_USER':
                            const instagramUsername = 'coinbeatsxyz' // Replace with actual username
                            window.open(`https://www.instagram.com/${instagramUsername}/`, '_blank')
                            break
                        case 'JOIN_DISCORD_CHANNEL':
                            const discordInviteLink = 'https://discord.gg/your-invite-code' // Replace with your Discord invite link
                            window.open(discordInviteLink, '_blank')
                            break
                        case 'PROVIDE_EMAIL':
                            return { notificationText: 'Please provide your email in the next step.' }
                        case 'ADD_TO_BIO':
                            return { notificationText: 'Please add "@CoinBeatsxyz Student" to your X bio.' }
                        case 'SHORT_CIRCUIT':
                            return { notificationText: task.description }
                        default:
                            break
                    }

                    // Start the task in the background
                    await startTask(task.id, academyId)
                    // Fetch updated user verification tasks
                    await fetchUserVerificationTasks()
                } catch (error) {
                    console.error('Error starting task:', error)
                    throw error
                }
            }

            return {}
        }
    }))
)

export default useUserVerificationStore
