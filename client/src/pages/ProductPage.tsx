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
} from 'konsta/react';
import {
  MdSchool,
  MdBookmarks,
  MdVideogameAsset,
  MdEmojiEvents,
} from 'react-icons/md';

export default function ProductPage({ theme, setTheme, setColorTheme }) {
  const initData = useInitData();
  const location = useLocation();
  const navigate = useNavigate();
  const { academy } = location.state;
  const [darkMode, setDarkMode] = useState(false);
  const [rightPanelOpened, setRightPanelOpened] = useState(false);
  const [colorPickerOpened, setColorPickerOpened] = useState(false);
  const [activeFilter, setActiveFilter] = useState();

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

  const constructImageUrl = (url) => {
    return `https://subscribes.lt/${url}`;
  };

  return (
    <Page>
      <Navbar
        title={academy.name}
        className="top-0 sticky"
        transparent
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

      <div className="text-center mt-4">
        <img
          alt={academy.name}
          className="h-18 w-18 rounded-full mb-2 mx-auto"
          src={constructImageUrl(academy.logoUrl)}
        />
        <h1 className="text-3xl font-bold">{academy.name}</h1>
        <div className="flex justify-center gap-2 mt-4 mx-4">
          <Button
            outline
            rounded
            onClick={() => setActiveFilter()}
            className={`${
              activeFilter
                ? 'bg-gray-100 k-color-brand-purple shadow-lg'
                : 'bg-white shadow-lg'
            }`}
          >
            Read
          </Button>
          <Button
            outline
            rounded
            onClick={() => setActiveFilter()}
            className={`${
              activeFilter
                ? 'bg-gray-100 k-color-brand-purple shadow-lg'
                : 'bg-white shadow-lg'
            }`}
          >
            Watch
          </Button>
          <Button
            outline
            rounded
            onClick={() => setActiveFilter()}
            className={`${
              activeFilter
                ? 'bg-gray-100 k-color-brand-purple shadow-lg'
                : 'bg-white shadow-lg'
            }`}
          >
            Quests
          </Button>
        </div>
      </div>

      <div className="p-4">
        <BlockTitle className="mb-2">Academy Details</BlockTitle>
        <List>
          <ListInput label="Name" type="text" value={academy.name} readOnly />
          <ListInput
            label="Category"
            type="text"
            value={academy.category}
            readOnly
          />
          <ListInput label="Chain" type="text" value={academy.chain} readOnly />

          <ListInput
            label="Website"
            type="text"
            value="Link" // Mocked value
            readOnly
          />
        </List>
      </div>

      <Tabbar labels icons className="left-0 bottom-0 fixed bg-[#FADAF9]">
        <TabbarLink
          onClick={() => navigate('/')}
          icon={<MdSchool className="w-6 h-6" />}
          label="Learn"
        />
        <TabbarLink
          onClick={() => navigate('/saved')}
          icon={<MdBookmarks className="w-6 h-6" />}
          label="Saved"
        />
        <TabbarLink
          onClick={() => navigate('/games')}
          icon={<MdVideogameAsset className="w-6 h-6" />}
          label="Games"
        />
        <TabbarLink
          onClick={() => navigate('/points')}
          icon={<MdEmojiEvents className="w-6 h-6" />}
          label="Points"
        />
      </Tabbar>

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
