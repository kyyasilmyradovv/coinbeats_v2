// src/components/AcademyCompletionSlide.tsx

import React, { useEffect, useState } from 'react'
import { Button, Card, Dialog, ListInput, List, Notification } from 'konsta/react'
import coinStack from '../images/coin-stack.png'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance'
import axios from 'axios'
import useUserStore from '~/store/useUserStore'
import useUserVerificationStore from '~/store/useUserVerificationStore'
import useAcademiesStore from '~/store/useAcademiesStore'
import useNotificationStore from '~/store/useNotificationStore'
import xIcon from '../images/X 1.png'
import bunnyLogo from '../images/bunny-mascot.png'
import Lottie from 'react-lottie'
import bunnyHappyAnimationData from '../animations/bunny-happy.json'
import {
    platformIcons,
    getActionLabel,
    requiresInputField,
    getInputPlaceholder,
    handleAction,
    handleSubmitTask,
    shouldDisableActionButton,
    shouldDisableVerifyButton
} from '../utils/actionHandlers'
import bunnyAnimationData from '../animations/bunny.json'
import coinsCreditedAnimationData from '../animations/coins-credited.json'
import AnimatedNumber from '../components/AnimatedNumber'
import { FaTimes } from 'react-icons/fa'
import ticket from '../images/tickets 1.png'

const coinsCreditedAnimation = {
    loop: true,
    autoplay: true,
    animationData: coinsCreditedAnimationData,
    rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice'
    }
}

const bunnyAnimation = {
    loop: true,
    autoplay: true,
    animationData: bunnyAnimationData,
    rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice'
    }
}

interface VerificationTask {
    id: number
    name: string
    description: string
    xp: number
    platform: string
    verificationMethod: string
    intervalType: string
    parameters?: any
}

type AcademyCompletionSlideProps = {
    earnedPoints: number
    totalPoints: number
    academyName: string
    academyId: number
    academyTwitter?: string // Add this line
    surprisePoint: number
}

const bunnyHappyAnimation = {
    loop: true,
    autoplay: true,
    animationData: bunnyHappyAnimationData,
    rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice'
    }
}

