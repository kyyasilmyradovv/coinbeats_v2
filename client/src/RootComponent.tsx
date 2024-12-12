// src/RootComponent.tsx

import React, { useLayoutEffect, useEffect, useState, useRef } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { App as KonstaApp, KonstaProvider } from 'konsta/react'
import MainPage from './pages/MainPage'
import NotFoundPage from './pages/NotFoundPage'
import ProductPage from './pages/ProductPage'
import BookmarksPage from './pages/BookmarksPage'
import GamesPage from './pages/GamesPage'
import PointsPage from './pages/PointsPage'
import DiscoverPage from './pages/DiscoverPage'
import RegisterCreatorPage from './pages/RegisterCreatorPage'
import LoginPage from './pages/LoginPage'
import SessionAnalysisPage from './pages/SessionAnalysisPage'
import CreatorDashboardPage from './pages/CreatorDashboardPage'
import UserManagementPage from './pages/UserManagementPage'
import InboxPage from './pages/InboxPage'
import AcademyStatisticsPage from './pages/AcademyStatisticsPage'
import UserProfilePage from './pages/UserProfilePage'
import CreateAcademyPage from './pages/CreateAcademyPage'
import ContentCreationPage from './pages/ContentCreationPage'
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
import RouteGuard from './components/RouteGuard'
import Spinner from './components/Spinner'
import ScholarshipManagementPage from './pages/ScholarshipManagementPage'
import CharacterLevelManagementPage from './pages/CharacterLevelManagementPage'

// Import the NotificationDialog component and the notification store
import NotificationDialog from './components/NotificationDialog'
import useNotificationStore from './store/useNotificationStore'
import OverallRaffleManagementPage from './pages/OverallRaffleManagementPage'

