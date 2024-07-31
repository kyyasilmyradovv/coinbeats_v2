// src/pages/HomePage

import React, { useMemo, useState, useLayoutEffect } from 'react';
import { useInitData } from '@telegram-apps/sdk-react';
import { TonConnectButton } from '@tonconnect/ui-react';
import {
  Page,
  Navbar,
  BlockTitle,
  List,
  ListInput,
  Card,
  Block,
  Button,
  Chip,
  Panel,
  Link,
  ListItem,
  Radio,
  Toggle,
  Popover,
  NavbarBackLink,
} from 'konsta/react';
import { MdEmojiEvents, MdBookmarks } from 'react-icons/md';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook from react-router-dom
import { useBookmarks } from '../contexts/BookmarkContext'; // Import the context
import logo from '../images/coinbeats-logo.png';
import bunny from '../images/bunny-mascot.png';
import basedAI from '../images/basedAI.jpg';
import carv from '../images/carv.jpeg';
import revert from '../images/revert.png';
import pingpong from '../images/pingpong.jpeg';
import iyk from '../images/IYK.jpeg';
import skale from '../images/skale.png';
import ton from '../images/ton.png';
import d1 from '../images/d1.jpeg';
import borpa from '../images/borpa.png';
import mantle from '../images/mantle.png';
import aurelius from '../images/aurelius.png';
import berachain from '../images/berachain.png';
import sei from '../images/sei.png';
import frax from '../images/frax.jpg';
import clip from '../images/clip.png';
import defiAcademy from '../images/coinbeats-l.svg';
import voltage from '../images/voltage.jpg';
import bittensor from '../images/bittensor.jpeg';
import aarna from '../images/aarna.png';

const mockData = [
  { id: 1, name: 'BasedAI', category: 'AI', chain: 'Ethereum', link: 'https://coinbeats.xyz/academies/getbased/', image: basedAI, sponsored: true, xp: 100 },
  { id: 2, name: 'Revert Finance', category: 'Finance', chain: 'Binance', link: 'https://coinbeats.xyz/academies/revert-finance/', image: revert, new: true, xp: 100 },
  { id: 3, name: 'PingPong', category: 'Game', chain: 'Solana', link: 'https://coinbeats.xyz/academies/pingpong/', image: pingpong, topRated: true, xp: 100 },
  { id: 4, name: 'carv', category: 'NFT', chain: 'Ethereum', link: 'https://coinbeats.xyz/academies/carv/', image: carv, sponsored: true, xp: 100 },
  { id: 5, name: 'IYK', category: 'Technology', chain: 'Polygon', link: 'https://coinbeats.xyz/academies/iyk/', image: iyk, new: true, xp: 100 },
  { id: 6, name: 'SKALE Network', category: 'Network', chain: 'Avalanche', link: 'https://coinbeats.xyz/academies/skale-network/', image: skale, topRated: true, xp: 100 },
  { id: 7, name: 'Ton Blockchain', category: 'AI', chain: 'Ethereum', link: 'https://coinbeats.xyz/academies/ton-blockchain/', image: ton, sponsored: true, xp: 100 },
  { id: 8, name: 'Districtone', category: 'Finance', chain: 'Binance', link: 'https://coinbeats.xyz/academies/districtone/', image: d1, new: true, xp: 100 },
  { id: 9, name: 'BorpaToken', category: 'Game', chain: 'Solana', link: 'https://coinbeats.xyz/academies/borpatoken/', image: borpa, topRated: true, xp: 100 },
  { id: 10, name: 'Mantle', category: 'NFT', chain: 'Ethereum', link: 'https://coinbeats.xyz/academies/mantle/', image: mantle, sponsored: true, xp: 100 },
  { id: 11, name: 'Aurelius', category: 'Technology', chain: 'Polygon', link: 'https://coinbeats.xyz/academies/aurelius/', image: aurelius, new: true, xp: 100 },
  { id: 12, name: 'Berachain', category: 'Network', chain: 'Avalanche', link: 'https://coinbeats.xyz/academies/berachain/', image: berachain, topRated: true, xp: 100 },
  { id: 13, name: 'SEI', category: 'AI', chain: 'Ethereum', link: 'https://coinbeats.xyz/academies/sei/', image: sei, sponsored: true, xp: 100 },
  { id: 14, name: 'Frax', category: 'Finance', chain: 'Binance', link: 'https://coinbeats.xyz/academies/frax/', image: frax, new: true, xp: 100 },
  { id: 15, name: 'Clip Finance', category: 'Game', chain: 'Solana', link: 'https://coinbeats.xyz/academies/clipfinance/', image: clip, topRated: true, xp: 100 },
  { id: 16, name: 'DeFi Academy', category: 'NFT', chain: 'Ethereum', link: 'https://coinbeats.xyz/academies/defi-academy/', image: defiAcademy, sponsored: true, xp: 100 },
  { id: 17, name: 'Voltage Finance', category: 'Technology', chain: 'Polygon', link: 'https://coinbeats.xyz/academies/voltage-finance/', image: voltage, new: true, xp: 100 },
  { id: 18, name: 'Bittensor', category: 'Network', chain: 'Avalanche', link: 'https://coinbeats.xyz/academies/bittensor/', image: bittensor, topRated: true, xp: 100 },
  { id: 19, name: 'aarnâ', category: 'Network', chain: 'Avalanche', link: 'https://coinbeats.xyz/academies/aarna/', image: aarna, topRated: true, xp: 100 },
];

