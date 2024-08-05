// src/pages/UserManagementPage.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Page, Block, List, ListItem, Button } from 'konsta/react';

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:7000/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: number) => {
    try {
      await axios.delete(`http://localhost:7000/users/${userId}`);
      setUsers(users.filter((user) => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <Page>
      <BlockTitle>User Management</BlockTitle>
      <Block strong>
        <List>
          {users.map((user) => (
            <ListItem
              key={user.id}
              title={`${user.name} (${user.email})`}
              after={
                <div>
                  <Button outline small onClick={() => handleDeleteUser(user.id)}>Delete</Button>
                  {/* Add Edit and Ban buttons as needed */}
                </div>
              }
            />
          ))}
        </List>
      </Block>
    </Page>
  );
};

export default UserManagementPage;
