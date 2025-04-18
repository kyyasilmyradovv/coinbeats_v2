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

exports.updateProfile = asyncHandler(async (req, res, next) => {
  const { name, password } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      name,
      ...(password ? { password: await bcrypt.hash(password, 10) } : {}),
    },
    select: { id: true, roles: true, email: true, name: true },
  });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const accessToken = jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: '2h',
  });
  const refreshToken = jwt.sign(user, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '30d',
  });

  res.status(200).json({ accessToken, refreshToken, ...user });
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email, isBanned: false },
    select: {
      id: true,
      roles: true,
      name: true,
      email: true,
      password: true,
    },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  delete user.password;

  const accessToken = jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: '2h',
  });
  const refreshToken = jwt.sign(user, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '30d',
  });

  res.status(200).json({ accessToken, refreshToken, ...user });
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
    select: { id: true, roles: true, email: true, name: true },
  });

  const accessToken = jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: '2h',
  });
  const refreshToken = jwt.sign(user, process.env.JWT_REFRESH_SECRET, {
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
    select: { id: true, roles: true, email: true, name: true },
  });

  if (!user) {
    return res.status(409).json({
      status: 'Failed',
      message: 'Invalid token',
    });
  }

  const accessToken = jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: '2h',
  });
  const refreshToken = jwt.sign(user, process.env.JWT_REFRESH_SECRET, {
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

  console.log('---------------', code);
  await prisma.emailVerifications?.upsert({
    where: { email },
    update: { code, created_at: new Date() },
    create: { email, code, created_at: new Date() },
  });

  console.log('Code sent: ', code);

  await sendMail(code, email);

  res.status(200).json({ message: 'Code sent' });
});

exports.verifyMyEmail = asyncHandler(async (req, res, next) => {
  const { email, code } = req.body;
  const TEN_MINUTES_AGO = new Date(Date.now() - 10 * 60 * 1000);

  const verification = await prisma.emailVerifications.findFirst({
    where: {
      email,
      created_at: { gte: TEN_MINUTES_AGO },
    },
  });

  if (!verification || verification.code !== code) {
    return res.status(400).json({ message: 'Invalid verification code' });
  }

  await prisma.emailVerifications.delete({ where: { email } });

  const user = await prisma.user.upsert({
    where: { email },
    update: { emailConfirmed: true },
    create: {
      email,
      name: email.split('@')[0],
      roles: ['USER'],
      isBanned: false,
      emailConfirmed: true,
    },
    select: { id: true, roles: true, email: true, name: true },
  });

  const accessToken = jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: '2h',
  });
  const refreshToken = jwt.sign(user, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '30d',
  });

  res.status(200).json({ accessToken, refreshToken, ...user });
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

exports.weakProtect = asyncHandler(async (req, res, next) => {
  let token,
    auth = req.headers?.authorization;
  if (auth?.startsWith('Bearer')) token = auth.split(' ')[1];

  if (token) {
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
  }

  next();
});