export default function HomePage({ theme, setTheme, setColorTheme }) {
  const initData = useInitData();
  const { bookmarks, addBookmark } = useBookmarks(); // Use the context
  const [category, setCategory] = useState('');
  const [chain, setChain] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [rightPanelOpened, setRightPanelOpened] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
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

  const navigate = useNavigate(); // Initialize useNavigate hook

  const filteredData = useMemo(() => {
    let data = mockData;
    if (category) data = data.filter((item) => item.category === category);
    if (chain) data = data.filter((item) => item.chain === chain);
    if (activeFilter === 'sponsored')
      data = data.filter((item) => item.sponsored);
    if (activeFilter === 'new') data = data.filter((item) => item.new);
    if (activeFilter === 'topRated')
      data = data.filter((item) => item.topRated);
    return data;
  }, [category, chain, activeFilter]);

  const handleMoreClick = (academy) => {
    navigate(`/product/${academy.id}`, { state: { academy } }); // Navigate to the product page with academy data
  };

  return (
    <Page>
      <Navbar
        title={<img src={logo} alt="Company Logo" style={{ height: '40px' }} />}
        className="top-0 sticky"
        transparent
        large
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

      <div className="flex justify-center items-center flex-col mb-4 mt-1">
        <div className="bg-white rounded-full shadow-lg p-4 flex flex-row items-center px-6">
          <img src={bunny} className="h-12 w-12 mr-4" alt="bunny mascot" />
          <div className="text-lg text-gray-500 font-semibold mr-4">
            Your Bunny XP:
          </div>
          <div className="text-xl font-bold text-black">100567467</div>
        </div>
      </div>

      <div className="flex justify-between bg-white rounded-2xl m-4 shadow-lg">
        <List className="w-full my-0">
          <ListInput
            label="Category"
            type="select"
            dropdown
            outline
            placeholder="Please choose..."
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All</option>
            <option value="AI">AI</option>
            <option value="Finance">Finance</option>
            <option value="Game">Game</option>
            <option value="NFT">NFT</option>
            <option value="Technology">Technology</option>
            <option value="Network">Network</option>
          </ListInput>
        </List>
        <List className="w-full my-0">
          <ListInput
            label="Chain"
            type="select"
            dropdown
            outline
            placeholder="Please choose..."
            value={chain}
            onChange={(e) => setChain(e.target.value)}
          >
            <option value="">All</option>
            <option value="Ethereum">Ethereum</option>
            <option value="Binance">Binance</option>
            <option value="Solana">Solana</option>
            <option value="Polygon">Polygon</option>
            <option value="Avalanche">Avalanche</option>
          </ListInput>
        </List>
      </div>

      <div className="px-4">
        <div className="flex gap-2 justify-center mt-4">
          <Button
            rounded
            outline
            small
            onClick={() => setActiveFilter('all')}
            className={`${
              activeFilter === 'all'
                ? 'bg-gray-100 k-color-brand-purple shadow-lg'
                : 'bg-white shadow-lg'
            }`}
          >
            All
          </Button>
          <Button
            rounded
            outline
            small
            onClick={() => setActiveFilter('sponsored')}
            className={`${
              activeFilter === 'sponsored'
                ? 'bg-gray-100 k-color-brand-purple shadow-lg'
                : 'bg-white shadow-lg'
            }`}
          >
            Sponsored
          </Button>
          <Button
            rounded
            outline
            small
            onClick={() => setActiveFilter('new')}
            className={`${
              activeFilter === 'new'
                ? 'bg-gray-100 k-color-brand-purple shadow-lg'
                : 'bg-white shadow-lg'
            }`}
          >
            New
          </Button>
          <Button
            rounded
            outline
            small
            onClick={() => setActiveFilter('topRated')}
            className={`${
              activeFilter === 'topRated'
                ? 'bg-gray-100 k-color-brand-purple shadow-lg'
                : 'bg-white shadow-lg'
            }`}
          >
            Top Viewed
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 px-4 pt-6 pb-16">
        {filteredData.map((academy) => (
          <Card
            key={academy.id}
            className="relative flex flex-col items-center text-center p-6 rounded-2xl shadow-lg"
          >
            <div className="absolute top-0 left-0 p-2">
              <button
                className="text-amber-500 rounded-full shadow-md focus:outline-none"
                onClick={() => addBookmark(academy)}
              >
                <MdBookmarks className="h-5 w-5 " />
              </button>
            </div>
            <div className="absolute top-0 right-0 p-2 bg-white bg-opacity-75 rounded-full text-sm font-bold text-gray-800">
              {academy.xp} XP
            </div>
            <div className="flex items-center text-center w-full justify-center">
            <img
              alt={academy.name}
              className="h-16 w-16 rounded-full mb-2"
              src={academy.image}
            />
            </div>
            <div className="text-lg font-bold whitespace-nowrap">
              {academy.name}
            </div>
            <Button
              rounded
              large
              className="mt-2 w-full font-bold shadow-xl w-32"
              onClick={() => handleMoreClick(academy)}
            >
              More
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

HomePage.displayName = 'HomePage';
