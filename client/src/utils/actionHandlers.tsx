// src/utils/actionHandlers.ts

import { VerificationTask } from '../types'
import { FaFacebook, FaInstagram, FaTelegramPlane, FaDiscord, FaYoutube, FaEnvelope } from 'react-icons/fa'
import { TbBrandX } from 'react-icons/tb'
import useUserVerificationStore from '../store/useUserVerificationStore'
import { initUtils } from '@telegram-apps/sdk'

// Define the platform icons
export const platformIcons: { [key: string]: JSX.Element } = {
    X: <TbBrandX className="w-8 h-8 !mb-3 text-gray-300 !p-0 !m-0" />,
    FACEBOOK: <FaFacebook className="w-8 h-8 !mb-3 text-blue-700 !p-0 !m-0" />,
    INSTAGRAM: <FaInstagram className="w-8 h-8 !mb-3 text-pink-500 !p-0 !m-0" />,
    TELEGRAM: <FaTelegramPlane className="w-8 h-8 !mb-3 text-blue-400 !p-0 !m-0" />,
    DISCORD: <FaDiscord className="w-8 h-8 !mb-3 text-indigo-600 !p-0 !m-0" />,
    YOUTUBE: <FaYoutube className="w-8 h-8 !mb-3 text-red-600 !p-0 !m-0" />,
    EMAIL: <FaEnvelope className="w-8 h-8 !mb-3 text-green-500 !p-0 !m-0" />
    // Add other platforms as needed
}

// Generate referral link to direct users to the bot with a referral code
export const generateReferralLink = (referralCode: string): string => {
    const botUsername = 'CoinBeatsBunny_bot' // Use the bot's username
    return `https://t.me/${botUsername}?start=${referralCode}`
}

