// server/controllers/userController.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// server/controllers/userController.js

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        points: true, // Include points data
        sessionLogs: true, // Include session logs for session count
        academies: {
          include: {
            subscription: true, // Include subscription details
          },
        },
      },
    });

    // Map through users to calculate additional data
    const usersWithDetails = users.map(user => {
      // Calculate total points
      const totalPoints = user.points.reduce((sum, point) => sum + point.value, 0);

      // Count sessions
      const sessionCount = user.sessionLogs.length;

      // Determine subscription validity and status
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
    res.status(500).json({ error: 'Error fetching users' });
  }
};

exports.getUserDetailsById = async (req, res) => {
  const { userId } = req.params; // Retrieve userId from request parameters

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId, 10) }, // Fetch user by internal database ID
      include: {
        points: true, // Include user's points data
        sessionLogs: true, // Include session logs data
        academies: {
          include: {
            subscription: true, // Include subscription details
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' }); // Handle case where user is not found
    }

    // Calculate total points from user's points data
    const totalPoints = user.points.reduce((sum, point) => sum + point.value, 0);

    // Calculate session count from user's session logs
    const sessionCount = user.sessionLogs.length;

    // Determine subscription status and validity
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
    res.status(500).json({ error: 'Error fetching user' });
  }
};

exports.createUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
    });

    res.json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Error creating user' });
  }
};

exports.deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    await prisma.user.delete({
      where: { id: parseInt(userId, 10) },
    });
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Error deleting user' });
  }
};

exports.getUserByTelegramId = async (req, res) => {
  const telegramUserId = parseInt(req.params.telegramUserId, 10);
  try {
    const user = await prisma.user.findUnique({
      where: { telegramUserId },
      include: { points: true }, // Include points in the response
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate total points from the points relation
    const totalPoints = user.points.reduce((sum, point) => sum + point.value, 0);

    res.json({ ...user, totalPoints });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Error fetching user' });
  }
};

exports.updateUserRole = async (req, res) => {
  const { userId, newRole } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'Error updating role' });
  }
};

// Register user as creator
// server/controllers/userController.js

exports.registerCreator = async (req, res) => {
  try {
    const { telegramUserId, name, email, password } = req.body;

    // Check if user with the same email already exists as a CREATOR
    const existingCreator = await prisma.user.findFirst({
      where: {
        email: email,
        role: 'CREATOR',
      },
    });

    if (existingCreator) {
      return res.status(409).json({ error: 'Email is already used by another creator' });
    }

    // Check if user already exists with the given telegramUserId
    let user = await prisma.user.findUnique({ where: { telegramUserId } });

    if (user) {
      // Update role if necessary
      if (user.role !== 'CREATOR') {
        user = await prisma.user.update({
          where: { telegramUserId },
          data: { role: 'CREATOR', email }, // Update email if user is being promoted to CREATOR
        });
        return res.status(200).json({ message: 'User role updated to CREATOR', user });
      } else {
        return res.status(200).json({ message: 'User already has the CREATOR role' });
      }
    } else {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      // Create the user with the CREATOR role
      user = await prisma.user.create({
        data: {
          telegramUserId,
          name,
          email,
          password: hashedPassword,
          role: 'CREATOR',
        },
      });

      res.status(201).json({ message: 'User registered as a CREATOR', userId: user.id });
    }
  } catch (error) {
    console.error('Error registering creator:', error);
    res.status(500).json({ error: 'Error registering creator' });
  }
};

// Handle user interactions
exports.userInteraction = async (req, res) => {
  try {
    const { telegramUserId, action, name, email, password } = req.body;

    // Check if the user already exists
    let user = await prisma.user.findUnique({ where: { telegramUserId } });

    if (!user && (action === 'register_creator' || action === 'significant_action')) {
      // Create a user if a significant action is performed
      user = await prisma.user.create({
        data: {
          telegramUserId,
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
};
