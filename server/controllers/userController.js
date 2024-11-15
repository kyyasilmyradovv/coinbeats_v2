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
  const { taskId, userId, academyId } = req.body;

  if (!userId || !taskId) {
    return next(createError(400, 'User ID and Task ID are required'));
  }

  try {
    // Fetch user and include twitterAccounts
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        twitterAccount: {
          where: { disconnectedAt: null },
          orderBy: { connectedAt: 'desc' },
          take: 1,
        },
      },
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

    // Check if user started the task
    const userVerification = await prisma.userVerification.findFirst({
      where: {
        userId: user.id,
        verificationTaskId: taskId,
        academyId: academyId || undefined,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!userVerification) {
      return res.status(400).json({
        message:
          'You have not started this task yet. Please perform the task before verifying.',
      });
    }

    // Handle LEAVE_FEEDBACK tasks
    if (verificationTask.verificationMethod === 'LEAVE_FEEDBACK') {
      // Check if feedback submission exists
      const feedbackSubmission = await prisma.userTaskSubmission.findFirst({
        where: {
          userId,
          taskId,
        },
      });

      if (!feedbackSubmission) {
        return res.status(400).json({
          message: 'You have not submitted feedback yet.',
        });
      }

      return res.json({
        message: 'Feedback task already completed.',
      });
    }

    // For other tasks, proceed with verification

    // Fetch academy name if needed
    let academyName = null;
    if (academyId) {
      const academy = await prisma.academy.findUnique({
        where: { id: academyId },
      });
      academyName = academy?.name || null;
    }

    // Perform verification
    const isVerified = await performVerification(verificationTask, user, {
      userVerification,
      academyId,
      academyName,
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

      // Award points
      await prisma.point.create({
        data: {
          userId,
          value: verificationTask.xp,
          verificationTaskId: taskId,
          academyId: academyId || null,
        },
      });

      return res.json({
        message: 'Task completed successfully',
        pointsAwarded: verificationTask.xp,
      });
    } else {
      return res.status(400).json({
        message:
          'Verification failed. Please ensure you have completed the task.',
      });
    }
  } catch (error) {
    console.error('Error completing verification task:', error);

    // Send the error message back to the client
    if (error.message) {
      return res.status(400).json({ message: error.message });
    } else {
      next(createError(500, 'Error completing verification task'));
    }
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
  const { taskId, userId, academyId } = req.body;

  try {
    const verificationTask = await prisma.verificationTask.findUnique({
      where: { id: taskId },
    });
    if (!verificationTask) {
      return next(createError(404, 'Verification task not found'));
    }

    // Adjusted the handling of academyId here
    const existingVerification = await prisma.userVerification.findFirst({
      where: {
        userId: userId,
        verificationTaskId: taskId,
        academyId: academyId !== undefined ? academyId : null,
      },
    });

    if (existingVerification) {
      return res.status(400).json({ message: 'Task already started' });
    }

    let parameters = {};

    // Fetch academy name
    let academyName = null;
    if (academyId) {
      const academy = await prisma.academy.findUnique({
        where: { id: academyId },
      });
      if (academy) {
        academyName = academy.name;
      }
    }

    // For the TWEET verification method, save academyName as a parameter
    if (verificationTask.verificationMethod === 'TWEET') {
      if (academyName) {
        parameters.expectedKeyword = academyName; // Save the academy name as expectedKeyword
      }
      // No need to set parameters for task 4 as it already has tweetText in taskParameters
    }

    await prisma.userVerification.create({
      data: {
        userId: userId,
        verificationTaskId: taskId,
        academyId: academyId !== undefined ? academyId : null,
        parameters: parameters,
        createdAt: new Date(),
      },
    });

    res.json({ message: 'Task started successfully' });
  } catch (error) {
    console.error('Error starting verification task:', error);
    next(createError(500, 'Error starting verification task'));
  }
};

exports.submitTask = async (req, res, next) => {
  const { taskId, submissionText, userId } = req.body;

  if (!userId || !taskId || !submissionText) {
    return next(
      createError(400, 'User ID, Task ID, and submission text are required')
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    // Enforce minimum character length only for LEAVE_FEEDBACK tasks
    if (verificationTask.verificationMethod === 'LEAVE_FEEDBACK') {
      if (submissionText.length < 100) {
        return next(
          createError(400, 'Feedback must be at least 100 characters long.')
        );
      }
    }

    // Save the submission
    await prisma.userTaskSubmission.create({
      data: {
        userId,
        taskId,
        submissionText,
      },
    });

    if (verificationTask.verificationMethod === 'LEAVE_FEEDBACK') {
      // Check if the user has started the task
      const userVerification = await prisma.userVerification.findFirst({
        where: {
          userId,
          verificationTaskId: taskId,
          verified: false,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!userVerification) {
        return res.status(400).json({
          message:
            'You have not started this task yet. Please start the task before submitting feedback.',
        });
      }

      // Mark the task as completed and award points
      await prisma.userVerification.update({
        where: { id: userVerification.id },
        data: {
          verified: true,
          completedAt: new Date(),
          pointsAwarded: verificationTask.xp,
        },
      });

      // Award points
      await prisma.point.create({
        data: {
          userId,
          value: verificationTask.xp,
          verificationTaskId: taskId,
        },
      });

      return res.json({
        message: 'Feedback submitted successfully and points awarded.',
      });
    }

    // For other tasks, return a generic success message
    res.json({ message: 'Submission received and will be verified.' });
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

      // Fetch the user with referredByUserId
      const user = await prisma.user.findUnique({
        where: { id: Number(userId) },
        select: { referredByUserId: true },
      });

      if (user && user.referredByUserId) {
        // Fetch the referring user
        const referringUserId = user.referredByUserId;

        // Find the verification task
        const verificationTask = await prisma.verificationTask.findFirst({
          where: {
            verificationMethod: 'INVITE_TELEGRAM_FRIEND',
            taskType: 'PLATFORM_SPECIFIC',
          },
        });

        if (verificationTask) {
          const xpAwarded = verificationTask.xp;

          // Award XP to the referring user
          await prisma.point.create({
            data: {
              userId: referringUserId,
              value: xpAwarded,
              verificationTaskId: verificationTask.id,
            },
          });

          console.log('Point record created for referring user.');

          // Update UserVerification record for the referring user
          await prisma.userVerification.updateMany({
            where: {
              userId: referringUserId,
              verificationTaskId: verificationTask.id,
              verified: false,
            },
            data: {
              verified: true,
              pointsAwarded: xpAwarded,
              completedAt: new Date(),
            },
          });
          console.log('UserVerification record updated for referring user.');
        } else {
          console.error(
            'VerificationTask not found for INVITE_TELEGRAM_FRIEND'
          );
        }
      }

      return res.json({ isReferralComplete: true });
    } else {
      return res.json({ isReferralComplete: false });
    }
  } catch (error) {
    console.error('Error checking referral completion:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getTwitterAuthStatus = async (req, res, next) => {
  const telegramUserId = req.headers['x-telegram-user-id'];

  if (!telegramUserId) {
    return res.status(400).json({ error: 'Telegram user ID is required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        telegramUserId: BigInt(telegramUserId),
      },
      include: {
        twitterAccount: {
          where: {
            disconnectedAt: null,
          },
          orderBy: {
            connectedAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if twitterAccount exists and has at least one entry
    const currentTwitterAccount = user.twitterAccount?.[0] || null;

    const twitterAuthenticated = !!currentTwitterAccount;

    res.json({
      twitterAuthenticated,
      twitterUsername: currentTwitterAccount?.twitterUsername || null,
      twitterUserId: currentTwitterAccount?.twitterUserId || null,
    });
  } catch (error) {
    console.error('Error fetching Twitter authentication status:', error);
    next(createError(500, 'Error fetching Twitter authentication status'));
  }
};

/**
 * Remove the current Twitter account for the user.
 */
exports.removeTwitterAccount = async (req, res, next) => {
  const telegramUserId = req.headers['x-telegram-user-id'];

  if (!telegramUserId) {
    return res.status(400).json({ error: 'Telegram user ID is required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        telegramUserId: BigInt(telegramUserId),
      },
      include: {
        twitterAccount: {
          // Changed from TwitterAccount
          where: {
            disconnectedAt: null,
          },
          orderBy: {
            connectedAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!user || user.twitterAccount.length === 0) {
      return res
        .status(404)
        .json({ error: 'No connected Twitter account found' });
    }

    const currentTwitterAccount = user.twitterAccount[0];

    await prisma.twitterAccount.update({
      where: { id: currentTwitterAccount.id },
      data: { disconnectedAt: new Date() },
    });

    res.json({ message: 'Twitter account disconnected successfully' });
  } catch (error) {
    console.error('Error removing Twitter account:', error);
    next(createError(500, 'Error removing Twitter account'));
  }
};

exports.updateWalletAddresses = async (req, res, next) => {
  const { erc20WalletAddress, solanaWalletAddress, tonWalletAddress } =
    req.body;
  const telegramUserIdHeader = req.headers['x-telegram-user-id'];

  if (!telegramUserIdHeader) {
    return res.status(400).json({ error: 'Telegram User ID is required' });
  }

  try {
    const telegramUserId = BigInt(telegramUserIdHeader);

    const user = await prisma.user.findUnique({
      where: { telegramUserId },
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found. Please complete an academy to register.',
      });
    }

    // Update the user's wallet addresses
    const updatedUser = await prisma.user.update({
      where: { telegramUserId },
      data: {
        erc20WalletAddress,
        solanaWalletAddress,
        tonWalletAddress,
      },
    });

    res.json({
      message: 'Wallet addresses updated successfully',
      walletAddresses: {
        erc20WalletAddress: updatedUser.erc20WalletAddress,
        solanaWalletAddress: updatedUser.solanaWalletAddress,
        tonWalletAddress: updatedUser.tonWalletAddress,
      },
    });
  } catch (error) {
    console.error('Error updating wallet addresses:', error);
    next(createError(500, 'Internal Server Error'));
  }
};
