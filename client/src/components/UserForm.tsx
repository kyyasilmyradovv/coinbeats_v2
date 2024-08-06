// src/components/UserForm.tsx

import React, { useState } from 'react';
import axios from 'axios';

const UserForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await axios.post('/api/users', { name, email, password, role });
      console.log('User created:', response.data);
      // Optionally, clear the form or show a success message
      setName('');
      setEmail('');
      setPassword('');
      setRole('USER');
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '300px' }}>
      <label htmlFor="name">Name:</label>
      <input
        id="name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <label htmlFor="email">Email:</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <label htmlFor="password">Password:</label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <label htmlFor="role">Role:</label>
      <select
        id="role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="USER">User</option>
        <option value="CREATOR">Creator</option>
        <option value="ADMIN">Admin</option>
        <option value="SUPERADMIN">Superadmin</option>
      </select>
      <button type="submit">Create User</button>
    </form>
  );
};

export default UserForm;
