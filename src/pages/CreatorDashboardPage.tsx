// src/pages/CreatorDashboardPage.tsx

import React, { useMemo, useState, useEffect } from 'react';
import { Page, Block } from 'konsta/react';
import ContentManager from '../components/creator/ContentManager';
import PromotionEditor from '../components/creator/PromotionEditor';
import CongratsVideoUploader from '../components/creator/CongratsVideoUploader';
import ReferralManager from '../components/creator/ReferralManager';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/Sidebar'; // Ensure the correct import path


const CreatorDashboardPage: React.FC = ({ theme, setTheme, setColorTheme }) => {
    const [rightPanelOpened, setRightPanelOpened] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    
    const toggleSidebar = () => {
        setRightPanelOpened(!rightPanelOpened);
    };
    
    useEffect(() => {
        setDarkMode(document.documentElement.classList.contains('dark'));
      }, []);
  return (
    <Page>
      <Navbar darkMode={darkMode} onToggleSidebar={toggleSidebar} />
      <Sidebar
        opened={rightPanelOpened}
        onClose={() => setRightPanelOpened(false)}
        theme={theme}
        setTheme={setTheme}
        setColorTheme={setColorTheme} />
      <Block>
        <ContentManager />
        <PromotionEditor />
        <CongratsVideoUploader />
        <ReferralManager />
      </Block>
    </Page>
  );
};

export default CreatorDashboardPage;
