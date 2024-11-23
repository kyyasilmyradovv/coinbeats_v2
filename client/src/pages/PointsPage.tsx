// src/pages/PointsPage.tsx

import React, { useEffect, useState, useMemo } from 'react'
import { Card, Page, Button, Dialog, List, ListInput, Notification } from 'konsta/react'
import { FaTwitter, FaFacebook, FaInstagram, FaTelegramPlane, FaDiscord, FaYoutube, FaEnvelope, FaTimes } from 'react-icons/fa'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'
import BottomTabBar from '../components/BottomTabBar'
import coinStack from '../images/coin-stack.png'
import Trophy from '../images/trophy.png'
import ximage from '../images/x.png'
import useUserStore from '~/store/useUserStore'
import treasure from '../images/treasure1.png'
import bunny from '../images/bunny-head.png'
import bunnyLogo from '../images/bunny-mascot.png'
import Lottie from 'react-lottie'
import coinsEarnedAnimationData from '../animations/earned-coins.json'
import bunnyHappyAnimationData from '../animations/bunny-happy.json'
import bronzeMedal from '../images/bronze-medal.png'
import useTasksStore from '~/store/useTasksStore'
import useLeaderboardStore from '../store/useLeaderboardStore'
import { handleAction, copyReferralLink, handleInviteFriend, getActionLabel } from '../utils/actionHandlers'
import useUserVerificationStore from '../store/useUserVerificationStore'
import { VerificationTask, CharacterLevel } from '../types'
import useCharacterLevelStore from '../store/useCharacterLevelStore'