const AcademyCompletionSlide: React.FC<AcademyCompletionSlideProps> = ({
    earnedPoints,
    totalPoints,
    academyName,
    academyId,
    academyTwitter, // Destructure the prop here
    surprisePoint
}) => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { userId, telegramUserId, twitterAuthenticated, referralCode, setTwitterAuthenticated } = useUserStore((state) => ({
        userId: state.userId,
        telegramUserId: state.telegramUserId,
        twitterAuthenticated: state.twitterAuthenticated,
        referralCode: state.referralCode,
        setTwitterAuthenticated: state.setTwitterAuthenticated
    }))
    const [endOfAcademyTasks, setEndOfAcademyTasks] = useState<VerificationTask[]>([])
    const { userVerificationTasks, fetchUserVerificationTasks, completeTask } = useUserVerificationStore((state) => ({
        userVerificationTasks: state.userVerificationTasks,
        fetchUserVerificationTasks: state.fetchUserVerificationTasks,
        completeTask: state.completeTask
    }))
    const { fetchUserTotalPoints } = useAcademiesStore.getState()
    const { fetchUserLevel } = useUserStore.getState()
    const { fetchNotifications, showNotification } = useNotificationStore.getState()

    const [notificationOpen, setNotificationOpen] = useState(false)
    const [notificationText, setNotificationText] = useState('')
    const [selectedTask, setSelectedTask] = useState<VerificationTask | null>(null)
    const [taskInputValues, setTaskInputValues] = useState<{ [key: number]: string }>({})
    const [submittedTasks, setSubmittedTasks] = useState<{ [key: number]: boolean }>({})
    const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
    const [feedbackText, setFeedbackText] = useState('')
    const [referralModalOpen, setReferralModalOpen] = useState(false)
    const [referralLink, setReferralLink] = useState('')
    const [visibleTooltip, setVisibleTooltip] = useState<number | null>(null)

    // Extract Twitter handle from academyTwitter prop
    const [twitterHandle, setTwitterHandle] = useState('')

    useEffect(() => {
        if (academyTwitter) {
            const handle = extractTwitterHandle(academyTwitter)
            setTwitterHandle(handle)
        }
    }, [academyTwitter])

    // Function to extract Twitter handle
    function extractTwitterHandle(url: string): string {
        if (!url) return ''
        let handle = url.replace(/https:\/\/(x\.com|twitter\.com)\//, '')
        handle = handle.replace(/\/$/, '')
        return '@' + handle
    }

    // Fetch tasks with the 'END_OF_ACADEMY' display location for this academy
    const fetchEndOfAcademyTasks = async () => {
        try {
            const response = await axiosInstance.get(`/api/verification-tasks/end-of-academy?academyId=${academyId}`)
            setEndOfAcademyTasks(response.data)
        } catch (error) {
            console.error('Error fetching end of academy tasks:', error)
        }
    }

    useEffect(() => {
        fetchEndOfAcademyTasks()
        fetchUserVerificationTasks()
    }, [academyId])

    // Handle URL parameters for twitterAuth
    useEffect(() => {
        const twitterAuthStatus = searchParams.get('twitterAuth')
        if (twitterAuthStatus === 'success') {
            setTwitterAuthenticated(true)
            setNotificationText('Twitter authentication successful!')
            setNotificationOpen(true)
            // Remove the query parameter from the URL
            navigate('', { replace: true })
        } else if (twitterAuthStatus === 'failure') {
            setNotificationText('Twitter authentication failed. Please try again.')
            setNotificationOpen(true)
            navigate('', { replace: true })
        }
    }, [searchParams, setTwitterAuthenticated, navigate])

    // Handle action button click
    const onActionClick = async (task: VerificationTask) => {
        await handleAction(
            task,
            {
                referralCode,
                setReferralLink,
                setReferralModalOpen,
                setNotificationText,
                setNotificationOpen,
                setSelectedTask,
                setFeedbackDialogOpen,
                twitterAuthenticated,
                academyName,
                twitterHandle, // Pass the extracted Twitter handle here
                telegramUserId,
                userId
            },
            academyId
        )

        // Fetch the updated user verification tasks after starting the task
        await fetchUserVerificationTasks()
    }

    // Handle verify button click
    const handleVerify = async (task: VerificationTask) => {
        const userVerification = userVerificationTasks.find(
            (verification) => verification.verificationTaskId === task.id && verification.academyId === academyId
        )

        if (!userVerification) {
            setNotificationText('You have not started this task yet. Please perform the task before verifying.')
            setNotificationOpen(true)
            return
        }

        if (userVerification.verified) {
            setNotificationText('You have already completed this task.')
            setNotificationOpen(true)
            return
        }

        try {
            const message = await completeTask(task.id, academyId)

            // Fetch updated points and level
            if (userId) {
                await fetchUserTotalPoints(userId) // Update points
                await fetchUserLevel() // Update level
            }

            // Fetch notifications
            await fetchNotifications()

            // Show any unread notifications
            const { notifications } = useNotificationStore.getState()
            const unreadNotification = notifications.find((notif) => !notif.read)

            if (unreadNotification) {
                showNotification(unreadNotification)
            }

            setNotificationText(message)
            setNotificationOpen(true)

            // Update userVerificationTasks after completing the task
            await fetchUserVerificationTasks()
        } catch (error) {
            console.error('Error completing task:', error)

            let errorMessage = 'Verification failed. Please try again later.'
            if (axios.isAxiosError(error)) {
                const status = error.response?.status
                const backendMessage = error.response?.data?.message

                if (status === 429) {
                    errorMessage = 'Too many requests. Please try again later.'
                } else if (status === 401) {
                    errorMessage = 'Unauthorized. Please connect your Twitter account.'
                } else if (status === 400 && backendMessage) {
                    errorMessage = backendMessage
                } else if (backendMessage) {
                    errorMessage = backendMessage
                }
            }

            setNotificationText(errorMessage)
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

    // Helper functions
    function isSameDay(d1: Date, d2: Date) {
        return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()
    }

    const [showSurpriseBoxDialog, setShowSurpriseBoxDialog] = useState(surprisePoint > 0)

    return (
        <div className="flex flex-col items-center justify-center h-full mb-12">
            <div
                style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: '#1F2937',
                    padding: '30px',
                    borderRadius: '14px'
                }}
            >
                <h2 className="text-xl font-bold mb-4">In total you collected:</h2>
                <div className="flex items-center justify-center text-2xl font-bold mb-8 gap-4" style={{ flexDirection: 'column' }}>
                    <div className="flex items-center">
                        {earnedPoints} / {totalPoints}
                        <img src={coinStack} alt="coin stack" className="w-12 h-12 ml-4 mb-2" />
                    </div>
                    {earnedPoints + surprisePoint > 99 && (
                        <div className="flex items-center" style={{ gap: '5px' }}>
                            +{Math.floor((earnedPoints + surprisePoint) / 100)}
                            <img src={ticket} alt="ticket" className="w-10 h-10 ml-2 mb-2" />
                        </div>
                    )}
                </div>

                <div style={{ width: '100%', gap: '20px' }} className="w-full flex flex-col-reverse md:flex-row gap-5">
                    <Button
                        large
                        rounded
                        outline
                        onClick={() => navigate('/')}
                        className="mb-4"
                        style={{
                            backgroundColor: '4F5763',
                            color: 'rgba(255, 255, 255, 0.70)'
                        }}
                    >
                        Explore more academies
                    </Button>
                    <Button
                        large
                        rounded
                        outline
                        disabled
                        style={{
                            background: 'linear-gradient(180deg, #D52AE9 0%, #2E3772 100%)',
                            border: '1px solid #C400B2',
                            color: '#fff'
                        }}
                    >
                        Earn by doing quests
                    </Button>
                </div>
            </div>
            {/* Surprise Box  */}
            {showSurpriseBoxDialog && (
                <Dialog opened={true} onBackdropClick={() => setShowSurpriseBoxDialog(false)} className="!m-0 !p-0 !rounded-2xl !bg-opacity-80">
                    <div className="p-0 relative">
                        <button className="absolute right-1 text-gray-500 hover:text-gray-700" onClick={() => setShowSurpriseBoxDialog(false)}>
                            <FaTimes size={20} />
                        </button>
                        <Lottie options={bunnyAnimation} height={200} width={200} />
                        <div className="text-lg font-bold text-center mt-4">Wow!</div>
                        <div className="text-lg font-bold text-center mt-4">You got a Black Box XP Boost! 🚀🚀</div>
                        <div className="flex flex-col items-center">
                            <div className="flex mt-4  text-2xl font-bold items-end justify-center">
                                <span className="mr-1">+</span>
                                <div className="mr-2">
                                    <AnimatedNumber target={surprisePoint} duration={2000} />
                                </div>
                                <Lottie options={coinsCreditedAnimation} height={60} width={60} />
                            </div>
                            <div className="flex mt-1 mb-2 text-2xl font-bold items-end justify-center">
                                <span className="mr-1">+</span>
                                <div className="mr-2">
                                    <AnimatedNumber target={surprisePoint / 100} duration={2000} />
                                </div>
                                <img src={ticket} alt="Raffles" style={{ width: 36 }} />
                            </div>
                        </div>
                    </div>
                </Dialog>
            )}

            {/* Referral Dialog */}
            <Dialog opened={referralModalOpen} onBackdropClick={() => setReferralModalOpen(false)} title="Invite a Friend" className="!m-0 !p-0 rounded-2xl">
                <div className="p-0">
                    <p>Share this link with your friends:</p>
                    <List className="!m-0 !p-0">
                        <ListInput outline type="text" value={referralLink} readOnly className="w-full !m-0 !p-0 border border-gray-300 rounded mt-2" />
                    </List>
                    <div className="flex flex-col space-y-2 mt-2">
                        <Button
                            outline
                            rounded
                            onClick={() => {
                                navigator.clipboard.writeText(referralLink)
                                setNotificationText('Referral link copied to clipboard!')
                                setNotificationOpen(true)
                            }}
                            className="!text-xs ml-4 mt-1 font-bold shadow-xl min-w-28 !mx-auto"
                            style={{
                                background: 'linear-gradient(to left, #ff0077, #7700ff)',
                                color: '#fff'
                            }}
                        >
                            Copy Invite Link
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
                            onClick={() => {
                                handleSubmitTask(selectedTask, feedbackText, {
                                    setNotificationText,
                                    setNotificationOpen,
                                    setSubmittedTasks,
                                    submittedTasks,
                                    setTaskInputValues,
                                    taskInputValues,
                                    userId,
                                    academyId
                                })
                                setFeedbackDialogOpen(false)
                                setFeedbackText('')
                            }}
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
            {/* Notification */}
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
                            onClick={() => {
                                handleSubmitTask(selectedTask, taskInputValues[selectedTask.id], {
                                    setNotificationText,
                                    setNotificationOpen,
                                    setSubmittedTasks,
                                    submittedTasks,
                                    setTaskInputValues,
                                    taskInputValues,
                                    userId,
                                    academyId
                                })
                            }}
                            className="!text-2xs font-bold shadow-xl !w-20 !h-6 mt-1 justify-end"
                            style={{ background: 'linear-gradient(to left, #16a34a, #3b82f6)', color: '#fff' }}
                        >
                            Send
                        </Button>
                    </div>
                )}
            </Notification>
            {/* Display End of Academy Tasks */}
            {endOfAcademyTasks.map((task) => {
                // Find user verification for the current task
                const userVerification = userVerificationTasks.find(
                    (verification) => verification.verificationTaskId === task.id && verification.academyId === academyId
                )
                const isVerified = userVerification?.verified
                const completedToday = isVerified && isSameDay(new Date(), new Date(userVerification?.completedAt))

                // Determine if the "Action" or "Verify" button should be disabled
                const disableActionButton = shouldDisableActionButton(task, userVerificationTasks, academyId)
                const disableVerifyButton = shouldDisableVerifyButton(task, userVerificationTasks, academyId)

                return (
                    <Card
                        key={task.id}
                        className="!my-6 !mx-0 !p-1 !rounded-2xl border border-gray-400 dark:border-gray-700 shadow-lg flex items-center justify-center !w-full"
                        style={{ background: '#1F2937' }}
                    >
                        <div className="flex items-center w-full mb-4" style={{ justifyContent: 'center' }}>
                            <div className="w-9 h-9 mr-2 items-center justify-center text-center rounded-md">
                                {platformIcons[task.platform] || <img src={xIcon} alt="coin stack" className="w-9 h-9" />}
                            </div>
                            {/* <div> */}
                            <div className="flex items-center" style={{ gap: '10px' }}>
                                <p className="text-[16px] font-bold dark:text-gray-100 ">
                                    {task.name} +{task.xp}
                                </p>
                                <img src={coinStack} alt="coin stack" className="w-6 h-6 " />
                            </div>

                            {/* </div> */}
                        </div>
                        <p className="text-md dark:text-gray-100 my-6" style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.70)' }}>
                            🎉 I just completed {academyName} academy on CoinBeats Crypto School #CoinBeatsxyz
                        </p>
                        <div className="flex flex-row gap-2 justify-center mr-2 mx-auto w-full">
                            {/* Action Button */}
                            <Button
                                rounded
                                onClick={() => onActionClick(task)}
                                className="!text-xs font-bold shadow-xl !w-30 !h-7"
                                style={{
                                    background: 'linear-gradient(90deg, #02A2CF 0%, #4FB139 100%)',
                                    color: '#fff',
                                    borderRadius: '20px',
                                    border: '1px solid #FFF'
                                }}
                                disabled={disableActionButton}
                            >
                                {getActionLabel(task.verificationMethod, twitterAuthenticated)}
                            </Button>

                            {/* Verify Button */}
                            <Button
                                rounded
                                outline
                                onClick={() => handleVerify(task)}
                                className="!text-xs font-bold shadow-xl !w-30 !h-7"
                                style={{
                                    border: isVerified ? '#16a34a' : '1px solid #FFF',
                                    backgroundColor: '#4F5763',
                                    color: '#fff'
                                }}
                                disabled={disableVerifyButton}
                            >
                                {isVerified ? 'Completed' : 'Verify'}
                            </Button>
                        </div>
                    </Card>
                )
            })}
        </div>
    )
}

export default AcademyCompletionSlide
