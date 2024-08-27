// src/pages/PointsPage

import React, { useMemo, useState, useLayoutEffect } from 'react';
import { useInitData } from '@telegram-apps/sdk-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Page, BlockTitle, Card } from 'konsta/react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import BottomTabBar from '../components/BottomTabBar';
import bunny from '../images/bunny-mascot.png';
import { useBookmarks } from '../contexts/BookmarkContext';

export default function PointsPage({ theme, setTheme, setColorTheme }) {
  const [darkMode, setDarkMode] = useState(false);
  const [rightPanelOpened, setRightPanelOpened] = useState(false);
  const { bookmarks } = useBookmarks();
  const [activeTab, setActiveTab] = useState('tab-4');  // Ensure this matches the correct tab

  useLayoutEffect(() => {
    setDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  return (
    <Page>
      <Navbar darkMode={darkMode} onToggleSidebar={() => setRightPanelOpened(!rightPanelOpened)} />
      <Sidebar
        opened={rightPanelOpened}
        onClose={() => setRightPanelOpened(false)}
        theme={theme}
        setTheme={setTheme}
        setColorTheme={setColorTheme}
      />
      
      <div className="text-center flex w-full items-center justify-center absolute top-8">
        <BlockTitle large>Points</BlockTitle>
      </div>

      <div className="flex justify-center items-center flex-col mb-4 mt-14">
        <div className="p-2 flex flex-row items-center">
          <img src={bunny} className="h-18 w-18 mr-4" alt="bunny mascot" />
          <div className="text-lg text-gray-500 font-semibold mr-4">
            Your Bunny XP:
          </div>
          <div className="text-xl font-bold text-black">100567467</div>
        </div>
      </div>

      <div className="px-2">
        {bookmarks.map((academy) => (
          <Card
            key={academy.id}
            className="flex flex-row items-center text-center rounded-3xl shadow-lg relative"
          >
            <div className="flex flex-row justify-between w-full items-center">
              <div className="flex flex-col items-center text-left w-28">
                <img
                  alt={academy.name}
                  className="h-12 w-12 rounded-full mx-auto hover:cursor-pointer"
                  src={academy.image}
                />
                <div className="text-sm font-bold whitespace-nowrap">
                  {academy.name}
                </div>
              </div>
              <div className="flex-1 text-center pr-4">
                <div className="text-sm font-base text-gray-600">
                  You passed <span className="font-bold">{academy.name} </span>
                  academy and{' '}
                  <div className="flex flex-row items-center justify-center">
                    <span className="mr-4">collected</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center text-right">
                <div className="text-sm font-bold">{academy.xp} XP</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <BottomTabBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </Page>
  );
}
