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

/**
 * Get all users with additional details.
 */
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
      const subscriptionStatus = subscription ? 'Active' : 'Inactive';
      const subscriptionValidUntil =
        subscription &&
        subscription.subscription &&
        subscription.subscription.endDate
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

/**
 * Get user details by user ID.
 */
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
      subscription &&
      subscription.subscription &&
      subscription.subscription.endDate
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

/**
 * Create a new user with specified roles.
 */
exports.createUser = async (req, res, next) => {
  const { name, email, password, roles } = req.body; // 'roles' is now an array

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, roles },
    });

    res.json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    next(createError(500, 'Error creating user'));
  }
};

/**
 * Delete a user by user ID.
 */
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

/**
 * Get a user by Telegram ID.
 */
exports.getUserByTelegramId = async (req, res, next) => {
  let telegramUserId = req.params.telegramUserId;
  try {
    console.log('Fetching user with Telegram ID:', telegramUserId);

    // Convert telegramUserId to BigInt
    telegramUserId = BigInt(telegramUserId);

    const user = await prisma.user.findUnique({
      where: { telegramUserId },
      include: {
        points: true,
        academies: true, // Include academies in the response
      },
    });

    if (!user) {
      console.log('User not found:', telegramUserId.toString());
      return next(createError(404, 'User not found'));
    }

    const totalPoints = user.points.reduce(
      (sum, point) => sum + point.value,
      0
    );
    const hasAcademy = user.academies.length > 0;

    const response = {
      ...user,
      totalPoints,
      hasAcademy,
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching user:', error);
    next(createError(500, 'Error fetching user'));
  }
};

/**
 * Update a user's roles.
 */
exports.updateUserRoles = async (req, res, next) => {
  const { userId, newRoles } = req.body; // 'newRoles' is an array

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { roles: { set: newRoles } },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating roles:', error);
    next(createError(500, 'Error updating roles'));
  }
};

/**
 * Register a user as a creator.
 */
exports.registerCreator = async (req, res, next) => {
  try {
    let { telegramUserId, name, email, password } = req.body;
    console.log('Starting registration process...');

    // Convert telegramUserId to BigInt
    telegramUserId = BigInt(telegramUserId);

    // Check if a creator with the same email already exists
    const existingCreator = await prisma.user.findFirst({
      where: { email, roles: { has: 'CREATOR' } },
    });

    if (existingCreator) {
      console.log('Email already used by another creator:', email);
      return next(createError(409, 'Email is already used by another creator'));
    }

    // Check if a user with the given telegramUserId exists
    let user = await prisma.user.findUnique({ where: { telegramUserId } });

    if (user && user.roles.includes('CREATOR')) {
      console.log(
        'User already exists with Telegram ID and is a creator:',
        telegramUserId.toString()
      );
      return res
        .status(400)
        .json({ message: 'User with this Telegram ID is already a creator' });
    }

    if (user && user.roles.includes('USER')) {
      // Hash the new password before updating
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      console.log('Password hashed successfully');

      // Generate email confirmation token and send confirmation email
      const emailConfirmationToken = crypto.randomBytes(32).toString('hex');
      console.log(
        'Email confirmation token generated:',
        emailConfirmationToken
      );

      // Upgrade existing user's roles to include 'CREATOR'
      const updatedRoles = [...new Set([...user.roles, 'CREATOR'])];

      user = await prisma.user.update({
        where: { telegramUserId },
        data: {
          roles: { set: updatedRoles },
          email,
          password: hashedPassword,
          emailConfirmationToken,
        },
      });
      console.log(
        'User roles updated to include CREATOR with updated email and password:',
        telegramUserId.toString()
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
        message:
          'User roles updated to include CREATOR. Please confirm your email.',
      });
    }

    // If no user exists, create a new user with roles 'USER' and 'CREATOR'
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    console.log('Password hashed successfully');

    const emailConfirmationToken = crypto.randomBytes(32).toString('hex');
    console.log('Email confirmation token generated:', emailConfirmationToken);

    user = await prisma.user.create({
      data: {
        telegramUserId,
        name,
        email,
        password: hashedPassword,
        roles: ['USER', 'CREATOR'],
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

/**
 * Handle user interactions like bookmarking academies.
 */
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
            roles: ['USER'],
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

/**
 * Toggle bookmark for an academy.
 */
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

/**
 * Get bookmarked academies for a user.
 */
exports.getBookmarkedAcademies = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId, 10) },
      include: {
        bookmarkedAcademies: true,
      },
    });

    if (!user) {
      return next(createError(404, 'User not found'));
    }

    res.json(user.bookmarkedAcademies);
  } catch (error) {
    console.error('Error fetching bookmarked academies:', error);
    next(createError(500, 'Error fetching bookmarked academies'));
  }
};

