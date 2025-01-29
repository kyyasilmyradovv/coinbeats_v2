import React, { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { Page, Block, Button, Dialog, List, ListInput, Notification } from 'konsta/react'
import { Icon } from '@iconify/react'
import { FaTimes } from 'react-icons/fa'

import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'
import BottomTabBar from '../components/BottomTabBar'

import useDiscoverStore from '../store/useDiscoverStore'
import useUserStore from '../store/useUserStore'
import useUserVerificationStore from '../store/useUserVerificationStore'
import useAcademiesStore from '../store/useAcademiesStore'
import useNotificationStore from '../store/useNotificationStore'

import Lottie from 'react-lottie'
import bunnyHappyAnimationData from '../animations/bunny-happy.json'
import bunnyLogo from '../images/bunny-mascot.png'
import coinStackIcon from '../images/coin-stack.png'
import coinbeats from '../images/coinbeats-l.svg'

import axios from '../api/axiosInstance'
import { platformIcons, getActionLabel, requiresInputField, getInputPlaceholder, handleAction } from '../utils/actionHandlers'
import { extractYouTubeVideoId } from '../utils/extractYouTubeVideoId'
import axiosInstance from '../api/axiosInstance'

interface Tutorial {
    id: number
    title: string
    description?: string
    contentUrl?: string
    type?: string
    logoUrl?: string
    coverPhotoUrl?: string
    categories?: { id: number; name: string }[]
    chains?: { id: number; name: string }[]
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
    parameters?: { [key: string]: string }
}

const bunnyHappyAnimation = {
    loop: true,
    autoplay: true,
    animationData: bunnyHappyAnimationData,
    rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice'
    }
}

const typeMapping: { [key: string]: string } = {
    WALLET_SETUP: 'Wallet Setup',
    CEX_TUTORIAL: 'CEX Tutorial',
    APP_TUTORIAL: 'App Tutorial',
    RESEARCH_TUTORIAL: 'Research Tutorial',
    OTHER: 'Other'
}

