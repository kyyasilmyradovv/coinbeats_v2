// src/pages/RegisterCreatorPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useUserStore from '../store/useUserStore';
import useSessionStore from '../store/useSessionStore';
import {
  Page,
  Navbar,
  List,
  ListInput,
  Button,
  BlockTitle,
  NavbarBackLink,
  Block,
  Chip,
  Link,
  Panel
} from 'konsta/react';
import { useTheme } from 'konsta/react';
import logoLight from '../images/coinbeats-light.svg';
import logoDark from '../images/coinbeats-dark.svg';

const RegisterCreatorPage: React.FC = () => {
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
  const theme = useTheme();
  const darkMode = theme === 'dark';
  const userAvatar = 'https://cdn.framework7.io/placeholder/people-100x100-7.jpg';

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
      const response = await axios.post('http://localhost:7000/api/register-creator', {
        telegramUserId,
        ...formData, // Ensure formData includes email
      });
  
      if (response.status === 201 || response.status === 200) {
        updateUserRole('CREATOR');
        setUser(telegramUserId, username, 'CREATOR');
        alert(response.data.message || 'Successfully registered as a creator!');
        navigate('/creator-dashboard');
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      alert(error.response?.data?.error || 'Failed to register as a creator');
    }
  };  

  return (
    <Page>
      <Navbar
        title={<img src={darkMode ? logoLight : logoDark} alt="Company Logo" className="h-7 mx-auto" />}
        left={<NavbarBackLink onClick={() => navigate(-1)} />}
        right={
          <Chip
            className="m-0.5"
            media={
              <img
                alt="avatar"
                className="ios:h-7 material:h-6 rounded-full"
                src={userAvatar}
              />
            }
            onClick={() => setRightPanelOpened(true)}
          >
            {username || 'Guest'}
          </Chip>
        }
        centerTitle={true}
      />

      <div className="text-center flex w-full items-center justify-center top-8 mb-10">
        <BlockTitle large>Register as Academy Creator</BlockTitle>
      </div>
      <Block strong className="mx-4 my-4 bg-white rounded-2xl shadow-lg p-6">
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
      </Block>

      <Panel
        side="right"
        floating
        opened={rightPanelOpened}
        onBackdropClick={() => setRightPanelOpened(false)}
      >
        <Page>
          <Navbar
            title="User Settings"
            right={
              <Link navbar onClick={() => setRightPanelOpened(false)}>
                Close
              </Link>
            }
          />
          <Block className="space-y-4">
            <BlockTitle>Profile Settings</BlockTitle>
            <List className="rounded-2xl">
              <ListInput
                label="Username"
                type="text"
                outline
                clearButton
                value={username}
                disabled
                className="rounded-2xl"
              />
              <ListInput
                label="User ID"
                type="text"
                outline
                clearButton
                value={telegramUserId}
                disabled
                className="rounded-2xl"
              />
            </List>
          </Block>
        </Page>
      </Panel>
    </Page>
  );
};

export default RegisterCreatorPage;
