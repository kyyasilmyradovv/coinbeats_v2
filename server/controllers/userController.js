// server/controllers/userController.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        points: true,
        sessionLogs: true,
        academies: {
          include: {
            subscription: true,
          },
        },
      },
    });

    // Calculate additional data
    const usersWithDetails = users.map(user => {
      const totalPoints = user.points.reduce((sum, point) => sum + point.value, 0);
      const sessionCount = user.sessionLogs.length;
      const subscription = user.academies.find(academy => academy.subscription);
      const subscriptionStatus = subscription && subscription.subscription ? 'Active' : 'Inactive';
      const subscriptionValidUntil = subscription && subscription.subscription ? new Date(subscription.subscription.endDate).toLocaleDateString() : 'N/A';

      return {
        ...user,
        totalPoints,
        sessionCount,
        subscriptionStatus,
        subscriptionValidUntil,
      };
    });

    res.json(usersWithDetails);
  } catch (error) {
    console.error('Error fetching users:', error);
    next(createError(500, 'Error fetching users'));
  }
};

exports.getUserDetailsById = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId, 10) },
      include: {
        points: true,
        sessionLogs: true,
        academies: {
          include: {
            subscription: true,
          },
        },
      },
    });

    if (!user) {
      return next(createError(404, 'User not found'));
    }

    const totalPoints = user.points.reduce((sum, point) => sum + point.value, 0);
    const sessionCount = user.sessionLogs.length;
    const subscription = user.academies.find(academy => academy.subscription);
    const subscriptionStatus = subscription ? 'Active' : 'Inactive';
    const subscriptionValidUntil = subscription && subscription.subscription.endDate ? new Date(subscription.subscription.endDate).toLocaleDateString() : 'N/A';

    res.json({
      ...user,
      totalPoints,
      sessionCount,
      subscriptionStatus,
      subscriptionValidUntil,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    next(createError(500, 'Error fetching user'));
  }
};

exports.createUser = async (req, res, next) => {
  const { name, email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
    });

    res.json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    next(createError(500, 'Error creating user'));
  }
};

exports.deleteUser = async (req, res, next) => {
  const { userId } = req.params;
  try {
    await prisma.user.delete({
      where: { id: parseInt(userId, 10) },
    });
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting user:', error);
    next(createError(500, 'Error deleting user'));
  }
};

exports.getUserByTelegramId = async (req, res, next) => {
  const telegramUserId = parseInt(req.params.telegramUserId, 10);
  try {
    console.log("Fetching user with Telegram ID:", telegramUserId);

    const user = await prisma.user.findUnique({
      where: { telegramUserId },
      include: { 
        points: true,
        academies: true,  // Include academies in the response
      },
    });

    if (!user) {
      console.log("User not found:", telegramUserId);
      return next(createError(404, 'User not found'));
    }

    const totalPoints = user.points.reduce((sum, point) => sum + point.value, 0);
    const hasAcademy = user.academies.length > 0;

    res.json({ ...user, totalPoints, hasAcademy });
  } catch (error) {
    console.error('Error fetching user:', error);
    next(createError(500, 'Error fetching user'));
  }
};


exports.updateUserRole = async (req, res, next) => {
  const { userId, newRole } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating role:', error);
    next(createError(500, 'Error updating role'));
  }
};

exports.registerCreator = async (req, res, next) => {
  try {
    const { telegramUserId, name, email, password } = req.body;
    console.log('Starting registration process...');

    // Check if a creator with the same email already exists
    const existingCreator = await prisma.user.findFirst({
      where: { email, role: 'CREATOR' },
    });

    if (existingCreator) {
      console.log('Email already used by another creator:', email);
      return next(createError(409, 'Email is already used by another creator'));
    }

    // Check if a user with the given telegramUserId already exists
    let user = await prisma.user.findUnique({ where: { telegramUserId } });

    if (user) {
      console.log('User already exists with Telegram ID:', telegramUserId);
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    console.log('Password hashed successfully');

    const emailConfirmationToken = crypto.randomBytes(32).toString('hex');
    console.log('Email confirmation token generated:', emailConfirmationToken);

    // Create the user
    user = await prisma.user.create({
      data: {
        telegramUserId,
        name,
        email,
        password: hashedPassword,
        role: 'CREATOR',
        emailConfirmationToken,
      },
    });
    console.log('User registered successfully:', user.id);

    // Update the confirmation URL to use the new email confirmation route
    const confirmationUrl = `${process.env.BACKEND_URL}/api/email/confirm-email?token=${emailConfirmationToken}`;
    console.log('Confirmation URL:', confirmationUrl);

    const message = `
  <h1>Confirm your email</h1>
  <p>Please confirm your email by clicking on the following link:</p>
  <a href="${confirmationUrl}">Confirm Email</a>
`;

    await sendEmail(email, 'Email Confirmation', 'Please confirm your email', message);
    console.log('Confirmation email sent');

    return res.status(201).json({ message: 'User registered as a CREATOR. Please confirm your email.' });
  } catch (error) {
    console.error('Error registering creator:', error);
    next(createError(500, 'Error registering creator'));
  }
};

exports.userInteraction = async (req, res, next) => {
  try {
    const { telegramUserId, action, name, email, password } = req.body;

    let user = await prisma.user.findUnique({ where: { telegramUserId } });

    if (!user && (action === 'register_creator' || action === 'significant_action')) {
      user = await prisma.user.create({
        data: {
          telegramUserId,
          name: name || 'Unknown',
          email: email || '',
          password: password ? bcrypt.hashSync(password, SALT_ROUNDS) : null,
          role: action === 'register_creator' ? 'CREATOR' : 'USER',
        },
      });

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
    next(createError(500, 'Error handling user interaction'));
  }
};

/* exports.confirmEmail = async (req, res, next) => {
  const { token } = req.query;

  try {
    // Log the token received for debugging purposes
    console.log("Received token:", token);

    const user = await prisma.user.findFirst({
      where: { emailConfirmationToken: token },
    });

    if (!user) {
      console.log("User not found for token:", token);
      return next(createError(400, 'Invalid or expired token'));
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailConfirmed: true,
        emailConfirmationToken: null,
      },
    });

    // Redirect to the login page with success status
    return res.redirect(`${process.env.FRONTEND_URL}/login?status=success`);
  } catch (error) {
    console.error('Error confirming email:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/login?status=failure`);
  }
}; */