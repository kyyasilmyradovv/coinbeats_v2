// src/pages/HomePage.tsx

import React, { useMemo, useState, useEffect } from 'react'
import axios from '../api/axiosInstance' // Adjust this import based on your setup
import { useNavigate } from 'react-router-dom'
import useCategoryChainStore from '../store/useCategoryChainStore'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'
import { Page, List, ListInput, Card, Button, Dialog } from 'konsta/react'
import { MdBookmarks } from 'react-icons/md'
import { Icon } from '@iconify/react'
import useSessionStore from '../store/useSessionStore'
import useUserStore from '~/store/useUserStore'
import treasure from '../images/treasure1.png'
import coins from '../images/coin-stack.png'
import NewIcon from '../images/new.png' // Import the new icon

export default function HomePage({ theme, setTheme, setColorTheme }) {
    const navigate = useNavigate()
    const [category, setCategory] = useState('')
    const [chain, setChain] = useState('')
    const [activeFilter, setActiveFilter] = useState('all')
    const [academies, setAcademies] = useState([])
    const [bookmarkMessage, setBookmarkMessage] = useState('') // State for bookmark message
    const [showBookmarkAnimation, setShowBookmarkAnimation] = useState(false) // State to control bookmark animation
    const [tasks, setTasks] = useState([])
    const [referralModalOpen, setReferralModalOpen] = useState(false)
    const [referralLink, setReferralLink] = useState('')

    const handleAction = (task) => {
        if (task.verificationMethod === 'INVITE_TELEGRAM_FRIEND') {
            // Get the user's referral code
            axios
                .get('/api/users/me')
                .then((response) => {
                    const referralCode = response.data.referralCode
                    if (!referralCode) {
                        alert('Referral code not available.')
                        return
                    }
                    const referralLink = `${window.location.origin}?referralCode=${referralCode}`
                    // Display the link and a button to share it
                    setReferralLink(referralLink)
                    setReferralModalOpen(true)
                })
                .catch((error) => {
                    console.error('Error fetching user data:', error)
                })
        }
        // ... handle other methods
    }

    // Zustand User Store
    const { bookmarks, setBookmarks, userId, role, totalPoints, points, setUser } = useUserStore((state) => ({
        bookmarks: state.bookmarks,
        setBookmarks: state.setBookmarks,
        userId: state.userId,
        role: state.role,
        points: state.points,
        totalPoints: state.totalPoints, // Summing up user points
        setUser: state.setUser
    }))

    // Zustand Session Store - Get telegramUserId from the session store
    const { telegramUserId } = useSessionStore((state) => ({
        telegramUserId: state.userId
    }))

    // Zustand CategoryChain Store
    const { categories, chains, fetchCategoriesAndChains } = useCategoryChainStore((state) => ({
        categories: state.categories,
        chains: state.chains,
        fetchCategoriesAndChains: state.fetchCategoriesAndChains
    }))

    useEffect(() => {
        const fetchHomepageTasks = async () => {
            try {
                const response = await axios.get('/api/verification-tasks/homepage')
                setTasks(response.data)
            } catch (error) {
                console.error('Error fetching homepage tasks:', error)
            }
        }

        fetchHomepageTasks()
    }, [])

    // Fetch academies and categories/chains on component mount
    useEffect(() => {
        const fetchAcademies = async () => {
            try {
                const response = await axios.get('/api/academies/academies')
                setAcademies(response.data)
            } catch (error) {
                console.error('Error fetching academies:', error)
            }
        }

        fetchCategoriesAndChains()
        fetchAcademies()
    }, [fetchCategoriesAndChains])

    // Fetch bookmarks only after the userId is available
    useEffect(() => {
        const fetchBookmarkedAcademies = async () => {
            if (userId) {
                try {
                    const response = await axios.get(`/api/users/${userId}/bookmarked-academies`)
                    setBookmarks(response.data) // Store fetched bookmarks in Zustand
                } catch (error) {
                    console.error('Error fetching bookmarked academies:', error)
                }
            }
        }

        if (userId) {
            fetchBookmarkedAcademies() // Only fetch if userId is present
        }
    }, [userId, setBookmarks])

    const handleBookmark = async (academy) => {
        try {
            const response = await axios.post('/api/users/interaction', {
                telegramUserId: telegramUserId, // Get telegramUserId from the session store
                action: 'bookmark',
                academyId: academy.id
            })
            setBookmarks(academy) // Adds to local context for immediate UI update

            // Set bookmark message and show animation
            setBookmarkMessage(`Bookmarked!`)
            setShowBookmarkAnimation(true)

            // Navigate to BookmarksPage and pass the academy object as state
            navigate('/saved', { state: { academy } })

            // Remove the message and animation after 2 seconds
            setTimeout(() => {
                setShowBookmarkAnimation(false)
                setBookmarkMessage('')
            }, 2000)
        } catch (error) {
            console.error('Error bookmarking academy:', error)
        }
    }

    const isBookmarked = (academyId) => {
        return Array.isArray(bookmarks) ? bookmarks.some((bookmark) => bookmark.id === academyId) : false
    }

    const hasCompletedAcademy = (academyId) => {
        return Array.isArray(points) ? points.some((point) => point.academyId === academyId) : false
    }

    const getCompletedAcademyPoints = (academyId) => {
        return Array.isArray(points) ? points.find((point) => point.academyId === academyId) : null
    }

    const filteredData = useMemo(() => {
        let data = academies
        if (category) data = data.filter((item) => item.categories.some((cat) => cat.name === category))
        if (chain) data = data.filter((item) => item.chains.some((ch) => ch.name === chain))
        if (activeFilter === 'sponsored') data = data.filter((item) => item.sponsored)
        if (activeFilter === 'new') data = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        if (activeFilter === 'topRated') data = data.sort((a, b) => b.xp - a.xp)
        return data
    }, [category, chain, activeFilter, academies])

    const constructImageUrl = (url) => {
        return `https://subscribes.lt/${url}`
    }

    const handleMoreClick = (academy) => {
        navigate(`/product/${academy.id}`, { state: { academy } })
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

    return (
        <Page>
            <Navbar />
            <Sidebar />

            <div className="flex flex-row justify-center items-center flex-wrap mb-6 mt-6">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-2 flex flex-row items-center px-6 m-2">
                    {/* "Your Coins" card */}
                    <img src={treasure} className="h-8 w-8 mr-4" alt="bunny mascot" />
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold mr-4">Your Coins:</div>
                    <div className="text-md font-bold text-black dark:text-white">{totalPoints}</div>
                </div>

                {tasks.length > 0 && (
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-2 flex flex-row items-center px-6 m-2">
                        {/* Task card */}
                        <img src={`/images/platform-logos/${tasks[0].platform.toLowerCase()}.png`} className="h-10 w-10 mr-4" alt={tasks[0].platform} />
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold mr-4">{tasks[0].name}</div>
                        <Button
                            outline
                            rounded
                            onClick={() => handleAction(tasks[0])}
                            className="text-[12px] !w-16"
                            style={{
                                background: 'linear-gradient(to left, #ff0077, #7700ff)',
                                color: '#fff'
                            }}
                        >
                            Invite
                        </Button>
                    </div>
                )}
            </div>

            <Dialog opened={referralModalOpen} onBackdropClick={() => setReferralModalOpen(false)} title="Invite a Friend">
                <div className="p-4">
                    <p>Share this link with your friends:</p>
                    <input type="text" value={referralLink} readOnly className="w-full p-2 border border-gray-300 rounded mt-2" />
                    <Button onClick={copyReferralLink} className="mt-2">
                        Copy Link
                    </Button>
                    <Button onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}`, '_blank')} className="mt-2">
                        Share via Telegram
                    </Button>
                </div>
            </Dialog>

            <div className="flex justify-between bg-white dark:bg-zinc-900 rounded-2xl m-4 shadow-lg">
                <List className="w-full !my-0">
                    <ListInput
                        label="Category"
                        type="select"
                        dropdown
                        outline
                        placeholder="Please choose..."
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="">All</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.name}>
                                {category.name}
                            </option>
                        ))}
                    </ListInput>
                </List>
                <List className="w-full !my-0">
                    <ListInput
                        label="Chain"
                        type="select"
                        dropdown
                        outline
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
                    >
                        All
                    </Button>
                    <Button
                        rounded
                        outline
                        small
                        onClick={() => setActiveFilter('sponsored')}
                        className={`${
                            activeFilter === 'sponsored'
                                ? 'bg-gray-100 dark:bg-gray-800 k-color-brand-purple shadow-lg !text-2xs'
                                : 'bg-white dark:bg-gray-900 shadow-lg !text-2xs'
                        }`}
                    >
                        Sponsored
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
                    >
                        Most XP
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 px-2 pt-6 pb-16">
                {filteredData.map((academy) => {
                    const isCompleted = hasCompletedAcademy(academy.id)

                    return (
                        <Card key={academy.id} className="relative flex flex-col items-center text-center !p-3 !rounded-2xl shadow-lg overflow-visible">
                            <div className="absolute top-0 left-0 p-2">
                                <button
                                    className={`${isBookmarked(academy.id) ? 'text-red-600' : 'text-amber-500'} rounded-full shadow-md focus:outline-none m-1`}
                                    onClick={() => handleBookmark(academy)}
                                >
                                    <MdBookmarks className="h-5 w-5 transition-transform duration-300 transform hover:scale-110" />
                                </button>
                            </div>
                            <div
                                className={`flex items-center absolute top-0 right-0 px-1 py-[2px] ${
                                    isCompleted ? 'bg-green-100' : 'bg-white'
                                } bg-opacity-75 rounded-full text-sm font-bold text-gray-800 m-2`}
                            >
                                {isCompleted ? (
                                    // Use getCompletedAcademyPoints to find the specific points record and display the value
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
                            {new Date() - new Date(academy.createdAt) < 30 * 24 * 60 * 60 * 1000 && (
                                <img src={NewIcon} alt="New" className="absolute left-7 -bottom-4 w-10 h-10 -translate-x-8" style={{ zIndex: 10 }} />
                            )}
                        </Card>
                    )
                })}
            </div>

            {showBookmarkAnimation && (
                <div className="fixed inset-0 flex flex-col items-center justify-center z-50 animate-bookmark">
                    <MdBookmarks className="h-20 w-20 text-amber-500 transform scale-105 transition-transform duration-1000 ease-out" />
                    <div className="text-gray-800 dark:text-white mt-4 text-lg font-semibold">{bookmarkMessage}</div>
                </div>
            )}
        </Page>
    )
}

HomePage.displayName = 'HomePage'
