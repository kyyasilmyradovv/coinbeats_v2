// src/pages/HomePage.tsx

import React, { useMemo, useState, useEffect } from 'react'
import { initUtils } from '@telegram-apps/sdk'
import axios from '../api/axiosInstance' // Adjust this import based on your setup
import { useNavigate } from 'react-router-dom'
import useCategoryChainStore from '../store/useCategoryChainStore'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'
import { Page, List, ListInput, Card, Button, Dialog, Link, Block } from 'konsta/react'
import { MdBookmarks } from 'react-icons/md'
import { FaTelegramPlane } from 'react-icons/fa' // Import the Telegram icon
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
    const [bookmarkMessage, setBookmarkMessage] = useState('')
    const [showBookmarkAnimation, setShowBookmarkAnimation] = useState(false)
    const [tasks, setTasks] = useState([])
    const [referralModalOpen, setReferralModalOpen] = useState(false)
    const [referralLink, setReferralLink] = useState('')
    const [referralCode, setReferralCode] = useState('')

    const handleAction = (task) => {
        if (task.verificationMethod === 'INVITE_TELEGRAM_FRIEND') {
            axios
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
        // ... handle other methods
    }

    const { bookmarks, setBookmarks, userId, role, totalPoints, points, setUser } = useUserStore((state) => ({
        bookmarks: state.bookmarks,
        setBookmarks: state.setBookmarks,
        userId: state.userId,
        role: state.role,
        points: state.points,
        totalPoints: state.totalPoints,
        setUser: state.setUser
    }))

    const { telegramUserId } = useSessionStore((state) => ({
        telegramUserId: state.userId
    }))

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

    useEffect(() => {
        const fetchBookmarkedAcademies = async () => {
            if (userId) {
                try {
                    const response = await axios.get(`/api/users/${userId}/bookmarked-academies`)
                    setBookmarks(response.data)
                } catch (error) {
                    console.error('Error fetching bookmarked academies:', error)
                }
            }
        }

        if (userId) {
            fetchBookmarkedAcademies()
        }
    }, [userId, setBookmarks])

    const handleBookmark = async (academy) => {
        try {
            await axios.post('/api/users/interaction', {
                telegramUserId: telegramUserId,
                action: 'bookmark',
                academyId: academy.id
            })
            setBookmarks(academy)
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

    const handleInviteFriend = () => {
        const utils = initUtils()
        const inviteLink = `https://t.me/CoinbeatsMiniApp_bot/miniapp?startapp=${referralCode}`
        const shareText = `Join me on this awesome app!`

        const fullUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(shareText)}`
        utils.openTelegramLink(fullUrl)
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

            <div className="flex flex-row justify-center items-center mb-4 mt-4">
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
                            <img src={coins} className="h-3 w-3 ml-1" alt="coins icon" />
                        </Button>
                    </div>
                )}
            </div>

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
                        <Card
                            key={academy.id}
                            className="relative flex flex-col items-center text-center !p-3 !rounded-2xl shadow-lg border border-gray-300 dark:border-gray-600 overflow-visible"
                        >
                            <div className="absolute top-0 left-0 p-2">
                                <button
                                    className={`${isBookmarked(academy.id) ? 'text-red-600' : 'text-amber-500'} rounded-full shadow-md focus:outline-none m-1`}
                                    onClick={() => handleBookmark(academy)}
                                >
                                    <MdBookmarks className="h-5 w-5 transition-transform duration-300 transform hover:scale-110" />
                                </button>
                            </div>
                            <div
                                className={`flex items-center absolute top-0 right-0 px-2 py-[3px] ${
                                    isCompleted ? 'bg-gradient-to-r from-teal-400 to-teal-100' : 'bg-gradient-to-r from-slate-400 to-slate-100'
                                } bg-opacity-75 rounded-full text-sm font-bold text-gray-800 m-2`}
                            >
                                {isCompleted ? (
                                    <>
                                        <span className="text-xs">+{getCompletedAcademyPoints(academy.id)?.value} ✅</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-xs">+{academy.xp}</span> <img src={coins} className="h-4 w-4" alt="coins icon" />
                                    </>
                                )}
                            </div>

                            <div className="flex items-center text-center w-full justify-center mt-1">
                                <img alt={academy.name} className="h-16 w-16 rounded-full mb-2" src={constructImageUrl(academy.logoUrl)} />
                            </div>
                            <div className="text-lg font-bold whitespace-nowrap">{academy.name}</div>
                            {/* <Button rounded large className="mt-2 font-bold shadow-xl min-w-28" onClick={() => handleMoreClick(academy)}> */}
                            <Button
                                outline
                                rounded
                                onClick={() => handleMoreClick(academy)}
                                className="!text-xs !w-16 ml-4 mt-2 font-bold shadow-xl min-w-28 !mx-auto"
                                style={{
                                    background: 'linear-gradient(to left, #ff0077, #7700ff)',
                                    color: '#fff'
                                }}
                            >
                                Study Now
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
