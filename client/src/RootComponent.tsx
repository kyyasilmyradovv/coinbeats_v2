// src/RootComponent.tsx

import React, { useLayoutEffect, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { App as KonstaApp, KonstaProvider } from 'konsta/react';
import MainPage from './pages/MainPage';
import NotFoundPage from './pages/NotFoundPage';
import ProductPage from './pages/ProductPage';
import BookmarksPage from './pages/BookmarksPage';
import RegisterCreatorPage from './pages/RegisterCreatorPage';
import LoginPage from './pages/LoginPage';
import SessionAnalysisPage from './pages/SessionAnalysisPage';
import CreatorDashboardPage from './pages/CreatorDashboardPage';
import UserManagementPage from './pages/UserManagementPage';
import InboxPage from './pages/InboxPage';
import AcademyStatisticsPage from './pages/AcademyStatisticsPage';
import UserProfilePage from './pages/UserProfilePage';
import CreateAcademyPage from './pages/CreateAcademyPage';
import MyAcademiesPage from './pages/MyAcademiesPage';
import SuperAdminDashboardPage from './pages/SuperAdminDashboardPage';
import UserDetailPage from './pages/UserDetailPage';
import AddRafflesPage from './pages/AddRafflesPage';  // New import
import AddQuestsPage from './pages/AddQuestsPage';    // New import
import EditAcademyPage from './pages/EditAcademyPage';
import AddVideoLessonsPage from './pages/AddVideoLessonsPage';
import { BookmarkProvider } from './contexts/BookmarkContext';
import { useInitData } from '@telegram-apps/sdk-react';
import useSessionStore from './store/useSessionStore';
import useUserStore from './store/useUserStore';
import './index.css';
import axios from './api/axiosInstance';
import RouteGuard from './components/RouteGuard';

function RootComponent() {
  const initData = useInitData();
  const {
    theme,
    setTheme,
    colorTheme,
    darkMode,
    setDarkMode,
  } = useUserStore((state) => ({
    theme: state.theme,
    setTheme: state.setTheme,
    colorTheme: state.colorTheme,
    darkMode: state.darkMode,
    setDarkMode: state.setDarkMode,
  }));

  const startSession = useSessionStore((state) => state.startSession);
  const endSession = useSessionStore((state) => state.endSession);
  const setCurrentRoute = useSessionStore((state) => state.setCurrentRoute);
  const addRouteDuration = useSessionStore((state) => state.addRouteDuration);
  const { setUser } = useUserStore((state) => ({
    setUser: state.setUser,
  }));

  const location = useLocation();

  useEffect(() => {
    const initializeUserSession = async () => {
      if (initData) {
        const telegramUserId = initData.user.id;
        const username = initData.user.username || 'Guest';
    
        try {
          const response = await axios.get(`/api/users/${telegramUserId}`);
    
          if (response.status === 200 && response.data) {
            const { id, email, role, totalPoints, academies, emailConfirmed } = response.data;
            const hasAcademy = academies && academies.length > 0;
            setUser(id, username, email, emailConfirmed, role, totalPoints || 100, null, hasAcademy);
          } else {
            setUser(null, username, '', false, 'USER', 100, null, false);
          }
        } catch (error) {
          if (error.response && error.response.status === 404) {
            setUser(null, username, '', false, 'USER', 100, null, false);
          } else {
            console.error('Error fetching user:', error);
          }
        }

        const sessionStartTime = Date.now();
        startSession({
          sessionStartTime,
          userId: telegramUserId,
          username: username,
          roles: ['USER'], // Default role
        });

        let routeStartTime = sessionStartTime;
        let currentRoute = location.pathname;

        const updateRouteDuration = () => {
          const now = Date.now();
          const duration = now - routeStartTime;
          addRouteDuration(currentRoute, duration);
          setCurrentRoute(currentRoute);
          routeStartTime = now;
        };

        const handleRouteChange = () => {
          updateRouteDuration();
          currentRoute = location.pathname;
        };

        updateRouteDuration();

        return () => {
          updateRouteDuration();
        };
      }
    };

    initializeUserSession();

    const handleSessionEnd = () => {
      const sessionEndTime = Date.now();
      const duration = Math.floor((sessionEndTime - (startSession.sessionStartTime || 0)) / 1000);

      const finalRouteDuration = Date.now() - (startSession.sessionStartTime || 0);
      addRouteDuration(location.pathname, finalRouteDuration);

      endSession();
    };

    window.addEventListener('beforeunload', handleSessionEnd);

    return () => {
      window.removeEventListener('beforeunload', handleSessionEnd);
    };
  }, [initData, startSession, setCurrentRoute, endSession, setUser, addRouteDuration, location]);

  const inIFrame = window.parent !== window;
  useLayoutEffect(() => {
    if (window.location.href.includes('safe-areas')) {
      const html = document.documentElement;
      if (html) {
        html.style.setProperty('--k-safe-area-top', theme === 'ios' ? '44px' : '24px');
        html.style.setProperty('--k-safe-area-bottom', '34px');
      }
    }
  }, [theme]);

  useLayoutEffect(() => {
    // Apply dark mode and color theme
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    if (colorTheme) {
      const htmlEl = document.documentElement;
      htmlEl.classList.forEach((c) => {
        if (c.includes('k-color')) htmlEl.classList.remove(c);
      });
      htmlEl.classList.add(colorTheme);
    }
  }, [darkMode, colorTheme]);

  return (
    <KonstaProvider theme={theme}>
      <KonstaApp theme={theme} safeAreas={!inIFrame}>
        <BookmarkProvider>
          <Routes>
            <Route path="*" element={<NotFoundPage />} />
            <Route path="/" element={<MainPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/saved" element={<BookmarksPage />} />
            <Route path="/register-creator" element={<RegisterCreatorPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/session-analyses" element={<SessionAnalysisPage />} />
            <Route path="/creator-dashboard" element={
              <RouteGuard requiredRole="CREATOR">
                <CreatorDashboardPage />
              </RouteGuard>
            } />
            <Route path="/superadmin-dashboard" element={
              <RouteGuard requiredRole="SUPERADMIN">
                <SuperAdminDashboardPage />
              </RouteGuard>
            } />
            <Route path="/user-management" element={
              <RouteGuard requiredRole="SUPERADMIN">
                <UserManagementPage />
              </RouteGuard>
            } />
            <Route path="/user/:userId" element={
              <RouteGuard requiredRole="SUPERADMIN">
                <UserDetailPage />
              </RouteGuard>
            } />
            <Route path="/inbox" element={<InboxPage />} />
            <Route path="/academy-statistics" element={<AcademyStatisticsPage />} />
            <Route path="/user-profile" element={<UserProfilePage />} />
            <Route path="/create-academy" element={
              <RouteGuard requiredRole="CREATOR">
                <CreateAcademyPage />
              </RouteGuard>
            } />
            <Route path="/my-academies" element={
              <RouteGuard requiredRole="CREATOR">
                <MyAcademiesPage />
              </RouteGuard>
            } />
            <Route path="/add-video-lessons/:id" element={
              <RouteGuard requiredRole="CREATOR">
                <AddVideoLessonsPage />
              </RouteGuard>
            } />
            <Route path="/add-raffles/:id" element={
              <RouteGuard requiredRole="CREATOR">
                <AddRafflesPage />
              </RouteGuard>
            } />
            <Route path="/add-tasks/:id" element={
              <RouteGuard requiredRole="CREATOR">
                <AddQuestsPage />
              </RouteGuard>
            } />
            <Route path="/edit-academy/:id" element={
              <RouteGuard requiredRole="CREATOR">
                <EditAcademyPage />
              </RouteGuard>
            } />
          </Routes>
        </BookmarkProvider>
      </KonstaApp>
    </KonstaProvider>
  );
}

export default RootComponent;
