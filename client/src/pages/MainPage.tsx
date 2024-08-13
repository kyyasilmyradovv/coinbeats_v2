// src/pages/MainPage.tsx

import React, { useState } from 'react';
import { Tabbar, TabbarLink, Icon } from 'konsta/react';
import { MdSchool, MdBookmarks, MdVideogameAsset, MdEmojiEvents } from 'react-icons/md';
import HomePage from './HomePage';
import BookmarksPage from './BookmarksPage';
import GamesPage from './GamesPage';
import PointsPage from './PointsPage';
import useUserStore from '../store/useUserStore';

export default function MainPage() {
  const [activeTab, setActiveTab] = useState('tab-1');
  
  // Access the theme-related state from the store
  const { theme, setTheme, setColorTheme } = useUserStore((state) => ({
    theme: state.theme,
    setTheme: state.setTheme,
    setColorTheme: state.setColorTheme,
  }));

  return (
    <div>
      {activeTab === 'tab-1' && <HomePage />}
      {activeTab === 'tab-2' && <BookmarksPage />}
      {activeTab === 'tab-3' && <GamesPage />}
      {activeTab === 'tab-4' && <PointsPage />}

      <Tabbar labels icons className="left-0 bottom-0 fixed bg-[#FADAF9]">
        <TabbarLink
          active={activeTab === 'tab-1'}
          onClick={() => setActiveTab('tab-1')}
          icon={
            <Icon
              ios={<MdSchool className="w-7 h-7" />}
              material={<MdSchool className="w-6 h-6" />}
            />
          }
          label="Learn"
        />
        <TabbarLink
          active={activeTab === 'tab-2'}
          onClick={() => setActiveTab('tab-2')}
          icon={
            <Icon
              ios={<MdBookmarks className="w-7 h-7" />}
              material={<MdBookmarks className="w-6 h-6" />}
            />
          }
          label="Bookmarks"
        />
        <TabbarLink
          active={activeTab === 'tab-3'}
          onClick={() => setActiveTab('tab-3')}
          icon={
            <Icon
              ios={<MdVideogameAsset className="w-7 h-7" />}
              material={<MdVideogameAsset className="w-6 h-6" />}
            />
          }
          label="Earn"
        />
        <TabbarLink
          active={activeTab === 'tab-4'}
          onClick={() => setActiveTab('tab-4')}
          icon={
            <Icon
              ios={<MdEmojiEvents className="w-7 h-7" />}
              material={<MdEmojiEvents className="w-6 h-6" />}
            />
          }
          label="Points"
        />
      </Tabbar>
    </div>
  );
}
