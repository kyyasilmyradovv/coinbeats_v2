// server/controllers/userController.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const { performVerification } = require('../services/verificationService');

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
    const usersWithDetails = users.map((user) => {
      const totalPoints = user.points.reduce(
        (sum, point) => sum + point.value,
        0
      );
      const sessionCount = user.sessionLogs.length;
      const subscription = user.academies.find(
        (academy) => academy.subscription
      );
      const subscriptionStatus =
        subscription && subscription.subscription ? 'Active' : 'Inactive';
      const subscriptionValidUntil =
        subscription && subscription.subscription
          ? new Date(subscription.subscription.endDate).toLocaleDateString()
          : 'N/A';

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

    const totalPoints = user.points.reduce(
      (sum, point) => sum + point.value,
      0
    );
    const sessionCount = user.sessionLogs.length;
    const subscription = user.academies.find((academy) => academy.subscription);
    const subscriptionStatus = subscription ? 'Active' : 'Inactive';
    const subscriptionValidUntil =
      subscription && subscription.subscription.endDate
        ? new Date(subscription.subscription.endDate).toLocaleDateString()
        : 'N/A';

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
    console.log('Fetching user with Telegram ID:', telegramUserId);

    const user = await prisma.user.findUnique({
      where: { telegramUserId },
      include: {
        points: true,
        academies: true, // Include academies in the response
      },
    });

    if (!user) {
      console.log('User not found:', telegramUserId);
      return next(createError(404, 'User not found'));
    }

    const totalPoints = user.points.reduce(
      (sum, point) => sum + point.value,
      0
    );
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

    // Check if a user with the given telegramUserId exists
    let user = await prisma.user.findUnique({ where: { telegramUserId } });

    if (user && user.role === 'CREATOR') {
      console.log(
        'User already exists with Telegram ID and is a creator:',
        telegramUserId
      );
      return res
        .status(400)
        .json({ message: 'User with this Telegram ID is already a creator' });
    }

    if (user && user.role === 'USER') {
      // Hash the new password before updating
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      console.log('Password hashed successfully');

      // Generate email confirmation token and send confirmation email
      const emailConfirmationToken = crypto.randomBytes(32).toString('hex');
      console.log(
        'Email confirmation token generated:',
        emailConfirmationToken
      );

      // Upgrade existing user role to CREATOR, update email, password, and confirmation token
      user = await prisma.user.update({
        where: { telegramUserId },
        data: {
          role: 'CREATOR',
          email,
          password: hashedPassword,
          emailConfirmationToken,
        },
      });
      console.log(
        'User role upgraded to CREATOR with updated email and password:',
        telegramUserId
      );

      const confirmationUrl = `${process.env.BACKEND_URL}/api/email/confirm-email?token=${emailConfirmationToken}`;
      console.log('Confirmation URL:', confirmationUrl);

      const message = `
        <h1>Confirm your email</h1>
        <p>Please confirm your email by clicking on the following link:</p>
        <a href="${confirmationUrl}">Confirm Email</a>
      `;

      await sendEmail(
        email,
        'Email Confirmation',
        'Please confirm your email',
        message
      );
      console.log('Confirmation email sent upon role upgrade');

      return res.status(200).json({
        message: 'User role upgraded to CREATOR. Please confirm your email.',
      });
    }

    // If no user exists, create a new user
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

    const confirmationUrl = `${process.env.BACKEND_URL}/api/email/confirm-email?token=${emailConfirmationToken}`;
    console.log('Confirmation URL:', confirmationUrl);

    const message = `
      <h1>Confirm your email</h1>
      <p>Please confirm your email by clicking on the following link:</p>
      <a href="${confirmationUrl}">Confirm Email</a>
    `;

    await sendEmail(
      email,
      'Email Confirmation',
      'Please confirm your email',
      message
    );
    console.log('Confirmation email sent upon user creation');

    return res.status(201).json({
      message: 'User registered as a CREATOR. Please confirm your email.',
    });
  } catch (error) {
    console.error('Error registering creator:', error);
    next(createError(500, 'Error registering creator'));
  }
};

exports.userInteraction = async (req, res, next) => {
  try {
    const { telegramUserId, action, academyId } = req.body;

    let user = await prisma.user.findUnique({
      where: { telegramUserId },
      include: { bookmarkedAcademies: true },
    });

    if (!user) {
      // If the user doesn't exist and action is bookmark, create a new user with the bookmark.
      if (action === 'bookmark') {
        user = await prisma.user.create({
          data: {
            telegramUserId,
            role: 'USER',
            bookmarkedAcademies: { connect: { id: parseInt(academyId, 10) } }, // Initial bookmark
          },
          include: { bookmarkedAcademies: true },
        });
      } else {
        return res
          .status(400)
          .json({ message: 'Invalid action for non-existent user.' });
      }
    } else if (action === 'bookmark') {
      const alreadyBookmarked = user.bookmarkedAcademies.some(
        (academy) => academy.id === parseInt(academyId, 10)
      );

      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          bookmarkedAcademies: alreadyBookmarked
            ? { disconnect: { id: parseInt(academyId, 10) } } // Remove bookmark
            : { connect: { id: parseInt(academyId, 10) } }, // Add bookmark
        },
        include: { bookmarkedAcademies: true },
      });
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

exports.toggleBookmark = async (req, res, next) => {
  const { userId } = req.user;
  const { academyId } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { bookmarkedAcademies: true },
    });

    const alreadyBookmarked = user.bookmarkedAcademies.some(
      (academy) => academy.id === parseInt(academyId, 10)
    );

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        bookmarkedAcademies: alreadyBookmarked
          ? { disconnect: { id: parseInt(academyId, 10) } }
          : { connect: { id: parseInt(academyId, 10) } },
      },
      include: { bookmarkedAcademies: true },
    });

    res.json(updatedUser.bookmarkedAcademies);
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    next(createError(500, 'Error toggling bookmark'));
  }
};

