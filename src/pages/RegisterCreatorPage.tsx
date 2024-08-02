// src/pages/RegisterCreatorPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useUserStore from '../store/useUserStore';
import useSessionStore from '../store/useSessionStore'; // Import session store

const RegisterCreatorPage: React.FC = () => {
  const navigate = useNavigate();

  // Fetch user data from session store instead of user store
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
        ...formData,
      });

      if (response.status !== 201) {
        throw new Error('Failed to register');
      }

      // Update Zustand user store
      updateUserRole('CREATOR');
      setUser(telegramUserId, username, 'CREATOR');

      alert('Successfully registered as a creator!');
      navigate('/creator-dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Failed to register as a creator');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Register as Academy Creator</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="name" className="block font-semibold">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="email" className="block font-semibold">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="password" className="block font-semibold">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block font-semibold">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">Register</button>
      </form>
    </div>
  );
};

export default RegisterCreatorPage;
