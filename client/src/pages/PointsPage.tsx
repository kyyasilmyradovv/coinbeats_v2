import React, { useEffect, useState } from 'react'
import { Card, BlockTitle } from 'konsta/react'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'
import BottomTabBar from '../components/BottomTabBar'
import axiosInstance from '../api/axiosInstance'
import coinStack from '../images/coin-stack.png'
import Trophy from '../images/trophy.png'
import coins from '../images/treasure1.png'
import ximage from '../images/x.png'
import useUserStore from '~/store/useUserStore'

const PointsPage: React.FC = () => {
    const { userId, totalPoints } = useUserStore((state) => ({
        userId: state.userId,
        totalPoints: state.totalPoints
    }))

    const [leaderboard, setLeaderboard] = useState<any[]>([])
    const [userPoints, setUserPoints] = useState<any[]>([])

    const [activeTab, setActiveTab] = useState('tab-4') // Set active tab to Bookmarks

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

    // Fetch leaderboard when userId is available
    useEffect(() => {
        if (userId) {
            fetchUserPoints()
            const fetchLeaderboard = async () => {
                try {
                    const response = await axiosInstance.get('/api/points/leaderboard')
                    setLeaderboard(response.data)
                } catch (error) {
                    console.error('Error fetching leaderboard:', error)
                }
            }

            fetchLeaderboard()
        }
    }, [userId]) // Only runs when userId changes and is non-null

    return (
        <div className="flex flex-col">
            {/* Navbar, Sidebar, and BottomTabBar */}
            <Navbar />
            <div className="flex flex-grow">
                <Sidebar />
                <div className="flex-grow p-4">
                    <div className="text-center flex items-center justify-center top-4">
                        <BlockTitle large className="!mt-0 !mb-0">
                            Points
                        </BlockTitle>
                    </div>
                    {/* First Card: Your Coins */}
                    <Card className="!my-0 !mx-2 !p-0 !mt-4 !rounded-2xl !bg-gray-50 dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-sm !mb-2 !flex !items-center justify-center">
                        <div className="flex !items-center">
                            <img src={coins} className="h-10 w-10 mr-4" alt="bunny mascot" />
                            <div className="text-lg text-gray-500 dark:text-gray-400 font-semibold mr-4">Your Coins:</div>
                            <div className="text-xl font-bold text-black dark:text-white">{totalPoints}</div>
                        </div>
                    </Card>

                    {/* Second Card: Leaderboard */}
                    <Card className="!my-2 !mx-2 !p-2 !rounded-2xl !bg-gray-50 dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-sm !mb-2">
                        <div className="flex justify-between">
                            <h2 className="text-md font-bold mb-4 text-center">Leaderboard</h2>
                            <h2 className="text-md font-bold mb-4 text-center">Points</h2>
                        </div>
                        {leaderboard.map((user, index) => (
                            <div key={user.userId} className="flex items-center mb-2">
                                <img src={Trophy} alt="Trophy" className="h-6 w-6 mr-2" />
                                <div className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                                    {index + 1}. {user.name}
                                </div>
                                <div className="flex flex-grow"></div>
                                <div className="text-md font-bold text-gray-600 dark:text-gray-300">
                                    <strong>{user.totalPoints}</strong>
                                </div>
                            </div>
                        ))}
                    </Card>

                    {/* Third Card: Individual Points Breakdown */}
                    <Card className="!my-2 !mx-2 !p-2 !rounded-2xl !bg-gray-50 dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-sm !mb-12">
                        <h2 className="text-xl font-bold mb-4">Your Points Breakdown</h2>
                        {userPoints.map((point, index) => (
                            <div key={index} className="flex items-center mb-4">
                                <div className="bg-gray-900 mr-4 items-center justify-center text-center rounded-md w-14 h-12 flex p-2">
                                    {point.academy ? (
                                        <img src={constructImageUrl(point.academy.logoUrl)} className="h-8 w-8 rounded-full" alt="academy logo" />
                                    ) : point.verificationTask?.platform === 'twitter' ? (
                                        <img src={ximage} alt="X Platform" className="h-8 w-8" />
                                    ) : null}
                                </div>
                                <div className="flex flex-row justify-between w-full">
                                    <div>
                                        <p className="text-lg font-semibold dark:text-gray-100">
                                            {point.academy ? point.academy.name : point.verificationTask?.description}
                                        </p>
                                    </div>
                                    <div className="flex">
                                        <p className="text-lg font-semibold dark:text-gray-100">+{point.value}</p>
                                        <img src={coinStack} alt="Coins" className="w-8 h-6" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Card>
                </div>
            </div>
            <BottomTabBar activeTab={activeTab} setActiveTab={setActiveTab} /> {/* Add BottomTabBar */}
        </div>
    )
}

export default PointsPage
