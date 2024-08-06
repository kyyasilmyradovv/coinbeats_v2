// src/pages/LoginPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page, List, ListInput, Button, BlockTitle, Block } from 'konsta/react';
import useAuthStore from '../store/useAuthStore'; // Import the correct auth store
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';

const LoginPage: React.FC = ({ theme, setTheme, setColorTheme }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login, userRole } = useAuthStore((state) => ({
    login: state.login,
    userRole: state.userRole,
  }));
  const [rightPanelOpened, setRightPanelOpened] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      alert('Login successful!');

      // Use navigate to handle redirection based on role
      switch (userRole) {
        case 'SUPERADMIN':
          navigate('/superadmin-dashboard');
          break;
        case 'ADMIN':
          navigate('/admin-dashboard');
          break;
        case 'CREATOR':
          navigate('/creator-dashboard');
          break;
        default:
          navigate('/'); // Redirect to home or other appropriate page
          break;
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      alert(error.response?.data?.error || 'Failed to login');
    }
  };

  return (
    <Page>
      <Navbar darkMode={darkMode} onToggleSidebar={() => setRightPanelOpened(!rightPanelOpened)} />
      <Sidebar
        opened={rightPanelOpened}
        onClose={() => setRightPanelOpened(false)}
        theme={theme}
        setTheme={setTheme}
        setColorTheme={setColorTheme}
      />

      <div className="text-center flex w-full items-center justify-center top-8 mb-10">
        <BlockTitle large>Login</BlockTitle>
      </div>

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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
