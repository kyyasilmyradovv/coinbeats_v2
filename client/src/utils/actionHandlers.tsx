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
export function getActionLabel(verificationMethod: string, isAuthenticated?: boolean): string {
    switch (verificationMethod) {
        case 'TWEET':
            return 'Tweet'
        case 'RETWEET':
            return 'Retweet'
        case 'FOLLOW_USER':
            return !isAuthenticated ? 'Authenticate' : 'Follow'
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
    const {
        referralCode,
        setReferralLink,
        setReferralModalOpen,
        setNotificationText,
        setNotificationOpen,
        setSelectedTask,
        setFeedbackDialogOpen,
        twitterAuthenticated
    } = options
    const { userId } = useSessionStore.getState()
    const { startTask } = useUserVerificationStore.getState()

    if (task.verificationMethod === 'FOLLOW_USER' && task.platform === 'X') {
        if (!twitterAuthenticated) {
            // Redirect to backend endpoint to initiate OAuth flow
            window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/auth/twitter/start?telegramUserId=${userId}`
        } else {
            // User is authenticated with Twitter, proceed to perform the action
            const username = task.parameters?.username // Get the username from task parameters
            if (!username) {
                setNotificationText('Username is not specified for this task.')
                setNotificationOpen(true)
                return
            }
            window.open(`https://twitter.com/${username}`, '_blank')

            // Start the task in the background
            try {
                await startTask(task.id, userId)
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
                const retweetId = task.parameters?.tweetId // Replace with actual tweet ID from task parameters
                if (!retweetId) {
                    setNotificationText('Tweet ID is not specified for this task.')
                    setNotificationOpen(true)
                    return
                }
                window.open(`https://twitter.com/intent/retweet?tweet_id=${retweetId}`, '_blank')
                break

            case 'FOLLOW_USER':
                if (!twitterAuthenticated) {
                    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/auth/twitter/start?telegramUserId=${userId}`
                } else {
                    const username = task.parameters.username // Get the username from task parameters
                    if (!username) {
                        setNotificationText('Username is not specified for this task.')
                        setNotificationOpen(true)
                        return
                    }
                    window.open(`https://twitter.com/${username}`, '_blank')

                    try {
                        await startTask(task.id)
                    } catch (error) {
                        console.error('Error starting task:', error)
                    }
                }
                break

            case 'LIKE_TWEET':
                const likeTweetId = task.parameters?.tweetId // Replace with actual tweet ID from task parameters
                if (!likeTweetId) {
                    setNotificationText('Tweet ID is not specified for this task.')
                    setNotificationOpen(true)
                    return
                }
                window.open(`https://twitter.com/intent/like?tweet_id=${likeTweetId}`, '_blank')
                break
            case 'COMMENT_ON_TWEET':
                const commentTweetId = task.parameters?.tweetId // Replace with actual tweet ID from task parameters
                if (!commentTweetId) {
                    setNotificationText('Tweet ID is not specified for this task.')
                    setNotificationOpen(true)
                    return
                }
                window.open(`https://twitter.com/intent/tweet?in_reply_to=${commentTweetId}`, '_blank')
                break
            case 'JOIN_TELEGRAM_CHANNEL':
                const telegramChannelLink = task.parameters?.channelLink // Replace with your Telegram channel link
                if (!telegramChannelLink) {
                    setNotificationText('Telegram channel link is not specified for this task.')
                    setNotificationOpen(true)
                    return
                }
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
                const youtubeChannelUrl = task.parameters?.channelUrl // Replace with your YouTube channel URL
                if (!youtubeChannelUrl) {
                    setNotificationText('YouTube channel URL is not specified for this task.')
                    setNotificationOpen(true)
                    return
                }
                window.open(youtubeChannelUrl, '_blank')
                break
            case 'WATCH_YOUTUBE_VIDEO':
                const youtubeVideoUrl = task.parameters?.videoUrl // Replace with your YouTube video URL
                if (!youtubeVideoUrl) {
                    setNotificationText('YouTube video URL is not specified for this task.')
                    setNotificationOpen(true)
                    return
                }
                window.open(youtubeVideoUrl, '_blank')
                break
            case 'FOLLOW_INSTAGRAM_USER':
                const instagramUsername = task.parameters?.username // Replace with actual username
                if (!instagramUsername) {
                    setNotificationText('Instagram username is not specified for this task.')
                    setNotificationOpen(true)
                    return
                }
                window.open(`https://www.instagram.com/${instagramUsername}/`, '_blank')
                break
            case 'JOIN_DISCORD_CHANNEL':
                const discordInviteLink = task.parameters?.inviteLink // Replace with your Discord invite link
                if (!discordInviteLink) {
                    setNotificationText('Discord invite link is not specified for this task.')
                    setNotificationOpen(true)
                    return
                }
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
            await startTask(task.id, userId)
        } catch (error) {
            console.error('Error starting task:', error)
        }
    }
}

// Determine if the action button should be disabled
export const shouldDisableActionButton = (task: VerificationTask, userVerificationTasks: any[]): boolean => {
    const userVerification = userVerificationTasks.find((verification) => verification.verificationTaskId === task.id)

    if (!userVerification) {
        return false // Task has not been started by the user yet
    }

    const isVerified = userVerification.verified
    const completedToday = isVerified && isSameDay(new Date(), new Date(userVerification.completedAt))
    // const timerCheck = hasTimerPassed(userVerification.createdAt, verificationTask.shortCircuitTimer);

    if (task.intervalType === 'ONETIME' && isVerified) {
        return true // Disable button for one-time tasks that are already completed
    }

    if (task.intervalType === 'REPEATED' && completedToday) {
        return true // Disable button if the task is repeated but completed today
    }

    return false
}

// Determine if the verify button should be disabled
export const shouldDisableVerifyButton = (task: VerificationTask, userVerificationTasks: any[]): boolean => {
    const userVerification = userVerificationTasks.find((verification) => verification.verificationTaskId === task.id)

    if (!userVerification) {
        return true // Disable if task not started
    }

    const isVerified = userVerification.verified
    const completedToday = isVerified && isSameDay(new Date(), new Date(userVerification.completedAt))

    if (task.intervalType === 'ONETIME' && isVerified) {
        return true // Disable button for one-time tasks that are already completed
    }

    if (task.intervalType === 'REPEATED' && completedToday) {
        return true // Disable button if the task is repeated but completed today
    }

    return false
}

// Handle task submission
export const handleSubmitTask = async (task: VerificationTask, submissionText: string, options: { [key: string]: any }) => {
    const { setNotificationText, setNotificationOpen, setSubmittedTasks, submittedTasks, setTaskInputValues, taskInputValues, userId } = options
    const { startTask, submitTask } = useUserVerificationStore.getState()

    if (!submissionText || submissionText.length < 5) {
        setNotificationText('Please enter at least 5 characters.')
        setNotificationOpen(true)
        return
    }

    try {
        await startTask(task.id, userId)
        await submitTask(task.id, submissionText, userId)
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
