// src/pages/HomePage.tsx

import React, { useMemo, useState, useEffect, useRef } from 'react'
import { initUtils } from '@telegram-apps/sdk'
import { useNavigate } from 'react-router-dom'
import useAcademiesStore from '../store/useAcademiesStore'
import useCategoryChainStore from '../store/useCategoryChainStore'
import useTasksStore from '../store/useTasksStore'
import useLeaderboardStore from '../store/useLeaderboardStore'
import useUserVerificationStore from '../store/useUserVerificationStore'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'
import { Page, List, ListInput, Card, Button, Dialog, Searchbar, Notification } from 'konsta/react'
import { MdBookmarks } from 'react-icons/md'
import { FaTelegramPlane, FaTimes } from 'react-icons/fa'
import useSessionStore from '../store/useSessionStore'
import useUserStore from '../store/useUserStore'
import coins from '../images/coin-stack.png'
import NewIcon from '../images/new.png'
import AnimatedNumber from '../components/AnimatedNumber'
import Lottie from 'react-lottie'
import bunnyAnimationData from '../animations/bunny.json'
import coinsCreditedAnimationData from '../animations/coins-credited.json'
import coinsEarnedAnimationData from '../animations/earned-coins.json'
import bunnyHappyAnimationData from '../animations/bunny-happy.json'
import bunnyLogo from '../images/bunny-mascot.png'

