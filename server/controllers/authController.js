const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

exports.registerCreator = async (req, res) => {
  const { telegramUserId, name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await prisma.user.create({
      data: {
        telegramUserId,
        name,
        email,
        password: hashedPassword,
        role: 'CREATOR',
      },
    });

    res.status(201).json({ message: 'Creator registered successfully', user: newUser });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      console.log('Invalid email or password for:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    console.log('Tokens generated for user:', user.id);
    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return res.sendStatus(401);

  jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, user) => {
    if (err) {
      console.error('Refresh token verification error:', err);
      return res.sendStatus(403);
    }

    const newAccessToken = generateAccessToken(user);
    console.log('Access token refreshed for user:', user.userId);
    res.json({ accessToken: newAccessToken });
  });
};
