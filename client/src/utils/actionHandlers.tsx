// src/utils/actionHandlers.ts

import { VerificationTask } from '../types'
import { FaTwitter, FaFacebook, FaInstagram, FaTelegramPlane, FaDiscord, FaYoutube, FaEnvelope } from 'react-icons/fa'
import { initUtils } from '@telegram-apps/sdk'
import useUserStore from '../store/useUserStore'
import useSessionStore from '../store/useSessionStore'
import useUserVerificationStore from '../store/useUserVerificationStore'

// Define the platform icons
export const platformIcons: { [key: string]: JSX.Element } = {
    X: <FaTwitter className="w-8 h-8 !mb-3 text-blue-500 !p-0 !m-0" />,
    FACEBOOK: <FaFacebook className="w-8 h-8 !mb-3 text-blue-700 !p-0 !m-0" />,
    INSTAGRAM: <FaInstagram className="w-8 h-8 !mb-3 text-pink-500 !p-0 !m-0" />,
    TELEGRAM: <FaTelegramPlane className="w-8 h-8 !mb-3 text-blue-400 !p-0 !m-0" />,
    DISCORD: <FaDiscord className="w-8 h-8 !mb-3 text-indigo-600 !p-0 !m-0" />,
    YOUTUBE: <FaYoutube className="w-8 h-8 !mb-3 text-red-600 !p-0 !m-0" />,
    EMAIL: <FaEnvelope className="w-8 h-8 !mb-3 text-green-500 !p-0 !m-0" />
    // Add other platforms as needed
}

