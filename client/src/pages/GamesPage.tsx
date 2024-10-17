// src/pages/GamesPage.tsx

import React, { useState, useEffect } from 'react'
import { Page, Button, Dialog, ListInput, List, Notification } from 'konsta/react'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'
import BottomTabBar from '../components/BottomTabBar'
import coinStackIcon from '../images/coin-stack.png'
import { FaTwitter, FaFacebook, FaInstagram, FaTelegramPlane, FaDiscord, FaYoutube, FaEnvelope } from 'react-icons/fa'
import { initUtils } from '@telegram-apps/sdk'
import bunnyLogo from '../images/bunny-mascot.png'
import coinbeats from '../images/coinbeats-l.svg'
import useUserStore from '../store/useUserStore'
import useTasksStore from '../store/useTasksStore'
import useUserVerificationStore from '../store/useUserVerificationStore'
import Lottie from 'react-lottie'
import bunnyHappyAnimationData from '../animations/bunny-happy.json'

const bunnyHappyAnimation = {
    loop: true,
    autoplay: true,
    animationData: bunnyHappyAnimationData,
    rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice'
    }
}

// Utility function to check if two dates are the same day
const isSameDay = (d1, d2) => {
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()
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

export default function GamesPage() {
    const { userId, referralCode } = useUserStore((state) => ({
        userId: state.userId,
        referralCode: state.referralCode
    }))

    const { gameTasks, fetchGameTasks } = useTasksStore((state) => ({
        gameTasks: state.gameTasks,
        fetchGameTasks: state.fetchGameTasks
    }))

    const { userVerificationTasks, fetchUserVerificationTasks, startTask, submitTask, completeTask } = useUserVerificationStore((state) => ({
        userVerificationTasks: state.userVerificationTasks,
        fetchUserVerificationTasks: state.fetchUserVerificationTasks,
        startTask: state.startTask,
        submitTask: state.submitTask,
        completeTask: state.completeTask
    }))

    const [activeTab, setActiveTab] = useState('tab-3')
    const [referralModalOpen, setReferralModalOpen] = useState(false)
    const [referralLink, setReferralLink] = useState('')
    const [visibleTooltip, setVisibleTooltip] = useState<number | null>(null)
    const [activeTaskTab, setActiveTaskTab] = useState('repeated')
    const [notificationOpen, setNotificationOpen] = useState(false)
    const [notificationText, setNotificationText] = useState('')
    const [selectedTask, setSelectedTask] = useState<VerificationTask | null>(null)
    const [taskInputValues, setTaskInputValues] = useState<{ [key: number]: string }>({})
    const [submittedTasks, setSubmittedTasks] = useState<{ [key: number]: boolean }>({})

    // Feedback handling state variables
    const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
    const [feedbackText, setFeedbackText] = useState('')

    useEffect(() => {
        fetchGameTasks()
        fetchUserVerificationTasks()
    }, [fetchGameTasks, fetchUserVerificationTasks])

    const hasTimerPassed = (taskCreatedAt: string, timer: number) => {
        const createdAt = new Date(taskCreatedAt).getTime()
        const now = Date.now()
        const timeElapsed = (now - createdAt) / 1000 // Convert milliseconds to seconds

        return timeElapsed > timer // Return true if timer seconds have passed
    }

    const toggleTooltip = (tooltipIndex: number) => {
        if (visibleTooltip === tooltipIndex) {
            setVisibleTooltip(null)
        } else {
            setVisibleTooltip(tooltipIndex)
        }
    }

    const platformIcons: { [key: string]: JSX.Element } = {
        X: <FaTwitter className="w-8 h-8 !mb-3 text-blue-500 !p-0 !m-0" />,
        FACEBOOK: <FaFacebook className="w-8 h-8 !mb-3 text-blue-700 !p-0 !m-0" />,
        INSTAGRAM: <FaInstagram className="w-8 h-8 !mb-3 text-pink-500 !p-0 !m-0" />,
        TELEGRAM: <FaTelegramPlane className="w-8 h-8 !mb-3 text-blue-400 !p-0 !m-0" />,
        DISCORD: <FaDiscord className="w-8 h-8 !mb-3 text-indigo-600 !p-0 !m-0" />,
        YOUTUBE: <FaYoutube className="w-8 h-8 !mb-3 text-red-600 !p-0 !m-0" />,
        EMAIL: <FaEnvelope className="w-8 h-8 !mb-3 text-green-500 !p-0 !m-0" />,
        NONE: <img src={coinbeats} alt="CoinBeats" className="w-8 h-8 !mb-3" />
        // Add other platforms as needed
    }

    function getActionLabel(verificationMethod: string) {
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
    }

    // Determine if a task requires an input field
    function requiresInputField(task: VerificationTask): boolean {
        const methodsRequiringInput = ['SHORT_CIRCUIT', 'PROVIDE_EMAIL', 'ADD_TO_BIO', 'SUBSCRIBE_YOUTUBE_CHANNEL']
        return methodsRequiringInput.includes(task.verificationMethod)
    }

    // Get placeholder text based on task name
    function getInputPlaceholder(task: VerificationTask): string {
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

    const handleAction = async (task: VerificationTask) => {
        if (requiresInputField(task)) {
            openNotificationForTask(task)
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
                    const retweetId = '1846827987741605934' // Replace with actual tweet ID
                    window.open(`https://twitter.com/intent/retweet?tweet_id=${retweetId}`, '_blank')
                    break
                case 'FOLLOW_USER':
                    const username = 'CoinBeatsxyz' // Replace with actual username
                    window.open(`https://twitter.com/${username}`, '_blank')
                    break
                case 'LIKE_TWEET':
                    const likeTweetId = '1846827987741605934' // Replace with actual tweet ID
                    window.open(`https://twitter.com/intent/like?tweet_id=${likeTweetId}`, '_blank')
                    break
                case 'COMMENT_ON_TWEET':
                    const commentTweetId = '1846827987741605934' // Replace with actual tweet ID
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

    const shouldDisableButton = (task: VerificationTask) => {
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

    const handleSubmitTask = async (task) => {
        const submissionText = taskInputValues[task.id]

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
        } catch (error) {
            console.error('Error submitting task:', error)
            setNotificationText('Submission failed')
            setNotificationOpen(true)
        }
    }

    const openNotificationForTask = (task: VerificationTask) => {
        setSelectedTask(task) // Set the task that requires submission
        setNotificationText(task.description) // Set notification text for the task
        setNotificationOpen(true) // Open the notification
    }

    const handleInviteFriend = () => {
        const utils = initUtils()
        const inviteLink = `https://t.me/CoinbeatsMiniApp_bot/miniapp?startapp=${referralCode}`
        const shareText = `Join me on this awesome app!`

        const fullUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(shareText)}`
        utils.openTelegramLink(fullUrl)
    }

    const copyReferralLink = () => {
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

    const handleVerify = async (task: VerificationTask) => {
        const userVerification = userVerificationTasks.find((verification) => verification.verificationTaskId === task.id)
        const isVerified = userVerification && userVerification.verified
        const completedToday = isVerified && isSameDay(new Date(), new Date(userVerification?.completedAt))

        // Prevent verification if already done for the day
        if ((task.intervalType === 'ONETIME' && isVerified) || (task.intervalType === 'REPEATED' && completedToday)) {
            setNotificationText('You have already completed this task.')
            setNotificationOpen(true)
            return
        }

        try {
            const message = await completeTask(task.id)
            setNotificationText(message)
            setNotificationOpen(true)
        } catch (error) {
            console.error('Error completing task:', error)
            setNotificationText('Verification failed')
            setNotificationOpen(true)
        }
    }

    const inviteTask = gameTasks.find((task) => task.verificationMethod === 'INVITE_TELEGRAM_FRIEND')

    const filteredTasks = gameTasks.filter((task) => {
        if (activeTaskTab === 'onetime') return task.intervalType === 'ONETIME' && task.verificationMethod !== 'INVITE_TELEGRAM_FRIEND'
        if (activeTaskTab === 'repeated') return task.intervalType === 'REPEATED' && task.verificationMethod !== 'INVITE_TELEGRAM_FRIEND'
        return false
    })

    // Handle feedback submission
    const handleSubmitFeedback = async () => {
        if (!selectedTask) return
        const taskId = selectedTask.id

        try {
            await startTask(taskId)
            await submitTask(taskId, feedbackText)
            setFeedbackDialogOpen(false)
            setNotificationText(
                'We appreciate your feedback very much! The admins will review your feedback and credit you the points. You can see your points on the Points page under your stats tab.'
            )
            setNotificationOpen(true)
            setFeedbackText('')
            setSelectedTask(null)
        } catch (error) {
            console.error('Error submitting feedback:', error)
            setNotificationText('Error submitting feedback. Please try again later.')
            setNotificationOpen(true)
        }
    }

    return (
        <Page>
            <Navbar />
            <Sidebar />
            <div className="relative min-h-screen bg-cosmos-bg bg-fixed bg-center bg-no-repeat bg-cover">
                <div className="absolute inset-0 bg-black opacity-50 z-0"></div>
                <div className="relative z-10">
                    {/* Referral Dialog */}
                    <Dialog
                        opened={referralModalOpen}
                        onBackdropClick={() => setReferralModalOpen(false)}
                        title="Invite a Friend"
                        className="!m-0 !p-0 rounded-2xl"
                    >
                        <div className="p-0">
                            <p>Share this link with your friends:</p>
                            <List className="!m-0 !p-0">
                                <ListInput outline type="text" value={referralLink} readOnly className="w-full !m-0 !p-0 border border-gray-300 rounded mt-2" />
                            </List>
                            <div className="flex flex-col space-y-2 mt-2">
                                <Button
                                    outline
                                    rounded
                                    onClick={copyReferralLink}
                                    className="!text-xs ml-4 mt-1 font-bold shadow-xl min-w-28 !mx-auto"
                                    style={{
                                        background: 'linear-gradient(to left, #ff0077, #7700ff)',
                                        color: '#fff'
                                    }}
                                >
                                    Copy Invite Link
                                </Button>
                                <Button
                                    outline
                                    rounded
                                    onClick={handleInviteFriend}
                                    className="!text-xs ml-4 mt-1 font-bold shadow-xl min-w-28 !mx-auto"
                                    style={{
                                        background: 'linear-gradient(to left, #ff0077, #7700ff)',
                                        color: '#fff'
                                    }}
                                >
                                    <FaTelegramPlane className="inline-block mr-2 !h-5 !w-5" />
                                    Invite Friend
                                </Button>
                            </div>
                        </div>
                    </Dialog>

                    {/* Feedback Dialog */}
                    {selectedTask && (
                        <Dialog
                            opened={feedbackDialogOpen}
                            onBackdropClick={() => setFeedbackDialogOpen(false)}
                            title={selectedTask ? selectedTask.name : 'Feedback'}
                            className="!m-0 !p-0 rounded-2xl !w-80"
                        >
                            <div className="p-4">
                                <div className="flex items-center justify-center mb-4">
                                    <Lottie options={bunnyHappyAnimation} height={150} width={150} />
                                </div>
                                <p>{selectedTask ? selectedTask.description : ''}</p>
                                <List className="!m-0 !p-0 !ml-0 !mr-0">
                                    <ListInput
                                        type="textarea"
                                        outline
                                        inputStyle={{ height: '5rem', marginLeft: '0', marginRight: '0' }}
                                        placeholder="Enter your feedback here..."
                                        value={feedbackText}
                                        onChange={(e) => setFeedbackText(e.target.value)}
                                        className="w-full !m-0 !p-0 border border-gray-300 rounded mt-2 !ml-0 !mr-0"
                                    />
                                </List>
                                <Button
                                    rounded
                                    outline
                                    onClick={handleSubmitFeedback}
                                    className="!text-xs mt-4 font-bold shadow-xl min-w-28 !mx-auto"
                                    style={{
                                        background: 'linear-gradient(to left, #ff0077, #7700ff)',
                                        color: '#fff'
                                    }}
                                >
                                    Send
                                </Button>
                            </div>
                        </Dialog>
                    )}

                    <Notification
                        className="fixed !mt-12 top-12 left-0 z-50 border"
                        opened={notificationOpen}
                        icon={<img src={bunnyLogo} alt="Bunny Mascot" className="w-10 h-10" />}
                        title="Message from CoinBeats Bunny"
                        text={notificationText}
                        button={<Button onClick={() => setNotificationOpen(false)}>Close</Button>}
                        onClose={() => setNotificationOpen(false)}
                    >
                        {selectedTask && requiresInputField(selectedTask) && !submittedTasks[selectedTask.id] && (
                            <div className="flex flex-row items-center">
                                <List className="!m-1 !p-1">
                                    <ListInput
                                        type="text"
                                        outline
                                        value={taskInputValues[selectedTask.id] || ''}
                                        onChange={(e) =>
                                            setTaskInputValues({
                                                ...taskInputValues,
                                                [selectedTask.id]: e.target.value
                                            })
                                        }
                                        placeholder={getInputPlaceholder(selectedTask)}
                                        className="border rounded text-xs !m-1 !p-1"
                                    />
                                </List>
                                <Button
                                    rounded
                                    onClick={() => handleSubmitTask(selectedTask)}
                                    className="!text-2xs font-bold shadow-xl !w-20 !h-6 mt-1 justify-end"
                                    style={{ background: 'linear-gradient(to left, #16a34a, #3b82f6)', color: '#fff' }}
                                >
                                    Send
                                </Button>
                            </div>
                        )}
                    </Notification>

                    <div className="mt-0 px-4 pb-10 pt-4 mb-8">
                        {/* Tabs for Tasks */}
                        <div className="flex justify-center gap-2 mt-4 mx-4 relative z-10 mb-4">
                            <Button
                                outline
                                rounded
                                onClick={() => setActiveTaskTab('repeated')}
                                className={`${
                                    activeTaskTab === 'repeated'
                                        ? 'bg-gray-100 dark:bg-gray-800 k-color-brand-purple shadow-lg'
                                        : 'bg-white dark:bg-gray-900 shadow-lg'
                                } rounded-full text-xs`}
                                style={{
                                    color: '#fff'
                                }}
                            >
                                Repeated
                            </Button>
                            <Button
                                outline
                                rounded
                                onClick={() => setActiveTaskTab('onetime')}
                                className={`${
                                    activeTaskTab === 'onetime'
                                        ? 'bg-gray-100 dark:bg-gray-800 k-color-brand-purple shadow-lg'
                                        : 'bg-white dark:bg-gray-900 shadow-lg'
                                } rounded-full text-xs`}
                                style={{
                                    color: '#fff'
                                }}
                            >
                                One-Time
                            </Button>
                        </div>

                        {/* Invite Task at the Top */}
                        {inviteTask && (
                            <div
                                key={inviteTask.id}
                                className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-lg py-2 flex flex-row items-start px-1 border border-gray-300 dark:border-gray-600 h-16 justify-between w-full mb-2"
                            >
                                {/* Platform Icon */}
                                <div className="w-12 h-16 flex items-center justify-center pb-2">
                                    {platformIcons[inviteTask.platform] || <div className="w-10 h-10 text-gray-500 p-2">?</div>}
                                </div>

                                <div className="flex flex-col flex-grow mx-2">
                                    {/* Task Name and Question Mark Button */}
                                    <h3
                                        className={`font-bold text-left break-words whitespace-normal ${
                                            inviteTask.name.length > 50 ? 'text-xs' : 'text-sm'
                                        } flex items-center relative`}
                                    >
                                        {inviteTask.name}
                                        {/* Question Mark Button */}
                                        <button
                                            className="ml-2 rounded-full bg-gray-700 text-white text-xs font-bold w-5 h-5 flex items-center justify-center"
                                            onClick={() => toggleTooltip(inviteTask.id)}
                                        >
                                            ?
                                        </button>
                                        {/* Tooltip */}
                                        {visibleTooltip === inviteTask.id && (
                                            <div className="tooltip absolute bg-gray-700 text-white text-xs rounded-2xl p-4 mt-2 z-20">
                                                {inviteTask.description}
                                                <button className="absolute top-0 right-0 text-white text-sm mt-1 mr-1" onClick={() => setVisibleTooltip(null)}>
                                                    &times;
                                                </button>
                                            </div>
                                        )}
                                    </h3>

                                    {/* XP and Users Completed */}
                                    <div className="flex items-center mt-1">
                                        {/* +XP with coin-stack icon */}
                                        <div className="flex items-center">
                                            <span className="mx-1 text-xs text-gray-100">+{inviteTask.xp}</span>
                                            <img src={coinStackIcon} alt="Coin Stack" className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex flex-col space-y-1 justify-center items-center mr-2">
                                    {/* Action Button */}
                                    <Button
                                        rounded
                                        onClick={() => handleAction(inviteTask)}
                                        className="!text-2xs font-bold shadow-xl !w-20 !h-6"
                                        style={{
                                            background: 'linear-gradient(to left, #16a34a, #3b82f6)',
                                            color: '#fff'
                                        }}
                                    >
                                        {getActionLabel(inviteTask.verificationMethod)}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Display Tasks Based on Active Tab */}
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map((task) => {
                                // Find user verification for the current task
                                const userVerification = userVerificationTasks.find((verification) => verification.verificationTaskId === task.id)
                                const isVerified = userVerification?.verified
                                const completedToday = isVerified && isSameDay(new Date(), new Date(userVerification?.completedAt))
                                const timerCheck = userVerification && hasTimerPassed(userVerification.createdAt, 1000)

                                // Determine if the "Action" or "Verify" button should be disabled
                                const shouldDisableActionButton = shouldDisableButton(task)

                                return (
                                    <div
                                        key={task.id}
                                        className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-lg py-1 flex flex-row items-center px-1 border border-gray-300 dark:border-gray-600 h-16 justify-between w-full mb-2"
                                    >
                                        {/* Platform Icon */}
                                        <div className="w-12 h-16 flex items-center justify-center pt-2">
                                            {platformIcons[task.platform] || <div className="w-8 h-8 text-gray-500">?</div>}
                                        </div>

                                        <div className="flex flex-col flex-grow mx-2 py-1">
                                            {/* Task Name and Tooltip */}
                                            <h3 className="font-semibold text-left break-words whitespace-normal text-xs flex items-center relative">
                                                {task.name}
                                                <button
                                                    className="ml-2 rounded-full bg-gray-700 text-white text-xs font-bold w-5 h-5 flex items-center justify-center"
                                                    onClick={() => toggleTooltip(task.id)}
                                                >
                                                    ?
                                                </button>
                                                {visibleTooltip === task.id && (
                                                    <div className="tooltip absolute bg-gray-700 text-white text-xs rounded-2xl p-4 mt-2 z-20">
                                                        {task.description}
                                                        <button
                                                            className="absolute top-0 right-0 text-white text-sm mt-1 mr-1"
                                                            onClick={() => setVisibleTooltip(null)}
                                                        >
                                                            &times;
                                                        </button>
                                                    </div>
                                                )}
                                            </h3>

                                            {/* XP and Users Completed */}
                                            <div className="flex items-center mt-1">
                                                <div className="flex items-center">
                                                    <span className="mx-1 text-sm text-gray-100">+{task.xp}</span>
                                                    <img src={coinStackIcon} alt="Coin Stack" className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col space-y-1 justify-center mr-2">
                                            {/* Action Button */}
                                            <Button
                                                rounded
                                                onClick={() => handleAction(task)}
                                                className="!text-2xs font-bold shadow-xl !w-20 !h-6"
                                                style={{
                                                    background: 'linear-gradient(to left, #16a34a, #3b82f6)',
                                                    color: '#fff'
                                                }}
                                                disabled={shouldDisableActionButton}
                                            >
                                                {getActionLabel(task.verificationMethod)}
                                            </Button>

                                            {/* Verify Button */}
                                            {task.verificationMethod !== 'LEAVE_FEEDBACK' && (
                                                <Button
                                                    rounded
                                                    outline
                                                    onClick={() => handleVerify(task)}
                                                    className="!text-2xs font-bold shadow-xl !w-20 !h-6"
                                                    style={{
                                                        borderColor: isVerified ? '#16a34a' : '#3b82f6', // Green border for completed
                                                        backgroundColor: 'transparent', // Green background for completed
                                                        color: '#fff' // White text for completed, blue otherwise
                                                    }}
                                                    disabled={isVerified} // Disable if task is verified
                                                >
                                                    {isVerified ? 'Completed' : 'Verify'}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="text-center text-white mt-4">No tasks available.</div>
                        )}
                    </div>

                    <BottomTabBar activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>
            </div>
        </Page>
    )
}

GamesPage.displayName = 'GamesPage'
