// src/pages/LoginPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page, List, ListInput, Button, BlockTitle, Block } from 'konsta/react';
import useAuthStore from '../store/useAuthStore'; 
import useUserStore from '../store/useUserStore';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';

const LoginPage: React.FC = ({ theme, setTheme, setColorTheme }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuthStore((state) => ({
    login: state.login,
  }));
  const [rightPanelOpened, setRightPanelOpened] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Access role, hasAcademy, and emailConfirmed flag from Zustand store
  const { role, hasAcademy, emailConfirmed } = useUserStore((state) => ({
    role: state.role,
    hasAcademy: state.hasAcademy,
    emailConfirmed: state.emailConfirmed,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Attempting login with email:', email);
      await login(email, password);

      if (!emailConfirmed) {
        alert('Please confirm your email before logging in.');
        return;
      }

      console.log('Login successful!');
      console.log('User role from useUserStore:', role);
      console.log('Has academy from useUserStore:', hasAcademy);

      // Redirect based on the user's role and academy status
      if (role === 'CREATOR') {
        console.log('User is a CREATOR');
        if (hasAcademy) {
          console.log('User has an academy, redirecting to /creator-dashboard');
          navigate('/creator-dashboard');
        } else {
          console.log('User does not have an academy, redirecting to /create-academy');
          navigate('/create-academy');
        }
      } else if (role === 'SUPERADMIN') {
        console.log('User is a SUPERADMIN, redirecting to /superadmin-dashboard');
        navigate('/superadmin-dashboard');
      } else if (role === 'ADMIN') {
        console.log('User is an ADMIN, redirecting to /admin-dashboard');
        navigate('/admin-dashboard');
      } else {
        console.log('User role did not match, redirecting to /');
        navigate('/');
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
