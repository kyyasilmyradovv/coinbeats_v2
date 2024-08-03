import React, { useState, useMemo, useLayoutEffect } from 'react';
import { useInitData } from '@telegram-apps/sdk-react';
import { useNavigate } from 'react-router-dom';
import { Chip, NavbarBackLink, Link, Navbar as KonstaNavbar } from 'konsta/react';
import logoLight from '../../images/coinbeats-light.svg';
import logoDark from '../../images/coinbeats-dark.svg';

interface NavbarProps {
  darkMode: boolean;
  onToggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ darkMode, onToggleSidebar }) => {
  const initData = useInitData();
  const navigate = useNavigate();

  const username = useMemo(() => initData?.user?.username || 'Guest', [initData]);
  const userAvatar = useMemo(
    () => initData?.user?.photoUrl || 'https://cdn.framework7.io/placeholder/people-100x100-7.jpg',
    [initData]
  );

  return (
    <KonstaNavbar
      title={<img src={darkMode ? logoLight : logoDark} alt="Company Logo" className="h-7 mx-auto" />}
      className="top-0 sticky"
      left={<NavbarBackLink onClick={() => history.back()} />}
      right={
        <Chip
          className="m-0.5"
          media={<img alt="avatar" className="ios:h-7 material:h-6 rounded-full" src={userAvatar} />}
          onClick={onToggleSidebar}
        >
          {username}
        </Chip>
      }
      centerTitle={true}
    />
  );
};

export default Navbar;
