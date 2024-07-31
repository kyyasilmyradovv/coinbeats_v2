import React, { useMemo, useState, useLayoutEffect } from 'react';
import { useInitData } from '@telegram-apps/sdk-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TonConnectButton } from '@tonconnect/ui-react';
import {
  Page,
  Navbar,
  BlockTitle,
  Button,
  List,
  ListInput,
  Link,
  Icon,
  Tabbar,
  TabbarLink,
  NavbarBackLink,
  Chip,
  Panel,
  Block,
  ListItem,
  Radio,
  Toggle,
  Popover,
  Card,
} from 'konsta/react';
import { MdBookmarks } from 'react-icons/md';
import { useBookmarks } from '../contexts/BookmarkContext';
import logo from '../images/coinbeats-logo.png';

export default function BookmarksPage({ theme, setTheme, setColorTheme }) {
  const initData = useInitData();
  const location = useLocation();
  const navigate = useNavigate(); // Initialize useNavigate hook
  const { bookmarks, removeBookmark } = useBookmarks();
  const [darkMode, setDarkMode] = useState(false);
  const [rightPanelOpened, setRightPanelOpened] = useState(false);
  const [colorPickerOpened, setColorPickerOpened] = useState(false);

  const username = useMemo(() => {
    return initData?.user?.username || 'Guest';
  }, [initData]);

  const userAvatar = useMemo(() => {
    return (
      initData?.user?.photoUrl ||
      'https://cdn.framework7.io/placeholder/people-100x100-7.jpg'
    );
  }, [initData]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  useLayoutEffect(() => {
    setDarkMode(document.documentElement.classList.contains('dark'));
  });

  const handleMoreClick = (academy) => {
    navigate(`/product/${academy.id}`, { state: { academy } }); // Navigate to the product page with academy data
  };

  return (
    <Page>
      <Navbar
        title={<img src={logo} alt="Company Logo" style={{ height: '40px' }} />}
        className="top-0 sticky"
        backlink
        left={<NavbarBackLink onClick={() => history.back()} />}
        right={
          <Chip
            className="m-0.5"
            media={
              <img
                alt="avatar"
                className="ios:h-7 material:h-6 rounded-full"
                src={userAvatar}
              />
            }
            onClick={() => setRightPanelOpened(true)}
          >
            {username}
          </Chip>
        }
        centerTitle={true}
      />

      <div className="text-center flex w-full items-center justify-center">
        <BlockTitle large>Bookmarks</BlockTitle>
      </div>

      <div className="grid grid-cols-2 px-2 pt-6 pb-16">
        {bookmarks.map((academy) => (
          <Card
            key={academy.id}
            className="flex flex-col items-center text-center px-4 py-4 rounded-3xl shadow-lg justify-center relative"
          >
            <div className="absolute top-2 left-2">
              <button
                className="text-red-500 m-2 rounded-full shadow-md"
                onClick={() => removeBookmark(academy)}
              >
                <MdBookmarks className="cursor-pointer h-4 w-4" />
              </button>
            </div>
            <div className="absolute top-2 right-2 bg-white bg-opacity-75 px-2 py-1 rounded-full text-sm font-bold text-gray-800">
              {academy.xp} XP
            </div>
            <img
              alt={academy.name}
              className="h-18 w-18 rounded-full mb-2 mx-auto"
              src={academy.image}
            />
            <div className="text-lg font-bold whitespace-nowrap">
              {academy.name}
            </div>
            <Button
              rounded
              large
              className="mt-2 w-full min-w-32 font-extrabold shadow-xl"
              onClick={() => handleMoreClick(academy)}
            >
              more
            </Button>
          </Card>
        ))}
      </div>

      <Panel
        side="right"
        floating
        opened={rightPanelOpened}
        onBackdropClick={() => setRightPanelOpened(false)}
      >
        <Page>
          <Navbar
            title="User Settings"
            right={
              <Link navbar onClick={() => setRightPanelOpened(false)}>
                Close
              </Link>
            }
          />
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
          </Block>
        </Page>
      </Panel>
    </Page>
  );
}