exports.getBookmarkedAcademies = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId, 10) },
      include: {
        bookmarkedAcademies: true, // Ensure this is included
      },
    });

    if (!user) {
      return next(createError(404, 'User not found'));
    }

    res.json(user.bookmarkedAcademies); // Return the bookmarked academies directly
  } catch (error) {
    console.error('Error fetching bookmarked academies:', error);
    next(createError(500, 'Error fetching bookmarked academies'));
  }
};

exports.completeVerificationTask = async (req, res, next) => {
  const { taskId, twitterHandle } = req.body;
  const userId = req.user.id;

  try {
    const verificationTask = await prisma.verificationTask.findUnique({
      where: { id: taskId },
    });

    if (!verificationTask) {
      return next(createError(404, 'Verification task not found'));
    }

    const isVerified = await performVerification(verificationTask, req.user, {
      twitterHandle,
    });

    if (isVerified) {
      // Check if task already completed
      const existingCompletion = await prisma.userVerification.findFirst({
        where: {
          userId,
          verificationTaskId: taskId,
          verified: true,
        },
      });

      if (existingCompletion && verificationTask.intervalType === 'ONETIME') {
        return res.status(400).json({ message: 'Task already completed' });
      }

      // Record the completion
      await prisma.userVerification.create({
        data: {
          userId,
          verificationTaskId: taskId,
          verified: true,
          pointsAwarded: verificationTask.xp,
          completedAt: new Date(),
        },
      });

      // Update user's points
      await prisma.point.create({
        data: {
          userId,
          value: verificationTask.xp,
          verificationTaskId: taskId,
        },
      });

      res.json({
        message: 'Task completed successfully',
        pointsAwarded: verificationTask.xp,
      });
    } else {
      res.status(400).json({
        message:
          'Verification failed. Please ensure you have tweeted the correct message.',
      });
    }
  } catch (error) {
    console.error('Error completing verification task:', error);
    next(createError(500, 'Error completing verification task'));
  }
};

exports.getCurrentUser = async (req, res, next) => {
  try {
    const { telegramUserId } = req.user;
    const user = await prisma.user.findUnique({
      where: { telegramUserId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.handleLoginStreak = async (req, res, next) => {
  const telegramUserId = req.headers['x-telegram-user-id'];

  if (!telegramUserId) {
    return next(createError(400, 'Telegram User ID is required'));
  }

  try {
    // Find the user by telegramUserId
    const user = await prisma.user.findUnique({
      where: { telegramUserId: parseInt(telegramUserId, 10) },
    });

    if (!user) {
      return next(createError(404, 'User not found'));
    }

    const userId = user.id;

    // The rest of your login streak logic remains the same
    // Find the Daily Login Streak task
    const verificationTask = await prisma.verificationTask.findFirst({
      where: {
        name: 'Daily Login Streak',
      },
    });

    if (!verificationTask) {
      return next(createError(404, 'Daily Login Streak task not found'));
    }

    // Get current date
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Find existing UserVerification
    let userVerification = await prisma.userVerification.findFirst({
      where: {
        userId: userId,
        verificationTaskId: verificationTask.id,
      },
    });

    if (userVerification) {
      const lastLoginDate = userVerification.lastLoginDate;

      if (lastLoginDate) {
        const lastLogin = new Date(lastLoginDate);

        // Check if last login was yesterday
        if (
          lastLogin.getFullYear() === yesterday.getFullYear() &&
          lastLogin.getMonth() === yesterday.getMonth() &&
          lastLogin.getDate() === yesterday.getDate()
        ) {
          // Continue streak
          const newStreakCount = userVerification.streakCount + 1;
          const newPointsAwarded = Math.floor(
            userVerification.pointsAwarded * 1.5
          );
          userVerification = await prisma.userVerification.update({
            where: { id: userVerification.id },
            data: {
              streakCount: newStreakCount,
              pointsAwarded: newPointsAwarded,
              lastLoginDate: today,
            },
          });
        } else if (
          lastLogin.getFullYear() === today.getFullYear() &&
          lastLogin.getMonth() === today.getMonth() &&
          lastLogin.getDate() === today.getDate()
        ) {
          // Already logged in today
          return res.json({
            message: 'Already logged in today',
            userVerification,
          });
        } else {
          // Reset streak
          userVerification = await prisma.userVerification.update({
            where: { id: userVerification.id },
            data: {
              streakCount: 1,
              pointsAwarded: 100,
              lastLoginDate: today,
            },
          });
        }
      } else {
        // No lastLoginDate, reset streak
        userVerification = await prisma.userVerification.update({
          where: { id: userVerification.id },
          data: {
            streakCount: 1,
            pointsAwarded: 100,
            lastLoginDate: today,
          },
        });
      }
    } else {
      // Create new UserVerification
      userVerification = await prisma.userVerification.create({
        data: {
          userId: userId,
          verificationTaskId: verificationTask.id,
          pointsAwarded: 100,
          streakCount: 1,
          lastLoginDate: today,
        },
      });
    }

    // Create a new Point record
    const point = await prisma.point.create({
      data: {
        value: userVerification.pointsAwarded,
        userId: userId,
        verificationTaskId: verificationTask.id,
      },
    });

    res.json({ userVerification, point });
  } catch (error) {
    console.error('Error handling login streak:', error);
    next(createError(500, 'Internal Server Error'));
  }
};
