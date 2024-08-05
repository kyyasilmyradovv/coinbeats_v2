// src/pages/LoginPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Page, Navbar, List, ListInput, Button, BlockTitle, Block } from 'konsta/react';
import useUserStore from '../store/useUserStore';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const loginUser = useUserStore((state) => state.loginUser);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:7000/login', formData);

      if (response.status === 200) {
        const { user, token } = response.data;
        loginUser({ ...user, token });
        alert('Login successful!');
        navigate('/user-profile'); // Redirect to user profile or dashboard
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      alert(error.response?.data?.error || 'Failed to login');
    }
  };

  return (
    <Page>
      <Navbar title="Login" />
      <BlockTitle large>Login</BlockTitle>
      <Block strong className="mx-4 my-4 bg-white rounded-2xl shadow-lg p-6">
        <form onSubmit={handleLogin} className="space-y-4">
          <List className="rounded-2xl">
            <ListInput
              label="Email"
              type="email"
              placeholder="Enter your email"
              outline
              clearButton
              required
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="rounded-2xl"
            />
            <ListInput
              label="Password"
              type="password"
              placeholder="Enter your password"
              outline
              clearButton
              required
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="rounded-2xl"
            />
          </List>
          <Button type="submit" large raised strong className="w-full rounded-2xl">
            Login
          </Button>
        </form>
      </Block>
    </Page>
  );
};

export default LoginPage;
