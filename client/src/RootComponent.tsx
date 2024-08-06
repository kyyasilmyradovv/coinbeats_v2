// src/RootComponent.tsx

import React, { useLayoutEffect, useState, useEffect } from 'react';
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
import SuperAdminDashboardPage from './pages/SuperAdminDashboardPage'; // Import the SuperAdmin page
import { BookmarkProvider } from './contexts/BookmarkContext';
import { useInitData } from '@telegram-apps/sdk-react';
import useSessionStore from './store/useSessionStore';
import useUserStore from './store/useUserStore';
import './index.css';
import axios from './api/axiosInstance';
import RouteGuard from './components/RouteGuard';

function RootComponent() {
  const [theme, setTheme] = useState('ios');
  const [currentColorTheme, setCurrentColorTheme] = useState('');
  const initData = useInitData();

  const setColorTheme = (color) => {
    const htmlEl = document.documentElement;
    htmlEl.classList.forEach((c) => {
      if (c.includes('k-color')) htmlEl.classList.remove(c);
    });
    if (color) htmlEl.classList.add(color);
    setCurrentColorTheme(color);
  };

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
          // Check if user exists in the database
          const response = await axios.get(`/api/users/${telegramUserId}`);

          if (response.status === 200 && response.data) {
            const { id, email, role, totalPoints } = response.data;
            setUser(id, username, email, role, totalPoints || 100, null);
          } else {
            setUser(null, username, '', 'USER', 100, null);
          }
        } catch (error) {
          if (error.response && error.response.status === 404) {
            setUser(null, username, '', 'USER', 100, null);
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

  return (
    <KonstaProvider theme={theme}>
      <KonstaApp theme={theme} safeAreas={!inIFrame}>
        <BookmarkProvider>
          <Routes>
            <Route path="*" element={<NotFoundPage />} />
            <Route path="/" element={<MainPage theme={theme} setTheme={setTheme} colorTheme={currentColorTheme} setColorTheme={setColorTheme} />} />
            <Route path="/product/:id" element={<ProductPage theme={theme} setTheme={setTheme} colorTheme={currentColorTheme} setColorTheme={setColorTheme} />} />
            <Route path="/saved" element={<BookmarksPage theme={theme} setTheme={setTheme} colorTheme={currentColorTheme} setColorTheme={setColorTheme} />} />
            <Route path="/register-creator" element={<RegisterCreatorPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/session-analyses" element={<SessionAnalysisPage />} />
            <Route path="/creator-dashboard" element={
              <RouteGuard requiredRole="CREATOR">
                <CreatorDashboardPage theme={theme} setTheme={setTheme} colorTheme={currentColorTheme} setColorTheme={setColorTheme} />
              </RouteGuard>
            } />
            <Route path="/superadmin-dashboard" element={
              <RouteGuard requiredRole="SUPERADMIN">
                <SuperAdminDashboardPage theme={theme} setTheme={setTheme} colorTheme={currentColorTheme} setColorTheme={setColorTheme} />
              </RouteGuard>
            } />
            <Route path="/user-management" element={<UserManagementPage />} />
            <Route path="/inbox" element={<InboxPage />} />
            <Route path="/academy-statistics" element={<AcademyStatisticsPage />} />
            <Route path="/user-profile" element={<UserProfilePage />} />
            <Route path="/create-academy" element={<CreateAcademyPage />} />
            <Route path="/my-academies" element={<MyAcademiesPage />} />
          </Routes>
        </BookmarkProvider>
      </KonstaApp>
    </KonstaProvider>
  );
}

export default RootComponent;
