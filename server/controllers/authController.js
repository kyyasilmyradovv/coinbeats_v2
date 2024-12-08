// server/controllers/authController.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const createError = require('http-errors');
const crypto = require('crypto');
const axios = require('axios');
const OAuth = require('oauth').OAuth;
const { URLSearchParams } = require('url');

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

      // Initialize referringUser variable
      let referringUser = null;

      // Prepare new user data
      const newUserData = {
        telegramUserId,
        name: username,
        roles: ['USER'], // Initialize roles as ['USER']
        referralCode: newReferralCode,
        referralCompletionChecked: true, // Default value, may change if referred
      };

      // If referral code is provided, find the referring user
      if (referralCode) {
        referringUser = await prisma.user.findUnique({
          where: { referralCode },
        });

        if (referringUser) {
          newUserData.referredByUserId = referringUser.id;
          newUserData.referralCompletionChecked = false; // Set to false when referred
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
          (referringUser.id === 3 ||
            referringUser.referralCode === 'f1174622ac83f36c')
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

          // TODO: ask Timo about it because i cant check it
          // if (xpAwarded > 99) {
          //   await prisma.raffle.create({
          //     data: {
          //       userId: user?.id,
          //       amount: xpAwarded / 100,
          //       taskId: verificationTask.id,
          //     },
          //   });
          //   await prisma.user.update({
          //     where: { id: user?.id },
          //     data: { raffleAmount: { increment: xpAwarded / 100 } },
          //   });
          // }

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
          // Regular case: create UserVerification entry for the referring user, but do not award XP yet
          console.log('Referring user ID:', user.referredByUserId);

          // Create UserVerification record for the referring user, with verified = false
          await prisma.userVerification.create({
            data: {
              userId: referringUser.id,
              verificationTaskId: verificationTask.id,
              verified: false,
              pointsAwarded: 0,
              createdAt: new Date(),
            },
          });
          console.log(
            'UserVerification record created for referring user, pending verification.'
          );
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

// Start Twitter OAuth 2.0 Flow with twitter sdk
exports.twitterStart = (req, res, next) => {
  try {
    const codeVerifier = crypto.randomBytes(64).toString('hex');
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');
    const telegramUserId = req.query.telegramUserId;
    const returnTo = req.query.returnTo;

    console.log('This is telegram user', telegramUserId);

    if (!telegramUserId) {
      return next(createError(400, 'Telegram user ID is required'));
    }

    // Create a payload containing necessary data
    const payload = {
      state: crypto.randomBytes(16).toString('hex'),
      codeVerifier,
      telegramUserId,
      returnTo,
    };

    // Sign the payload to prevent tampering
    const stateToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '10m' });

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.TWITTER_CLIENT_ID,
      redirect_uri: `${process.env.BACKEND_URL}/api/auth/twitter/callback`,
      scope: 'tweet.read users.read follows.read offline.access',
      state: stateToken, // Use the signed token as the state parameter
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    res.redirect(
      `https://mobile.x.com/i/oauth2/authorize?${params.toString()}`
    );
  } catch (error) {
    console.error('Error in twitterStart:', error);
    next(createError(500, 'Error initiating Twitter authentication'));
  }
};

// Handle Twitter OAuth 2.0 Callback
exports.twitterCallback = async (req, res, next) => {
  try {
    const { code, state } = req.query;

    if (!state || !code) {
      return next(createError(400, 'Invalid state or code parameter'));
    }

    // Verify and decode the state token
    let payload;
    try {
      payload = jwt.verify(state, JWT_SECRET);
    } catch (err) {
      console.error('Invalid state token:', err);
      return next(createError(400, 'Invalid state parameter'));
    }

    const { codeVerifier, telegramUserId, returnTo } = payload;

    if (!codeVerifier || !telegramUserId) {
      return next(createError(400, 'Missing codeVerifier or telegramUserId'));
    }

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.TWITTER_CLIENT_ID,
      redirect_uri: `${process.env.BACKEND_URL}/api/auth/twitter/callback`,
      code_verifier: codeVerifier,
      code: code,
    });

    const tokenResponse = await axios.post(
      'https://api.twitter.com/2/oauth2/token',
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: {
          username: process.env.TWITTER_CLIENT_ID,
          password: process.env.TWITTER_CLIENT_SECRET,
        },
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Fetch user info from Twitter API
    const userResponse = await axios.get('https://api.twitter.com/2/users/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      params: {
        'user.fields': 'id,username,name',
      },
    });

    const twitterUserId = userResponse.data.data.id;
    const twitterUsername = userResponse.data.data.username;

    // Convert telegramUserId to BigInt if necessary
    const telegramUserIdBigInt = BigInt(telegramUserId);

    // Find user in your database using telegramUserId
    const user = await prisma.user.findUnique({
      where: { telegramUserId: telegramUserIdBigInt },
    });

    if (!user) {
      console.error('User not found with Telegram ID:', telegramUserId);
      return next(createError(404, 'User not found'));
    }

    // Store the new Twitter account
    await prisma.twitterAccount.create({
      data: {
        userId: user.id,
        twitterUserId: twitterUserId,
        twitterUsername: twitterUsername,
        twitterAccessToken: access_token,
        twitterRefreshToken: refresh_token,
        twitterTokenExpiresAt: new Date(Date.now() + expires_in * 1000),
        connectedAt: new Date(),
      },
    });

    console.log('User connected with Twitter account:', twitterUsername);

    // Redirect back to Telegram Mini App using deep link
    const botUsername = 'CoinbeatsMiniApp_bot/miniapp'; // Replace with your bot's username
    const startAppParam = 'twitterAuthSuccess';

    // URL-encode the parameters if necessary
    const telegramDeepLink = `https://t.me/${botUsername}?startapp=${encodeURIComponent(
      startAppParam
    )}`;
    res.redirect(telegramDeepLink);
  } catch (error) {
    console.error(
      'Error in twitterCallback:',
      error.response?.data || error.message
    );
    next(createError(500, 'Authentication failed'));
  }
};
