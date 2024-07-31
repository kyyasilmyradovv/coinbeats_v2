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
import logo from '../images/coinbeats-logo.png';

const mockData = [
  {
    id: 1,
    name: 'BasedAI',
    category: 'AI',
    chain: 'Ethereum',
    link: 'https://coinbeats.xyz/academies/getbased/',
    image: '../images/basedAI.jpg',
    sponsored: true,
  },
  {
    id: 2,
    name: 'Revert Finance',
    category: 'Finance',
    chain: 'Binance',
    link: 'https://coinbeats.xyz/academies/revert-finance/',
    image: '../images/revert.png',
    new: true,
  },
  {
    id: 3,
    name: 'PingPong',
    category: 'Game',
    chain: 'Solana',
    link: 'https://coinbeats.xyz/academies/pingpong/',
    image: '../images/pingpong.jpeg',
    topRated: true,
  },
  {
    id: 4,
    name: 'carv',
    category: 'NFT',
    chain: 'Ethereum',
    link: 'https://coinbeats.xyz/academies/carv/',
    image: '../images/carv.jpeg',
    sponsored: true,
  },
  {
    id: 5,
    name: 'IYK',
    category: 'Technology',
    chain: 'Polygon',
    link: 'https://coinbeats.xyz/academies/iyk/',
    image: '../images/IYK.jpeg',
    new: true,
  },
  {
    id: 6,
    name: 'SKALE Network',
    category: 'Network',
    chain: 'Avalanche',
    link: 'https://coinbeats.xyz/academies/skale-network/',
    image: '../images/skale.png',
    topRated: true,
  },
  {
    id: 7,
    name: 'Ton Blockchain',
    category: 'AI',
    chain: 'Ethereum',
    link: 'https://coinbeats.xyz/academies/ton-blockchain/',
    image: '../images/ton.png',
    sponsored: true,
  },
  {
    id: 8,
    name: 'Districtone',
    category: 'Finance',
    chain: 'Binance',
    link: 'https://coinbeats.xyz/academies/districtone/',
    image: '../images/d1.jpeg',
    new: true,
  },
  {
    id: 9,
    name: 'BorpaToken',
    category: 'Game',
    chain: 'Solana',
    link: 'https://coinbeats.xyz/academies/borpatoken/',
    image: '../images/borpa.png',
    topRated: true,
  },
  {
    id: 10,
    name: 'Mantle',
    category: 'NFT',
    chain: 'Ethereum',
    link: 'https://coinbeats.xyz/academies/mantle/',
    image: '../images/mantle.png',
    sponsored: true,
  },
  {
    id: 11,
    name: 'Aurelius',
    category: 'Technology',
    chain: 'Polygon',
    link: 'https://coinbeats.xyz/academies/aurelius/',
    image: '../images/aurelius.png',
    new: true,
  },
  {
    id: 12,
    name: 'Berachain',
    category: 'Network',
    chain: 'Avalanche',
    link: 'https://coinbeats.xyz/academies/berachain/',
    image: '../images/berachain.png',
    topRated: true,
  },
  {
    id: 13,
    name: 'SEI',
    category: 'AI',
    chain: 'Ethereum',
    link: 'https://coinbeats.xyz/academies/sei/',
    image: '../images/sei.png',
    sponsored: true,
  },
  {
    id: 14,
    name: 'Frax',
    category: 'Finance',
    chain: 'Binance',
    link: 'https://coinbeats.xyz/academies/frax/',
    image: '../images/frax.jpg',
    new: true,
  },
  {
    id: 15,
    name: 'Clip Finance',
    category: 'Game',
    chain: 'Solana',
    link: 'https://coinbeats.xyz/academies/clipfinance/',
    image: '../images/clip.png',
    topRated: true,
  },
  {
    id: 16,
    name: 'DeFi Academy',
    category: 'NFT',
    chain: 'Ethereum',
    link: 'https://coinbeats.xyz/academies/defi-academy/',
    image: '../images/coinbeats-l.svg',
    sponsored: true,
  },
  {
    id: 17,
    name: 'Voltage Finance',
    category: 'Technology',
    chain: 'Polygon',
    link: 'https://coinbeats.xyz/academies/voltage-finance/',
    image: '../images/voltage.jpg',
    new: true,
  },
  {
    id: 18,
    name: 'Bittensor',
    category: 'Network',
    chain: 'Avalanche',
    link: 'https://coinbeats.xyz/academies/bittensor/',
    image: '../images/bittensor.jpeg',
    topRated: true,
  },
  {
    id: 19,
    name: 'aarnâ',
    category: 'Network',
    chain: 'Avalanche',
    link: 'https://coinbeats.xyz/academies/aarna/',
    image: '../images/aarna.png',
    topRated: true,
  },
];

export default function HomePage({ theme, setTheme, setColorTheme }) {
  const initData = useInitData();
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

  const handleMoreClick = (link) => {
    window.location.href = link;
  };

  return (
    <Page>
      <Navbar
        title={<img src={logo} alt="Company Logo" style={{ height: '40px' }} />}
        className="top-0 sticky"
        large
        transparent
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

      <div className="flex justify-between bg-white rounded-2xl m-4 shadow-lg">
        <List className="w-full">
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
        <List className="w-full">
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

      <div className="grid grid-cols-2 px-2 pt-6 pb-16">
        {filteredData.map((academy) => (
          <Card
            key={academy.id}
            className="flex flex-col items-center text-center px-4 py-4 rounded-3xl shadow-lg justify-center"
          >
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
              onClick={() => handleMoreClick(academy.link)}
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

HomePage.displayName = 'HomePage';
