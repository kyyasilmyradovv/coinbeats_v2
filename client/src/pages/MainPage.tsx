// src/pages/MainPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomTabBar from '../components/BottomTabBar';
import HomePage from './HomePage';
import BookmarksPage from './BookmarksPage';
import GamesPage from './GamesPage';
import PointsPage from './PointsPage';

export default function MainPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tab-1');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    switch (tab) {
      case 'tab-1':
        navigate('/');
        break;
      case 'tab-2':
        navigate('/saved');
        break;
      case 'tab-3':
        navigate('/games');
        break;
      case 'tab-4':
        navigate('/points');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <div>
      {activeTab === 'tab-1' && <HomePage />}
      {activeTab === 'tab-2' && <BookmarksPage />}
      {activeTab === 'tab-3' && <GamesPage />}
      {activeTab === 'tab-4' && <PointsPage />}

      <BottomTabBar activeTab={activeTab} setActiveTab={handleTabChange} />
    </div>
  );
}
