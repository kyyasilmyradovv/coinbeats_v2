// src/components/SuperAdminSidebar.tsx

import React from 'react';
import { Panel, List, ListItem, Link } from 'konsta/react';

interface SidebarProps {
  opened: boolean;
  onClose: () => void;
  theme: string;
  setTheme: (theme: string) => void;
  setColorTheme: (color: string) => void;
}

const SuperAdminSidebar: React.FC<SidebarProps> = ({
  opened,
  onClose,
  theme,
  setTheme,
  setColorTheme,
}) => {
  return (
    <Panel opened={opened} onBackdropClick={onClose}>
      <List>
        <ListItem title="Dashboard" after="superadmin" link="/superadmin-dashboard" />
        <ListItem title="User Management" link="/user-management" />
        <ListItem title="Academy Statistics" link="/academy-statistics" />
        <ListItem title="Inbox" link="/inbox" />
        <ListItem title="Subscription Management" link="/subscription-management" />
      </List>
    </Panel>
  );
};

export default SuperAdminSidebar;
