// src/pages/RegisterCreatorPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import useUserStore from '../store/useUserStore';
import useSessionStore from '../store/useSessionStore';
import { Page, List, ListInput, Button, BlockTitle, Block } from 'konsta/react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import { Icon } from '@iconify/react';

const RegisterCreatorPage: React.FC = ({ theme, setTheme, setColorTheme }) => {
  const navigate = useNavigate();
  const { userId: telegramUserId, username } = useSessionStore((state) => ({
    userId: state.userId,
    username: state.username,
  }));
  const { setUser, updateUserRole } = useUserStore((state) => ({
    setUser: state.setUser,
    updateUserRole: state.updateUserRole,
  }));

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [rightPanelOpened, setRightPanelOpened] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [colorPickerOpened, setColorPickerOpened] = useState(false);
  const [isRegistrationSuccessful, setIsRegistrationSuccessful] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      const response = await axiosInstance.post('/api/users/register-creator', {
        telegramUserId,
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (response.status === 201 || response.status === 200) {
        setIsRegistrationSuccessful(true);
      }
    } catch (error: any) {
      console.error('Registration failed:', error.response ? error.response.data : error.message);
      alert(error.response?.data?.error || 'Failed to register as a creator');
    }
  };

  useEffect(() => {
    if (isRegistrationSuccessful) {
      const source = new EventSource(`/api/sse/email-confirmation-status?userId=${telegramUserId}`);

      source.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.emailConfirmed) {
          navigate('/login');
          source.close(); // Close the connection after receiving the confirmation
        }
      };

      source.onerror = () => {
        console.error('Error in SSE connection');
        source.close();
      };

      return () => {
        source.close(); // Clean up the connection when the component is unmounted
      };
    }
  }, [isRegistrationSuccessful, navigate, telegramUserId]);

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
        <BlockTitle large>Register as Academy Creator</BlockTitle>
      </div>

      <Block strong className="mx-4 my-4 bg-white rounded-2xl shadow-lg p-6">
        {isRegistrationSuccessful ? (
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-4">
              Thank you for registering! Please confirm your email by clicking the link sent to your email.
            </h2>
            <div className="flex justify-center">
              <Icon icon="svg-spinners:blocks-shuffle-3" className="text-[#DE47F0]" width="24" height="24" />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <List className="rounded-2xl">
              <ListInput
                label="Name"
                type="text"
                placeholder="Enter your name"
                outline
                clearButton
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="rounded-2xl"
              />
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
              <ListInput
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                outline
                clearButton
                required
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="rounded-2xl"
              />
            </List>
            <Button
              type="submit"
              large
              raised
              strong
              className="w-full rounded-2xl"
            >
              Register
            </Button>
          </form>
        )}
      </Block>
    </Page>
  );
};

export default RegisterCreatorPage;
