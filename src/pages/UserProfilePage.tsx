// src/pages/UserProfilePage.tsx

import React, { useState, useEffect } from 'react';
import { Page, Block, BlockTitle, List, ListInput, Button } from 'konsta/react';
import axios from 'axios';
import useUserStore from '../store/useUserStore';

const UserProfilePage: React.FC = () => {
  const { userId } = useUserStore((state) => ({ userId: state.userId }));
  const [userData, setUserData] = useState<any>({});

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:7000/users/${userId}`);
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleSaveChanges = async () => {
    try {
      await axios.put(`http://localhost:7000/users/${userId}`, userData);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <Page>
      <BlockTitle>User Profile</BlockTitle>
      <Block strong>
        <List>
          <ListInput
            label="Name"
            type="text"
            value={userData.name || ''}
            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
          />
          <ListInput
            label="Email"
            type="email"
            value={userData.email || ''}
            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
          />
          {/* Add more fields as needed */}
        </List>
        <Button onClick={handleSaveChanges}>Save Changes</Button>
      </Block>
    </Page>
  );
};

export default UserProfilePage;
