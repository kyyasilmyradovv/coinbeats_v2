// src/components/Sidebar.tsx

import React, { useState, useLayoutEffect } from 'react';
import {
  Page,
  Panel,
  Block,
  BlockTitle,
  List,
  ListItem,
  Radio,
  Toggle,
  Popover,
  Link,
  Button,
} from 'konsta/react';
import { TonConnectButton } from '@tonconnect/ui-react';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../store/useUserStore';

interface SidebarProps {
  opened: boolean;
  onClose: () => void;
  theme: string;
  setTheme: (theme: string) => void;
  setColorTheme: (color: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  opened,
  onClose,
  theme,
  setTheme,
  setColorTheme,
}) => {
  const [darkMode, setDarkMode] = useState(false);
  const [colorPickerOpened, setColorPickerOpened] = useState(false);
  const navigate = useNavigate();

  // Access role from Zustand store
  const { role, setUser } = useUserStore((state) => ({
    role: state.role,
    setUser: state.setUser,
  }));

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  useLayoutEffect(() => {
    setDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const handleLogout = () => {
    // Implement logout logic
    setUser(null, 'Guest', 'USER');
    navigate('/'); // Redirect to login page
  };

  // Render role-based routes in the sidebar
  const renderRoleBasedLinks = () => {
    switch (role) {
      case 'SUPERADMIN':
        return (
          <>
            <ListItem
              link
              title="Session Analysis"
              onClick={() => navigate('/session-analysis')}
            />
            <ListItem
              link
              title="User Management"
              onClick={() => navigate('/user-management')}
            />
            <ListItem
              link
              title="Inbox"
              onClick={() => navigate('/inbox')}
            />
          </>
        );
      case 'ADMIN':
        return (
          <>
            <ListItem
              link
              title="User Management"
              onClick={() => navigate('/user-management')}
            />
            <ListItem
              link
              title="Inbox"
              onClick={() => navigate('/inbox')}
            />
          </>
        );
      case 'CREATOR':
        return (
          <>
            <Button
              raised
              clear
              rounded
              onClick={() => navigate('/create-academy')}
              className="bg-white"
            >
              Create Academy
            </Button>
            <Button
              raised
              clear
              rounded
              onClick={() => navigate('/my-academies')}
              className="bg-white"
            >
              My Academies
            </Button>
            <Button
              raised
              clear
              rounded
              onClick={() => navigate('/user-profile')}
              className="bg-white"
            >
              User Profile
            </Button>
            <Button
              raised
              clear
              rounded
              onClick={() => navigate('/academy-statistics')}
              className="bg-white"
            >
              Academy Statistics
            </Button>
            <Button
              raised
              clear
              rounded
              onClick={() => navigate('/inbox')}
              className="bg-white"
            >
              Inbox
            </Button>
          </>
        );
      default:
        return null; // Other roles or default case
    }
  };

  return (
    <Panel side="right" floating opened={opened} onBackdropClick={onClose}>
      <Page>
        <Block className="space-y-4">
          <BlockTitle className="mb-1">Connect your TON Wallet</BlockTitle>
          <TonConnectButton className="mx-auto" />

          <BlockTitle>Theme</BlockTitle>
          <List strong inset>
            <ListItem
              label
              title="iOS Theme"
              media={
                <Radio
                  onChange={() => setTheme('ios')}
                  component="div"
                  checked={theme === 'ios'}
                />
              }
            />
            <ListItem
              label
              title="Material Theme"
              media={
                <Radio
                  onChange={() => setTheme('material')}
                  component="div"
                  checked={theme === 'material'}
                />
              }
            />
          </List>

          <List strong inset>
            <ListItem
              title="Dark Mode"
              label
              after={
                <Toggle
                  component="div"
                  onChange={() => toggleDarkMode()}
                  checked={darkMode}
                />
              }
            />
            <ListItem
              title="Color Theme"
              link
              onClick={() => setColorPickerOpened(true)}
              after={
                <div className="w-6 h-6 rounded-full bg-primary home-color-picker" />
              }
            />
          </List>

          <Popover
            opened={colorPickerOpened}
            onBackdropClick={() => setColorPickerOpened(false)}
            size="w-36"
            target=".home-color-picker"
            className="transform translate-x-[-95%] translate-y-[-30%]"
          >
            <div className="grid grid-cols-3 py-2">
              <Link
                touchRipple
                className="overflow-hidden h-12"
                onClick={() => setColorTheme('')}
              >
                <span className="bg-brand-primary w-6 h-6 rounded-full" />
              </Link>
              <Link
                touchRipple
                className="overflow-hidden h-12"
                onClick={() => setColorTheme('k-color-brand-red')}
              >
                <span className="bg-brand-red w-6 h-6 rounded-full" />
              </Link>
              <Link
                touchRipple
                className="overflow-hidden h-12"
                onClick={() => setColorTheme('k-color-brand-green')}
              >
                <span className="bg-brand-green w-6 h-6 rounded-full" />
              </Link>
              <Link
                touchRipple
                className="overflow-hidden h-12"
                onClick={() => setColorTheme('k-color-brand-yellow')}
              >
                <span className="bg-brand-yellow w-6 h-6 rounded-full" />
              </Link>
              <Link
                touchRipple
                className="overflow-hidden h-12"
                onClick={() => setColorTheme('k-color-brand-purple')}
              >
                <span className="bg-brand-purple w-6 h-6 rounded-full" />
              </Link>
            </div>
          </Popover>

          {/* Render role-based links */}
          <Block className="space-y-2">{renderRoleBasedLinks()}</Block>

          {/* Logout Button */}
          <Button
            rounded
            outline
            onClick={handleLogout}
            className="!w-fit !px-4 !py-2 !mx-auto k-color-brand-red"
          >
            Logout
          </Button>
        </Block>
      </Page>
    </Panel>
  );
};

export default Sidebar;
