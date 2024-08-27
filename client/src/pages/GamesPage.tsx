// client/src/pages/GamesPage.tsx

import React, { useState } from 'react';
import { Page, BlockTitle } from 'konsta/react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import BottomTabBar from '../components/BottomTabBar'; // Import BottomTabBar

export default function GamesPage({ theme, setTheme, setColorTheme }) {
  const [darkMode, setDarkMode] = useState(false);
  const [rightPanelOpened, setRightPanelOpened] = useState(false);

  const [activeTab, setActiveTab] = useState('tab-3'); // Set active tab to Earn

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
        <BlockTitle large>Earn</BlockTitle>
      </div>

      <BottomTabBar activeTab={activeTab} setActiveTab={setActiveTab} /> {/* Add BottomTabBar */}
    </Page>
  );
}
