// client/src/components/IntroPage.tsx

import React, { useState, useEffect, useRef } from 'react'
import './IntroPage.css'
import introImage from '../images/intro.webp'
import coinbeatsText from '../images/coinbeats.png'
import schoolText from '../images/school.png'
import useAcademiesStore from '../store/useAcademiesStore'
import usePointsStore from '../store/usePointsStore'
import useLeaderboardStore from '../store/useLeaderboardStore'
import useTasksStore from '../store/useTasksStore'
import useUserVerificationStore from '../store/useUserVerificationStore'
import useCategoryChainStore from '../store/useCategoryChainStore'
import { useInitData } from '@telegram-apps/sdk-react'
import useSessionStore from '../store/useSessionStore'
import useUserStore from '../store/useUserStore'
import useNotificationStore from '../store/useNotificationStore'
import axiosInstance from '~/api/axiosInstance'
import useRafflesStore from '~/store/useRafflesStore'
import { Preloader } from 'konsta/react'

interface IntroPageProps {
    onComplete: () => void
}

const IntroPage: React.FC<IntroPageProps> = ({ onComplete }) => {
    const initData = useInitData()
    const initializedRef = useRef(false)

    const { fetchAcademiesAndPreloadImages } = useAcademiesStore()
    const { fetchUserPoints } = usePointsStore()
    const { fetchUserRaffles } = useRafflesStore()
    const { fetchLeaderboards } = useLeaderboardStore()
    const { fetchVerificationTasks, fetchGameTasks } = useTasksStore()
    const { fetchUserVerificationTasks } = useUserVerificationStore()
    const { fetchCategoriesAndChains } = useCategoryChainStore()

    const {
        fetchUser,
        registerUser,
        fetchTwitterAuthStatus,
        setTwitterAuthenticated,
        referralCompletionChecked,
        checkReferralCompletion,
        userId,
        fetchUserLevel
    } = useUserStore()
    const { startSession } = useSessionStore()
    const { addNotifications } = useNotificationStore()

    useEffect(() => {
        if (!initData || !initData.user || initializedRef.current) return
        initializedRef.current = true

        const removeSpinner = () => {
            const spinner = document.getElementById('initial-spinner')
            if (spinner) {
                spinner.remove()
            }
        }

        removeSpinner()

        // Parse TappAds parameters if any
        let tappadsPublisher: string | null = null
        let tappadsClickId: string | null = null

        if (initData.startParam && initData.startParam.startsWith('tappads_')) {
            const match = initData.startParam.match(/^tappads_(\d+)_(\S+)$/)
            if (match) {
                tappadsPublisher = match[1]
                tappadsClickId = match[2]
            }
        }

        // Store tappads info in sessionStore for later use
        useSessionStore.setState({ tappadsPublisher, tappadsClickId })

        const initializeUserSession = async () => {
            try {
                const telegramUserId = initData.user.id
                const username = initData.user.username || initData.user.firstName || initData.user.lastName || 'Guest'
                const startParam = initData.startParam || null

                useSessionStore.setState({ userId: telegramUserId })

                let userRoles: string[] = ['USER']

                try {
                    // Attempt to fetch existing user data
                    await fetchUser(telegramUserId)
                    const roles = useUserStore.getState().roles
                    userRoles = roles || ['USER']
                } catch (error: any) {
                    if (error.response && error.response.status === 404) {
                        // User not found, register
                        await registerUser(telegramUserId, username, startParam)
                        const roles = useUserStore.getState().roles
                        userRoles = roles || ['USER']
                    } else {
                        console.error('Error fetching user:', error)
                        useUserStore.setState({
                            userId: null,
                            username: 'Guest',
                            email: '',
                            emailConfirmed: false,
                            roles: ['USER'],
                            totalPoints: 0,
                            points: [],
                            bookmarks: [],
                            authenticated: false,
                            token: null,
                            hasAcademy: false,
                            referralPointsAwarded: 0,
                            referralCode: null
                        })
                        userRoles = ['USER']
                    }
                }

                const sessionStartTime = Date.now()
                startSession({
                    sessionStartTime,
                    userId: telegramUserId,
                    username: username,
                    roles: userRoles
                })

                // Check for twitter auth
                if (startParam === 'twitterAuthSuccess') {
                    setTwitterAuthenticated(true)
                    await fetchTwitterAuthStatus()
                }

                await fetchUserLevel()
            } catch (e) {
                console.error('Error initializing user session:', e)
                useUserStore.setState({
                    userId: null,
                    username: 'Guest',
                    email: '',
                    emailConfirmed: false,
                    roles: ['USER'],
                    totalPoints: 0,
                    points: [],
                    bookmarks: [],
                    authenticated: false,
                    token: null,
                    hasAcademy: false,
                    referralPointsAwarded: 0,
                    referralCode: null
                })
            }
        }

        const fetchData = async () => {
            try {
                await initializeUserSession()

                await Promise.all([
                    fetchAcademiesAndPreloadImages(),
                    fetchUserPoints(),
                    fetchUserRaffles(),
                    fetchLeaderboards(),
                    fetchVerificationTasks(),
                    fetchGameTasks(),
                    fetchUserVerificationTasks(),
                    fetchCategoriesAndChains(),
                    fetchTwitterAuthStatus(),
                    fetchUserLevel()
                ])
            } catch (error) {
                console.error('Error in fetchData:', error)
            }
        }

        fetchData().then(() => {
            setTimeout(() => {
                onComplete()
            }, 4000)
        })
    }, [
        initData,
        onComplete,
        fetchAcademiesAndPreloadImages,
        fetchUserPoints,
        fetchUserRaffles,
        fetchLeaderboards,
        fetchVerificationTasks,
        fetchGameTasks,
        fetchUserVerificationTasks,
        fetchCategoriesAndChains,
        fetchTwitterAuthStatus,
        fetchUserLevel,
        fetchUser,
        registerUser,
        setTwitterAuthenticated,
        startSession
    ])

    useEffect(() => {
        const fetchNotificationsAsync = async () => {
            if (userId) {
                try {
                    const response = await axiosInstance.get(`/api/notifications/${userId}`)
                    const notifications = response.data.map((notif: any) => ({
                        id: notif.id,
                        text: notif.message,
                        title: notif.type === 'LEVEL_UP' ? 'Level Up!' : 'Notification',
                        icon: null,
                        type: notif.type,
                        read: notif.read
                    }))
                    addNotifications(notifications)
                } catch (error) {
                    console.error('Error fetching notifications:', error)
                }
            }
        }

        fetchNotificationsAsync()
    }, [userId, addNotifications])

    useEffect(() => {
        if (userId && !referralCompletionChecked) {
            checkReferralCompletion(userId)
        }
    }, [userId, referralCompletionChecked, checkReferralCompletion])

    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval)
                    return 100
                }
                return prev + 1
            })
        }, 120)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="intro-container" style={{ position: 'relative', height: '100vh' }}>
            <div className="intro-image">
                <img src={introImage} alt="Intro Background" className="intro-bg" />
                <img src={coinbeatsText} alt="Coinbeats Text" className="coinbeats-text" />
                <img src={schoolText} alt="School Text" className="school-text" />
            </div>
            {progress < 100 && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: '10%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '80%'
                    }}
                >
                    <div
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '10px',
                            height: '10px',
                            overflow: 'hidden',
                            position: 'relative'
                        }}
                    >
                        <div
                            style={{
                                backgroundColor: 'white',
                                width: `${progress}%`,
                                height: '100%',
                                transition: 'width 0.05s linear'
                            }}
                        />
                    </div>
                </div>
            )}
            {progress == 100 && (
                <div
                    style={{
                        position: 'absolute',
                        top: '90%',
                        left: '50%',
                        transform: 'translate(-50%, -50%) scale(0.25)',
                        zIndex: 10
                    }}
                >
                    <Preloader size="small" style={{ color: 'white' }} />
                </div>
            )}
        </div>
    )
}

export default IntroPage
