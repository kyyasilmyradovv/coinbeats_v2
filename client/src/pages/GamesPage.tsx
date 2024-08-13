// client/src/pages/GamesPage.tsx

import React, { useMemo, useState, useLayoutEffect } from 'react';
import { useInitData } from '@telegram-apps/sdk-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TonConnectButton } from '@tonconnect/ui-react';
import { Page, Block, BlockTitle } from 'konsta/react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';

export default function GamesPage({ theme, setTheme, setColorTheme }) {
  const [darkMode, setDarkMode] = useState(false);
  const [rightPanelOpened, setRightPanelOpened] = useState(false);
  const [colorPickerOpened, setColorPickerOpened] = useState(false);

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
    </Page>
  );
}
