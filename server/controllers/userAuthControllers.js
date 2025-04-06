const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const asyncHandler = require('../utils/asyncHandler');
const { sendMail } = require('../utils/sendMail');

// const JWT_SECRET = 'abcdef';
// const JWT_REFRESH_SECRET = 'abcdef';

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email, isBanned: false },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const tokenPayload = {
    id: user.id.toString(),
    roles: user.roles,
    telegramUserId: user.telegramUserId ? user.telegramUserId.toString() : null,
    email: user.email,
  };

  const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: '2h',
  });
  const refreshToken = jwt.sign(tokenPayload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '30d',
  });

  res.status(200).json({ accessToken, refreshToken });
});

exports.sendMeCode = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  if (existingUser) {
    return res.status(409).json({ message: 'Email already in use' });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  await prisma.emailVerifications.upsert({
    where: { email },
    update: { code, created_at: new Date() },
    create: { email, code, created_at: new Date() },
  });

  await sendMail(code, email);

  res.status(200).json({ message: 'Code sent' });
});

exports.verify = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  const user = await prisma.user.findUnique({
    where: { email, isBanned: false },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const tokenPayload = {
    id: user.id.toString(),
    roles: user.roles,
    telegramUserId: user.telegramUserId ? user.telegramUserId.toString() : null,
    email: user.email,
  };

  const accessToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '2h' });
  const refreshToken = jwt.sign(tokenPayload, JWT_REFRESH_SECRET, {
    expiresIn: '30d',
  });

  res.json({ accessToken, refreshToken });
});
