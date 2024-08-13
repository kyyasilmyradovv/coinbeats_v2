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

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  // Zustand store states
  const {
    role,
    theme,
    darkMode,
    sidebarOpened,
    toggleSidebar,
    setTheme,
    setColorTheme,
    setDarkMode,
    setUser,
  } = useUserStore((state) => ({
    role: state.role,
    theme: state.theme,
    darkMode: state.darkMode,
    sidebarOpened: state.sidebarOpened,
    toggleSidebar: state.toggleSidebar,
    setTheme: state.setTheme,
    setColorTheme: state.setColorTheme,
    setDarkMode: state.setDarkMode,
    setUser: state.setUser,
  }));

  const [colorPickerOpened, setColorPickerOpened] = useState(false);

  useLayoutEffect(() => {
    setDarkMode(document.documentElement.classList.contains('dark'));
  }, [setDarkMode]);

  const handleLogout = () => {
    setUser(null, 'Guest', '',  'USER', 100, null, false); // Reset user state
    navigate('/'); // Redirect to home page
    toggleSidebar(); // Close sidebar
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    toggleSidebar(); // Close sidebar after navigating
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const renderRoleBasedLinks = () => {
    switch (role) {
      case 'SUPERADMIN':
        return (
          <>
            <Button
              raised
              clear
              rounded
              onClick={() => handleNavigation('/superadmin-dashboard')}
              className="bg-white"
            >
              Dashboard
            </Button>
            <Button
              raised
              clear
              rounded
              onClick={() => handleNavigation('/user-management')}
              className="bg-white"
            >
              User Management
            </Button>
            <Button
              raised
              clear
              rounded
              onClick={() => handleNavigation('/academy-statistics')}
              className="bg-white"
            >
              Academy Statistics
            </Button>
            <Button
              raised
              clear
              rounded
              onClick={() => handleNavigation('/inbox')}
              className="bg-white"
            >
              Inbox
            </Button>
            <Button
              raised
              clear
              rounded
              onClick={() => handleNavigation('/subscription-management')}
              className="bg-white"
            >
              Subscription Management
            </Button>
          </>
        );
      case 'ADMIN':
        return (
          <>
            <Button
              raised
              clear
              rounded
              onClick={() => handleNavigation('/admin-dashboard')}
              className="bg-white"
            >
              Admin Dashboard
            </Button>
            <Button
              raised
              clear
              rounded
              onClick={() => handleNavigation('/user-management')}
              className="bg-white"
            >
              User Management
            </Button>
            <Button
              raised
              clear
              rounded
              onClick={() => handleNavigation('/inbox')}
              className="bg-white"
            >
              Inbox
            </Button>
          </>
        );
      case 'CREATOR':
        return (
          <>
            <Button
              raised
              clear
              rounded
              onClick={() => handleNavigation('/creator-dashboard')}
              className="bg-white"
            >
              Creator Dashboard
            </Button>
            <Button
              raised
              clear
              rounded
              onClick={() => handleNavigation('/create-academy')}
              className="bg-white"
            >
              Create Academy
            </Button>
            <Button
              raised
              clear
              rounded
              onClick={() => handleNavigation('/my-academies')}
              className="bg-white"
            >
              My Academies
            </Button>
            <Button
              raised
              clear
              rounded
              onClick={() => handleNavigation('/user-profile')}
              className="bg-white"
            >
              User Profile
            </Button>
            <Button
              raised
              clear
              rounded
              onClick={() => handleNavigation('/academy-statistics')}
              className="bg-white"
            >
              Academy Statistics
            </Button>
            <Button
              raised
              clear
              rounded
              onClick={() => handleNavigation('/inbox')}
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
    <Panel
      side="right"
      floating
      opened={sidebarOpened}
      onBackdropClick={toggleSidebar}
    >
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
                onClick={() => {
                  setColorTheme('');
                  setColorPickerOpened(false); // Close the popover
                }}
              >
                <span className="bg-brand-primary w-6 h-6 rounded-full" />
              </Link>
              <Link
                touchRipple
                className="overflow-hidden h-12"
                onClick={() => {
                  setColorTheme('k-color-brand-red');
                  setColorPickerOpened(false); // Close the popover
                }}
              >
                <span className="bg-brand-red w-6 h-6 rounded-full" />
              </Link>
              <Link
                touchRipple
                className="overflow-hidden h-12"
                onClick={() => {
                  setColorTheme('k-color-brand-green');
                  setColorPickerOpened(false); // Close the popover
                }}
              >
                <span className="bg-brand-green w-6 h-6 rounded-full" />
              </Link>
              <Link
                touchRipple
                className="overflow-hidden h-12"
                onClick={() => {
                  setColorTheme('k-color-brand-yellow');
                  setColorPickerOpened(false); // Close the popover
                }}
              >
                <span className="bg-brand-yellow w-6 h-6 rounded-full" />
              </Link>
              <Link
                touchRipple
                className="overflow-hidden h-12"
                onClick={() => {
                  setColorTheme('k-color-brand-purple');
                  setColorPickerOpened(false); // Close the popover
                }}
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
