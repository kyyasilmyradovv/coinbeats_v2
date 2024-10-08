// src/RootComponent.tsx

import React, { useLayoutEffect, useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { App as KonstaApp, KonstaProvider } from 'konsta/react'
import MainPage from './pages/MainPage'
import NotFoundPage from './pages/NotFoundPage'
import ProductPage from './pages/ProductPage'
import BookmarksPage from './pages/BookmarksPage'
import GamesPage from './pages/GamesPage'
import PointsPage from './pages/PointsPage'
import RegisterCreatorPage from './pages/RegisterCreatorPage'
import LoginPage from './pages/LoginPage'
import SessionAnalysisPage from './pages/SessionAnalysisPage'
import CreatorDashboardPage from './pages/CreatorDashboardPage'
import UserManagementPage from './pages/UserManagementPage'
import InboxPage from './pages/InboxPage'
import AcademyStatisticsPage from './pages/AcademyStatisticsPage'
import UserProfilePage from './pages/UserProfilePage'
import CreateAcademyPage from './pages/CreateAcademyPage'
import MyAcademiesPage from './pages/MyAcademiesPage'
import SuperAdminDashboardPage from './pages/SuperAdminDashboardPage'
import AcademyTypePage from './pages/AcademyTypePage'
import AddPlatformTasksPage from './pages/AddPlatformTasksPage'
import CategoryChainManagementPage from './pages/CategoryChainManagementPage'
import UserDetailPage from './pages/UserDetailPage'
import AddRafflesPage from './pages/AddRafflesPage'
import AddQuestsPage from './pages/AddQuestsPage'
import EditAcademyPage from './pages/EditAcademyPage'
import AddVideoLessonsPage from './pages/AddVideoLessonsPage'
import AllocateXpPage from './pages/AllocateXpPage'
import AcademyManagementPage from './pages/AcademyManagementPage'
import AcademyDetailPage from './pages/AcademyDetailPage'
import { BookmarkProvider } from './contexts/BookmarkContext'
import { useInitData } from '@telegram-apps/sdk-react'
import useSessionStore from './store/useSessionStore'
import useUserStore from './store/useUserStore'
import axios from './api/axiosInstance'
import RouteGuard from './components/RouteGuard'
import Spinner from './components/Spinner'

function RootComponent() {
    const [isLoading, setIsLoading] = useState(true)
    const initData = useInitData()

    const { theme, darkMode, initializePreferences } = useSessionStore((state) => ({
        theme: state.theme,
        darkMode: state.darkMode,
        initializePreferences: state.initializePreferences
    }))

    useEffect(() => {
        initializePreferences()
    }, [initializePreferences])

    const startSession = useSessionStore((state) => state.startSession)
    const endSession = useSessionStore((state) => state.endSession)
    const setCurrentRoute = useSessionStore((state) => state.setCurrentRoute)
    const addRouteDuration = useSessionStore((state) => state.addRouteDuration)

    const { setUser } = useUserStore((state) => ({
        setUser: state.setUser
    }))

    const location = useLocation()

    const inIFrame = window.parent !== window

    useLayoutEffect(() => {
        if (window.location.href.includes('safe-areas')) {
            const html = document.documentElement
            if (html) {
                html.style.setProperty('--k-safe-area-top', theme === 'ios' ? '44px' : '24px')
                html.style.setProperty('--k-safe-area-bottom', '34px')
            }
        }
    }, [theme])

    useLayoutEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [darkMode])

    useEffect(() => {
        let routeStartTime = Date.now()
        let currentRoute = location.pathname

        const updateRouteDuration = () => {
            const now = Date.now()
            const duration = now - routeStartTime
            addRouteDuration(currentRoute, duration)
            setCurrentRoute(currentRoute)
            routeStartTime = now
        }

        console.log('This is the init data object', initData)

        const initializeUserSession = async () => {
            try {
                if (initData && initData.user) {
                    const telegramUserId = initData.user.id
                    const username = initData.user.username || 'Guest'

                    // Get referralCode from initData.startParam
                    const referralCode = initData.startParam || null

                    let userRoles: string[] = ['USER'] // Default roles

                    try {
                        const response = await axios.get(`/api/users/${telegramUserId}`)

                        if (response.status === 200 && response.data) {
                            const { id, name, email, roles, totalPoints, points, bookmarkedAcademies, academies, emailConfirmed } = response.data
                            const hasAcademy = academies && academies.length > 0

                            setUser({
                                userId: id,
                                username: name,
                                email: email,
                                emailConfirmed: emailConfirmed,
                                roles: roles,
                                totalPoints: totalPoints,
                                points: points || [],
                                bookmarks: bookmarkedAcademies || [],
                                token: null,
                                hasAcademy: hasAcademy,
                                referralPointsAwarded: 0 // No referral points since user already exists
                            })

                            userRoles = roles || ['USER']
                        } else {
                            // User not found, register
                            const registerResponse = await axios.post('/api/auth/register', {
                                telegramUserId,
                                username,
                                referralCode
                            })

                            const { user: userData, pointsAwardedToUser } = registerResponse.data
                            const hasAcademy = userData.academies && userData.academies.length > 0

                            setUser({
                                userId: userData.id,
                                username: userData.name,
                                email: userData.email,
                                emailConfirmed: userData.emailConfirmed,
                                roles: userData.roles,
                                totalPoints: userData.totalPoints,
                                points: userData.points || [],
                                bookmarks: userData.bookmarkedAcademies || [],
                                token: null,
                                hasAcademy: hasAcademy,
                                referralPointsAwarded: pointsAwardedToUser || 0
                            })

                            userRoles = userData.roles || ['USER']
                        }
                    } catch (error) {
                        if (error.response && error.response.status === 404) {
                            // User not found, register
                            const registerResponse = await axios.post('/api/auth/register', {
                                telegramUserId,
                                username,
                                referralCode
                            })

                            const { user: userData, pointsAwardedToUser } = registerResponse.data
                            const hasAcademy = userData.academies && userData.academies.length > 0

                            setUser({
                                userId: userData.id,
                                username: userData.name,
                                email: userData.email,
                                emailConfirmed: userData.emailConfirmed,
                                roles: userData.roles,
                                totalPoints: userData.totalPoints,
                                points: userData.points || [],
                                bookmarks: userData.bookmarkedAcademies || [],
                                token: null,
                                hasAcademy: hasAcademy,
                                referralPointsAwarded: pointsAwardedToUser || 0
                            })

                            userRoles = userData.roles || ['USER']
                        } else {
                            console.error('Error fetching user:', error)
                            // Set default values in case of error
                            setUser({
                                userId: null,
                                username: 'Guest',
                                email: '',
                                emailConfirmed: false,
                                roles: ['USER'],
                                totalPoints: 100,
                                points: [],
                                bookmarks: [],
                                token: null,
                                hasAcademy: false,
                                referralPointsAwarded: 0
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

                    routeStartTime = sessionStartTime
                    currentRoute = location.pathname

                    updateRouteDuration()
                } else {
                    // initData not available, set default user
                    setUser({
                        userId: null,
                        username: 'Guest',
                        email: '',
                        emailConfirmed: false,
                        roles: ['USER'],
                        totalPoints: 100,
                        points: [],
                        bookmarks: [],
                        token: null,
                        hasAcademy: false,
                        referralPointsAwarded: 0
                    })
                }
            } catch (e) {
                console.error('Error initializing user session:', e)
                // Set default user in case of error
                setUser({
                    userId: null,
                    username: 'Guest',
                    email: '',
                    emailConfirmed: false,
                    roles: ['USER'],
                    totalPoints: 100,
                    points: [],
                    bookmarks: [],
                    token: null,
                    hasAcademy: false,
                    referralPointsAwarded: 0
                })
            } finally {
                setIsLoading(false)
            }
        }

        initializeUserSession()

        const handleSessionEnd = () => {
            const sessionEndTime = Date.now()
            const duration = Math.floor((sessionEndTime - (startSession.sessionStartTime || 0)) / 1000)

            const finalRouteDuration = Date.now() - (startSession.sessionStartTime || 0)
            addRouteDuration(location.pathname, finalRouteDuration)

            endSession()
        }

        window.addEventListener('beforeunload', handleSessionEnd)

        return () => {
            window.removeEventListener('beforeunload', handleSessionEnd)
            updateRouteDuration()
        }
    }, [initData, startSession, setCurrentRoute, endSession, setUser, addRouteDuration, location])

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spinner />
            </div>
        )
    }

    return (
        <KonstaProvider theme={theme}>
            <KonstaApp theme={theme} safeAreas={!inIFrame}>
                <BookmarkProvider>
                    <Routes>
                        <Route path="*" element={<NotFoundPage />} />
                        <Route path="/" element={<MainPage />} />
                        <Route path="/product/:id" element={<ProductPage />} />
                        <Route path="/saved" element={<BookmarksPage />} />
                        <Route path="/games" element={<GamesPage />} />
                        <Route path="/points" element={<PointsPage />} />
                        <Route path="/register-creator" element={<RegisterCreatorPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/session-analyses" element={<SessionAnalysisPage />} />
                        <Route
                            path="/creator-dashboard"
                            element={
                                <RouteGuard requiredRole="CREATOR">
                                    <CreatorDashboardPage />
                                </RouteGuard>
                            }
                        />
                        <Route
                            path="/superadmin-dashboard"
                            element={
                                <RouteGuard requiredRole="SUPERADMIN">
                                    <SuperAdminDashboardPage />
                                </RouteGuard>
                            }
                        />
                        <Route
                            path="/user-management"
                            element={
                                <RouteGuard requiredRole="SUPERADMIN">
                                    <UserManagementPage />
                                </RouteGuard>
                            }
                        />
                        <Route
                            path="/user/:userId"
                            element={
                                <RouteGuard requiredRole="SUPERADMIN">
                                    <UserDetailPage />
                                </RouteGuard>
                            }
                        />
                        <Route
                            path="/academy-management"
                            element={
                                <RouteGuard requiredRole="SUPERADMIN">
                                    <AcademyManagementPage />
                                </RouteGuard>
                            }
                        />
                        <Route
                            path="/academy/:academyId"
                            element={
                                <RouteGuard requiredRole="SUPERADMIN">
                                    <AcademyDetailPage />
                                </RouteGuard>
                            }
                        />
                        <Route path="/inbox" element={<InboxPage />} />
                        <Route path="/academy-statistics" element={<AcademyStatisticsPage />} />
                        <Route
                            path="/academy-types"
                            element={
                                <RouteGuard requiredRole="SUPERADMIN">
                                    <AcademyTypePage />
                                </RouteGuard>
                            }
                        />
                        <Route
                            path="/add-platform-tasks"
                            element={
                                <RouteGuard requiredRole="SUPERADMIN">
                                    <AddPlatformTasksPage />
                                </RouteGuard>
                            }
                        />
                        <Route
                            path="/add-categories-chains"
                            element={
                                <RouteGuard requiredRole="SUPERADMIN">
                                    <CategoryChainManagementPage />
                                </RouteGuard>
                            }
                        />
                        <Route path="/user-profile" element={<UserProfilePage />} />
                        <Route
                            path="/create-academy"
                            element={
                                <RouteGuard requiredRole="CREATOR">
                                    <CreateAcademyPage />
                                </RouteGuard>
                            }
                        />
                        <Route
                            path="/my-academies"
                            element={
                                <RouteGuard requiredRole="CREATOR">
                                    <MyAcademiesPage />
                                </RouteGuard>
                            }
                        />
                        <Route
                            path="/add-video-lessons/:id"
                            element={
                                <RouteGuard requiredRole="CREATOR">
                                    <AddVideoLessonsPage />
                                </RouteGuard>
                            }
                        />
                        <Route
                            path="/add-raffles/:id"
                            element={
                                <RouteGuard requiredRole="CREATOR">
                                    <AddRafflesPage />
                                </RouteGuard>
                            }
                        />
                        <Route
                            path="/add-tasks/:id"
                            element={
                                <RouteGuard requiredRole="CREATOR">
                                    <AddQuestsPage />
                                </RouteGuard>
                            }
                        />
                        <Route
                            path="/edit-academy/:id"
                            element={
                                <RouteGuard requiredRole="CREATOR">
                                    <EditAcademyPage />
                                </RouteGuard>
                            }
                        />
                        <Route
                            path="/allocate-xp/:id"
                            element={
                                <RouteGuard requiredRole="CREATOR">
                                    <AllocateXpPage />
                                </RouteGuard>
                            }
                        />
                    </Routes>
                </BookmarkProvider>
            </KonstaApp>
        </KonstaProvider>
    )
}

export default RootComponent