export default function HomePage() {
    const navigate = useNavigate()
    const [category, setCategory] = useState('')
    const [chain, setChain] = useState('')
    const [activeFilter, setActiveFilter] = useState('all')
    const [bookmarkMessage, setBookmarkMessage] = useState('')
    const [showBookmarkAnimation, setShowBookmarkAnimation] = useState(false)
    const [referralModalOpen, setReferralModalOpen] = useState(false)
    const [referralLink, setReferralLink] = useState('')
    const [referralCodeState, setReferralCodeState] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [loginStreakData, setLoginStreakData] = useState(null)
    const [showLoginStreakDialog, setShowLoginStreakDialog] = useState(false)
    const [showReferralPointsDialog, setShowReferralPointsDialog] = useState(false)
    const [animationComplete, setAnimationComplete] = useState(false)
    const [notificationOpen, setNotificationOpen] = useState(false)
    const [notificationText, setNotificationText] = useState('')

    // Added useRef to ensure the login streak is handled only once
    const loginStreakHandled = useRef(false)

    // Add state variables for feedback handling
    const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
    const [feedbackText, setFeedbackText] = useState('')
    const [selectedTask, setSelectedTask] = useState(null)

    const {
        bookmarks,
        userId,
        totalPoints,
        points,
        referralPointsAwarded,
        resetReferralPointsAwarded,
        fetchBookmarkedAcademies,
        referralCode,
        handleLoginStreak,
        addBookmark
    } = useUserStore((state) => ({
        bookmarks: state.bookmarks,
        userId: state.userId,
        points: state.points,
        totalPoints: state.totalPoints,
        referralPointsAwarded: state.referralPointsAwarded,
        resetReferralPointsAwarded: state.resetReferralPointsAwarded,
        fetchBookmarkedAcademies: state.fetchBookmarkedAcademies,
        referralCode: state.referralCode,
        handleLoginStreak: state.handleLoginStreak,
        addBookmark: state.addBookmark
    }))

    const { telegramUserId } = useSessionStore((state) => ({
        telegramUserId: state.userId
    }))

    const { categories, chains } = useCategoryChainStore((state) => ({
        categories: state.categories,
        chains: state.chains
    }))

    const { academies } = useAcademiesStore((state) => ({
        academies: state.academies
    }))

    const { homepageTasks } = useTasksStore((state) => ({
        homepageTasks: state.homepageTasks
    }))

    const { leaderboard, fetchLeaderboards } = useLeaderboardStore((state) => ({
        leaderboard: state.leaderboard,
        fetchLeaderboards: state.fetchLeaderboards
    }))

    const { startTask, submitTask } = useUserVerificationStore((state) => ({
        startTask: state.startTask,
        submitTask: state.submitTask
    }))

    const bunnyAnimation = {
        loop: true,
        autoplay: true,
        animationData: bunnyAnimationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    }

    const coinsCreditedAnimation = {
        loop: true,
        autoplay: true,
        animationData: coinsCreditedAnimationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    }

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

    const handleLoginStreakLocal = async () => {
        try {
            const { userVerification, point } = await handleLoginStreak()
            if (point) {
                setLoginStreakData({
                    ...userVerification,
                    pointsAwarded: point.value
                })
                setShowLoginStreakDialog(true)
            }
        } catch (error) {
            console.error('Error handling login streak:', error)
        }
    }

    useEffect(() => {
        if (!loginStreakHandled.current) {
            loginStreakHandled.current = true

            if (referralPointsAwarded && referralPointsAwarded > 0) {
                // Show referral points dialog
                setShowReferralPointsDialog(true)
            } else {
                // Proceed to login streak
                handleLoginStreakLocal()
            }
        }
    }, [referralPointsAwarded])

    useEffect(() => {
        if (userId) {
            fetchBookmarkedAcademies(userId)
        }
    }, [userId, fetchBookmarkedAcademies])

    useEffect(() => {
        if (userId) {
            fetchLeaderboards()
        }
    }, [userId, fetchLeaderboards])

    const isBookmarked = (academyId) => {
        return Array.isArray(bookmarks) ? bookmarks.some((bookmark) => bookmark.id === academyId) : false
    }

    const hasCompletedAcademy = (academyId) => {
        return Array.isArray(points) ? points.some((point) => point.academyId === academyId) : false
    }

    const filteredData = useMemo(() => {
        let data = academies || []

        // Apply filters
        if (category) data = data.filter((item) => item.categories.some((cat) => cat.name === category))
        if (chain) data = data.filter((item) => item.chains.some((ch) => ch.name === chain))
        if (searchQuery) data = data.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
        if (activeFilter === 'yetToDo') data = data.filter((item) => !hasCompletedAcademy(item.id))
        if (activeFilter === 'new') data = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        if (activeFilter === 'topRated') data = data.sort((a, b) => b.xp - a.xp)

        return data
    }, [academies, category, chain, searchQuery, activeFilter, points])

    const constructImageUrl = (url) => {
        return `https://subscribes.lt/${url}`
    }

    const handleBookmark = async (academy) => {
        try {
            await addBookmark(academy.id)
            setBookmarkMessage(`Bookmarked!`)
            setShowBookmarkAnimation(true)
            navigate('/saved', { state: { academy } })

            setTimeout(() => {
                setShowBookmarkAnimation(false)
                setBookmarkMessage('')
            }, 2000)
        } catch (error) {
            console.error('Error bookmarking academy:', error)
        }
    }

    const getCompletedAcademyPoints = (academyId) => {
        return Array.isArray(points) ? points.find((point) => point.academyId === academyId) : null
    }

    const handleMoreClick = (academy) => {
        navigate(`/product/${academy.id}`, { state: { academy } })
    }

    const handleAction = (task) => {
        if (task.verificationMethod === 'INVITE_TELEGRAM_FRIEND') {
            const userReferralCode = referralCode
            if (!userReferralCode) {
                setNotificationText('Referral code not available.')
                setNotificationOpen(true)
                return
            }
            const botUsername = 'CoinbeatsMiniApp_bot/miniapp' // Replace with your bot's username
            const referralLink = `https://t.me/${botUsername}?startapp=${userReferralCode}`
            setReferralCodeState(userReferralCode) // Store referralCode for later use
            setReferralLink(referralLink)
            setReferralModalOpen(true)
        } else if (task.verificationMethod === 'LEAVE_FEEDBACK') {
            setSelectedTask(task)
            setFeedbackDialogOpen(true)
        }
        // ... handle other methods if any
    }

    const handleInviteFriend = () => {
        const utils = initUtils()
        const inviteLink = `https://t.me/CoinbeatsMiniApp_bot/miniapp?startapp=${referralCodeState}`
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

    // Compute userRank
    const userRank = useMemo(() => {
        if (leaderboard && userId) {
            const rank = leaderboard.findIndex((user) => user.userId === userId)
            return rank >= 0 ? rank + 1 : null
        }
        return null
    }, [leaderboard, userId])

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
            await startTask(taskId, userId)
            await submitTask(taskId, feedbackText, userId)
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
                    {/* Header and Tasks */}
                    <div className="flex flex-row justify-center items-center mb-2 mt-2">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-1 flex flex-col items-center px-2 m-2 border border-gray-300 dark:border-gray-600 h-auto ml-4">
                            {/* "Your Coins" card */}
                            <div className="flex flex-row items-center justify-between w-full">
                                <div className="w-10 h-10">
                                    <Lottie options={coinsEarnedAnimation} height={40} width={40} />
                                </div>
                                <div className="text-md font-bold text-black dark:text-white flex-grow text-end mr-2 mt-1">{totalPoints}</div>
                            </div>
                            {/* User Rank */}
                            {userRank && (
                                <div className="flex flex-row items-center mt-2 w-full">
                                    <div className="w-10 h-10 items-center">
                                        <Lottie options={bunnyHappyAnimation} height={35} width={35} />
                                    </div>
                                    <div className="flex flex-col file:text-md font-bold text-black dark:text-white flex-grow text-end mr-2 mt-1">
                                        <div className="flex flex-row items-center justify-center">
                                            <span className="text-center">{userRank}</span>
                                        </div>
                                        <div className="flex flex-row items-center justify-center">
                                            <span className="text-xs text-gray-300">Rank</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Map over tasks to display all task items */}
                        <div className="flex flex-col flex-grow">
                            {homepageTasks.length > 0 &&
                                homepageTasks.map((task, index) => (
                                    <div
                                        key={index}
                                        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg py-1 flex flex-row items-center px-1 m-1 border border-gray-300 dark:border-gray-600 h-12 mr-4 justify-between"
                                    >
                                        {/* Task card */}
                                        {task.verificationMethod === 'LEAVE_FEEDBACK' ? (
                                            <div className="text-2xl mx-2">🙏</div>
                                        ) : (
                                            <FaTelegramPlane size={30} className="text-blue-400 mx-2" />
                                        )}
                                        <div className="flex flex-col flex-grow ml-2">
                                            <div className="text-[12px] text-gray-800 dark:text-gray-200 font-semibold mr-2">{task.name}</div>
                                        </div>
                                        <button
                                            onClick={() => handleAction(task)}
                                            className={`text-2xs font-bold whitespace-nowrap mr-2 rounded-full flex flex-row h-6 uppercase items-center justify-center ${
                                                task.verificationMethod === 'LEAVE_FEEDBACK'
                                                    ? 'border border-orange-400 px-4 w-fit-content min-w-28'
                                                    : 'border border-blue-400 px-4 w-fit-content  min-w-28'
                                            }`}
                                            style={{
                                                background:
                                                    task.verificationMethod === 'LEAVE_FEEDBACK'
                                                        ? 'linear-gradient(to left, #3b82f6, #ff0077)'
                                                        : 'linear-gradient(to left, #16a34a, #3b82f6)',
                                                color: '#fff'
                                            }}
                                        >
                                            {task.verificationMethod === 'LEAVE_FEEDBACK' ? 'Feedback' : 'Invite'} +{task.xp}
                                            <img src={coins} className="h-3 w-3 ml-1" alt="coins icon" />
                                        </button>
                                    </div>
                                ))}
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

                    {/* Referral Points Dialog */}
                    {showReferralPointsDialog && (
                        <Dialog
                            opened={showReferralPointsDialog}
                            onBackdropClick={() => {
                                setShowReferralPointsDialog(false)
                                resetReferralPointsAwarded()
                                handleLoginStreakLocal()
                            }}
                            className="!m-0 !p-0 !rounded-2xl !bg-opacity-80"
                        >
                            <div className="p-0 relative">
                                <button
                                    className="absolute right-1 text-gray-500 hover:text-gray-700"
                                    onClick={() => {
                                        setShowReferralPointsDialog(false)
                                        resetReferralPointsAwarded()
                                        handleLoginStreakLocal()
                                    }}
                                >
                                    <FaTimes size={20} />
                                </button>
                                <div className="text-md font-bold text-center mt-4">Your special link bonus</div>
                                <div className="mb-10">
                                    <Lottie options={coinsCreditedAnimation} height={150} width={150} />
                                </div>
                                <div className="flex mt-4 mb-2 text-2xl font-bold items-end justify-center">
                                    <span className="mr-1">+</span>
                                    <AnimatedNumber target={referralPointsAwarded} duration={2000} onComplete={() => setAnimationComplete(true)} />
                                    <img src={coins} className={`h-8 w-8 ml-2 ${animationComplete ? 'animate-zoom' : 'animate-coin-spin'}`} alt="Coin" />
                                </div>
                            </div>
                        </Dialog>
                    )}

                    {/* Login Streak Dialog */}
                    {showLoginStreakDialog && (
                        <Dialog
                            opened={showLoginStreakDialog}
                            onBackdropClick={() => setShowLoginStreakDialog(false)}
                            className="!m-0 !p-0 !rounded-2xl !bg-opacity-80"
                        >
                            <div className="p-0 relative">
                                <button className="absolute right-1 text-gray-500 hover:text-gray-700" onClick={() => setShowLoginStreakDialog(false)}>
                                    <FaTimes size={20} />
                                </button>
                                <div className="text-md font-bold text-center mt-4">Daily Login Streak (1.5x)</div>
                                <Lottie options={bunnyAnimation} height={200} width={200} />
                                <div className="flex flex-col items-center">
                                    {/* Updated styles for the "Day" circle */}
                                    <div className="rounded-full p-2 bg-[linear-gradient(to_left,#ff0077,#7700ff)] border-2 border-[#DE47F0]">
                                        <div className="w-12 h-12 text-center">
                                            <div className="flex items-center text-center justify-center">
                                                <div className="text-md font-bold text-white">Day</div>
                                            </div>
                                            <div className="flex items-center justify-center text-white text-2xl font-bold">
                                                {loginStreakData?.streakCount || 1}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex mt-4 mb-2 text-2xl font-bold items-end justify-center">
                                        <span className="mr-1">+</span>
                                        <div className="mr-2">
                                            <AnimatedNumber
                                                target={loginStreakData?.pointsAwarded || 100}
                                                duration={2000}
                                                onComplete={() => setAnimationComplete(true)}
                                            />
                                        </div>
                                        <Lottie options={coinsCreditedAnimation} height={60} width={60} />
                                    </div>
                                </div>
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

                    {/* Filters */}
                    <div className="flex flex-col justify-between bg-white dark:bg-zinc-900 rounded-2xl mx-2 shadow-lg p-0 py-0">
                        <div className="flex flex-row w-full mt-1 items-center ml-4">
                            <span className="text-xs text-gray-800 dark:text-gray-300 ml-2">Filter by:</span>
                        </div>
                        <div className="flex flex-row w-full space-x-0">
                            <div className="!flex w-1/3">
                                <List className="!flex !ml-0 !mr-0 !mt-0 !mb-0 !w-full !my-0">
                                    <ListInput
                                        className="!flex text-xs !ml-0 !mr-0 !mt-0 !mb-0"
                                        label="Category"
                                        type="select"
                                        dropdown
                                        outline
                                        inputClassName="!flex !h-7 !ml-0 !mr-0 !mt-0 !mb-0"
                                        inputStyle={{ fontSize: '0.85rem' }}
                                        placeholder="Please choose..."
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        <option value="">All</option>
                                        {categories.map((category) => (
                                            <option
                                                key={category.id}
                                                value={category.name}
                                                className="!dark:text-white !text-black dark:bg-gray-800 !bg-gray-100"
                                            >
                                                {category.name}
                                            </option>
                                        ))}
                                    </ListInput>
                                </List>
                            </div>
                            <div className="!flex w-1/3">
                                <List className="!flex !ml-0 !mr-0 !mt-0 !mb-0 !w-full !my-0">
                                    <ListInput
                                        className="!flex text-xs !h-4 !ml-0 !mr-0 !mt-0 !mb-0"
                                        label="Chain"
                                        type="select"
                                        dropdown
                                        outline
                                        inputClassName="!flex !h-7 !ml-0 !mr-0 !mt-0 !mb-0"
                                        inputStyle={{ fontSize: '0.85rem' }}
                                        placeholder="Please choose..."
                                        value={chain}
                                        onChange={(e) => setChain(e.target.value)}
                                    >
                                        <option value="">All</option>
                                        {chains.map((chain) => (
                                            <option key={chain.id} value={chain.name}>
                                                {chain.name}
                                            </option>
                                        ))}
                                    </ListInput>
                                </List>
                            </div>
                            <div className="flex w-1/3 items-center justify-center text-center pr-2 z-0">
                                <Searchbar
                                    inputStyle={{ height: '1.9rem', fontSize: '0.85rem' }}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search"
                                    className="!text-2xs z-0 !items-center !justify-center !my-auto !h-7 !placeholder:text-sm"
                                    clearButton
                                />
                            </div>
                        </div>
                    </div>

                    {/* Filter Buttons */}
                    <div className="px-4">
                        <div className="flex gap-2 justify-center mt-4">
                            <Button
                                rounded
                                outline
                                small
                                onClick={() => setActiveFilter('all')}
                                className={`${
                                    activeFilter === 'all'
                                        ? 'bg-gray-100 dark:bg-gray-800 k-color-brand-purple shadow-lg !text-2xs'
                                        : 'bg-white dark:bg-gray-900 shadow-lg !text-2xs'
                                }`}
                                style={{
                                    color: '#fff'
                                }}
                            >
                                All
                            </Button>
                            <Button
                                rounded
                                outline
                                small
                                onClick={() => setActiveFilter('yetToDo')}
                                className={`!border-brand-blue text-brand-blue ${
                                    activeFilter === 'yetToDo'
                                        ? 'bg-gray-100 dark:bg-gray-800 k-color-brand-purple shadow-lg !text-2xs'
                                        : 'bg-white dark:bg-gray-900 shadow-lg !text-2xs'
                                }`}
                                style={{
                                    color: '#fff'
                                }}
                            >
                                Yet To Do
                            </Button>
                            <Button
                                rounded
                                outline
                                small
                                onClick={() => setActiveFilter('new')}
                                className={`${
                                    activeFilter === 'new'
                                        ? 'bg-gray-100 dark:bg-gray-800 k-color-brand-purple shadow-lg !text-2xs'
                                        : 'bg-white dark:bg-gray-900 shadow-lg !text-2xs'
                                }`}
                                style={{
                                    color: '#fff'
                                }}
                            >
                                New
                            </Button>
                            <Button
                                rounded
                                outline
                                small
                                onClick={() => setActiveFilter('topRated')}
                                className={`${
                                    activeFilter === 'topRated'
                                        ? 'bg-gray-100 dark:bg-gray-800 k-color-brand-purple shadow-lg !text-2xs !whitespace-nowrap'
                                        : 'bg-white dark:bg-gray-900 shadow-lg !text-2xs !whitespace-nowrap'
                                }`}
                                style={{
                                    color: '#fff'
                                }}
                            >
                                Most XP
                            </Button>
                        </div>
                    </div>

                    {/* Render the total number of academies */}
                    <div className="text-gray-300 text-xs mt-2 ml-6">
                        <span className="text-white font-bold">{filteredData.length} </span> Academies
                    </div>

                    {/* Tailwind Grid */}
                    <div className="grid grid-cols-3 gap-0 px-2 pt-1 pb-16">
                        {filteredData.map((academy) => {
                            const isCompleted = hasCompletedAcademy(academy.id)
                            const isCoinbeats = academy.academyType.name === 'Coinbeats'

                            return (
                                <div key={academy.id} className="relative">
                                    {/* Coinbeats background div */}
                                    {isCoinbeats && (
                                        <div className="absolute inset-0 pointer-events-none rounded-2xl z-0 coinbeats-background mx-[7px] mt-[7px] mb-[15px] items-center justify-center"></div>
                                    )}

                                    {/* Card element */}
                                    <Card
                                        className={`relative flex flex-col items-center text-center p-0 !mb-4 !m-2 rounded-2xl shadow-lg overflow-visible z-10 bg-white dark:bg-zinc-900 ${
                                            isCoinbeats ? 'coinbeats-content border-none' : 'border border-gray-300 dark:border-gray-600'
                                        }`}
                                    >
                                        {/* Bookmark Icon */}
                                        <div className="absolute top-1 left-1">
                                            <button
                                                className={`${
                                                    isBookmarked(academy.id) ? 'text-red-600' : 'text-amber-500'
                                                } rounded-full shadow-md focus:outline-none m-1`}
                                                onClick={() => handleBookmark(academy)}
                                            >
                                                <MdBookmarks className="h-4 w-4 transition-transform duration-300 transform hover:scale-110" />
                                            </button>
                                        </div>
                                        {/* Completed badge */}
                                        <div
                                            className={`flex items-center absolute top-1 right-1 px-1 py-[1px] ${
                                                isCompleted ? 'bg-gradient-to-r from-teal-400 to-teal-100' : 'bg-gradient-to-r from-slate-400 to-slate-100'
                                            } bg-opacity-75 rounded-full text-2xs font-bold text-gray-800`}
                                        >
                                            {isCompleted ? (
                                                <span className="text-xs">+{getCompletedAcademyPoints(academy.id)?.value} ✅</span>
                                            ) : (
                                                <>
                                                    <span className="text-xs">+{academy.xp}</span>
                                                    <img src={coins} className="h-4 w-4" alt="coins icon" />
                                                </>
                                            )}
                                        </div>
                                        {/* Coinbeats content (image, etc.) */}
                                        <div className="flex items-center justify-center w-full mt-1">
                                            <img
                                                alt={academy.name}
                                                className="h-16 w-16 rounded-full mb-2"
                                                src={constructImageUrl(academy.logoUrl)}
                                                loading="lazy" // Lazy loading the image
                                            />
                                        </div>
                                        <div className="text-md font-bold whitespace-nowrap">{academy.name}</div>
                                        <Button
                                            outline
                                            rounded
                                            onClick={() => handleMoreClick(academy)}
                                            className="!text-xs !w-24 !mx-auto mt-1 font-bold shadow-xl !h-6 !mb-3 !whitespace-nowrap"
                                            style={{
                                                background: 'linear-gradient(to left, #ff0077, #7700ff)',
                                                color: '#fff'
                                            }}
                                        >
                                            Study Now
                                        </Button>
                                        <div className="flex absolute bottom-1 right-1 mr-1">
                                            👨<span className="mt-[1px] ml-1">{academy.pointCount}</span>
                                        </div>
                                        {!isCoinbeats && new Date() - new Date(academy.createdAt) < 7 * 24 * 60 * 60 * 1000 && (
                                            <img src={NewIcon} alt="New" className="absolute left-7 -bottom-2 w-7 h-7 -translate-x-8" style={{ zIndex: 10 }} />
                                        )}
                                    </Card>
                                </div>
                            )
                        })}
                    </div>

                    {showBookmarkAnimation && (
                        <div className="fixed inset-0 flex flex-col items-center justify-center z-50 animate-bookmark">
                            <MdBookmarks className="h-20 w-20 text-amber-500 transform scale-105 transition-transform duration-1000 ease-out" />
                            <div className="text-gray-800 dark:text-white mt-4 text-lg font-semibold">{bookmarkMessage}</div>
                        </div>
                    )}
                </div>
            </div>
        </Page>
    )
}

HomePage.displayName = 'HomePage'
