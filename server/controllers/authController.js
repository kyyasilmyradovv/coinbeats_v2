// server/controllers/authController.js

const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const createError = require('http-errors');
const crypto = require('crypto');

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

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

exports.registerUser = async (req, res, next) => {
  const { telegramUserId, username, referralCode } = req.body;

  try {
    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { telegramUserId },
    });

    if (!user) {
      // Generate a unique referral code
      const generateReferralCode = () => crypto.randomBytes(8).toString('hex');
      const newReferralCode = generateReferralCode();

      // Prepare new user data
      const newUserData = {
        telegramUserId,
        name: username,
        role: 'USER',
        referralCode: newReferralCode,
      };

      // If referral code is provided, find the referring user
      if (referralCode) {
        const referringUser = await prisma.user.findUnique({
          where: { referralCode },
        });
        if (referringUser) {
          newUserData.referredByUserId = referringUser.id;
        }
      }

      // Create the new user
      user = await prisma.user.create({
        data: newUserData,
      });

      // Award XP to the referring user if applicable
      if (user.referredByUserId) {
        const xpAwarded = 50; // Or fetch from the task definition
        // Create Point record
        await prisma.point.create({
          data: {
            userId: user.referredByUserId,
            value: xpAwarded,
          },
        });
        // Create UserVerification record
        const verificationTask = await prisma.verificationTask.findFirst({
          where: {
            verificationMethod: 'INVITE_TELEGRAM_FRIEND',
            taskType: 'PLATFORM_SPECIFIC',
          },
        });
        if (verificationTask) {
          await prisma.userVerification.create({
            data: {
              userId: user.referredByUserId,
              verificationTaskId: verificationTask.id,
              verified: true,
              pointsAwarded: xpAwarded,
              completedAt: new Date(),
            },
          });
        }
      }
    }

    res.json(user);
  } catch (error) {
    console.error('Error registering user:', error);
    next(createError(500, 'Error registering user'));
  }
};
