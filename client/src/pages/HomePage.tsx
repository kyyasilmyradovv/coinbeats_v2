// src/pages/HomePage.tsx

import React, { useMemo, useState, useEffect, useRef } from 'react'
import { initUtils } from '@telegram-apps/sdk'
import axiosInstance from '../api/axiosInstance'
import { useNavigate } from 'react-router-dom'
import useCategoryChainStore from '../store/useCategoryChainStore'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'
import { Page, List, ListInput, Card, Button, Dialog, Searchbar, Notification } from 'konsta/react'
import { MdBookmarks } from 'react-icons/md'
import { FaTelegramPlane, FaTimes } from 'react-icons/fa'
import useSessionStore from '../store/useSessionStore'
import useUserStore from '../store/useUserStore'
import treasure from '../images/treasure1.png'
import coins from '../images/coin-stack.png'
import NewIcon from '../images/new.png'
import AnimatedNumber from '../components/AnimatedNumber'
import Lottie from 'react-lottie'
import bunnyAnimationData from '../animations/bunny.json'
import coinsCreditedAnimationData from '../animations/coins-credited.json'
import coinsEarnedAnimationData from '../animations/earned-coins.json'
import bunnyLogo from '../images/bunny-mascot.png'

export default function HomePage() {
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
    const [searchQuery, setSearchQuery] = useState('')
    const [loginStreakData, setLoginStreakData] = useState(null)
    const [showLoginStreakDialog, setShowLoginStreakDialog] = useState(false)
    const [showReferralPointsDialog, setShowReferralPointsDialog] = useState(false)
    const [animationComplete, setAnimationComplete] = useState(false)
    const [notificationOpen, setNotificationOpen] = useState(false)
    const [notificationText, setNotificationText] = useState('')

    // Added useRef to ensure the login streak is handled only once
    const loginStreakHandled = useRef(false)

    const handleAction = (task) => {
        if (task.verificationMethod === 'INVITE_TELEGRAM_FRIEND') {
            axiosInstance
                .get('/api/users/me')
                .then((response) => {
                    const userReferralCode = response.data.referralCode
                    if (!userReferralCode) {
                        setNotificationText('Referral code not available.')
                        setNotificationOpen(true)
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
        // ... handle other methods if any
    }

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

    const {
        bookmarks,
        setBookmarks,
        userId,
        roles, // Updated from role to roles
        totalPoints,
        points,
        setUser,
        referralPointsAwarded,
        resetReferralPointsAwarded
    } = useUserStore((state) => ({
        bookmarks: state.bookmarks,
        setBookmarks: state.setBookmarks,
        userId: state.userId,
        roles: state.roles, // Updated from role to roles
        points: state.points,
        totalPoints: state.totalPoints,
        setUser: state.setUser,
        referralPointsAwarded: state.referralPointsAwarded,
        resetReferralPointsAwarded: state.resetReferralPointsAwarded
    }))

    console.log('This is referral points on homepage store', referralPointsAwarded)

    const { telegramUserId } = useSessionStore((state) => ({
        telegramUserId: state.userId
    }))

    const { categories, chains, fetchCategoriesAndChains } = useCategoryChainStore((state) => ({
        categories: state.categories,
        chains: state.chains,
        fetchCategoriesAndChains: state.fetchCategoriesAndChains
    }))

    const handleLoginStreak = async () => {
        try {
            const response = await axiosInstance.post('/api/users/handle-login-streak')
            const { userVerification, point } = response.data

            // Update user points
            setUser((prevState) => ({
                ...prevState,
                totalPoints: (prevState.totalPoints || 0) + point.value,
                points: [...prevState.points, point]
            }))

            // Show the streak dialog
            setLoginStreakData(userVerification)
            setShowLoginStreakDialog(true)
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
                handleLoginStreak()
            }
        }
    }, [referralPointsAwarded])

    useEffect(() => {
        const fetchHomepageTasks = async () => {
            try {
                const response = await axiosInstance.get('/api/verification-tasks/homepage')
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
                const response = await axiosInstance.get('/api/academies/academies')
                // Filter academies to include only those with status 'approved'
                const approvedAcademies = response.data.filter((academy) => academy.status === 'approved')
                setAcademies(approvedAcademies)
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
                    const response = await axiosInstance.get(`/api/users/${userId}/bookmarked-academies`)
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

    const isBookmarked = (academyId) => {
        return Array.isArray(bookmarks) ? bookmarks.some((bookmark) => bookmark.id === academyId) : false
    }

    const hasCompletedAcademy = (academyId) => {
        return Array.isArray(points) ? points.some((point) => point.academyId === academyId) : false
    }

    const filteredData = useMemo(() => {
        let data = academies
        if (category) data = data.filter((item) => item.categories.some((cat) => cat.name === category))
        if (chain) data = data.filter((item) => item.chains.some((ch) => ch.name === chain))
        if (searchQuery) data = data.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
        if (activeFilter === 'yetToDo') data = data.filter((item) => !hasCompletedAcademy(item.id))
        if (activeFilter === 'new') data = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        if (activeFilter === 'topRated') data = data.sort((a, b) => b.xp - a.xp)
        return data
    }, [category, chain, searchQuery, activeFilter, academies, points])

    const constructImageUrl = (url) => {
        return `https://subscribes.lt/${url}`
    }

    const handleBookmark = async (academy) => {
        try {
            await axiosInstance.post('/api/users/interaction', {
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

    const getCompletedAcademyPoints = (academyId) => {
        return Array.isArray(points) ? points.find((point) => point.academyId === academyId) : null
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
                setNotificationText('Referral link copied to clipboard!')
                setNotificationOpen(true)
            })
            .catch((error) => {
                console.error('Error copying referral link:', error)
            })
    }

    return (
        <Page>
            <Navbar />
            <Sidebar />

            <div className="relative min-h-screen bg-cosmos-bg bg-fixed bg-center bg-no-repeat bg-cover">
                <div className="absolute inset-0 bg-black opacity-50 z-0"></div>
                <div className="relative z-10">
                    <div className="flex flex-row justify-center items-center mb-4 mt-4">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-1 flex flex-row items-center px-2 m-2 border border-gray-300 dark:border-gray-600 h-12 ml-4 justify-between">
                            {/* "Your Coins" card */}
                            <div className="w-10 h-10">
                                <Lottie options={coinsEarnedAnimation} height={40} width={40} />
                            </div>
                            <div className="text-md font-bold text-black dark:text-white flex flex-grow w-full text-end mr-2 mt-1">{totalPoints}</div>
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
                                    className="!text-2xs !w-28 !border-blue-400 !font-bold whitespace-nowrap mr-2 !px-2 !py-0"
                                    style={{
                                        background: 'linear-gradient(to left, #16a34a, #3b82f6)',
                                        color: '#fff'
                                    }}
                                >
                                    Invite +{tasks[0].xp}
                                    <img src={coins} className="h-3 w-3 ml-1" alt="coins icon" />
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

                    {/* Referral Points Dialog */}
                    {showReferralPointsDialog && (
                        <Dialog
                            opened={showReferralPointsDialog}
                            onBackdropClick={() => {
                                setShowReferralPointsDialog(false)
                                resetReferralPointsAwarded()
                                handleLoginStreak()
                            }}
                            className="!m-0 !p-0 !rounded-2xl !bg-opacity-80"
                        >
                            <div className="p-0 relative">
                                <button
                                    className="absolute right-1 text-gray-500 hover:text-gray-700"
                                    onClick={() => {
                                        setShowReferralPointsDialog(false)
                                        resetReferralPointsAwarded()
                                        handleLoginStreak()
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
                                            <div className="flex items-center justify-center text-white text-2xl font-bold">{loginStreakData.streakCount}</div>
                                        </div>
                                    </div>
                                    <div className="flex mt-4 mb-2 text-2xl font-bold items-end justify-center">
                                        <span className="mr-1">+</span>
                                        <div className="mr-2">
                                            <AnimatedNumber
                                                target={loginStreakData.pointsAwarded}
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

                    <div className="flex justify-between bg-white dark:bg-zinc-900 rounded-2xl mx-4 shadow-lg p-0 py-0">
                        <div className="flex flex-row w-full space-x-0">
                            <div className="!flex w-1/3">
                                <List className="!flex !ml-0 !mr-0 !mt-0 !mb-0 !w-full">
                                    <ListInput
                                        className="!flex text-xs !ml-0 !mr-0 !mt-0 !mb-0"
                                        label="Category"
                                        type="select"
                                        dropdown
                                        outline
                                        inputClassName="!flex !h-8 !ml-0 !mr-0 !mt-0 !mb-0"
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
                            </div>
                            <div className="!flex w-1/3">
                                <List className="!flex !ml-0 !mr-0 !mt-0 !mb-0 !w-full">
                                    <ListInput
                                        className="!flex text-xs !h-4 !ml-0 !mr-0 !mt-0 !mb-0"
                                        label="Chain"
                                        type="select"
                                        dropdown
                                        outline
                                        inputClassName="!flex !h-8 !ml-0 !mr-0 !mt-0 !mb-0"
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
                            <div className="flex w-1/3 h-full items-center justify-center text-center pr-2 z-0">
                                <Searchbar
                                    inputStyle={{ height: '2rem' }}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search"
                                    className="text-xs z-0"
                                    clearButton
                                />
                            </div>
                        </div>
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
                                className={`border-brand-blue text-brand-blue ${
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

                    <div className="grid grid-cols-3 gap-0 px-1 pt-6 pb-16">
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
                                            <img alt={academy.name} className="h-16 w-16 rounded-full mb-2" src={constructImageUrl(academy.logoUrl)} />
                                        </div>
                                        <div className="text-md font-bold whitespace-nowrap">{academy.name}</div>
                                        <Button
                                            outline
                                            rounded
                                            onClick={() => handleMoreClick(academy)}
                                            className="!text-xs !w-16 mt-1 font-bold shadow-xl min-w-24 !mx-auto !h-6 !mb-3"
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

                    <Notification
                        className="fixed !mt-12 top-12 left-0 z-50 border"
                        opened={notificationOpen}
                        icon={<img src={bunnyLogo} alt="Bunny Mascot" className="w-10 h-10" />}
                        title="Message from Coinbeats Bunny"
                        text={notificationText}
                        button={<Button onClick={() => setNotificationOpen(false)}>Close</Button>}
                        onClose={() => setNotificationOpen(false)}
                    />

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