// Get action label based on verification method
export function getActionLabel(verificationMethod: string, isAuthenticated?: boolean, isVerified?: boolean) {
    switch (verificationMethod) {
        case 'TWEET':
            return 'Tweet'
        case 'RETWEET':
            return 'Retweet'
        case 'FOLLOW_USER':
            if (!isAuthenticated) {
                return 'Authenticate'
            } else if (isVerified) {
                return 'Completed'
            } else {
                return 'Follow'
            }
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
}

// Determine if a task requires an input field
export function requiresInputField(task: VerificationTask): boolean {
    const methodsRequiringInput = ['SHORT_CIRCUIT', 'PROVIDE_EMAIL', 'ADD_TO_BIO', 'SUBSCRIBE_YOUTUBE_CHANNEL']
    return methodsRequiringInput.includes(task.verificationMethod)
}

// Get placeholder text based on task name
export function getInputPlaceholder(task: VerificationTask): string {
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
}

// Handle the action based on the task
export const handleAction = async (task: VerificationTask, options: { [key: string]: any }) => {
    const { referralCode, setReferralLink, setReferralModalOpen, setNotificationText, setNotificationOpen, setSelectedTask, setFeedbackDialogOpen } = options
    const { twitterAuthenticated, fetchTwitterAuthStatus } = useUserStore.getState()
    const { userId } = useSessionStore.getState()
    const { startTask } = useUserVerificationStore.getState()

    if (task.verificationMethod === 'FOLLOW_USER' && task.platform === 'X') {
        if (!twitterAuthenticated) {
            // Redirect to backend endpoint to initiate OAuth flow
            window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/auth/twitter/start?telegramUserId=${userId}`
        } else {
            // User is authenticated with Twitter, proceed to perform the action
            const username = 'CoinBeatsxyz' // Replace with actual username
            window.open(`https://twitter.com/${username}`, '_blank')

            // Start the task in the background
            try {
                await startTask(task.id)
            } catch (error) {
                console.error('Error starting task:', error)
            }
        }
    } else if (requiresInputField(task)) {
        setSelectedTask(task)
        setNotificationText(task.description)
        setNotificationOpen(true)
    } else if (task.verificationMethod === 'LEAVE_FEEDBACK') {
        setSelectedTask(task)
        setFeedbackDialogOpen(true)
    } else {
        // Direct the user to the appropriate action
        switch (task.verificationMethod) {
            case 'TWEET':
                const tweetText = encodeURIComponent(task.description || '')
                window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank')
                break
            case 'RETWEET':
                const retweetId = '1847151143173951933' // Replace with actual tweet ID
                window.open(`https://twitter.com/intent/retweet?tweet_id=${retweetId}`, '_blank')
                break
            case 'FOLLOW_USER':
                const username = 'CoinBeatsxyz' // Replace with actual username
                window.open(`https://twitter.com/${username}`, '_blank')
                break
            case 'LIKE_TWEET':
                const likeTweetId = '1847151143173951933' // Replace with actual tweet ID
                window.open(`https://twitter.com/intent/like?tweet_id=${likeTweetId}`, '_blank')
                break
            case 'COMMENT_ON_TWEET':
                const commentTweetId = '1847151143173951933' // Replace with actual tweet ID
                window.open(`https://twitter.com/intent/tweet?in_reply_to=${commentTweetId}`, '_blank')
                break
            case 'JOIN_TELEGRAM_CHANNEL':
                const telegramChannelLink = 'https://t.me/coinbeatsdiscuss' // Replace with your Telegram channel link
                window.open(telegramChannelLink, '_blank')
                break
            case 'INVITE_TELEGRAM_FRIEND':
                try {
                    const userReferralCode = referralCode
                    if (!userReferralCode) {
                        setNotificationText('Referral code not available.')
                        setNotificationOpen(true)
                        return
                    }
                    const botUsername = 'CoinbeatsMiniApp_bot/miniapp' // Replace with your bot's username
                    const referralLink = `https://t.me/${botUsername}?startapp=${userReferralCode}`
                    setReferralLink(referralLink)
                    setReferralModalOpen(true)
                } catch (error) {
                    console.error('Error fetching user data:', error)
                }
                break
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
                setNotificationText('Please provide your email in the next step.')
                setNotificationOpen(true)
                break
            case 'ADD_TO_BIO':
                setNotificationText('Please add "CoinBeats Student" to your X bio.')
                setNotificationOpen(true)
                window.open('https://twitter.com/settings/profile', '_blank')
                break
            case 'SHORT_CIRCUIT':
                setNotificationText(task.description)
                setNotificationOpen(true)
                break
            default:
                break
        }

        // Start the task in the background
        try {
            await startTask(task.id)
        } catch (error) {
            console.error('Error starting task:', error)
        }
    }
}

// Determine if the action button should be disabled
export const shouldDisableButton = (task: VerificationTask, userVerificationTasks: any[]) => {
    const userVerification = userVerificationTasks.find((verification) => verification.verificationTaskId === task.id)

    if (!userVerification) {
        return false // Task has not been started by the user yet
    }

    const isVerified = userVerification.verified
    const completedToday = isVerified && isSameDay(new Date(), new Date(userVerification.completedAt))
    const timerCheck = hasTimerPassed(userVerification.createdAt, 1000)

    if (task.intervalType === 'ONETIME' && isVerified) {
        return true // Disable button for one-time tasks that are already completed
    }

    if (task.intervalType === 'REPEATED' && completedToday && !timerCheck) {
        return true // Disable button if the task is repeated but completed today and timer not passed
    }

    return false
}

// Handle task submission
export const handleSubmitTask = async (task: VerificationTask, submissionText: string, options: { [key: string]: any }) => {
    const { setNotificationText, setNotificationOpen, setSubmittedTasks, submittedTasks, setTaskInputValues, taskInputValues } = options
    const { startTask, submitTask } = useUserVerificationStore.getState()

    if (!submissionText || submissionText.length < 5) {
        setNotificationText('Please enter at least 5 characters.')
        setNotificationOpen(true)
        return
    }

    try {
        await startTask(task.id)
        await submitTask(task.id, submissionText)
        setNotificationText('Submission successful!')
        setNotificationOpen(true)
        setSubmittedTasks({ ...submittedTasks, [task.id]: true })
        // Clear the input value
        setTaskInputValues({ ...taskInputValues, [task.id]: '' })
    } catch (error) {
        console.error('Error submitting task:', error)
        setNotificationText('Submission failed')
        setNotificationOpen(true)
    }
}

// Helper functions
function isSameDay(d1: Date, d2: Date) {
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()
}

function hasTimerPassed(taskCreatedAt: string, timer: number) {
    const createdAt = new Date(taskCreatedAt).getTime()
    const now = Date.now()
    const timeElapsed = (now - createdAt) / 1000 // Convert milliseconds to seconds

    return timeElapsed > timer // Return true if timer seconds have passed
}
