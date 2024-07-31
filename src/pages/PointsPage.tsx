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
import { MdBookmarks, MdEmojiEvents } from 'react-icons/md';
import { useBookmarks } from '../contexts/BookmarkContext';
import logo from '../images/coinbeats-logo.png';
import bunny from '../images/bunny-mascot.png';
import { Icon as Iconify } from '@iconify/react';

export default function PointsPage({ theme, setTheme, setColorTheme }) {
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

      <div className="text-center flex w-full items-center justify-center absolute top-8">
        <BlockTitle large>Points page</BlockTitle>
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
                  onClick={() => handleMoreClick(academy)}
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
                    <Iconify icon="uiw:d-arrow-right" width="16" height="16" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center text-right">
                <MdEmojiEvents className="text-yellow-500 text-4xl" />
                <div className="text-sm font-bold">{academy.xp} XP</div>
              </div>
            </div>
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