function RootComponent() {
    const [isLoading, setIsLoading] = useState(true)
    const initData = useInitData()
    const initializedRef = useRef(false)

    const { theme, darkMode, initializePreferences } = useSessionStore((state) => ({
        theme: state.theme,
        darkMode: state.darkMode,
        initializePreferences: state.initializePreferences
    }))

    useEffect(() => {
        initializePreferences()
    }, [initializePreferences])

    const { startSession, endSession, setCurrentRoute, addRouteDuration } = useSessionStore((state) => ({
        startSession: state.startSession,
        endSession: state.endSession,
        setCurrentRoute: state.setCurrentRoute,
        addRouteDuration: state.addRouteDuration
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
        if (initializedRef.current) return // Prevent multiple initializations
        initializedRef.current = true

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

        // Remove the user session initialization logic
        setIsLoading(false)

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
    }, [initData]) // Include initData in the dependency array

    // Import the telegramUserId from the session store
    const telegramUserId = useSessionStore((state) => state.userId)

    // Access notification store functions and state
    const { fetchNotifications } = useNotificationStore()

    // Fetch notifications when the component mounts
    useEffect(() => {
        if (telegramUserId) {
            fetchNotifications()
        }
    }, [telegramUserId, fetchNotifications])

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
                {/* Include the NotificationDialog component */}
                <NotificationDialog />

                <BookmarkProvider>
                    <Routes>
                        <Route path="*" element={<NotFoundPage />} />
                        <Route path="/" element={<MainPage />} />
                        <Route path="/product/:id" element={<ProductPage />} />
                        <Route path="/saved" element={<BookmarksPage />} />
                        <Route path="/games" element={<GamesPage />} />
                        <Route path="/points" element={<PointsPage />} />
                        <Route path="/discover" element={<DiscoverPage />} />
                        <Route path="/register-creator" element={<RegisterCreatorPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/session-analyses" element={<SessionAnalysisPage />} />
                        <Route
                            path="/creator-dashboard"
                            element={
                                <RouteGuard allowedRoles={['CREATOR']}>
                                    <CreatorDashboardPage />
                                </RouteGuard>
                            }
                        />
                        <Route
                            path="/superadmin-dashboard"
                            element={
                                <RouteGuard allowedRoles={['SUPERADMIN']}>
                                    <SuperAdminDashboardPage />
                                </RouteGuard>
                            }
                        />
                        <Route
                            path="/user-management"
                            element={
                                <RouteGuard allowedRoles={['SUPERADMIN']}>
                                    <UserManagementPage theme={theme} setTheme={() => {}} setColorTheme={() => {}} />
                                </RouteGuard>
                            }
                        />
                        <Route
                            path="/user/:userId"
                            element={
                                <RouteGuard allowedRoles={['SUPERADMIN']}>
                                    <UserDetailPage theme={theme} setTheme={() => {}} setColorTheme={() => {}} />
                                </RouteGuard>
                            }
                        />
                        <Route
                            path="/academy-management"
                            element={
                                <RouteGuard allowedRoles={['SUPERADMIN']}>
                                    <AcademyManagementPage />
                                </RouteGuard>
                            }
                        />
                        <Route
                            path="/academy/:academyId"
                            element={
                                <RouteGuard allowedRoles={['SUPERADMIN']}>
                                    <AcademyDetailPage />
                                </RouteGuard>
                            }
                        />
                        <Route path="/inbox" element={<InboxPage />} />
                        <Route path="/academy-statistics" element={<AcademyStatisticsPage />} />
                        <Route
                            path="/academy-types"
                            element={
                                <RouteGuard allowedRoles={['SUPERADMIN']}>
                                    <AcademyTypePage />
                                </RouteGuard>
                            }
                        />
                        <Route
                            path="/add-platform-tasks"
                            element={
                                <RouteGuard allowedRoles={['SUPERADMIN']}>
                                    <AddPlatformTasksPage />
                                </RouteGuard>
                            }
                        />
                        <Route
                            path="/scholarship-management"
                            element={
                                <RouteGuard allowedRoles={['SUPERADMIN']}>
                                    <ScholarshipManagementPage />
                                </RouteGuard>
                            }
                        />
                        <Route
                            path="/overall-raffle-management"
                            element={
                                <RouteGuard allowedRoles={['CREATOR', 'ADMIN', 'SUPERADMIN']}>
                                    <OverallRaffleManagementPage />
                                </RouteGuard>
                            }
                        />
                        <Route
                            path="/character-management"
                            element={
                                <RouteGuard allowedRoles={['SUPERADMIN']}>
                                    <CharacterLevelManagementPage />
                                </RouteGuard>
                            }
                        />
                        <Route
                            path="/add-categories-chains"
                            element={
                                <RouteGuard allowedRoles={['SUPERADMIN']}>
                                    <CategoryChainManagementPage />
                                </RouteGuard>
                            }
                        />
                        <Route path="/user-profile" element={<UserProfilePage />} />
                        <Route
                            path="/create-academy"
                            element={
                                <RouteGuard allowedRoles={['CREATOR']}>
                                    <CreateAcademyPage />
                                </RouteGuard>
                            }
                        />
                        <Route
                            path="/create-content"
                            element={
                                <RouteGuard allowedRoles={['SUPERADMIN']}>
                                    <ContentCreationPage />
                                </RouteGuard>
                            }
                        />
                        <Route
                            path="/my-academies"
                            element={
                                <RouteGuard allowedRoles={['CREATOR']}>
                                    <MyAcademiesPage />
                                </RouteGuard>
                            }
                        />
                        <Route
                            path="/add-video-lessons/:id"
                            element={
                                <RouteGuard allowedRoles={['CREATOR']}>
                                    <AddVideoLessonsPage />
                                </RouteGuard>
                            }
                        />
                        <Route
                            path="/add-raffles/:id"
                            element={
                                <RouteGuard allowedRoles={['CREATOR']}>
                                    <AddRafflesPage />
                                </RouteGuard>
                            }
                        />
                        <Route
                            path="/add-tasks/:id"
                            element={
                                <RouteGuard allowedRoles={['CREATOR']}>
                                    <AddQuestsPage />
                                </RouteGuard>
                            }
                        />
                        <Route
                            path="/edit-academy/:id"
                            element={
                                <RouteGuard allowedRoles={['CREATOR']}>
                                    <EditAcademyPage />
                                </RouteGuard>
                            }
                        />
                        <Route
                            path="/allocate-xp/:id"
                            element={
                                <RouteGuard allowedRoles={['CREATOR']}>
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
