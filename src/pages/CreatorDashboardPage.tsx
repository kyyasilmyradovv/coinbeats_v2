// src/pages/CreatorDashboardPage.tsx

import React, { useState, useEffect } from 'react';
import { Page, Block, Notification, Button } from 'konsta/react';
import ContentManager from '../components/creator/ContentManager';
import PromotionEditor from '../components/creator/PromotionEditor';
import CongratsVideoUploader from '../components/creator/CongratsVideoUploader';
import ReferralManager from '../components/creator/ReferralManager';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/Sidebar'; // Ensure the correct import path
import bunnyLogo from '../images/bunny-mascot.png'; // Import your mascot image

const CreatorDashboardPage: React.FC = ({ theme, setTheme, setColorTheme }) => {
  const [rightPanelOpened, setRightPanelOpened] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Track the number of times the notification has been closed
  const NOTIFICATION_CLOSE_COUNT_KEY = 'notificationCloseCount';
  const DONT_SHOW_NOTIFICATION_KEY = 'dontShowNotification';

  useEffect(() => {
    const closeCount = parseInt(localStorage.getItem(NOTIFICATION_CLOSE_COUNT_KEY) || '0', 10);
    const dontShowNotification = localStorage.getItem(DONT_SHOW_NOTIFICATION_KEY) === 'true';

    // Only show the notification if it has been closed less than 3 times and the user hasn't opted out
    if (closeCount < 3 && !dontShowNotification) {
      setNotificationOpen(true);
    }

    setDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const handleCloseNotification = () => {
    // Increment the close count
    const newCloseCount = parseInt(localStorage.getItem(NOTIFICATION_CLOSE_COUNT_KEY) || '0', 10) + 1;
    localStorage.setItem(NOTIFICATION_CLOSE_COUNT_KEY, newCloseCount.toString());

    if (newCloseCount >= 3) {
      // If the notification has been closed 3 times, do not show it again
      localStorage.setItem(DONT_SHOW_NOTIFICATION_KEY, 'true');
    }

    setNotificationOpen(false);
  };

  const handleDontShowAgain = () => {
    // Directly set the don't show again flag
    localStorage.setItem(DONT_SHOW_NOTIFICATION_KEY, 'true');
    setNotificationOpen(false);
  };

  const toggleSidebar = () => {
    setRightPanelOpened(!rightPanelOpened);
  };

  return (
    <Page>
      <Navbar darkMode={darkMode} onToggleSidebar={toggleSidebar} />
      <Sidebar
        opened={rightPanelOpened}
        onClose={() => setRightPanelOpened(false)}
        theme={theme}
        setTheme={setTheme}
        setColorTheme={setColorTheme}
      />
      <Block>
        <ContentManager />
        <PromotionEditor />
        <CongratsVideoUploader />
        <ReferralManager />
      </Block>

      <Notification
        opened={notificationOpen}
        icon={<img src={bunnyLogo} alt="Bunny Mascot" className="w-10 h-10" />}
        title="Message from Coinbeats Bunny"
        text="We are glad that you have decided to become an academy creator. All the pages and information you need open up from the side panel. Welcome to Coinbeats fam."
        button={
          <Button onClick={handleCloseNotification}>
            Close
          </Button>
        }
        onClose={handleCloseNotification}
      />
    </Page>
  );
};

export default CreatorDashboardPage;
