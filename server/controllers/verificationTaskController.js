// controllers/verificationTaskController.js
const { PrismaClient } = require('@prisma/client');
const createError = require('http-errors');
const prisma = new PrismaClient();
const axios = require('axios');
const querystring = require('querystring');

// Create a new platform verification task (Admin/Platform)
exports.createVerificationTask = async (req, res, next) => {
  const { platform, description, points } = req.body;

  console.log('Received request to create a verification task');
  console.log(`Platform: ${platform}, Description: ${description}, Points: ${points}`);

  try {
    const task = await prisma.verificationTask.create({
      data: {
        platform,
        description,
        points,
      },
    });
    console.log('Verification task created successfully:', task);
    res.status(201).json({ task });
  } catch (error) {
    console.error('Error creating verification task:', error);
    next(createError(500, 'Failed to create verification task'));
  }
};

// Step 1: Redirect to Twitter OAuth for Authorization
exports.twitterLogin = (req, res) => {
  const client_id = process.env.TWITTER_CLIENT_ID;
  const redirect_uri = process.env.TWITTER_REDIRECT_URI;

  const authUrl = `https://twitter.com/i/oauth2/authorize?${querystring.stringify({
    response_type: 'code',
    client_id,
    redirect_uri,
    scope: 'tweet.read tweet.write',
    state: 'state',
    code_challenge: 'challenge',
    code_challenge_method: 'plain'
  })}`;

  console.log('Redirecting to Twitter login:', authUrl);
  res.redirect(authUrl);
};

// Step 2: Handle Twitter OAuth Callback and Get Access Token
exports.twitterCallback = async (req, res, next) => {
  const code = req.query.code;

  try {
    const response = await axios.post('https://api.twitter.com/2/oauth2/token', {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: process.env.TWITTER_REDIRECT_URI,
      client_id: process.env.TWITTER_CLIENT_ID,
      code_verifier: 'challenge'
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64')}`
      }
    });

    const { access_token } = response.data;
    console.log('Twitter Access Token received:', access_token);

    // Store access_token in session/database (mocked here)
    req.session.access_token = access_token;

    // Redirect user to the verification page or UI where they can verify tweets
    res.redirect(`/tweet-verification?access_token=${access_token}`);
  } catch (error) {
    console.error('Error during Twitter OAuth callback:', error.response ? error.response.data : error.message);
    next(createError(500, 'Twitter Authentication failed'));
  }
};

// Step 3: Verify if the user has completed the Twitter task
exports.verifyTwitterTask = async (req, res, next) => {
  const { userId, tweetId, taskId } = req.body;

  console.log('Received request to verify Twitter task');
  console.log(`User ID: ${userId}, Tweet ID: ${tweetId}, Task ID: ${taskId}`);

  try {
    // Call Twitter API to get the tweet details
    console.log(`Calling Twitter API for tweet ID: ${tweetId}`);
    const tweetResponse = await axios.get(`https://api.twitter.com/2/tweets/${tweetId}`, {
      headers: {
        Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
      },
    });
    const tweetText = tweetResponse.data.data.text;
    console.log('Tweet fetched successfully:', tweetText);

    // Fetch the verification task from the database
    console.log(`Fetching verification task with ID: ${taskId}`);
    const task = await prisma.verificationTask.findUnique({ where: { id: taskId } });

    if (!task) {
      console.error('Verification task not found');
      return next(createError(404, 'Verification task not found'));
    }

    // Check if the tweet text includes the required task description
    if (tweetText.includes(task.description)) {
      console.log('Tweet matches the verification task description, awarding points');
      
      await prisma.userVerification.update({
        where: { userId_verificationTaskId: { userId, verificationTaskId: taskId } },
        data: { verified: true, pointsAwarded: task.points },
      });
      res.json({ message: 'Tweet verified successfully', points: task.points });
    } else {
      console.error('Tweet content does not match the task description');
      res.status(400).json({ error: 'Tweet content does not match the task' });
    }
  } catch (error) {
    console.error('Error verifying tweet:', error);
    next(createError(500, 'Verification failed'));
  }
};

// Get all verification tasks
exports.getVerificationTasks = async (req, res, next) => {
  console.log('Fetching all verification tasks');

  try {
    const tasks = await prisma.verificationTask.findMany();
    console.log('Fetched verification tasks:', tasks);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching verification tasks:', error);
    next(createError(500, 'Failed to fetch verification tasks'));
  }
};
