// client/src/pages/LoginPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page, List, ListInput, Button, BlockTitle, Block } from 'konsta/react';
import { Icon } from '@iconify/react';
import useAuthStore from '../store/useAuthStore'; 
import useUserStore from '../store/useUserStore';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, initializeAuth, accessToken, userRole } = useAuthStore((state) => ({
    login: state.login,
    initializeAuth: state.initializeAuth,
    accessToken: state.accessToken,
    userRole: state.userRole,
  }));
  
  const { role, hasAcademy, emailConfirmed } = useUserStore((state) => ({
    role: state.role,
    hasAcademy: state.hasAcademy,
    emailConfirmed: state.emailConfirmed,
  }));

  useEffect(() => {
    // Automatically initialize auth state on component mount
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    // If accessToken is present, navigate the user based on their role
    if (accessToken && userRole) {
      if (userRole === 'CREATOR') {
        navigate(hasAcademy ? '/creator-dashboard' : '/create-academy');
      } else if (userRole === 'SUPERADMIN') {
        navigate('/superadmin-dashboard');
      } else if (userRole === 'ADMIN') {
        navigate('/admin-dashboard');
      } else {
        navigate('/');
      }
    }
  }, [accessToken, userRole, navigate, hasAcademy]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);

      if (!emailConfirmed) {
        alert('Please confirm your email before logging in.');
        return;
      }

      // Redirect based on role
      if (role === 'CREATOR') {
        navigate(hasAcademy ? '/creator-dashboard' : '/create-academy');
      } else if (role === 'SUPERADMIN') {
        navigate('/superadmin-dashboard');
      } else if (role === 'ADMIN') {
        navigate('/admin-dashboard');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      alert(error.response?.data?.error || 'Failed to login');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
      <Page>
        <Navbar />
        <Sidebar />

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
                onClear={() => setEmail('')}
                className="rounded-2xl"
              />
              <ListInput
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                outline
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-2xl"
                inputClassName="pr-12"
              >
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-4 top-14 px-3 flex items-center text-gray-500 focus:outline-none"
                >
                  <Icon icon={showPassword ? 'mdi:eye-outline' : 'mdi:eye-closed'} width="20" height="20"/>
                </button>
              </ListInput>
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
