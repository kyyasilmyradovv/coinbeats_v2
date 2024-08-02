// src/pages/MainPage.tsx

import React, { useState } from 'react';
import { Tabbar, TabbarLink, Icon } from 'konsta/react';
import { BookFill, Star, GamecontrollerAltFill } from 'framework7-icons/react';
import {
  MdSchool,
  MdBookmarks,
  MdVideogameAsset,
  MdEmojiEvents,
} from 'react-icons/md';
import HomePage from './HomePage';
import BookmarksPage from './BookmarksPage';
import GamesPage from './GamesPage';
import PointsPage from './PointsPage';

export default function MainPage({ theme, setTheme, setColorTheme }) {
  const [activeTab, setActiveTab] = useState('tab-1');

  return (
    <div>
      {activeTab === 'tab-1' && (
        <HomePage
          theme={theme}
          setTheme={setTheme}
          setColorTheme={setColorTheme}
        />
      )}
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
          label="Games"
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
          label="Earn"
        />
      </Tabbar>
    </div>
  );
}
