// src/pages/LoginPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Page, Navbar, List, ListInput, Button, BlockTitle, Block } from 'konsta/react';
import useAuthStore from '../store/useAuthStore'; // Import the correct auth store

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState(''); // Separate state for email
  const [password, setPassword] = useState(''); // Separate state for password
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login); // Use the login function from useAuthStore

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password); // Use the login function to handle authentication
      alert('Login successful!');
      navigate('/user-profile'); // Redirect to user profile or dashboard
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <List className="rounded-2xl">
            <ListInput
              label="Email"
              type="email"
              placeholder="Enter your email"
              outline
              clearButton
              required
              name="email"
              value={email} // Use email state
              onChange={(e) => setEmail(e.target.value)} // Update email state
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
              value={password} // Use password state
              onChange={(e) => setPassword(e.target.value)} // Update password state
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
