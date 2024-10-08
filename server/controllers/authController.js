// server/controllers/authController.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const createError = require('http-errors');
const crypto = require('crypto');

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret';

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      console.log('Invalid email or password for:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const tokenPayload = {
      id: user.id.toString(),
      roles: user.roles, // Include roles array
      telegramUserId: user.telegramUserId
        ? user.telegramUserId.toString()
        : null,
      email: user.email,
    };

    const accessToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign(tokenPayload, JWT_REFRESH_SECRET, {
      expiresIn: '7d',
    });

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

    const tokenPayload = {
      id: user.id,
      roles: user.roles, // Include roles array
      telegramUserId: user.telegramUserId,
      email: user.email,
    };

    // No need to convert to strings here because they are already strings in the token
    const newAccessToken = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: '1h',
    });
    console.log('Access token refreshed for user:', user.id);
    res.json({ accessToken: newAccessToken });
  });
};

exports.registerUser = async (req, res, next) => {
  let { telegramUserId, username, referralCode } = req.body;

  try {
    console.log('Registering user with Telegram ID:', telegramUserId);
    console.log('Referral code received:', referralCode);

    // Convert telegramUserId to BigInt
    telegramUserId = BigInt(telegramUserId);

    // Initialize variable to track points awarded to the new user
    let pointsAwardedToUser = 0;

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { telegramUserId },
    });

    if (!user) {
      // Generate a unique referral code for the new user
      const generateReferralCode = () => crypto.randomBytes(8).toString('hex');
      const newReferralCode = generateReferralCode();

      // Prepare new user data
      const newUserData = {
        telegramUserId,
        name: username,
        roles: ['USER'], // Initialize roles as ['USER']
        referralCode: newReferralCode,
      };

      // Initialize referringUser variable
      let referringUser = null;

      // If referral code is provided, find the referring user
      if (referralCode) {
        referringUser = await prisma.user.findUnique({
          where: { referralCode },
        });
        if (referringUser) {
          newUserData.referredByUserId = referringUser.id;
          console.log('Referring user found:', referringUser.id);
        } else {
          console.log('No user found with referral code:', referralCode);
        }
      } else {
        console.log('No referral code provided.');
      }

      // Create the new user
      user = await prisma.user.create({
        data: newUserData,
      });
      console.log('New user created with ID:', user.id);

      // Find the verification task
      const verificationTask = await prisma.verificationTask.findFirst({
        where: {
          verificationMethod: 'INVITE_TELEGRAM_FRIEND',
          taskType: 'PLATFORM_SPECIFIC',
        },
      });

      if (verificationTask) {
        const xpAwarded = verificationTask.xp;
        console.log('VerificationTask found:', verificationTask);
        console.log('XP to be awarded:', xpAwarded);

        // Check for special case: if the referring user is user with id 3 or referral code 'P0q6Z2t9'
        if (
          referringUser &&
          (referringUser.id === 3 || referringUser.referralCode === 'P0q6Z2t9')
        ) {
          console.log(
            'Special case: awarding XP to the new user instead of the referrer.'
          );

          // Award XP to the new user
          await prisma.point.create({
            data: {
              userId: user.id,
              value: xpAwarded,
              verificationTaskId: verificationTask.id,
            },
          });
          console.log('Point record created for new user.');

          // Create UserVerification record for the new user
          await prisma.userVerification.create({
            data: {
              userId: user.id,
              verificationTaskId: verificationTask.id,
              verified: true,
              pointsAwarded: xpAwarded,
              completedAt: new Date(),
            },
          });
          console.log('UserVerification record created for new user.');

          // Set points awarded to user
          pointsAwardedToUser = xpAwarded;
        } else if (referringUser && user.referredByUserId) {
          // Regular case: award XP to the referring user
          console.log('Referring user ID:', user.referredByUserId);

          // Create Point record for the referring user
          await prisma.point.create({
            data: {
              userId: user.referredByUserId,
              value: xpAwarded,
              verificationTaskId: verificationTask.id,
            },
          });
          console.log('Point record created for referring user.');

          // Create UserVerification record for the referring user
          await prisma.userVerification.create({
            data: {
              userId: user.referredByUserId,
              verificationTaskId: verificationTask.id,
              verified: true,
              pointsAwarded: xpAwarded,
              completedAt: new Date(),
            },
          });
          console.log('UserVerification record created for referring user.');
        } else {
          console.log('No referring user; no XP will be awarded');
        }
      } else {
        console.error('VerificationTask not found for INVITE_TELEGRAM_FRIEND');
      }
    } else {
      console.log('User already exists with Telegram ID:', telegramUserId);
    }

    // Fetch updated user data with points and bookmarks
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        points: true,
        bookmarkedAcademies: true,
        academies: true,
      },
    });

    // Return the user along with points awarded to the user
    res.json({ user: updatedUser, pointsAwardedToUser });
  } catch (error) {
    console.error('Error registering user:', error);
    next(createError(500, 'Error registering user'));
  }
};
