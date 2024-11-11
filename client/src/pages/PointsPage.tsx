// src/pages/PointsPage.tsx

import React, { useEffect, useState, useMemo } from 'react'
import { Card, Page, Button, Dialog, List, ListInput } from 'konsta/react'
import { FaTwitter, FaFacebook, FaInstagram, FaTelegramPlane, FaDiscord, FaYoutube, FaEnvelope } from 'react-icons/fa'
import { X } from '@mui/icons-material'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'
import BottomTabBar from '../components/BottomTabBar'
import coinStack from '../images/coin-stack.png'
import Trophy from '../images/trophy.png'
import ximage from '../images/x.png'
import useUserStore from '~/store/useUserStore'
import useSessionStore from '../store/useSessionStore'
import treasure from '../images/treasure1.png'
import bunny from '../images/bunny-head.png'
import Lottie from 'react-lottie'
import coinsEarnedAnimationData from '../animations/earned-coins.json'
import bunnyHappyAnimationData from '../animations/bunny-happy.json'
import bronzeMedal from '../images/bronze-medal.png'
import useTasksStore from '~/store/useTasksStore'
import useLeaderboardStore from '../store/useLeaderboardStore'
import axiosInstance from '../api/axiosInstance' // Only if needed
import { handleAction, copyReferralLink, handleInviteFriend, generateReferralLink } from '../utils/actionHandlers' // Import functions
import { VerificationTask } from '../types'

const PointsPage: React.FC = () => {
    const { userId, totalPoints, userPoints, fetchUserPoints, referralCode } = useUserStore((state) => ({
        userId: state.userId,
        totalPoints: state.totalPoints,
        userName: state.username,
        userPoints: state.userPoints,
        fetchUserPoints: state.fetchUserPoints,
        referralCode: state.referralCode
    }))

    const { leaderboard, weeklyLeaderboard, fetchLeaderboards, scholarshipText, fetchScholarshipText } = useLeaderboardStore((state) => ({
        leaderboard: state.leaderboard,
        weeklyLeaderboard: state.weeklyLeaderboard,
        fetchLeaderboards: state.fetchLeaderboards,
        scholarshipText: state.scholarshipText,
        fetchScholarshipText: state.fetchScholarshipText
    }))

    const { homepageTasks } = useTasksStore((state) => ({
        homepageTasks: state.homepageTasks
    }))

    const [referralModalOpen, setReferralModalOpen] = useState(false)
    const [referralLink, setReferralLink] = useState('')

    const [activeTab, setActiveTab] = useState('tab-4') // Set active tab to Points
    const [activeLeaderboardTab, setActiveLeaderboardTab] = useState('weekly') // Set default tab to 'weekly' so Scholarships is active
    const [visibleTooltip, setVisibleTooltip] = useState(false) // State for tooltip visibility

    const { telegramUserId } = useSessionStore((state) => ({
        telegramUserId: state.userId
    }))

    const [notificationText, setNotificationText] = useState('')
    const [notificationOpen, setNotificationOpen] = useState(false)

    const constructImageUrl = (url) => {
        return `https://subscribes.lt/${url}`
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

    // Compute userRank
    const userRank = useMemo(() => {
        if (leaderboard && userId) {
            const rank = leaderboard.findIndex((user) => user.userId === userId)
            return rank >= 0 ? rank + 1 : null
        }
        return null
    }, [leaderboard, userId])

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
                                            onClick={() =>
                                                handleAction(task, {
                                                    referralCode,
                                                    setReferralLink,
                                                    setReferralModalOpen,
                                                    setNotificationText,
                                                    setNotificationOpen
                                                    // Remove referralCodeState and setReferralCodeState
                                                })
                                            }
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
                                            <img src={coinStack} className="h-3 w-3 ml-1" alt="coins icon" />
                                        </button>
                                    </div>
                                ))}
                        </div>
                    </div>

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
