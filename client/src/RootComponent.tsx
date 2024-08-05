// src/RootComponent.tsx

import React, { useLayoutEffect, useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { App as KonstaApp, KonstaProvider } from 'konsta/react';
import MainPage from './pages/MainPage';
import NotFoundPage from './pages/NotFoundPage';
import ProductPage from './pages/ProductPage';
import BookmarksPage from './pages/BookmarksPage';
import RegisterCreatorPage from './pages/RegisterCreatorPage';
import SessionAnalysisPage from './pages/SessionAnalysisPage';
import CreatorDashboardPage from './pages/CreatorDashboardPage';
import UserManagementPage from './pages/UserManagementPage';
import InboxPage from './pages/InboxPage';
import AcademyStatisticsPage from './pages/AcademyStatisticsPage';
import UserProfilePage from './pages/UserProfilePage';
import CreateAcademyPage from './pages/CreateAcademyPage'; // New Import
import MyAcademiesPage from './pages/MyAcademiesPage'; // New Import
import { BookmarkProvider } from './contexts/BookmarkContext';
import './index.css';

function RootComponent() {
  const [theme, setTheme] = useState('ios');
  const [currentColorTheme, setCurrentColorTheme] = useState('');

  const setColorTheme = (color) => {
    const htmlEl = document.documentElement;
    htmlEl.classList.forEach((c) => {
      if (c.includes('k-color')) htmlEl.classList.remove(c);
    });
    if (color) htmlEl.classList.add(color);
    setCurrentColorTheme(color);
  };

  useEffect(() => {
    window.setTheme = (t) => setTheme(t);
    window.setMode = (mode) => {
      if (mode === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    };
  }, []);

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
          <Router>
            <Routes>
              <Route path="*" element={<NotFoundPage />} />
              <Route path="/" element={<MainPage theme={theme} setTheme={setTheme} colorTheme={currentColorTheme} setColorTheme={setColorTheme} />} />
              <Route path="/product/:id" element={<ProductPage theme={theme} setTheme={setTheme} colorTheme={currentColorTheme} setColorTheme={setColorTheme} />} />
              <Route path="/saved" element={<BookmarksPage theme={theme} setTheme={setTheme} colorTheme={currentColorTheme} setColorTheme={setColorTheme} />} />
              <Route path="/register-creator" element={<RegisterCreatorPage />} />
              <Route path="/session-analyses" element={<SessionAnalysisPage />} />
              <Route path="/creator-dashboard" element={<CreatorDashboardPage theme={theme} setTheme={setTheme} colorTheme={currentColorTheme} setColorTheme={setColorTheme} />} />
              <Route path="/user-management" element={<UserManagementPage />} />
              <Route path="/inbox" element={<InboxPage />} />
              <Route path="/academy-statistics" element={<AcademyStatisticsPage />} />
              <Route path="/user-profile" element={<UserProfilePage />} />
              <Route path="/create-academy" element={<CreateAcademyPage />} /> {/* New route */}
              <Route path="/my-academies" element={<MyAcademiesPage />} /> {/* New route */}
            </Routes>
          </Router>
        </BookmarkProvider>
      </KonstaApp>
    </KonstaProvider>
  );
}

export default RootComponent;
