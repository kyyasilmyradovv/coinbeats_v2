import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabbar, TabbarLink, Icon } from 'konsta/react';
import GraduationHat from '../images/graduation-hat.png';
import Bookmark from '../images/bookmark.png';
import GamePad from '../images/game-pad.png';
import Trophy from '../images/trophy.png';
import useSessionStore from '../store/useSessionStore';

export default function BottomTabBar({ activeTab, setActiveTab }) {
  const navigate = useNavigate();

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    switch (tab) {
      case 'tab-1':
        navigate('/');
        break;
      case 'tab-2':
        navigate('/saved');
        break;
      case 'tab-3':
        navigate('/games');
        break;
      case 'tab-4':
        navigate('/points');
        break;
      default:
        break;
    }
  };

  const { darkMode } = useSessionStore((state) => ({ darkMode: state.darkMode }));

  return (
    <Tabbar labels icons className={`left-0 bottom-0 fixed ${darkMode ? 'bg-gray-900' : 'bg-white'} shadow-md !py-1`}>
      <TabbarLink
        active={activeTab === 'tab-1'}
        onClick={() => handleTabClick('tab-1')}
        className={`rounded-xl !my-2 !mr-2 !px-3 !py-2 ${
          activeTab === 'tab-1' ? `${darkMode ? 'bg-gray-800 text-white' : 'bg-slate-100 text-black'} border border-brand-purple` : 'border border-gray-300'
        }`}
        icon={<Icon ios={<img src={GraduationHat} alt="Learn" />} material={<img src={GraduationHat} alt="Learn" />} />}
        label="Learn"
      />
      <TabbarLink
        active={activeTab === 'tab-2'}
        onClick={() => handleTabClick('tab-2')}
        className={`rounded-xl !my-2 !mr-2 !px-3 !py-2 ${
          activeTab === 'tab-2' ? `${darkMode ? 'bg-gray-800 text-white' : 'bg-slate-100 text-black'} border !border-brand-purple` : 'border border-gray-300'
        }`}
        icon={<Icon ios={<img src={Bookmark} alt="Bookmarks" />} material={<img src={Bookmark} alt="Bookmarks" />} />}
        label="Bookmarks"
      />
      <TabbarLink
        active={activeTab === 'tab-3'}
        onClick={() => handleTabClick('tab-3')}
        className={`rounded-xl !my-2 !mr-2 !px-3 !py-2 ${
          activeTab === 'tab-3' ? `${darkMode ? 'bg-gray-800 text-white' : 'bg-slate-100 text-black'} border !border-brand-purple` : 'border border-gray-300'
        }`}
        icon={<Icon ios={<img src={GamePad} alt="Earn" className="!p-1" />} material={<img src={GamePad} alt="Earn" className="!p-1" />} />}
        label="Earn"
      />
      <TabbarLink
        active={activeTab === 'tab-4'}
        onClick={() => handleTabClick('tab-4')}
        className={`rounded-xl !my-2 !px-3 !py-2 ${
          activeTab === 'tab-4' ? `${darkMode ? 'bg-gray-800 text-white' : 'bg-slate-100 text-black'} border !border-brand-purple` : 'border border-gray-300'
        }`}
        icon={<Icon ios={<img src={Trophy} alt="Points" className="!p-1" />} material={<img src={Trophy} alt="Points" className="!p-1" />} />}
        label="Points"
      />
    </Tabbar>
  );
}
