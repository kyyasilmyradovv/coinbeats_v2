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

app.get('/users/:id', async (req, res) => {
    try {
      const userId = parseInt(req.params.id, 10);
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          academies: true,
          points: true,
        },
      });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching user details' });
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