const TutorialDetailPage: React.FC = () => {
    const { id } = useParams()
    const location = useLocation()
    const navigate = useNavigate()

    const [tutorial, setTutorial] = useState<Tutorial | null>(null)
    const { tutorials, fetchTutorials } = useDiscoverStore()

    const [activeTab, setActiveTab] = useState<'overview' | 'tasks'>('overview')

    // Tasks
    const [tasks, setTasks] = useState<VerificationTask[]>([])
    const [loadingTasks, setLoadingTasks] = useState(false)

    const { userId, referralCode, twitterAuthenticated, telegramUserId } = useUserStore((state) => ({
        userId: state.userId,
        referralCode: state.referralCode,
        twitterAuthenticated: state.twitterAuthenticated,
        telegramUserId: state.telegramUserId
    }))
    const { userVerificationTasks, fetchUserVerificationTasks, startTask, submitTask, completeTask } = useUserVerificationStore()

    const [notificationOpen, setNotificationOpen] = useState(false)
    const [notificationText, setNotificationText] = useState('')
    const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
    const [inputDialogOpen, setInputDialogOpen] = useState(false)
    const [selectedTask, setSelectedTask] = useState<VerificationTask | null>(null)
    const [feedbackText, setFeedbackText] = useState('')
    const [inputText, setInputText] = useState('')
    const [referralModalOpen, setReferralModalOpen] = useState(false)
    const [referralLink, setReferralLink] = useState('')
    const [visibleTooltip, setVisibleTooltip] = useState<number | null>(null)

    const { fetchUserTotalPoints } = useAcademiesStore()
    const { fetchNotifications, showNotification } = useNotificationStore()

    // 1) Load tutorial
    useEffect(() => {
        const stateItem = location.state?.item as Tutorial | undefined
        if (stateItem) {
            setTutorial(stateItem)
            if (id) {
                axiosInstance.post('/api/discover/visit', { tab: 'tutorial', id })
            }
        } else {
            if (tutorials.length === 0) {
                fetchTutorials().then(() => {
                    const found = tutorials.find((t) => t.id === Number(id))
                    if (found) setTutorial(found)
                })
            } else {
                const found = tutorials.find((t) => t.id === Number(id))
                if (found) setTutorial(found)
            }
        }
    }, [id, location.state, tutorials, fetchTutorials])

    // 2) Fetch tasks
    useEffect(() => {
        if (activeTab === 'tasks' && tutorial) {
            getTutorialTasks(tutorial.id)
            fetchUserVerificationTasks()
        }
    }, [activeTab, tutorial, fetchUserVerificationTasks])

    const getTutorialTasks = async (tutorialId: number) => {
        setLoadingTasks(true)
        try {
            const url = `/api/verification-tasks/content/Tutorial/${tutorialId}`
            const response = await axios.get(url)
            setTasks(response.data)
        } catch (error) {
            console.error('Error fetching tutorial tasks:', error)
        } finally {
            setLoadingTasks(false)
        }
    }

    // 3) Check if completed
    const isTaskCompleted = (task: VerificationTask) => {
        const relevantUVs = userVerificationTasks.filter((uv) => uv.verificationTaskId === task.id && uv.userId === userId)
        if (relevantUVs.length === 0) return false

        const latestUV = relevantUVs.reduce((latest, uv) => {
            const uvDate = new Date(uv.completedAt || uv.createdAt)
            const latDate = new Date(latest.completedAt || latest.createdAt)
            return uvDate > latDate ? uv : latest
        }, relevantUVs[0])

        return !!latestUV.verified
    }

    // 4) Action / Verify
    const toggleTooltip = (taskId: number) => {
        setVisibleTooltip((prev) => (prev === taskId ? null : taskId))
    }

    const onActionClick = async (task: VerificationTask) => {
        try {
            if (task.verificationMethod === 'LEAVE_FEEDBACK') {
                if (isTaskCompleted(task)) {
                    setNotificationText('You can do the task again when it resets.')
                    setNotificationOpen(true)
                } else {
                    setSelectedTask(task)
                    setFeedbackDialogOpen(true)
                }
            } else if (requiresInputField(task)) {
                setSelectedTask(task)
                setInputDialogOpen(true)
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
                    telegramUserId,
                    userId
                })
            }
        } catch (error: any) {
            console.error('Error in onActionClick:', error)
            const errorMessage = error.response?.data?.message || 'An error occurred. Please try again later.'
            setNotificationText(errorMessage)
            setNotificationOpen(true)
        }
    }

    const handleVerify = async (task: VerificationTask) => {
        try {
            const respMsg = await completeTask(task.id)
            if (userId) {
                await fetchUserTotalPoints(userId)
            }
            await fetchNotifications()
            const { notifications } = useNotificationStore.getState()
            const unreadNotification = notifications.find((n) => !n.read)
            if (unreadNotification) {
                showNotification(unreadNotification)
            }
            setNotificationText(respMsg)
            setNotificationOpen(true)
        } catch (error: any) {
            console.error('Error verifying task:', error)
            const errorMessage = error.response?.data?.message || 'Verification failed. Please try again later.'
            setNotificationText(errorMessage)
            setNotificationOpen(true)
        }
    }

    const onVerifyClick = async (task: VerificationTask) => {
        if (isTaskCompleted(task)) {
            setNotificationText('Task already completed, wait for reset.')
            setNotificationOpen(true)
        } else {
            await handleVerify(task)
        }
    }

    // 5) Feedback
    const handleSubmitFeedback = async () => {
        if (!selectedTask) return
        if (feedbackText.length < 100) {
            setNotificationText('Enter at least 100 characters.')
            setNotificationOpen(true)
            return
        }
        try {
            await startTask(selectedTask.id)
            await submitTask(selectedTask.id, feedbackText)

            setFeedbackDialogOpen(false)
            setNotificationText('Feedback received! Points awarded.')
            setNotificationOpen(true)
            setFeedbackText('')
            setSelectedTask(null)

            if (userId) {
                await fetchUserTotalPoints(userId)
            }
            await fetchNotifications()

            const { notifications } = useNotificationStore.getState()
            const unreadNotification = notifications.find((n) => !n.read)
            if (unreadNotification) showNotification(unreadNotification)

            await fetchUserVerificationTasks()
        } catch (error: any) {
            console.error('Error submitting feedback:', error)
            const errorMessage = error.response?.data?.message || 'Submission failed.'
            setNotificationText(errorMessage)
            setNotificationOpen(true)
        }
    }

    // 6) Input
    const handleSubmitInput = async () => {
        if (!selectedTask) return
        if (inputText.length < 5) {
            setNotificationText('Enter at least 5 characters.')
            setNotificationOpen(true)
            return
        }
        try {
            await startTask(selectedTask.id)
            await submitTask(selectedTask.id, inputText)

            if (selectedTask.verificationMethod === 'PROVIDE_EMAIL') {
                await handleVerify(selectedTask)
                setNotificationText('Email submitted, task completed.')
            } else {
                setNotificationText('Submission successful! You’ll be notified once verified.')
            }

            setInputDialogOpen(false)
            setNotificationOpen(true)
            setInputText('')
            setSelectedTask(null)

            if (userId) {
                await fetchUserTotalPoints(userId)
            }
            await fetchNotifications()

            const { notifications } = useNotificationStore.getState()
            const unreadNotification = notifications.find((n) => !n.read)
            if (unreadNotification) showNotification(unreadNotification)

            await fetchUserVerificationTasks()
        } catch (error: any) {
            console.error('Error submitting input:', error)
            const errorMessage = error.response?.data?.message || 'Submission failed.'
            setNotificationText(errorMessage)
            setNotificationOpen(true)
        }
    }

    // Render tasks
    const renderTasksTab = () => {
        if (loadingTasks) {
            return <p className="mt-4 text-sm text-gray-100">Loading tasks...</p>
        }
        if (tasks.length === 0) {
            return <p className="mt-4 text-sm text-gray-100">No tasks yet!</p>
        }

        return (
            <div className="mt-4 !mb-20">
                {tasks.map((task) => {
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
                                <h3 className="font-semibold text-left break-words whitespace-normal text-xs flex items-center relative">
                                    {task.name}
                                    <button
                                        className="ml-2 rounded-full bg-gray-700 text-white text-xs font-bold w-5 h-5 flex items-center justify-center"
                                        onClick={() => toggleTooltip(task.id)}
                                    >
                                        ?
                                    </button>
                                    {visibleTooltip === task.id && (
                                        <div className="tooltip absolute bg-gray-700 text-white text-xs rounded-2xl p-4 mt-2 z-20 w-44">
                                            {task.description}
                                            <button className="absolute top-0 right-0 text-white text-sm mt-1 mr-1" onClick={() => setVisibleTooltip(null)}>
                                                &times;
                                            </button>
                                        </div>
                                    )}
                                </h3>
                                <div className="flex items-center mt-1">
                                    <span className="mx-1 text-sm text-gray-100">+{task.xp}</span>
                                    <img src={coinStackIcon} alt="Coin Stack" className="w-4 h-4" />
                                </div>
                            </div>

                            <div className="flex flex-col space-y-1 justify-center mr-2">
                                <Button
                                    rounded
                                    onClick={() => onActionClick(task)}
                                    className="!text-2xs font-bold shadow-xl !w-20 !h-6"
                                    style={{
                                        background: 'linear-gradient(to left, #16a34a, #3b82f6)',
                                        color: '#fff'
                                    }}
                                >
                                    {getActionLabel(task.verificationMethod, twitterAuthenticated)}
                                </Button>
                                {task.verificationMethod !== 'LEAVE_FEEDBACK' && task.verificationMethod !== 'PROVIDE_EMAIL' && (
                                    <Button
                                        rounded
                                        outline
                                        onClick={() => onVerifyClick(task)}
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
                })}
            </div>
        )
    }

    const constructImageUrl = (url?: string) => (url ? `https://telegram.coinbeats.xyz/${url}` : '')

    const renderLinkButtons = () => {
        if (!tutorial?.contentUrl) return null

        const youtubeVideoId = extractYouTubeVideoId(tutorial.contentUrl)
        const isYouTubeLink = Boolean(youtubeVideoId)

        return (
            <div className="flex flex-col gap-4 mt-4">
                <div className="flex gap-3 flex-wrap">
                    <button
                        onClick={() => window.open(tutorial.contentUrl, '_blank')}
                        className="p-2 rounded-full hover:opacity-80 transition-all"
                        style={{ backgroundColor: '#444' }}
                        title="Open Tutorial Link"
                    >
                        <Icon icon="mdi:link-variant" style={{ color: 'rgba(255,255,255,0.8)' }} className="w-8 h-8" />
                    </button>
                </div>
                {isYouTubeLink && (
                    <div className="mt-4">
                        <iframe
                            width="100%"
                            height="315"
                            src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                            title="YouTube Video"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                )}
            </div>
        )
    }

    const renderMainCard = () => {
        if (!tutorial) return <p className="text-center mt-4">Loading tutorial...</p>

        return (
            <div className="!p-0 mx-4 mt-4 rounded-xl shadow-lg overflow-hidden bg-white dark:bg-zinc-900 border border-gray-300 dark:border-gray-600 !mb-20">
                {tutorial.coverPhotoUrl && (
                    <div className="relative w-full h-40 overflow-hidden rounded-b-2xl">
                        <img src={constructImageUrl(tutorial.coverPhotoUrl)} alt="Cover" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black bg-opacity-40"></div>

                        <div className="absolute bottom-2 left-4 flex gap-2">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`px-4 py-1 rounded-full border text-sm font-bold transition-all ${
                                    activeTab === 'overview'
                                        ? 'bg-gradient-to-t from-[#ff0077] to-[#7700ff] text-white border-[#9c27b0]'
                                        : 'bg-gray-800 text-white border-gray-600'
                                }`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('tasks')}
                                className={`px-4 py-1 rounded-full border text-sm font-bold transition-all ${
                                    activeTab === 'tasks'
                                        ? 'bg-gradient-to-t from-[#ff0077] to-[#7700ff] text-white border-[#9c27b0]'
                                        : 'bg-gray-800 text-white border-gray-600'
                                }`}
                            >
                                Tasks
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'overview' && (tutorial.logoUrl || tutorial.title) && (
                    <div className="flex items-center gap-3 px-4 pt-4">
                        {tutorial.logoUrl && (
                            <img
                                src={constructImageUrl(tutorial.logoUrl)}
                                alt="Logo"
                                className="w-20 h-20 rounded-full object-cover border-2 border-white dark:border-gray-800"
                            />
                        )}
                        {tutorial.title && <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">{tutorial.title}</h2>}
                    </div>
                )}

                <div className="px-4">
                    {activeTab === 'overview' && (
                        <>
                            {(tutorial.categories?.length || 0) > 0 || (tutorial.chains?.length || 0) > 0 ? (
                                <Block className="mt-3 !p-0">
                                    <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">About:</h3>
                                    <div className="flex flex-wrap gap-1">
                                        {tutorial.categories?.map((cat) => (
                                            <span key={cat.id} className="bg-blue-200 dark:bg-blue-700 text-2xs px-1 py-0.5 rounded-full">
                                                {cat.name}
                                            </span>
                                        ))}
                                        {tutorial.chains?.map((chain) => (
                                            <span key={chain.id} className="bg-green-200 dark:bg-green-700 text-2xs px-1 py-0.5 rounded-full">
                                                {chain.name}
                                            </span>
                                        ))}
                                    </div>
                                </Block>
                            ) : null}

                            {tutorial.description && (
                                <div className="mt-3">
                                    <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Description:</h3>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{tutorial.description}</p>
                                </div>
                            )}

                            {renderLinkButtons()}

                            {tutorial.type && (
                                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                    <strong>Type:</strong> {typeMapping[tutorial.type] || tutorial.type}
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'tasks' && (
                        <div className="mt-4 text-sm text-gray-700 dark:text-gray-300">
                            <h2 className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-200">Tasks</h2>
                            {renderTasksTab()}
                        </div>
                    )}

                    <div className="mt-6 mb-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 bg-gradient-to-t from-[#ff0077] to-[#7700ff] text-white border-[#9c27b0] font-bold rounded-full border-2 shadow-md transition-all"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <Page className="overflow-auto">
            <Navbar />
            <Sidebar />

            {renderMainCard()}

            {/* Referral Dialog */}
            <Dialog opened={referralModalOpen} onBackdropClick={() => setReferralModalOpen(false)} title="Invite a Friend" className="!m-0 !p-0 rounded-2xl">
                <div className="p-4">
                    <p>Share this link with your friends:</p>
                    <List className="!m-0 !p-0">
                        <ListInput outline type="text" value={referralLink} readOnly className="w-full !m-0 !p-0 border border-gray-300 rounded mt-2" />
                    </List>
                </div>
            </Dialog>

            {/* Feedback Dialog */}
            {selectedTask && feedbackDialogOpen && (
                <Dialog
                    opened={feedbackDialogOpen}
                    onBackdropClick={() => setFeedbackDialogOpen(false)}
                    title={selectedTask.name}
                    className="!m-0 !p-0 rounded-2xl !w-80"
                >
                    <div className="p-4 relative">
                        <button className="absolute -top-7 right-1 text-gray-500 hover:text-gray-700" onClick={() => setFeedbackDialogOpen(false)}>
                            <FaTimes size={20} />
                        </button>
                        <div className="flex items-center justify-center mb-4">
                            <Lottie options={bunnyHappyAnimation} height={150} width={150} />
                        </div>
                        <p>{selectedTask.description}</p>
                        <div className="relative">
                            <List className="!m-0 !p-0 !ml-0 !mr-0">
                                <ListInput
                                    type="textarea"
                                    outline
                                    inputStyle={{ height: '5rem' }}
                                    placeholder="Enter your feedback..."
                                    value={feedbackText}
                                    onChange={(e) => setFeedbackText(e.target.value)}
                                    className="w-full !m-0 !p-0 border border-gray-300 rounded mt-2 !ml-0 !mr-0"
                                />
                            </List>
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
                                    feedbackText.length >= 100 ? 'linear-gradient(to left, #ff0077, #7700ff)' : 'linear-gradient(to left, #52525b, #27272a)',
                                color: '#fff',
                                borderColor: '#9c27b0'
                            }}
                            disabled={feedbackText.length < 100}
                        >
                            Send
                        </Button>
                    </div>
                </Dialog>
            )}

            {/* Input Dialog */}
            {selectedTask && inputDialogOpen && (
                <Dialog
                    opened={inputDialogOpen}
                    onBackdropClick={() => setInputDialogOpen(false)}
                    title={selectedTask.name}
                    className="!m-0 !p-0 rounded-2xl !w-80"
                >
                    <div className="p-4 relative">
                        <button className="absolute -top-7 right-1 text-gray-500 hover:text-gray-700" onClick={() => setInputDialogOpen(false)}>
                            <FaTimes size={20} />
                        </button>
                        <div className="flex items-center justify-center mb-4">
                            <Lottie options={bunnyHappyAnimation} height={150} width={150} />
                        </div>
                        <p>{selectedTask.description}</p>
                        <div className="relative">
                            <List className="!m-0 !p-0 !ml-0 !mr-0">
                                <ListInput
                                    type="textarea"
                                    outline
                                    inputStyle={{ height: '5rem' }}
                                    placeholder={getInputPlaceholder(selectedTask)}
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    className="w-full !m-0 !p-0 border border-gray-300 rounded mt-2 !ml-0 !mr-0"
                                />
                            </List>
                        </div>
                        <Button
                            rounded
                            outline
                            onClick={handleSubmitInput}
                            className="!text-xs mt-4 font-bold shadow-xl min-w-28 !mx-auto !h-7"
                            style={{
                                background: inputText.length >= 5 ? 'linear-gradient(to left, #ff0077, #7700ff)' : 'linear-gradient(to left, #52525b, #27272a)',
                                color: '#fff',
                                borderColor: '#9c27b0'
                            }}
                            disabled={inputText.length < 5}
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

            <BottomTabBar activeTab="tab-1" setActiveTab={() => {}} />
        </Page>
    )
}

export default TutorialDetailPage
