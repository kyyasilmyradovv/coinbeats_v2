import React, { useEffect, useState } from 'react'
import { Card, Page, Button, Dialog, List, ListInput } from 'konsta/react'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'
import BottomTabBar from '../components/BottomTabBar'
import axiosInstance from '../api/axiosInstance'
import coinStack from '../images/coin-stack.png'
import Trophy from '../images/trophy.png'
import ximage from '../images/x.png'
import useUserStore from '~/store/useUserStore'
import useSessionStore from '../store/useSessionStore'
import treasure from '../images/treasure1.png'
import bunny from '../images/bunny-head.png'
import { FaTelegramPlane } from 'react-icons/fa'
import { initUtils } from '@telegram-apps/sdk'
import coming from '../images/svgs/coming-soon3.svg'
import Lottie from 'react-lottie'
import coinsEarnedAnimationData from '../animations/earned-coins.json'

const PointsPage: React.FC = () => {
    const { userId, totalPoints } = useUserStore((state) => ({
        userId: state.userId,
        totalPoints: state.totalPoints
    }))

    const [leaderboard, setLeaderboard] = useState<any[]>([])
    const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<any[]>([])
    const [userPoints, setUserPoints] = useState<any[]>([])
    const [tasks, setTasks] = useState([])
    const [referralModalOpen, setReferralModalOpen] = useState(false)
    const [referralLink, setReferralLink] = useState('')
    const [referralCode, setReferralCode] = useState('')

    const [activeTab, setActiveTab] = useState('tab-4') // Set active tab to Points
    const [activeLeaderboardTab, setActiveLeaderboardTab] = useState('weekly') // Set default tab to 'weekly' so Scholarships is active
    const [visibleTooltip, setVisibleTooltip] = useState(false) // State for tooltip visibility

    const { telegramUserId } = useSessionStore((state) => ({
        telegramUserId: state.userId
    }))

    const { setUser } = useUserStore((state) => ({
        setUser: state.setUser
    }))

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

    // Fetch user points breakdown using the new API
    const fetchUserPoints = async () => {
        if (!userId) {
            console.error('User ID is null or undefined, not fetching user points.')
            return
        }

        try {
            const response = await axiosInstance.get(`/api/points/breakdown/${userId}`)
            setUserPoints(response.data)
        } catch (error) {
            console.error('Error fetching user points:', error)
        }
    }

    // Fetch leaderboards when userId is available
    useEffect(() => {
        if (userId) {
            fetchUserPoints()
            const fetchLeaderboards = async () => {
                try {
                    // Fetch overall leaderboard
                    const overallResponse = await axiosInstance.get('/api/points/leaderboard')
                    setLeaderboard(overallResponse.data)

                    // Fetch weekly leaderboard
                    const weeklyResponse = await axiosInstance.get('/api/points/leaderboard?period=weekly')
                    setWeeklyLeaderboard(weeklyResponse.data)
                } catch (error) {
                    console.error('Error fetching leaderboards:', error)
                }
            }

            fetchLeaderboards()
        }
    }, [userId]) // Only runs when userId changes and is non-null

    // Fetch tasks (for the Invite button)
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axiosInstance.get('/api/verification-tasks/homepage')
                setTasks(response.data)
            } catch (error) {
                console.error('Error fetching tasks:', error)
            }
        }

        fetchTasks()
    }, [])

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

    const handleAction = (task) => {
        if (task.verificationMethod === 'INVITE_TELEGRAM_FRIEND') {
            axiosInstance
                .get('/api/users/me')
                .then((response) => {
                    const userReferralCode = response.data.referralCode
                    if (!userReferralCode) {
                        alert('Referral code not available.')
                        return
                    }
                    const botUsername = 'CoinbeatsMiniApp_bot/miniapp' // Replace with your bot's username
                    const referralLink = `https://t.me/${botUsername}?startapp=${userReferralCode}`
                    setReferralCode(userReferralCode) // Store referralCode for later use
                    setReferralLink(referralLink)
                    setReferralModalOpen(true)
                })
                .catch((error) => {
                    console.error('Error fetching user data:', error)
                })
        }
        // ... handle other methods if necessary
    }

    const copyReferralLink = () => {
        navigator.clipboard
            .writeText(referralLink)
            .then(() => {
                alert('Referral link copied to clipboard!')
            })
            .catch((error) => {
                console.error('Error copying referral link:', error)
            })
    }

    const handleInviteFriend = () => {
        const utils = initUtils()
        const inviteLink = `https://t.me/CoinbeatsMiniApp_bot/miniapp?startapp=${referralCode}`
        const shareText = `Join me on this awesome app!`

        const fullUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(shareText)}`
        utils.openTelegramLink(fullUrl)
    }

    return (
        <Page>
            <Navbar />
            <Sidebar />

            <div className="relative min-h-screen bg-cosmos-bg bg-fixed bg-center bg-no-repeat bg-cover">
                <div className="absolute inset-0 bg-black opacity-50 z-0"></div>
                <div className="relative z-10">
                    {/* Treasure and Task Cards */}
                    <div className="flex flex-row justify-center items-center mt-4">
                        <div className="pr-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-1 flex flex-row items-center px-2 m-2 border border-gray-300 dark:border-gray-600 h-12 ml-4 justify-between">
                            {/* "Your Coins" card */}
                            <div className="w-10 h-10">
                                <Lottie options={coinsEarnedAnimation} height={40} width={40} />
                            </div>
                            <div className="mt-1 text-md font-bold text-black dark:text-white flex flex-grow w-full text-end pr-2 items-center">
                                {totalPoints}
                            </div>
                        </div>

                        {tasks.length > 0 && (
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg py-1 flex flex-grow flex-row items-center px-1 m-1 border border-gray-300 dark:border-gray-600 h-12 mr-4 justify-between">
                                {/* Task card */}
                                <FaTelegramPlane size={30} className="text-blue-400 mx-2" />
                                <div className="flex flex-col flex-grow ml-2">
                                    <div className="text-[12px] text-gray-800 dark:text-gray-200 font-semibold mr-2">{tasks[0].name}</div>
                                </div>
                                <Button
                                    outline
                                    rounded
                                    onClick={() => handleAction(tasks[0])}
                                    className="!text-2xs !w-28 !h-6 !border-blue-400 !font-bold whitespace-nowrap mr-2 !px-2 !py-0"
                                    style={{
                                        background: 'linear-gradient(to left, #16a34a, #3b82f6)',
                                        color: '#fff'
                                    }}
                                >
                                    Invite +{tasks[0].xp}
                                    <img src={coinStack} className="h-3 w-3 ml-1" alt="coins icon" />
                                </Button>
                            </div>
                        )}
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

                    {/* Tabs for Leaderboards */}
                    <div className="flex justify-center gap-2 mt-4 mx-4 relative z-10">
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
                            <img src={coming} alt="Coming Soon" className="h-16 rotate-[3deg] mx-auto" />
                            <p className="text-sm font-bold text-white flex items-center justify-center">
                                Weekly Scholarships for Top 3: 3x100 USDC
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
                                        decides who wins the reward. Snapshot is taken every Sunday, 23.00 CET.
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
                                <Card className="!mb-2 !p-0 !rounded-2xl shadow-lg !mx-2 relative border border-gray-300 dark:border-gray-600">
                                    <div className="flex justify-between">
                                        <h2 className="text-sm font-bold mb-2 text-center">Overall Leaderboard</h2>
                                        <h2 className="text-sm font-bold mb-2 text-center">Points</h2>
                                    </div>
                                    {leaderboard.map((user, index) => (
                                        <div key={user.userId} className="flex items-center mb-2">
                                            <img src={Trophy} alt="Trophy" className="h-4 w-4 mr-2" />
                                            <div className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                                                {index + 1}. {user.name}
                                            </div>
                                            <div className="flex flex-grow"></div>
                                            <div className="text-sm font-bold text-gray-600 dark:text-gray-300">
                                                <strong>{user.totalPoints}</strong>
                                            </div>
                                        </div>
                                    ))}
                                </Card>
                            </>
                        )}

                        {activeLeaderboardTab === 'weekly' && (
                            <>
                                {/* Weekly Leaderboard Card */}
                                <Card className="!mb-2 !p-0 !rounded-2xl shadow-lg !mx-2 !mt-0 relative border border-gray-300 dark:border-gray-600">
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
                                    {weeklyLeaderboard.map((user, index) => (
                                        <div key={user.userId} className="flex items-center mb-2">
                                            <img src={Trophy} alt="Trophy" className="h-4 w-4 mr-2" />
                                            <div className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                                                {index + 1}. {user.name}
                                            </div>
                                            <div className="flex flex-grow"></div>
                                            <div className="text-sm font-bold text-gray-600 dark:text-gray-300">
                                                <strong>{user.totalPoints}</strong>
                                            </div>
                                        </div>
                                    ))}
                                </Card>
                            </>
                        )}

                        {activeLeaderboardTab === 'stats' && (
                            <>
                                {/* Your Points Breakdown Card */}
                                <Card className="!mb-2 !p-4 !rounded-2xl shadow-lg !mx-2 relative border border-gray-300 dark:border-gray-600">
                                    <h2 className="text-sm font-bold mb-4">Your Points Breakdown</h2>
                                    {userPoints.map((point, index) => (
                                        <div key={index} className="flex items-center mb-4">
                                            <div className="bg-gray-900 mr-4 items-center justify-center text-center rounded-md w-7 h-6 flex">
                                                {point.academy ? (
                                                    <img src={constructImageUrl(point.academy.logoUrl)} className="h-5 w-5 rounded-full" alt="academy logo" />
                                                ) : point.verificationTask?.platform === 'X' ? (
                                                    <img src={ximage} alt="X Platform" className="h-5 w-5" />
                                                ) : point.verificationTask?.platform === 'NONE' ? (
                                                    <img src={coinStack} alt="Coins" className="h-5 w-5" />
                                                ) : point.verificationTask?.verificationMethod === 'INVITE_TELEGRAM_FRIEND' ? (
                                                    <img src={bunny} alt="Bunny" className="h-5 w-5" />
                                                ) : null}
                                            </div>
                                            <div className="flex flex-row justify-between w-full">
                                                <div>
                                                    <p className="text-sm font-semibold dark:text-gray-100">
                                                        {point.academy ? point.academy.name : point.verificationTask?.name}
                                                    </p>
                                                </div>
                                                <div className="flex">
                                                    <p className="text-sm font-semibold dark:text-gray-100">+{point.value}</p>
                                                    <img src={coinStack} alt="Coins" className="w-5 h-5 ml-2" />
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
