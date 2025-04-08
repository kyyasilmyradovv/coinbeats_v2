const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const asyncHandler = require('../utils/asyncHandler');
const { sendMail } = require('../utils/sendMail');

exports.getMyProfile = asyncHandler(async (req, res, next) => {
  res.status(200).json(req.user);
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email, isBanned: false },
    select: {
      id: true,
      roles: true,
      name: true,
      telegramUserId: true,
      email: true,
      password: true,
    },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const tokenPayload = {
    id: user.id,
    roles: user.roles,
    telegramUserId: user.telegramUserId ? user.telegramUserId.toString() : null,
    email: user.email,
    name: user.name,
  };

  const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: '2h',
  });
  const refreshToken = jwt.sign(tokenPayload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '30d',
  });

  res.status(200).json({ accessToken, refreshToken, ...tokenPayload });
});

exports.signinGoogle = asyncHandler(async (req, res, next) => {
  const { email, name } = req.body;

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: name || email.split('@')[0],
      roles: ['USER'],
      isBanned: false,
      emailConfirmed: true,
    },
    update: {},
    select: {
      id: true,
      roles: true,
      telegramUserId: true,
      email: true,
      name: true,
    },
  });

  const tokenPayload = {
    id: user.id,
    roles: user.roles,
    telegramUserId: user.telegramUserId ? user.telegramUserId.toString() : null,
    email: user.email,
    name: user.name,
  };

  const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: '2h',
  });
  const refreshToken = jwt.sign(tokenPayload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '30d',
  });

  res.status(200).json({ accessToken, refreshToken, ...user });
});

exports.refreshToken = asyncHandler(async (req, res, next) => {
  let { refreshToken: token } = req.body;

  let decoded = null;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    return res.status(409).json({ status: 'Failed', message: 'Invalid token' });
  }

  const user = await prisma.user.findUnique({
    where: { id: +decoded.id, isBanned: false },
    select: {
      id: true,
      roles: true,
      telegramUserId: true,
      email: true,
      name: true,
    },
  });

  if (!user) {
    return res.status(409).json({
      status: 'Failed',
      message: 'Invalid token',
    });
  }

  const tokenPayload = {
    id: user.id,
    roles: user.roles,
    telegramUserId: user.telegramUserId ? user.telegramUserId.toString() : null,
    email: user.email,
    name: user.name,
  };

  const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: '2h',
  });
  const refreshToken = jwt.sign(tokenPayload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '30d',
  });

  res.status(200).json({ accessToken, refreshToken, ...user });
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

  console.log('Code sent: ', code);

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

exports.protectForUser = asyncHandler(async (req, res, next) => {
  let token,
    auth = req.headers?.authorization;
  if (auth?.startsWith('Bearer')) token = auth.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      status: 'Failed',
      message: 'You are not logged in',
    });
  }

  try {
    var decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  } catch (error) {
    console.log(error);
    if (error.name === 'TokenExpiredError') {
      return res.status(498).json({
        status: 'Failed',
        message: 'Token expired',
      });
    } else {
      return res.status(400).json({
        status: 'Failed',
        message: 'Token not valid',
      });
    }
  }

  req.user = decoded;

  next();
});
