import React, { useEffect, useState } from 'react'
import { Card, BlockTitle, Page, Button, Dialog, List, ListInput } from 'konsta/react'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'
import BottomTabBar from '../components/BottomTabBar'
import axiosInstance from '../api/axiosInstance'
import coinStack from '../images/coin-stack.png'
import Trophy from '../images/trophy.png'
import coins from '../images/treasure1.png'
import ximage from '../images/x.png'
import useUserStore from '~/store/useUserStore'
import useSessionStore from '../store/useSessionStore'
import treasure from '../images/treasure1.png'
import { FaTelegramPlane } from 'react-icons/fa'
import useCategoryChainStore from '../store/useCategoryChainStore'
import { initUtils } from '@telegram-apps/sdk'

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

    const { telegramUserId } = useSessionStore((state) => ({
        telegramUserId: state.userId
    }))

    const { setUser } = useUserStore((state) => ({
        setUser: state.setUser
    }))

    const constructImageUrl = (url) => {
        return `https://subscribes.lt/${url}`
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
                    {/* Replace the single "Your Coins" card with the two cards from HomePage */}
                    <div className="flex flex-row justify-center items-center mt-4">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-1 flex flex-row items-center px-2 m-2 border border-gray-300 dark:border-gray-600 h-12 ml-4 justify-between">
                            {/* "Your Coins" card */}
                            <img src={treasure} className="h-8 w-8 mr-2" alt="Treasure box" />
                            <div className="text-md font-bold text-black dark:text-white flex flex-grow w-full text-end">{totalPoints}</div>
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
                                    className="!text-2xs !w-fit !border-blue-400 !font-bold whitespace-nowrap mr-2 !px-2 !py-0"
                                    style={{
                                        background: 'linear-gradient(to left, #16a34a, #3b82f6)',
                                        color: '#fff'
                                    }}
                                >
                                    Invite +500
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

                    <div className="flex flex-col px-4">
                        {/* Overall Leaderboard Card */}
                        <Card className="!mb-2 !p-0 !rounded-2xl shadow-lg !mx-2 relative border border-gray-300 dark:border-gray-600 max-h-80 overflow-y-auto">
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

                        {/* Weekly Leaderboard Card */}
                        <Card className="!mb-2 !p-0 !rounded-2xl shadow-lg !mx-2 relative border border-gray-300 dark:border-gray-600 max-h-80 overflow-y-auto">
                            <div className="flex justify-between">
                                <h2 className="text-sm font-bold mb-2 text-center">Weekly Leaderboard</h2>
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

                        {/* Your Points Breakdown Card */}
                        <Card className="!mb-2 !p-0 !rounded-2xl shadow-lg !mx-2 relative border border-gray-300 dark:border-gray-600">
                            <h2 className="text-sm font-bold mb-4">Your Points Breakdown</h2>
                            {userPoints.map((point, index) => (
                                <div key={index} className="flex items-center mb-4">
                                    <div className="bg-gray-900 mr-4 items-center justify-center text-center rounded-md w-7 h-6 flex">
                                        {point.academy ? (
                                            <img src={constructImageUrl(point.academy.logoUrl)} className="h-5 w-5 rounded-full" alt="academy logo" />
                                        ) : point.verificationTask?.platform === 'X' ? (
                                            <img src={ximage} alt="X Platform" className="h-5 w-5" />
                                        ) : null}
                                    </div>
                                    <div className="flex flex-row justify-between w-full">
                                        <div>
                                            <p className="text-sm font-semibold dark:text-gray-100">
                                                {point.academy ? point.academy.name : point.verificationTask?.description}
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
                    </div>

                    <BottomTabBar activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>
            </div>
        </Page>
    )
}

export default PointsPage
