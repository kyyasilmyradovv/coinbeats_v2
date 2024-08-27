// src/pages/BookmarksPage.tsx

import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import BottomTabBar from '../components/BottomTabBar'; // Import BottomTabBar
import { Page, BlockTitle, Card, Button } from 'konsta/react';
import { MdBookmarks } from 'react-icons/md';
import useUserStore from '../store/useUserStore';
import useSessionStore from '../store/useSessionStore';

export default function BookmarksPage({ theme, setTheme, setColorTheme }) {
  const [bookmarkedAcademies, setBookmarkedAcademies] = useState([]);
  const { userId } = useUserStore((state) => ({
    userId: state.userId,
  }));

  const [rightPanelOpened, setRightPanelOpened] = useState(false); // Handle sidebar state
  const [darkMode, setDarkMode] = useState(false); // Handle dark mode state
  const navigate = useNavigate();
  // Using telegramUserId from the session store
  const { telegramUserId } = useSessionStore((state) => ({
    telegramUserId: state.userId,
  }));

  const [activeTab, setActiveTab] = useState('tab-2'); // Set active tab to Bookmarks

  useEffect(() => {
    const fetchBookmarkedAcademies = async () => {
      try {
        const response = await axios.get(`/api/users/${userId}/bookmarked-academies`);
        setBookmarkedAcademies(response.data);
      } catch (error) {
        console.error('Error fetching bookmarked academies:', error);
      }
    };

    fetchBookmarkedAcademies();
  }, [userId]);

  const constructImageUrl = (url) => {
    return `https://subscribes.lt/${url}`;
  };

  const handleRemoveBookmark = async (academyId) => {
    try {
      await axios.post('/api/users/interaction', {
        telegramUserId: telegramUserId,
        action: 'bookmark',
        academyId: academyId,
      });

      // Update the local state to reflect the change immediately
      setBookmarkedAcademies(prevAcademies =>
        prevAcademies.filter(academy => academy.id !== academyId)
      );
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  const handleMoreClick = (academy) => {
    navigate(`/product/${academy.id}`, { state: { academy } });
  };

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
        <BlockTitle large>Bookmarks</BlockTitle>
      </div>
  
      <div className="grid grid-cols-2 px-2 pt-14 pb-16">
        {bookmarkedAcademies.map((academy) => (
          <Card
            key={academy.id}
            className="relative flex flex-col items-center text-center !p-3 !rounded-2xl shadow-lg"
          >
            <div className="absolute top-0 left-0 p-2">
              <button
                className="text-red-600 rounded-full shadow-md focus:outline-none m-1"
                onClick={() => handleRemoveBookmark(academy.id)} // Call the remove bookmark function
              >
                <MdBookmarks className="h-5 w-5 " />
              </button>
            </div>
            <div className="absolute top-0 right-0 p-1 bg-white bg-opacity-75 rounded-full text-sm font-bold text-gray-800 m-1">
              {academy.xp} XP
            </div>
            <div className="flex items-center text-center w-full justify-center mt-1">
              <img
                alt={academy.name}
                className="h-16 w-16 rounded-full mb-2"
                src={constructImageUrl(academy.logoUrl)}
              />
            </div>
            <div className="text-lg font-bold whitespace-nowrap">
              {academy.name}
            </div>
            <Button
              rounded
              large
              className="mt-2 font-bold shadow-xl min-w-28"
              onClick={() => handleMoreClick(academy)}
            >
              More
            </Button>
          </Card>
        ))}
      </div>

      <BottomTabBar activeTab={activeTab} setActiveTab={setActiveTab} /> {/* Add BottomTabBar */}
    </Page>
  );
}