// Handle the Invite Friend action
export const handleInviteFriend = (referralCode: string) => {
    const utils = initUtils()
    const inviteLink = generateReferralLink(referralCode)
    const shareText = 'Join me on this awesome app!'

    const fullUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(shareText)}`
    utils.openTelegramLink(fullUrl)
}

// Copy referral link to clipboard
export const copyReferralLink = (referralLink: string, setNotificationText: Function, setNotificationOpen: Function) => {
    navigator.clipboard
        .writeText(referralLink)
        .then(() => {
            setNotificationText('Referral link copied to clipboard!')
            setNotificationOpen(true)
        })
        .catch((error) => {
            console.error('Error copying referral link:', error)
        })
}

// Get action label based on verification method
export function getActionLabel(verificationMethod: string, isAuthenticated?: boolean): string {
    switch (verificationMethod) {
        case 'TWEET':
            return !isAuthenticated ? 'Authenticate' : 'Post to X'
        case 'RETWEET':
            return !isAuthenticated ? 'Authenticate' : 'Retweet'
        case 'FOLLOW_USER':
            return !isAuthenticated ? 'Authenticate' : 'Follow'
        case 'LIKE_TWEET':
            return !isAuthenticated ? 'Authenticate' : 'Like tweet'
        case 'COMMENT_ON_TWEET':
            return !isAuthenticated ? 'Authenticate' : 'Comment'
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
            return !isAuthenticated ? 'Authenticate' : 'Add to Bio'
        case 'LEAVE_FEEDBACK':
            return 'Feedback'
        case 'MEME_TWEET':
            return !isAuthenticated ? 'Authenticate' : 'Tweet Meme'
        // Add other mappings as needed
        default:
            return 'Action'
    }
}

// Determine if a task requires an input field
export function requiresInputField(task: VerificationTask): boolean {
    const methodsRequiringInput = ['SHORT_CIRCUIT', 'PROVIDE_EMAIL', 'SUBSCRIBE_YOUTUBE_CHANNEL']
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

// Extend the global Window interface to include Telegram WebApp
declare global {
    interface Window {
        Telegram?: any
    }
}

// Handle the action based on the task
export const handleAction = async (task: VerificationTask, options: { [key: string]: any }, academyId?: number) => {
    const {
        referralCode,
        setReferralLink,
        setReferralModalOpen,
        setNotificationText,
        setNotificationOpen,
        setSelectedTask,
        setFeedbackDialogOpen,
        twitterAuthenticated,
        academyName,
        twitterHandle,
        telegramUserId
    } = options
    const { startTask } = useUserVerificationStore.getState()

    console.log('handleAction called with task:', task)
    console.log('twitterAuthenticated:', twitterAuthenticated)
    console.log('telegramUserId:', telegramUserId)

    if (requiresInputField(task)) {
        console.log('Task requires input field')
        setSelectedTask(task)
        setNotificationText(task.description)
        setNotificationOpen(true)
    } else if (task.verificationMethod === 'LEAVE_FEEDBACK') {
        console.log('Task is LEAVE_FEEDBACK')
        try {
            await startTask(task.id, academyId) // Start the task
            setSelectedTask(task)
            setFeedbackDialogOpen(true)
        } catch (error) {
            console.error('Error starting task:', error)
            setNotificationText(error.response?.data?.message || 'Error starting task. Please try again later.')
            setNotificationOpen(true)
        }
    } else {
        console.log('Handling action for verificationMethod:', task.verificationMethod)
        switch (task.verificationMethod) {
            case 'FOLLOW_USER':
                if (task.platform === 'X') {
                    if (!twitterAuthenticated) {
                        console.log('User not authenticated with Twitter, starting OAuth flow')
                        const returnTo = encodeURIComponent(window.location.href) // Current page
                        const authUrl = `${import.meta.env.VITE_API_BASE_URL}/api/auth/twitter/start?telegramUserId=${telegramUserId}&returnTo=${returnTo}`
                        console.log('authUrl:', authUrl)

                        // Open the authUrl in external browser using Telegram.WebApp.openLink
                        if (window.Telegram?.WebApp?.openTelegramLink) {
                            window.Telegram.WebApp.openTelegramLink(authUrl)
                        } else {
                            window.open(authUrl, '_blank')
                        }
                    } else {
                        const username = task.parameters?.username // Get the username from task parameters
                        if (!username) {
                            setNotificationText('Username is not specified for this task.')
                            setNotificationOpen(true)
                            return
                        }
                        window.open(`https://twitter.com/${username}`, '_blank')

                        try {
                            await startTask(task.id, academyId)
                        } catch (error) {
                            console.error('Error starting task:', error)
                        }
                    }
                } else if (task.platform === 'INSTAGRAM') {
                    const username = task.parameters?.username
                    if (!username) {
                        setNotificationText('Instagram username is not specified for this task.')
                        setNotificationOpen(true)
                        return
                    }
                    window.open(`https://www.instagram.com/${username}/`, '_blank')

                    try {
                        await startTask(task.id, academyId)
                    } catch (error) {
                        console.error('Error starting task:', error)
                    }
                }
                // Add handling for other platforms if needed
                break

            case 'TWEET':
                if (!twitterAuthenticated) {
                    console.log('User not authenticated with Twitter, starting OAuth flow')
                    const returnTo = encodeURIComponent(window.location.href)
                    const authUrl = `${import.meta.env.VITE_API_BASE_URL}/api/auth/twitter/start?telegramUserId=${telegramUserId}&returnTo=${returnTo}`
                    console.log('authUrl:', authUrl)

                    // Open the authUrl in external browser using Telegram.WebApp.openLink
                    if (window.Telegram?.WebApp?.openTelegramLink) {
                        window.Telegram.WebApp.openTelegramLink(authUrl)
                    } else {
                        window.open(authUrl, '_blank')
                    }
                } else {
                    let tweetText = ''
                    if (task.parameters?.tweetText) {
                        tweetText = task.parameters.tweetText
                    } else if (academyName && twitterHandle) {
                        tweetText = `🎉 I just completed ${academyName} ${twitterHandle} academy on CoinBeats Crypto School @CoinBeatsxyz`
                    } else {
                        tweetText = 'I just completed an academy on CoinBeats Crypto School @CoinBeatsxyz'
                    }
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank')

                    try {
                        await startTask(task.id, academyId)
                    } catch (error) {
                        console.error('Error starting task:', error)
                    }
                }
                break

            case 'RETWEET':
                console.log('Handling RETWEET action')
                const retweetId = task.parameters?.tweetId
                if (!retweetId) {
                    setNotificationText('Tweet ID is not specified for this task.')
                    setNotificationOpen(true)
                    return
                }
                window.open(`https://twitter.com/intent/retweet?tweet_id=${retweetId}`, '_blank')

                try {
                    await startTask(task.id, academyId)
                } catch (error) {
                    console.error('Error starting task:', error)
                }
                break

            case 'LIKE_TWEET':
                console.log('Handling LIKE_TWEET action')
                const likeTweetId = task.parameters?.tweetId
                if (!likeTweetId) {
                    setNotificationText('Tweet ID is not specified for this task.')
                    setNotificationOpen(true)
                    return
                }
                window.open(`https://twitter.com/intent/like?tweet_id=${likeTweetId}`, '_blank')

                try {
                    await startTask(task.id, academyId)
                } catch (error) {
                    console.error('Error starting task:', error)
                }
                break

            case 'COMMENT_ON_TWEET':
                console.log('Handling COMMENT_ON_TWEET action')
                const commentTweetId = task.parameters?.tweetId
                if (!commentTweetId) {
                    setNotificationText('Tweet ID is not specified for this task.')
                    setNotificationOpen(true)
                    return
                }
                window.open(`https://twitter.com/intent/tweet?in_reply_to=${commentTweetId}`, '_blank')

                try {
                    await startTask(task.id, academyId)
                } catch (error) {
                    console.error('Error starting task:', error)
                }
                break

            case 'JOIN_TELEGRAM_CHANNEL':
                console.log('Handling JOIN_TELEGRAM_CHANNEL action')
                const telegramChannelLink = task.parameters?.channelLink
                if (!telegramChannelLink) {
                    setNotificationText('Telegram channel link is not specified for this task.')
                    setNotificationOpen(true)
                    return
                }
                window.open(telegramChannelLink, '_blank')

                try {
                    await startTask(task.id, academyId)
                } catch (error) {
                    console.error('Error starting task:', error)
                }
                break

            case 'INVITE_TELEGRAM_FRIEND':
                console.log('Handling INVITE_TELEGRAM_FRIEND action')
                try {
                    const userReferralCode = referralCode
                    if (!userReferralCode) {
                        setNotificationText('Referral code not available.')
                        setNotificationOpen(true)
                        return
                    }
                    const referralLink = generateReferralLink(userReferralCode)
                    setReferralLink(referralLink)
                    setReferralModalOpen(true)
                } catch (error) {
                    console.error('Error generating referral link:', error)
                }
                break

            case 'SUBSCRIBE_YOUTUBE_CHANNEL':
                console.log('Handling SUBSCRIBE_YOUTUBE_CHANNEL action')
                const youtubeChannelUrl = task.parameters?.channelUrl
                if (!youtubeChannelUrl) {
                    setNotificationText('YouTube channel URL is not specified for this task.')
                    setNotificationOpen(true)
                    return
                }
                window.open(youtubeChannelUrl, '_blank')

                try {
                    await startTask(task.id, academyId)
                } catch (error) {
                    console.error('Error starting task:', error)
                }
                break

            case 'WATCH_YOUTUBE_VIDEO':
                console.log('Handling WATCH_YOUTUBE_VIDEO action')
                const youtubeVideoUrl = task.parameters?.videoUrl
                if (!youtubeVideoUrl) {
                    setNotificationText('YouTube video URL is not specified for this task.')
                    setNotificationOpen(true)
                    return
                }
                window.open(youtubeVideoUrl, '_blank')

                try {
                    await startTask(task.id, academyId)
                } catch (error) {
                    console.error('Error starting task:', error)
                }
                break

            case 'PROVIDE_EMAIL':
                console.log('Handling PROVIDE_EMAIL action')
                setNotificationText('Please provide your email in the next step.')
                setNotificationOpen(true)

                try {
                    await startTask(task.id, academyId)
                } catch (error) {
                    console.error('Error starting task:', error)
                }
                break

            case 'ADD_TO_BIO':
                console.log('Handling ADD_TO_BIO action')
                setNotificationText('Please add "@CoinBeatsxyz Student" to your X bio.')
                setNotificationOpen(true)
                window.open('https://twitter.com/settings/profile', '_blank')

                try {
                    await startTask(task.id, academyId)
                } catch (error) {
                    console.error('Error starting task:', error)
                }
                break

            case 'SHORT_CIRCUIT':
                console.log('Handling SHORT_CIRCUIT action')
                setNotificationText(task.description)
                setNotificationOpen(true)

                try {
                    await startTask(task.id, academyId)
                } catch (error) {
                    console.error('Error starting task:', error)
                }
                break

            default:
                setNotificationText('This action is not supported yet.')
                setNotificationOpen(true)
                break
        }
    }
}