const isSameDay = (d1, d2) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};
/**
 * Complete a verification task.
 */
exports.completeVerificationTask = async (req, res, next) => {
  const { taskId, userId } = req.body;

  if (!userId || !taskId) {
    return next(createError(400, 'User ID and Task ID are required'));
  }

  try {
    // Find user
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return next(createError(404, 'User not found'));
    }

    // Find the verification task
    const verificationTask = await prisma.verificationTask.findUnique({
      where: { id: taskId },
    });
    if (!verificationTask) {
      return next(createError(404, 'Verification task not found'));
    }

    // Check if the user has started this task (userVerification must exist)
    const userVerification = await prisma.userVerification.findFirst({
      where: { userId: user.id, verificationTaskId: taskId },
      orderBy: { completedAt: 'desc' },
    });

    // If no userVerification exists, return the message
    if (!userVerification) {
      return res.status(400).json({
        message:
          'You have not started this task yet. Please perform the task to verify.',
      });
    }

    // Handle ONETIME tasks (can only be completed once)
    if (verificationTask.intervalType === 'ONETIME') {
      if (userVerification.verified) {
        return res
          .status(400)
          .json({ message: 'This task can only be completed once.' });
      }
    }

    // Handle REPEATED tasks (can only be completed once per day)
    if (verificationTask.intervalType === 'REPEATED') {
      const now = new Date();
      const lastCompletionDate = userVerification
        ? new Date(userVerification.completedAt)
        : null;

      if (lastCompletionDate && isSameDay(now, lastCompletionDate)) {
        return res
          .status(400)
          .json({ message: 'This task can only be completed once per day.' });
      }
    }

    // Perform verification logic and mark the task as complete
    const isVerified = await performVerification(verificationTask, user, {
      userVerification,
    });

    if (isVerified) {
      await prisma.userVerification.update({
        where: { id: userVerification.id },
        data: {
          verified: true,
          completedAt: new Date(),
          pointsAwarded: verificationTask.xp,
        },
      });

      // Award points to the user
      await prisma.point.create({
        data: {
          userId: userId,
          value: verificationTask.xp,
          verificationTaskId: taskId,
        },
      });

      return res.json({
        message: 'Task completed successfully',
        pointsAwarded: verificationTask.xp,
      });
    } else {
      return res.status(400).json({
        message:
          'The tasks are manually confirmed. Come back in some time to verify.',
      });
    }
  } catch (error) {
    console.error('Error completing verification task:', error);
    next(createError(500, 'Error completing verification task'));
  }
};
/**
 * Get the current user based on authentication.
 */
