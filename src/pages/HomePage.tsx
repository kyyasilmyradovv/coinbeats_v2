// src/pages/HomePage.tsx

import React, { useMemo, useState, useEffect } from 'react';
import { useInitData } from '@telegram-apps/sdk-react';
import { TonConnectButton } from '@tonconnect/ui-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useSessionStore from '../store/useSessionStore';
import useUserStore from '../store/useUserStore';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import {
  Page,
  List,
  ListInput,
  Card,
  Button,
  Chip,
  Panel,
  Link,
  ListItem,
  Radio,
  Toggle,
  Popover,
  Block,
  BlockTitle,
} from 'konsta/react';
import { MdBookmarks } from 'react-icons/md';
import { useBookmarks } from '../contexts/BookmarkContext';
import logoLight from '../images/coinbeats-light.svg';
import logoDark from '../images/coinbeats-dark.svg';
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
  const navigate = useNavigate();
  const startSession = useSessionStore((state) => state.startSession);
  const endSession = useSessionStore((state) => state.endSession);
  const setCurrentRoute = useSessionStore((state) => state.setCurrentRoute);
  const { bookmarks, addBookmark } = useBookmarks();
  const [category, setCategory] = useState('');
  const [chain, setChain] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [rightPanelOpened, setRightPanelOpened] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [colorPickerOpened, setColorPickerOpened] = useState(false);

  // Zustand User Store
  const { userId, role, setUser } = useUserStore((state) => ({
    userId: state.userId,
    role: state.role,
    setUser: state.setUser,
  }));

  const username = useMemo(() => initData?.user?.username || 'Guest', [initData]);
  const userAvatar = useMemo(() => initData?.user?.photoUrl || 'https://cdn.framework7.io/placeholder/people-100x100-7.jpg', [initData]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const toggleSidebar = () => {
    setRightPanelOpened(!rightPanelOpened);
  };

  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  useEffect(() => {
    const initializeUserSession = async () => {
      if (initData) {
        const telegramUserId = initData.user.id;

        console.log('Telegram User ID:', telegramUserId);

        try {
          // Check if user exists in the database
          const response = await axios.get(`http://localhost:7000/api/users/${telegramUserId}`);

          console.log('Response:', response.data);

          if (response.status === 200 && response.data) {
            // User found, update Zustand store with user's data
            const { id, username, role } = response.data;
            console.log('User found:', response.data);
            setUser(id, username, role);
          } else {
            // User not found, initialize with default role
            console.log('User not found, initializing with default role');
            setUser(null, username, 'USER');
          }
        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.log('User not found in database, setting default role');
            // Set default values if user not found
            setUser(null, username, 'USER');
          } else {
            console.error('Error fetching user:', error);
          }
        }

        // Start a new session
        const sessionStartTime = Date.now();
        startSession({
          sessionStartTime,
          userId: telegramUserId,
          username: username,
          roles: ['USER'],
        });

        // Log session start
        // Removed initial session logging here

        // Track route changes
        const handleRouteChange = () => {
          const currentRoute = window.location.pathname;
          setCurrentRoute(currentRoute);
        };

        window.addEventListener('popstate', handleRouteChange);

        // Handle session end using beforeunload
        const handleSessionEnd = async () => {
          const sessionEndTime = Date.now();
          const duration = Math.floor((sessionEndTime - sessionStartTime) / 1000);

          try {
            await axios.post('http://localhost:7000/api/log-session', {
              telegramUserId,
              sessionStart: sessionStartTime,
              sessionEnd: sessionEndTime,
              duration,
              routeDurations: {}, // Collect actual durations
            });
            console.log('Session ended and logged');
          } catch (error) {
            console.error('Error logging session end:', error);
          }

          endSession(sessionEndTime);
        };

        window.addEventListener('beforeunload', handleSessionEnd);

        return () => {
          // Cleanup event listeners
          window.removeEventListener('popstate', handleRouteChange);
          window.removeEventListener('beforeunload', handleSessionEnd);
        };
      }
    };

    initializeUserSession();
  }, [initData, startSession, setCurrentRoute, endSession, setUser, username, role]);

  const filteredData = useMemo(() => {
    let data = mockData;
    if (category) data = data.filter((item) => item.category === category);
    if (chain) data = data.filter((item) => item.chain === chain);
    if (activeFilter === 'sponsored') data = data.filter((item) => item.sponsored);
    if (activeFilter === 'new') data = data.filter((item) => item.new);
    if (activeFilter === 'topRated') data = data.filter((item) => item.topRated);
    return data;
  }, [category, chain, activeFilter]);

  const handleMoreClick = (academy) => {
    navigate(`/product/${academy.id}`, { state: { academy } });
  };

  const renderSidePanelButtons = () => {
    const buttons = [];

    if (role?.includes('SUPERADMIN')) {
      buttons.push(<Button rounded outline key="superadmin" onClick={() => navigate('/superadmin-dashboard')} className="!w-fit !px-4 !py-4 !mx-auto k-color-brand-blue">Log in as Superadmin</Button>);
    }
    if (role?.includes('ADMIN')) {
      buttons.push(<Button rounded outline key="admin" onClick={() => navigate('/admin-dashboard')} className="!w-fit !px-4 !py-4 !mx-auto k-color-brand-blue">Log in as Admin</Button>);
    }
    if (role?.includes('CREATOR')) {
      buttons.push(<Button rounded outline key="creator" onClick={() => navigate('/creator-dashboard')} className="!w-fit !px-4 !py-4 !mx-auto k-color-brand-blue">Log in as Creator</Button>);
    }
    if (role === 'USER' && !role?.includes('CREATOR')) {
      buttons.push(<Button rounded outline key="become-creator" onClick={() => navigate('/register-creator')} className="!w-fit !px-4 !py-4 !mx-auto k-color-brand-blue">Become Academy Creator</Button>);
    }

    return buttons;
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

      <div className="flex justify-center items-center flex-col mb-4 mt-1">
        <div className="bg-white rounded-full shadow-lg p-2 flex flex-row items-center px-6">
          <img src={bunny} className="h-10 w-10 mr-4" alt="bunny mascot" />
          <div className="text-lg text-gray-500 font-semibold mr-4">
            Your Bunny XP:
          </div>
          <div className="text-xl font-bold text-black">100567467</div>
        </div>
      </div>

      <div className="flex justify-between bg-white rounded-2xl m-4 shadow-lg">
        <List className="w-full !my-0">
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
        <List className="w-full !my-0">
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
                ? 'bg-gray-100 k-color-brand-purple shadow-lg !text-2xs'
                : 'bg-white shadow-lg !text-2xs'
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
                ? 'bg-gray-100 k-color-brand-purple shadow-lg !text-2xs'
                : 'bg-white shadow-lg !text-2xs'
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
                ? 'bg-gray-100 k-color-brand-purple shadow-lg !text-2xs'
                : 'bg-white shadow-lg !text-2xs'
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
                ? 'bg-gray-100 k-color-brand-purple shadow-lg !text-2xs'
                : 'bg-white shadow-lg !text-2xs'
            }`}
          >
            Top Viewed
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 px-2 pt-6 pb-16">
        {filteredData.map((academy) => (
          <Card
            key={academy.id}
            className="relative flex flex-col items-center text-center !p-3 !rounded-2xl shadow-lg"
          >
            <div className="absolute top-0 left-0 p-2">
              <button
                className="text-amber-500 rounded-full shadow-md focus:outline-none m-1"
                onClick={() => addBookmark(academy)}
              >
                <MdBookmarks className="h-5 w-5 " />
              </button>
            </div>
            <div className="absolute top-0 right-0 p-1 bg-white bg-opacity-75 rounded-full text-sm font-bold text-gray-800 m-1">
              {academy.xp} XP
            </div>
            <div className="flex items-center text-center w-full justify-center mt-1">
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
              className="mt-2 font-bold shadow-xl min-w-28"
              onClick={() => handleMoreClick(academy)}
            >
              More
            </Button>
          </Card>
        ))}
      </div>
    </Page>
  );
}

HomePage.displayName = 'HomePage';
