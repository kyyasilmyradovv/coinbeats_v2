// src/pages/UserManagementPage.tsx

import React, { useEffect, useState, useRef } from 'react';
import axios from '../api/axiosInstance';
import { Page, Block, BlockTitle, Card, Button, List, ListItem, Popover } from 'konsta/react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { MoreHoriz } from '@mui/icons-material';

const UserManagementPage: React.FC<{
  theme: string;
  setTheme: (theme: string) => void;
  setColorTheme: (color: string) => void;
}> = ({ theme, setTheme, setColorTheme }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [rightPanelOpened, setRightPanelOpened] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showPopover, setShowPopover] = useState<{ [key: number]: boolean }>({});
  const popoverTargetRef = useRef<HTMLElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users');
        const data = Array.isArray(response.data) ? response.data : [];
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: number) => {
    try {
      await axios.delete(`/api/users/${userId}`);
      setUsers(users.filter((user) => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    navigate(`/user/${user.id}`); // Use user ID for navigation
  };

  const toggleSidebar = () => {
    setRightPanelOpened(!rightPanelOpened);
  };

  const togglePopover = (userId: number, ref: HTMLElement) => {
    popoverTargetRef.current = ref;
    setShowPopover((prev) => ({ ...prev, [userId]: !prev[userId] }));
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

      <div className="text-center flex w-full items-center justify-center top-8 mb-10">
        <BlockTitle large className="text-3xl font-bold">
          User Management
        </BlockTitle>
      </div>

      <Block>
        <List>
          {users.map((user) => (
            <Card key={user.id} className="!mx-0 mb-4 shadow-lg rounded-3xl">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => navigate(`/user/${user.id}`)} // Navigate to user detail page
              >
                <ListItem
                  title={
                    <div className="font-bold">{`${user.name} (${user.email})`}</div>
                  }
                  text={
                    <>
                      <div>
                        <span className="font-semibold">Telegram ID:</span>{' '}
                        <span className="font-bold">{user.telegramUserId}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Role:</span>{' '}
                        <span className="font-bold">{user.role}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Points:</span>{' '}
                        <span className="font-bold">{user.totalPoints}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Sessions:</span>{' '}
                        <span className="font-bold">{user.sessionCount}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Subscription Status:</span>{' '}
                        <span className="font-bold">{user.subscriptionStatus}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Valid Until:</span>{' '}
                        <span className="font-bold">{user.subscriptionValidUntil}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Created At:</span>{' '}
                        <span className="font-bold">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </>
                  }
                />
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePopover(user.id, e.currentTarget);
                  }}
                  className="text-white p-1 rounded-full !w-8"
                >
                  <MoreHoriz />
                </Button>
              </div>
              <Popover
                opened={showPopover[user.id] || false}
                target={popoverTargetRef.current}
                onBackdropClick={() => togglePopover(user.id, popoverTargetRef.current!)}
                angle={false}
                position="left" // Ensure popover opens to the left
                size="w-80" // Adjust popover size
                className="flex items-center justify-center"
              >
                <div className="flex flex-col space-y-2 p-4">
                  <Button onClick={() => handleEditUser(user)} className="bg-blue-500 text-white rounded-full">
                    Edit
                  </Button>
                  <Button onClick={() => handleDeleteUser(user.id)} className="bg-red-500 text-white rounded-full">
                    Delete
                  </Button>
                  <Button className="bg-yellow-500 text-white rounded-full">
                    Mark Admin/Remove Admin
                  </Button>
                </div>
              </Popover>
            </Card>
          ))}
        </List>
      </Block>
    </Page>
  );
};

export default UserManagementPage;
