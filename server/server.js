const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 7000;

const SALT_ROUNDS = 10;
const JWT_SECRET = 'your_jwt_secret';

app.use(cors());
app.use(express.json());

// Route to get all users
app.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
});

app.post('/users', async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  
      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword, role },
      });
  
      // Generate JWT token
      const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
        expiresIn: '1h',
      });
  
      res.json({ user, token });
    } catch (error) {
      res.status(500).json({ error: 'Error creating user' });
    }
  });

  app.get('/api/users/:telegramUserId', async (req, res) => {
    try {
      const telegramUserId = parseInt(req.params.telegramUserId, 10);
      console.log('Fetching user with telegramUserId:', telegramUserId); // Debugging line
  
      const user = await prisma.user.findUnique({
        where: { telegramUserId }, // Correct field
      });
  
      if (!user) {
        console.log('No user found for telegramUserId:', telegramUserId); // Debugging line
        return res.status(404).json({ error: 'User not found' });
      }
  
      console.log('User found:', user); // Debugging line
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error); // Debugging line
      res.status(500).json({ error: 'Error fetching user' });
    }
  }); 
  
  app.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Find the user by email
      const user = await prisma.user.findUnique({ where: { email } });
  
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      // Compare the password with the hashed password
      const isMatch = await bcrypt.compare(password, user.password);
  
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      // Generate JWT token
      const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
        expiresIn: '1h',
      });
  
      res.json({ user, token });
    } catch (error) {
      res.status(500).json({ error: 'Error logging in' });
    }
  });

  app.post('/api/register-creator', async (req, res) => {
    try {
      const { telegramUserId, name, email, password } = req.body;
  
      // Check if user already exists
      let user = await prisma.user.findUnique({ where: { telegramUserId } });
      if (user) {
        return res.status(400).json({ error: 'User already exists' });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  
      // Create the user with CREATOR role
      user = await prisma.user.create({
        data: {
          telegramUserId,
          name,
          email,
          password: hashedPassword,
          role: 'CREATOR',
        },
      });
  
      res.status(201).json({ userId: user.id });
    } catch (error) {
      console.error('Error registering creator:', error);
      res.status(500).json({ error: 'Error registering creator' });
    }
  });
  
  app.post('/api/update-role', async (req, res) => {
    try {
      const { userId, newRole } = req.body;
  
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role: newRole },
      });
  
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: 'Error updating role' });
    }
  });

  // server/server.js

  app.post('/api/log-session', async (req, res) => {
    try {
      const { telegramUserId, sessionStart, sessionEnd, routeDurations } = req.body;
      const duration = Math.floor((new Date(sessionEnd) - new Date(sessionStart)) / 1000);
  
      // Find user by telegramUserId if exists
      const user = await prisma.user.findUnique({
        where: { telegramUserId },
      });
  
      // Create session log without requiring a user
      await prisma.sessionLog.create({
        data: {
          userId: user ? user.id : null, // Use user ID if exists, else null
          telegramUserId,               // Always log Telegram user ID
          sessionStart: new Date(sessionStart),
          sessionEnd: new Date(sessionEnd),
          duration,
          routeDurations: JSON.stringify(routeDurations),
        },
      });
  
      res.status(201).json({ message: 'Session logged successfully' });
    } catch (error) {
      console.error('Error logging session:', error);
      res.status(500).json({ error: 'Error logging session' });
    }
  });

app.post('/api/user-interaction', async (req, res) => {
  try {
    const { telegramUserId, action, name, email, password } = req.body;

    // Check if the user already exists
    let user = await prisma.user.findUnique({ where: { id: telegramUserId } });

    if (!user && (action === 'register_creator' || action === 'significant_action')) {
      // Create a user if a significant action is performed
      user = await prisma.user.create({
        data: {
          id: telegramUserId,
          name: name || 'Unknown',
          email: email || '',
          password: password ? bcrypt.hashSync(password, SALT_ROUNDS) : null,
          role: action === 'register_creator' ? 'CREATOR' : 'USER',
        },
      });

      // Update existing session logs with the new userId
      await prisma.sessionLog.updateMany({
        where: { telegramUserId },
        data: { userId: user.id },
      });
    }

    // Additional logic for specific actions...
    switch (action) {
      case 'bookmark':
        // Handle bookmarking logic
        break;
      case 'collect_points':
        // Handle point collection logic
        break;
      case 'social_quest':
        // Handle social quest logic
        break;
      default:
        break;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error handling user interaction:', error);
    res.status(500).json({ error: 'Error handling user interaction' });
  }
});

app.get('/api/sessions', async (req, res) => {
  try {
    console.log('Fetching all session logs for analysis'); // Debugging line
    const sessions = await prisma.sessionLog.findMany();
    console.log('Sessions fetched:', sessions.length); // Debugging line
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching session logs:', error); // Debugging line
    res.status(500).json({ error: 'Error fetching session logs' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