const PointsPage: React.FC = () => {
    const { userId, totalPoints, userPoints, fetchUserPoints, referralCode, twitterAuthenticated, telegramUserId } = useUserStore((state) => ({
        userId: state.userId,
        totalPoints: state.totalPoints,
        userName: state.username,
        userPoints: state.userPoints,
        fetchUserPoints: state.fetchUserPoints,
        referralCode: state.referralCode,
        twitterAuthenticated: state.twitterAuthenticated,
        telegramUserId: state.telegramUserId
    }))

    const { homepageTasks } = useTasksStore((state) => ({
        homepageTasks: state.homepageTasks
    }))

    const { userVerificationTasks, fetchUserVerificationTasks, submitTask, startTask } = useUserVerificationStore((state) => ({
        userVerificationTasks: state.userVerificationTasks,
        fetchUserVerificationTasks: state.fetchUserVerificationTasks,
        submitTask: state.submitTask,
        startTask: state.startTask
    }))

    const { leaderboard, weeklyLeaderboard, fetchLeaderboards, scholarshipText, fetchScholarshipText } = useLeaderboardStore((state) => ({
        leaderboard: state.leaderboard,
        weeklyLeaderboard: state.weeklyLeaderboard,
        fetchLeaderboards: state.fetchLeaderboards,
        scholarshipText: state.scholarshipText,
        fetchScholarshipText: state.fetchScholarshipText
    }))

    const { characterLevels, fetchCharacterLevels } = useCharacterLevelStore()

    const [currentLevel, setCurrentLevel] = useState<CharacterLevel | null>(null)
    const [nextLevel, setNextLevel] = useState<CharacterLevel | null>(null)
    const [progressToNextLevel, setProgressToNextLevel] = useState(0)
    const [lottieAnimationData, setLottieAnimationData] = useState<any>(null)

    const [referralModalOpen, setReferralModalOpen] = useState(false)
    const [referralLink, setReferralLink] = useState('')

    const [activeTab, setActiveTab] = useState('tab-4') // Set active tab to Points
    const [activeLeaderboardTab, setActiveLeaderboardTab] = useState('weekly') // Set default tab to 'weekly' so Scholarships is active
    const [visibleTooltip, setVisibleTooltip] = useState(false) // State for tooltip visibility

    const [notificationText, setNotificationText] = useState('')
    const [notificationOpen, setNotificationOpen] = useState(false)

    const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
    const [feedbackText, setFeedbackText] = useState('')
    const [selectedTask, setSelectedTask] = useState<VerificationTask | null>(null)

    const constructImageUrl = (url: string) => {
        return `https://subscribes.lt/${url}`
    }

    // Updated constructLottieFileUrl function
    const constructLottieFileUrl = (url: string) => {
        return `${process.env.REACT_APP_API_BASE_URL}/${url}`
    }

    const [startOfWeek, setStartOfWeek] = useState<Date | null>(null)
    const [endOfWeek, setEndOfWeek] = useState<Date | null>(null)

    const coinsEarnedAnimation = {
        loop: true,
        autoplay: true,
        animationData: coinsEarnedAnimationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    }

    const bunnyHappyAnimation = {
        loop: true,
        autoplay: true,
        animationData: bunnyHappyAnimationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    }

    const platformIcons: { [key: string]: JSX.Element } = {
        X: <img src={ximage} alt="X" className="w-5 h-5" />,
        FACEBOOK: <FaFacebook className="w-5 h-5 text-blue-700" />,
        INSTAGRAM: <FaInstagram className="w-5 h-5 text-pink-500" />,
        TELEGRAM: <FaTelegramPlane className="w-5 h-5 text-blue-400" />,
        DISCORD: <FaDiscord className="w-5 h-5 text-indigo-600" />,
        YOUTUBE: <FaYoutube className="w-5 h-5 text-red-600" />,
        EMAIL: <FaEnvelope className="w-5 h-5 text-green-500" />
        // Add more platforms if needed
    }

    // Compute start and end of the week
    useEffect(() => {
        function getWeekStartAndEndDates() {
            const now = new Date()
            const dayOfWeek = now.getDay() // 0 (Sunday) to 6 (Saturday)
            const lastSunday = new Date(now)
            lastSunday.setDate(now.getDate() - dayOfWeek)
            lastSunday.setHours(0, 0, 0, 0) // Set to 00:00:00

            const nextSaturday = new Date(lastSunday)
            nextSaturday.setDate(lastSunday.getDate() + 6)
            nextSaturday.setHours(23, 59, 59, 999)

            return { startOfWeek: lastSunday, endOfWeek: nextSaturday }
        }

        const { startOfWeek, endOfWeek } = getWeekStartAndEndDates()
        setStartOfWeek(startOfWeek)
        setEndOfWeek(endOfWeek)
    }, [])

    useEffect(() => {
        if (userId) {
            fetchUserPoints(userId)
        }
    }, [userId, fetchUserPoints])

    useEffect(() => {
        if (userId) {
            fetchLeaderboards()
            fetchScholarshipText()
        }
    }, [userId, fetchLeaderboards, fetchScholarshipText])

    useEffect(() => {
        if (userId) {
            fetchUserVerificationTasks()
        }
    }, [userId, fetchUserVerificationTasks])

    useEffect(() => {
        fetchCharacterLevels()
    }, [fetchCharacterLevels])

    useEffect(() => {
        if (characterLevels.length > 0 && totalPoints !== null) {
            // Sort levels by minPoints
            const sortedLevels = [...characterLevels].sort((a, b) => a.minPoints - b.minPoints)

            // Find the current level
            const current = sortedLevels.find((level) => totalPoints >= level.minPoints && totalPoints <= level.maxPoints)
            setCurrentLevel(current || null)

            // Find the next level
            const currentIndex = current ? sortedLevels.findIndex((level) => level.id === current.id) : -1
            if (currentIndex >= 0 && currentIndex < sortedLevels.length - 1) {
                setNextLevel(sortedLevels[currentIndex + 1])
            } else {
                setNextLevel(null) // No next level, user is at max level
            }

            // Calculate progress towards next level
            if (current && nextLevel) {
                const levelRange = nextLevel.minPoints - current.minPoints
                const pointsIntoLevel = totalPoints - current.minPoints
                const progress = (pointsIntoLevel / levelRange) * 100
                setProgressToNextLevel(progress)
            } else {
                setProgressToNextLevel(100) // Max level
            }
        }
    }, [characterLevels, totalPoints, nextLevel])

    useEffect(() => {
        if (currentLevel && currentLevel.lottieFileUrl) {
            const lottieUrl = constructLottieFileUrl(currentLevel.lottieFileUrl)
            console.log('Fetching Lottie animation from:', lottieUrl)
            fetch(lottieUrl)
                .then((response) => response.json())
                .then((data) => {
                    setLottieAnimationData(data)
                })
                .catch((error) => {
                    console.error('Error fetching Lottie animation:', error)
                })
        }
    }, [currentLevel])

    // Compute userRank
    const userRank = useMemo(() => {
        if (leaderboard && userId) {
            const rank = leaderboard.findIndex((user) => user.userId === userId)
            return rank >= 0 ? rank + 1 : null
        }
        return null
    }, [leaderboard, userId])

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

    // Implement the handleSubmitFeedback function
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
            setNotificationText('Error submitting feedback. Please try again later.')
            setNotificationOpen(true)
        }
    }

    // Custom handleAction function
    const onActionClick = async (task: VerificationTask) => {
        if (task.verificationMethod === 'LEAVE_FEEDBACK') {
            // Do not start the task here
            setSelectedTask(task)
            setFeedbackDialogOpen(true)
        } else {
            // Use existing handleAction function
            handleAction(task, {
                referralCode,
                setReferralLink,
                setReferralModalOpen,
                setNotificationText,
                setNotificationOpen,
                setSelectedTask,
                setFeedbackDialogOpen,
                twitterAuthenticated,
                academyName: '',
                twitterHandle: '',
                telegramUserId
            })
        }
    }

    return (
        <Page>
            <Navbar />
            <Sidebar />

            <div className="relative min-h-screen bg-cosmos-bg bg-fixed bg-center bg-no-repeat bg-cover">
                <div className="absolute inset-0 bg-black opacity-50 z-0"></div>
                <div className="relative z-10">
                    {/* Header and Character Development Card */}
                    <div className="flex flex-row justify-center items-center mb-2 mt-2">
                        {/* Character Development Card */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-2 flex flex-row items-center mx-4 border border-gray-300 dark:border-gray-600 w-full">
                            {/* Left side: Progress bar and Levels */}
                            <div className="w-2/3 flex flex-col justify-center">
                                {/* Progress bar */}
                                <div className="relative w-full h-2 bg-gray-500 rounded-full overflow-hidden mt-2">
                                    <div
                                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-blue-500"
                                        style={{ width: `${progressToNextLevel}%` }}
                                    ></div>
                                </div>
                                {/* Total Points and Next Level Info */}
                                <div className="flex justify-between mt-1">
                                    {/* Total Points */}
                                    <div className="text-sm font-bold text-black dark:text-white">{totalPoints} coins</div>
                                    {/* Next Level Info */}
                                    {nextLevel && (
                                        <div className="text-right">
                                            <div className="text-2xs text-gray-100">Next level</div>
                                            <div className="text-xs font-bold text-white">{nextLevel.levelName}</div>
                                            <div className="text-xs text-white">Bonus coins: {nextLevel.rewardPoints}</div>
                                        </div>
                                    )}
                                </div>
                                {/* Rank and Current Level */}
                                <div className="flex items-center mt-1 justify-between">
                                    {/* Current Level */}
                                    {currentLevel && (
                                        <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-full px-2 text-center items-center justify-center pb-[2px]">
                                            <span className="text-white font-bold text-xs">{currentLevel.levelName}</span>
                                        </div>
                                    )}
                                    {/* Rank */}
                                    <div>{userRank && <div className="bg-gray-800 text-white rounded-full px-2 py-1 text-xs">Rank {userRank}</div>}</div>
                                </div>
                            </div>
                            {/* Right side: Lottie animation */}
                            <div className="w-1/3 flex justify-center">
                                {lottieAnimationData ? (
                                    <Lottie
                                        options={{
                                            loop: true,
                                            autoplay: true,
                                            animationData: lottieAnimationData,
                                            rendererSettings: {
                                                preserveAspectRatio: 'xMidYMid slice'
                                            }
                                        }}
                                        height={90}
                                        width={80}
                                    />
                                ) : (
                                    <div className="text-xs">Loading animation...</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Feedback Dialog */}
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
                                    <FaTelegramPlane className="inline-block mr-2 !h-5 !w-5" />
                                    Invite Friend
                                </Button>
                            </div>
                        </div>
                    </Dialog>

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

                    {/* Tabs for Leaderboards */}
                    <div className="flex justify-center gap-2 mt-2 mx-4 relative z-10">
                        {/* Scholarships Button (now first) */}
                        <div className="relative coinbeats-background rounded-full text-xs w-full p-[2px]">
                            <Button
                                outline
                                rounded
                                onClick={() => setActiveLeaderboardTab('weekly')}
                                className={`coinbeats-content rounded-full text-xs coinbeats-background !border-none !h-6 !px-2`}
                                style={{
                                    color: '#fff'
                                }}
                            >
                                Scholarships
                            </Button>
                        </div>
                        <Button
                            outline
                            rounded
                            onClick={() => setActiveLeaderboardTab('overall')}
                            className={`${
                                activeLeaderboardTab === 'overall'
                                    ? 'bg-gray-100 dark:bg-gray-800 k-color-brand-purple shadow-lg'
                                    : 'bg-white dark:bg-gray-900 shadow-lg'
                            } rounded-full text-xs`}
                            style={{
                                color: '#fff'
                            }}
                        >
                            Overall
                        </Button>
                        <Button
                            outline
                            rounded
                            onClick={() => setActiveLeaderboardTab('stats')}
                            className={`${
                                activeLeaderboardTab === 'stats'
                                    ? 'bg-gray-100 dark:bg-gray-800 k-color-brand-purple shadow-lg'
                                    : 'bg-white dark:bg-gray-900 shadow-lg'
                            } rounded-full text-xs`}
                            style={{
                                color: '#fff'
                            }}
                        >
                            Your Stats
                        </Button>
                    </div>

                    {/* Scholarships Info */}
                    {activeLeaderboardTab === 'weekly' && (
                        <div className="text-center mt-2">
                            <p className="text-sm font-bold text-white flex items-center justify-center">
                                {scholarshipText}
                                <button
                                    className="ml-2 rounded-full bg-gray-700 text-white text-xs font-bold w-5 h-5 flex items-center justify-center"
                                    onClick={() => setVisibleTooltip(!visibleTooltip)}
                                >
                                    ?
                                </button>
                            </p>
                            {visibleTooltip && (
                                <div className="tooltip relative bg-gray-700 text-white text-xs rounded-2xl p-4 mt-2 mx-auto w-11/12 max-w-md">
                                    <p>
                                        Weekly Scholarships are won by users who collect the most points during the week. In case of equal points, raffle
                                        decides who wins the reward. Snapshot is taken every Saturday, 23.00 CET.
                                    </p>
                                    <button className="absolute top-0 right-0 text-white text-sm mt-1 mr-1" onClick={() => setVisibleTooltip(false)}>
                                        &times;
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex flex-col px-4 mt-4">
                        {/* Render content based on activeLeaderboardTab */}
                        {activeLeaderboardTab === 'overall' && (
                            <>
                                {/* Overall Leaderboard Card */}
                                <Card className="!mb-18 !p-0 !rounded-2xl shadow-lg !mx-2 relative border border-gray-300 dark:border-gray-600">
                                    <div className="flex justify-between">
                                        <h2 className="text-sm font-bold mb-2 text-center">Overall Leaderboards</h2>
                                        <h2 className="text-sm font-bold mb-2 text-center">Points</h2>
                                    </div>
                                    {leaderboard.map((user, index) => {
                                        const isCurrentUser = user.userId === userId // Compare user IDs

                                        // Set the correct icon and dimensions based on the user's ranking
                                        const icon = index < 3 ? Trophy : index < 10 ? bronzeMedal : null
                                        const iconClass = index < 3 ? 'h-5 w-5' : index < 10 ? 'h-4 w-3' : 'h-5 w-5 invisible' // Invisible if no icon

                                        return (
                                            <div key={user.userId} className="flex items-center mb-2">
                                                {/* Placeholder for icon */}
                                                <div className={`flex w-5 ${iconClass} mr-2 justify-end`}>
                                                    {icon && <img src={icon} alt={index < 3 ? 'Trophy' : 'Bronze Medal'} className={`${iconClass}`} />}
                                                </div>

                                                {/* User name */}
                                                <div
                                                    className={`${
                                                        isCurrentUser
                                                            ? 'text-black dark:text-white font-bold underline text-md'
                                                            : 'text-gray-600 dark:text-gray-300 text-xs font-semibold'
                                                    } flex-grow`}
                                                >
                                                    {index + 1}. {user.name}
                                                </div>

                                                {/* Points */}
                                                <div
                                                    className={`${
                                                        isCurrentUser
                                                            ? 'text-black dark:text-white font-bold text-md'
                                                            : 'text-gray-600 dark:text-gray-300 text-sm font-bold'
                                                    }`}
                                                >
                                                    <strong>{user.totalPoints}</strong>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </Card>
                            </>
                        )}

                        {activeLeaderboardTab === 'weekly' && (
                            <>
                                {/* Weekly Leaderboard Card */}
                                <Card className="!mb-18 !p-0 !rounded-2xl shadow-lg !mx-2 !mt-0 relative border border-gray-300 dark:border-gray-600">
                                    {/* Date Range */}
                                    <div className="flex justify-between">
                                        <h2 className="text-sm font-bold mb-2 text-center">Weekly Leaderboard</h2>
                                        <div className="text-2xs text-gray-400">
                                            {startOfWeek && endOfWeek && (
                                                <span>
                                                    {startOfWeek.toLocaleDateString()} - {endOfWeek.toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                        <h2 className="text-sm font-bold mb-2 text-center">Points</h2>
                                    </div>
                                    {weeklyLeaderboard.map((user, index) => {
                                        const isCurrentUser = user.userId === userId // Compare user IDs

                                        // Set the correct icon and dimensions based on the user's ranking
                                        const icon = index < 3 ? Trophy : index < 10 ? bronzeMedal : null
                                        const iconClass = index < 3 ? 'h-5 w-5' : index < 10 ? 'h-4 w-3' : 'h-5 w-5 invisible' // Invisible if no icon

                                        return (
                                            <div key={user.userId} className="flex items-center mb-2">
                                                {/* Placeholder for icon */}
                                                <div className={`flex w-5 ${iconClass} mr-2 justify-end`}>
                                                    {icon && <img src={icon} alt={index < 3 ? 'Trophy' : 'Bronze Medal'} className={`${iconClass}`} />}
                                                </div>

                                                {/* User name */}
                                                <div
                                                    className={`${
                                                        isCurrentUser
                                                            ? 'text-black dark:text-white font-bold underline text-md'
                                                            : 'text-gray-600 dark:text-gray-300 text-xs font-semibold'
                                                    } flex-grow`}
                                                >
                                                    {index + 1}. {user.name}
                                                </div>

                                                {/* Points */}
                                                <div
                                                    className={`${
                                                        isCurrentUser
                                                            ? 'text-black dark:text-white font-bold text-md'
                                                            : 'text-gray-600 dark:text-gray-300 text-sm font-bold'
                                                    }`}
                                                >
                                                    <strong>{user.totalPoints}</strong>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </Card>
                            </>
                        )}

                        {activeLeaderboardTab === 'stats' && (
                            <>
                                {/* Your Points Breakdown Card */}
                                <Card className="!mb-18 !p-4 !rounded-2xl shadow-lg !mx-2 relative border border-gray-300 dark:border-gray-600">
                                    <h2 className="text-sm font-bold mb-4">Your Points Breakdown</h2>

                                    {/* Sort userPoints by createdAt in descending order */}
                                    {userPoints
                                        .sort((a, b) => {
                                            const dateA = new Date(a.createdAt)
                                            const dateB = new Date(b.createdAt)

                                            return dateB.getTime() - dateA.getTime() // Sort by newest first
                                        })
                                        .map((point, index) => (
                                            <div key={index} className="flex items-center mb-4 justify-between">
                                                <div className="bg-gray-900 mr-4 items-center justify-center text-center rounded-md w-7 h-6 flex-shrink-0 flex">
                                                    {point.academy ? (
                                                        <img
                                                            src={constructImageUrl(point.academy.logoUrl)}
                                                            className="h-5 w-5 rounded-full"
                                                            alt="academy logo"
                                                        />
                                                    ) : point.verificationTask?.platform && platformIcons[point.verificationTask.platform] ? (
                                                        platformIcons[point.verificationTask.platform]
                                                    ) : point.verificationTask?.platform === 'NONE' ? (
                                                        <img src={bunny} alt="Coins" className="h-5 w-5" />
                                                    ) : point.verificationTask?.verificationMethod === 'INVITE_TELEGRAM_FRIEND' ? (
                                                        <img src={bunny} alt="Bunny" className="h-5 w-5" />
                                                    ) : (
                                                        <img src={bunny} alt="Coins" className="h-5 w-5" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col w-full">
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-sm font-semibold dark:text-gray-100">
                                                            {point.academy ? point.academy.name : point.verificationTask?.name}
                                                        </p>
                                                        <div className="flex items-center w-20 justify-end">
                                                            <p className="text-sm font-semibold dark:text-gray-100">+{point.value}</p>
                                                            <img src={coinStack} alt="Coins" className="w-5 h-5 ml-2 flex-shrink-0" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </Card>
                            </>
                        )}
                    </div>

                    <BottomTabBar activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>
            </div>
        </Page>
    )
}

export default PointsPage
