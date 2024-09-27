// src/pages/BookmarksPage.tsx

import React, { useEffect, useState } from 'react'
import axios from '../api/axiosInstance'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'
import BottomTabBar from '../components/BottomTabBar'
import { Page, BlockTitle, Card, Button } from 'konsta/react'
import { MdBookmarks } from 'react-icons/md'
import useUserStore from '../store/useUserStore'
import useSessionStore from '../store/useSessionStore'
import coins from '../images/coin-stack.png'

export default function BookmarksPage({ academy }) {
    const [bookmarkedAcademies, setBookmarkedAcademies] = useState([])
    const { userId, points } = useUserStore((state) => ({
        userId: state.userId,
        points: state.points
    }))

    const hasCompletedAcademy = (academyId) => {
        return points.some((point) => point.academyId === academyId)
    }

    const getCompletedAcademyPoints = (academyId) => {
        return points.find((point) => point.academyId === academyId)
    }

    const navigate = useNavigate()
    // Using telegramUserId from the session store
    const { telegramUserId } = useSessionStore((state) => ({
        telegramUserId: state.userId
    }))

    const [activeTab, setActiveTab] = useState('tab-2') // Set active tab to Bookmarks

    useEffect(() => {
        if (academy) {
            setBookmarkedAcademies((prev) => [...prev, academy])
        } else {
            // Fetch from backend if no state passed
            const fetchBookmarkedAcademies = async () => {
                try {
                    const response = await axios.get(`/api/users/${userId}/bookmarked-academies`)
                    setBookmarkedAcademies(response.data)
                } catch (error) {
                    console.error('Error fetching bookmarked academies:', error)
                }
            }
            fetchBookmarkedAcademies()
        }
    }, [userId, academy])
    const constructImageUrl = (url) => {
        return `https://subscribes.lt/${url}`
    }

    const handleRemoveBookmark = async (academyId) => {
        try {
            await axios.post('/api/users/interaction', {
                telegramUserId: telegramUserId,
                action: 'bookmark',
                academyId: academyId
            })

            // Update the local state to reflect the change immediately
            setBookmarkedAcademies((prevAcademies) => prevAcademies.filter((academy) => academy.id !== academyId))
        } catch (error) {
            console.error('Error removing bookmark:', error)
        }
    }

    const handleMoreClick = (academy) => {
        navigate(`/product/${academy.id}`, { state: { academy } })
    }

    return (
        <Page>
            <Navbar />
            <Sidebar />
            <div className="text-center flex w-full items-center justify-center absolute top-8">
                <BlockTitle large>Raffles</BlockTitle>
            </div>
            <div className="grid grid-cols-2 px-2 pt-14 pb-16">
                {bookmarkedAcademies.map((academy) => (
                    <Card key={academy.id} className="relative flex flex-col items-center text-center !p-3 !rounded-2xl shadow-lg">
                        <div className="absolute top-0 left-0 p-2">
                            <button
                                className="text-red-600 rounded-full shadow-md focus:outline-none m-1"
                                onClick={() => handleRemoveBookmark(academy.id)} // Call the remove bookmark function
                            >
                                <MdBookmarks className="h-5 w-5 " />
                            </button>
                        </div>
                        <div
                            className={`flex items-center absolute top-0 right-0 px-1 py-[2px] ${
                                hasCompletedAcademy(academy.id) ? 'bg-green-100' : 'bg-white'
                            } bg-opacity-75 rounded-full text-sm font-bold text-gray-800 m-2`}
                        >
                            {hasCompletedAcademy(academy.id) ? (
                                <>+{getCompletedAcademyPoints(academy.id)?.value} ✅</>
                            ) : (
                                <>
                                    +{academy.xp} <img src={coins} className="h-5 w-5" alt="coins icon" />
                                </>
                            )}
                        </div>
                        <div className="flex items-center text-center w-full justify-center mt-1">
                            <img alt={academy.name} className="h-16 w-16 rounded-full mb-2" src={constructImageUrl(academy.logoUrl)} />
                        </div>
                        <div className="text-lg font-bold whitespace-nowrap">{academy.name}</div>
                        <Button rounded large className="mt-2 font-bold shadow-xl min-w-28" onClick={() => handleMoreClick(academy)}>
                            More
                        </Button>
                    </Card>
                ))}
            </div>
            <BottomTabBar activeTab={activeTab} setActiveTab={setActiveTab} /> {/* Add BottomTabBar */}
        </Page>
    )
}
