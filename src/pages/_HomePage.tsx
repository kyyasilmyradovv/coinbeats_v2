// src/pages/HomePage.tsx

import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import DateDisplay from '../components/DateDisplay';
import LoginForm from '../components/LoginForm';
import UserForm from '../components/UserForm';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const HomePage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <DateDisplay />
      <h1 className="text-6xl font-bold underline">Hello world!</h1>
      <LoginForm />
      <UserForm />
      <h2>Users List</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} - {user.email} - Role: {user.role}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HomePage;