exports.getCurrentUser = async (req, res, next) => {
  try {
    let { telegramUserId } = req.user;

    // Convert telegramUserId to BigInt
    telegramUserId = BigInt(telegramUserId);

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

/**
 * Handle login streak for a user.
 */
exports.handleLoginStreak = async (req, res, next) => {
  const telegramUserIdHeader = req.headers['x-telegram-user-id'];

  if (!telegramUserIdHeader) {
    return next(createError(400, 'Telegram User ID is required'));
  }

  try {
    // Convert telegramUserId to BigInt
    const telegramUserId = BigInt(telegramUserIdHeader);

    // Find the user by telegramUserId
    const user = await prisma.user.findUnique({
      where: { telegramUserId },
    });

    if (!user) {
      return next(createError(404, 'User not found'));
    }

    const userId = user.id;

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

          // Check if streak is less than or equal to 7
          let newPointsAwarded;
          if (newStreakCount <= 7) {
            newPointsAwarded = Math.floor(userVerification.pointsAwarded * 1.5);
          } else {
            // Keep pointsAwarded the same as on the 7th day
            newPointsAwarded = userVerification.pointsAwarded;
          }

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

exports.startVerificationTask = async (req, res, next) => {
  const { taskId, userId } = req.body; // Get userId from request body

  if (!userId) {
    return next(createError(400, 'User ID is required'));
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }, // Find user by userId
    });

    if (!user) {
      return next(createError(404, 'User not found'));
    }

    const verificationTask = await prisma.verificationTask.findUnique({
      where: { id: taskId },
    });

    if (!verificationTask) {
      return next(createError(404, 'Verification task not found'));
    }

    let userVerification = await prisma.userVerification.findFirst({
      where: {
        userId,
        verificationTaskId: taskId,
        verified: false,
      },
    });

    if (!userVerification) {
      userVerification = await prisma.userVerification.create({
        data: {
          userId,
          verificationTaskId: taskId,
          verified: false,
          createdAt: new Date(),
        },
      });
    }

    res.json({ message: 'Task started successfully' });
  } catch (error) {
    console.error('Error starting verification task:', error);
    next(createError(500, 'Error starting verification task'));
  }
};

exports.submitTask = async (req, res, next) => {
  const { taskId, submissionText, userId } = req.body; // Get userId from request body

  if (!userId || !taskId || !submissionText) {
    return next(
      createError(400, 'User ID, Task ID, and submission text are required')
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }, // Find user by userId
    });

    if (!user) {
      return next(createError(404, 'User not found'));
    }

    const verificationTask = await prisma.verificationTask.findUnique({
      where: { id: taskId },
    });

    if (!verificationTask) {
      return next(createError(404, 'Verification task not found'));
    }

    const submission = await prisma.userTaskSubmission.create({
      data: {
        userId,
        taskId,
        submissionText,
      },
    });

    res.json({ message: 'Submission received and will be verified' });
  } catch (error) {
    console.error('Error submitting task:', error);
    next(createError(500, 'Error submitting task'));
  }
};

exports.getUserVerificationTasks = async (req, res, next) => {
  console.log('Request body:', req.body); // Check if the userId is being received
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const userVerificationTasks = await prisma.userVerification.findMany({
      where: { userId: parseInt(userId, 10) },
      include: {
        verificationTask: true, // Include related task information
      },
    });

    if (userVerificationTasks.length === 0) {
      return res
        .status(404)
        .json({ message: 'No verification tasks found for this user.' });
    }

    res.json(userVerificationTasks);
  } catch (error) {
    console.error('Error fetching user verification tasks:', error);
    next(createError(500, 'Error fetching user verification tasks'));
  }
};

exports.checkReferralCompletion = async (req, res) => {
  const { userId } = req.params;

  try {
    // Find a point with academyId for the given user
    const userAcademyPoints = await prisma.point.findFirst({
      where: {
        userId: Number(userId),
        academyId: { not: null }, // Ensure it has an academyId
      },
    });

    if (userAcademyPoints) {
      // If the user has completed an academy, mark referralCompletionChecked as true
      await prisma.user.update({
        where: { id: Number(userId) },
        data: { referralCompletionChecked: true },
      });

      return res.json({ isReferralComplete: true });
    } else {
      return res.json({ isReferralComplete: false });
    }
  } catch (error) {
    console.error('Error checking referral completion:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
