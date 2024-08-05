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
  Button
} from 'konsta/react';
import { TonConnectButton } from '@tonconnect/ui-react';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../../store/useUserStore';

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
  const { role } = useUserStore((state) => ({
    role: state.role,
  }));

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  useLayoutEffect(() => {
    setDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const renderRoleBasedButtons = () => {
    const buttons = [];

    if (role === 'SUPERADMIN') {
      buttons.push(
        <Button
          key="superadmin"
          rounded
          outline
          onClick={() => navigate('/superadmin-dashboard')}
          className="!w-full !px-4 !py-2 !mx-auto k-color-brand-blue"
        >
          Log in as Superadmin
        </Button>
      );
    }
    if (role === 'ADMIN') {
      buttons.push(
        <Button
          key="admin"
          rounded
          outline
          onClick={() => navigate('/admin-dashboard')}
          className="!w-full !px-4 !py-2 !mx-auto k-color-brand-blue"
        >
          Log in as Admin
        </Button>
      );
    }
    if (role === 'CREATOR') {
      buttons.push(
        <Button
          key="creator"
          rounded
          outline
          onClick={() => navigate('/creator-dashboard')}
          className="!w-full !px-4 !py-2 !mx-auto k-color-brand-blue"
        >
          Log in as Creator
        </Button>
      );
    }
    if (role === 'USER' && !role?.includes('CREATOR')) {
      buttons.push(
        <Button
          key="become-creator"
          rounded
          outline
          onClick={() => navigate('/register-creator')}
          className="!w-full !px-4 !py-2 !mx-auto k-color-brand-blue"
        >
          Become Academy Creator
        </Button>
      );
    }

    return buttons;
  };

  return (
    <Panel side="right" floating opened={opened} onBackdropClick={onClose}>
      <Page>
        <Block className="space-y-4">
          <BlockTitle className="mb-1">Connect your TON Wallet</BlockTitle>
          <TonConnectButton className="mx-auto" />

          <Block className="space-y-2">
            {renderRoleBasedButtons()}
          </Block>

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
        </Block>
      </Page>
    </Panel>
  );
};

export default Sidebar;
