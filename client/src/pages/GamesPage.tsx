// src/pages/GamesPage.tsx

import React, { useState, useEffect } from 'react'
import { Page, Button, Dialog, ListInput, List, Notification } from 'konsta/react'
import { FaTwitter, FaFacebook, FaInstagram, FaTelegramPlane, FaDiscord, FaYoutube, FaEnvelope, FaTimes } from 'react-icons/fa'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'
import BottomTabBar from '../components/BottomTabBar'
import coinStackIcon from '../images/coin-stack.png'
import bunnyLogo from '../images/bunny-mascot.png'
import useUserStore from '../store/useUserStore'
import useTasksStore from '../store/useTasksStore'
import useUserVerificationStore from '../store/useUserVerificationStore'
import Lottie from 'react-lottie'
import bunnyHappyAnimationData from '../animations/bunny-happy.json'
import coinbeats from '../images/coinbeats-l.svg'
import { platformIcons, getActionLabel, handleAction, copyReferralLink, handleInviteFriend } from '../utils/actionHandlers'
import { VerificationTask } from '../types'

const bunnyHappyAnimation = {
    loop: true,
    autoplay: true,
    animationData: bunnyHappyAnimationData,
    rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice'
    }
}

export default function GamesPage() {
    const { userId, referralCode, twitterAuthenticated, telegramUserId } = useUserStore((state) => ({
        userId: state.userId,
        referralCode: state.referralCode,
        twitterAuthenticated: state.twitterAuthenticated,
        telegramUserId: state.telegramUserId
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
    const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
    const [feedbackText, setFeedbackText] = useState('')

    useEffect(() => {
        fetchGameTasks()
        fetchUserVerificationTasks()
    }, [fetchGameTasks, fetchUserVerificationTasks])

    // Function to determine if a task is completed
    const isTaskCompleted = (task: VerificationTask): boolean => {
        const userVerification = userVerificationTasks.find((uv) => uv.verificationTaskId === task.id && uv.userId === userId)
        if (!userVerification || !userVerification.verified) return false

        // If task is REPEATED and repeatInterval is 0, task is always available
        if (task.intervalType === 'REPEATED' && task.repeatInterval === 0) {
            return false
        }

        // Check if repeat interval has passed
        if (task.intervalType === 'REPEATED' && task.repeatInterval > 0) {
            const now = new Date()
            const completedAt = new Date(userVerification.completedAt)
            const intervalMillis = task.repeatInterval * 24 * 60 * 60 * 1000
            if (now.getTime() - completedAt.getTime() >= intervalMillis) {
                return false
            } else {
                return true
            }
        }

        // For ONETIME tasks, if verified, it's completed
        if (task.intervalType === 'ONETIME') {
            return true
        }

        return false
    }

    // Handle action button click
    const onActionClick = async (task: VerificationTask) => {
        try {
            if (task.verificationMethod === 'LEAVE_FEEDBACK') {
                const completed = isTaskCompleted(task)
                if (completed) {
                    setNotificationText('You can do the task again when the task resets.')
                    setNotificationOpen(true)
                } else {
                    // Handle LEAVE_FEEDBACK task
                    setSelectedTask(task)
                    setFeedbackDialogOpen(true)
                }
            } else {
                await handleAction(task, {
                    referralCode,
                    setReferralLink,
                    setReferralModalOpen,
                    setNotificationText,
                    setNotificationOpen,
                    setSelectedTask,
                    setFeedbackDialogOpen,
                    twitterAuthenticated,
                    telegramUserId
                })
            }
        } catch (error) {
            console.error('Error in onActionClick:', error)
        }
    }

    // Handle feedback submission
    const handleSubmitFeedback = async () => {
        if (!selectedTask) return
        if (feedbackText.length < 100) {
            setNotificationText('Please enter at least 100 characters.')
            setNotificationOpen(true)
            return
        }
        const taskId = selectedTask.id

        try {
            await startTask(taskId)
            await submitTask(taskId, feedbackText)
            setFeedbackDialogOpen(false)
            setNotificationText('We appreciate your feedback very much! You have been awarded points for your feedback.')
            setNotificationOpen(true)
            setFeedbackText('')
            setSelectedTask(null)

            // Refresh user verification tasks
            await fetchUserVerificationTasks()
        } catch (error) {
            console.error('Error submitting feedback:', error)
            setNotificationText('You can do the task again when the task resets.')
            setNotificationOpen(true)
        }
    }

    const handleVerify = async (task: VerificationTask) => {
        try {
            const message = await completeTask(task.id)
            setNotificationText(message)
            setNotificationOpen(true)

            // Refresh user verification tasks
            await fetchUserVerificationTasks()
        } catch (error) {
            console.error('Error completing task:', error)
            setNotificationText('Verification failed')
            setNotificationOpen(true)
        }
    }

    const toggleTooltip = (tooltipIndex: number) => {
        if (visibleTooltip === tooltipIndex) {
            setVisibleTooltip(null)
        } else {
            setVisibleTooltip(tooltipIndex)
        }
    }

    const inviteTask = gameTasks.find((task) => task.verificationMethod === 'INVITE_TELEGRAM_FRIEND')

    const filteredTasks = gameTasks.filter((task) => {
        if (activeTaskTab === 'onetime') return task.intervalType === 'ONETIME' && task.verificationMethod !== 'INVITE_TELEGRAM_FRIEND'
        if (activeTaskTab === 'repeated') return task.intervalType === 'REPEATED' && task.verificationMethod !== 'INVITE_TELEGRAM_FRIEND'
        return false
    })

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
                                    onClick={() => copyReferralLink(referralLink, setNotificationText, setNotificationOpen)}
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
                                    onClick={() => referralCode && handleInviteFriend(referralCode)}
                                    className="!text-xs ml-4 mt-1 font-bold shadow-xl min-w-28 !mx-auto"
                                    style={{
                                        background: 'linear-gradient(to left, #ff0077, #7700ff)',
                                        color: '#fff'
                                    }}
                                >
                                    Invite Friend
                                </Button>
                            </div>
                        </div>
                    </Dialog>

                    {/* Feedback Dialog */}
                    {selectedTask && feedbackDialogOpen && (
                        <Dialog
                            opened={feedbackDialogOpen}
                            onBackdropClick={() => setFeedbackDialogOpen(false)}
                            title={selectedTask ? selectedTask.name : 'Feedback'}
                            className="!m-0 !p-0 rounded-2xl !w-80"
                        >
                            <div className="p-4 relative">
                                {/* X Button to Close Dialog */}
                                <button className="absolute -top-7 right-1 text-gray-500 hover:text-gray-700" onClick={() => setFeedbackDialogOpen(false)}>
                                    <FaTimes size={20} />
                                </button>
                                <div className="flex items-center justify-center mb-4">
                                    <Lottie options={bunnyHappyAnimation} height={150} width={150} />
                                </div>
                                <p>{selectedTask ? selectedTask.description : ''}</p>
                                <div className="relative">
                                    <List className="!m-0 !p-0 !ml-0 !mr-0">
                                        <ListInput
                                            type="textarea"
                                            outline
                                            inputStyle={{ height: '5rem' }}
                                            placeholder="Enter your feedback here..."
                                            value={feedbackText}
                                            onChange={(e) => setFeedbackText(e.target.value)}
                                            className="w-full !m-0 !p-0 border border-gray-300 rounded mt-2 !ml-0 !mr-0"
                                        />
                                    </List>
                                    {/* Character Count Display */}
                                    <div className="absolute -top-7 right-2 mt-2 mr-2 text-xs" style={{ color: feedbackText.length >= 100 ? 'green' : 'red' }}>
                                        {feedbackText.length}/100
                                    </div>
                                </div>
                                <Button
                                    rounded
                                    outline
                                    onClick={handleSubmitFeedback}
                                    className="!text-xs mt-4 font-bold shadow-xl min-w-28 !mx-auto !h-7"
                                    style={{
                                        background:
                                            feedbackText.length >= 100
                                                ? 'linear-gradient(to left, #ff0077, #7700ff)'
                                                : 'linear-gradient(to left, #52525b, #27272a)', // Gray gradient when disabled
                                        color: '#fff',
                                        borderColor: '#9c27b0' // Ensure border is visible
                                    }}
                                    disabled={feedbackText.length < 100}
                                >
                                    Send
                                </Button>
                            </div>
                        </Dialog>
                    )}

                    {/* Notification */}
                    <Notification
                        className="fixed !mt-12 top-12 left-0 z-50 border"
                        opened={notificationOpen}
                        icon={<img src={bunnyLogo} alt="Bunny Mascot" className="w-10 h-10" />}
                        title="Message from CoinBeats Bunny"
                        text={notificationText}
                        button={<Button onClick={() => setNotificationOpen(false)}>Close</Button>}
                        onClose={() => setNotificationOpen(false)}
                    />

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
                                    {platformIcons[inviteTask.platform] ? (
                                        platformIcons[inviteTask.platform]
                                    ) : (
                                        <img src={coinbeats} alt="Default Icon" className="w-10 h-10 pb-2" />
                                    )}
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
                                <div className="flex flex-col space-y-1 justify-center items-center mr-2 my-auto">
                                    {/* Action Button */}
                                    <Button
                                        rounded
                                        onClick={() => onActionClick(inviteTask)}
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
                                const completed = isTaskCompleted(task)

                                return (
                                    <div
                                        key={task.id}
                                        className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-lg py-1 flex flex-row items-center px-1 border border-gray-300 dark:border-gray-600 h-16 justify-between w-full mb-2"
                                    >
                                        {/* Platform Icon */}
                                        <div className="w-12 h-16 flex items-center justify-center pt-2">
                                            {platformIcons[task.platform] ? (
                                                platformIcons[task.platform]
                                            ) : (
                                                <img src={coinbeats} alt="Default Icon" className="w-8 h-8 pb-2" />
                                            )}
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
                                                onClick={() => onActionClick(task)}
                                                className="!text-2xs font-bold shadow-xl !w-20 !h-6"
                                                style={{
                                                    background: 'linear-gradient(to left, #16a34a, #3b82f6)',
                                                    borderColor: '#16a34a', // Green border
                                                    color: '#fff'
                                                }}
                                            >
                                                {completed ? 'Completed' : getActionLabel(task.verificationMethod, twitterAuthenticated)}
                                            </Button>

                                            {/* Verify Button */}
                                            {task.verificationMethod !== 'LEAVE_FEEDBACK' && (
                                                <Button
                                                    rounded
                                                    outline
                                                    onClick={() => handleVerify(task)}
                                                    className="!text-2xs font-bold shadow-xl !w-20 !h-6"
                                                    style={{
                                                        borderColor: completed ? '#16a34a' : '#3b82f6',
                                                        backgroundColor: 'transparent',
                                                        color: '#fff'
                                                    }}
                                                >
                                                    {completed ? 'Completed' : 'Verify'}
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