// Determine if the action button should be disabled
export const shouldDisableActionButton = (task: VerificationTask, userVerificationTasks: any[], academyId?: number): boolean => {
    const userVerification = userVerificationTasks.find((verification) => verification.verificationTaskId === task.id && verification.academyId === academyId)

    if (!userVerification) {
        return false // Task has not been started by the user yet
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

// Determine if the verify button should be disabled
export const shouldDisableVerifyButton = (task: VerificationTask, userVerificationTasks: any[], academyId?: number): boolean => {
    const userVerification = userVerificationTasks.find((verification) => verification.verificationTaskId === task.id && verification.academyId === academyId)

    const isVerified = userVerification?.verified || false

    // Disable the button only if the task is completed and verified
    return isVerified
}

// Handle task submission
export const handleSubmitTask = async (task: VerificationTask, submissionText: string, options: { [key: string]: any }) => {
    const { setNotificationText, setNotificationOpen, setSubmittedTasks, submittedTasks, setTaskInputValues, taskInputValues, userId, academyId } = options
    const { startTask, submitTask } = useUserVerificationStore.getState()

    if (!submissionText || submissionText.length < 5) {
        setNotificationText('Please enter at least 5 characters.')
        setNotificationOpen(true)
        return
    }

    try {
        await startTask(task.id, academyId)
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

// Helper function to check if two dates are on the same day
function isSameDay(d1: Date, d2: Date): boolean {
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()
}

export const handleTwitterAuthentication = (
    telegramUserId: string,
    options: { setNotificationText: Function; setNotificationOpen: Function },
    returnToUrl?: string
) => {
    const { setNotificationText, setNotificationOpen } = options

    const returnTo = encodeURIComponent(returnToUrl || window.location.origin) // Use a shorter URL
    const authUrl = `${import.meta.env.VITE_API_BASE_URL}/api/auth/twitter/start?telegramUserId=${telegramUserId}&returnTo=${returnTo}`

    // Platform detection using user agent
    const userAgent = navigator.userAgent || navigator.vendor || ''
    console.log('User agent:', userAgent)

    const isAndroid = /Android/i.test(userAgent)
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent)
    const isDesktop = !isAndroid && !isIOS

    console.log('isAndroid:', isAndroid)
    console.log('isIOS:', isIOS)
    console.log('isDesktop:', isDesktop)

    if (isIOS) {
        console.log('iOS device detected. Using window.location.href')
        if (window.Telegram?.WebApp?.openLink) {
            window.Telegram.WebApp.openLink(authUrl, { target: 'external' })
        } else {
            window.open(authUrl, '_blank')
        }
    } else if (isAndroid) {
        console.log('Android device detected. Attempting to open link using intent')
        // Try using intent scheme for Android
        window.open(authUrl, '_blank')
    } else {
        console.log('Desktop or unknown device detected. Using alternative methods to open link')

        window.open(authUrl, '_blank')
    }
}
