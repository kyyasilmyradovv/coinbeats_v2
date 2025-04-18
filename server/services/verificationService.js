// server/services/verificationService.js

const axios = require('axios');
const { Client } = require('twitter-api-sdk');
const OAuth = require('oauth').OAuth;
const qs = require('qs'); // For query string formatting
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { URLSearchParams } = require('url');
// Helper function to get Twitter user ID by username
const getTwitterUserIdByUsername = async (username, client) => {
  try {
    const userResponse = await client.users.findUserByUsername(
      username.replace('@', ''),
      {
        'user.fields': ['id'],
      }
    );
    return userResponse.data.id;
  } catch (error) {
    console.error(
      'Error fetching Twitter user ID:',
      error.response?.data || error.message
    );
    throw new Error('Error fetching Twitter user ID');
  }
};

const verifyFollowUser = async (verificationTask, user) => {
  console.log('Starting verifyFollowUser...');
  console.log('Verification Task:', JSON.stringify(verificationTask, null, 2));

  // Ensure twitterAccount is included in user data
  if (!user.twitterAccount || user.twitterAccount.length === 0) {
    throw new Error('User has no linked Twitter accounts.');
  }

  const currentTwitterAccount = user.twitterAccount[0];

  if (
    !currentTwitterAccount ||
    !currentTwitterAccount.twitterUserId ||
    !currentTwitterAccount.twitterAccessToken
  ) {
    throw new Error('User is not authenticated with Twitter');
  }

  // Use the Twitter account details
  let twitterUserId = currentTwitterAccount.twitterUserId;
  let twitterAccessToken = currentTwitterAccount.twitterAccessToken;
  let twitterRefreshToken = currentTwitterAccount.twitterRefreshToken;
  let twitterTokenExpiresAt = currentTwitterAccount.twitterTokenExpiresAt;

  const usernameToFollow = verificationTask.parameters?.username;
  console.log('Username to follow:', usernameToFollow);

  if (!usernameToFollow) {
    throw new Error('Username to follow is not specified');
  }

  try {
    // Check if access token is expired
    const now = new Date();
    if (twitterTokenExpiresAt && now >= twitterTokenExpiresAt) {
      if (twitterRefreshToken) {
        console.log('Access token expired. Refreshing token...');
        twitterAccessToken = await refreshAccessToken(
          twitterRefreshToken,
          currentTwitterAccount
        );
      } else {
        throw new Error('No refresh token available to refresh access token');
      }
    }

    // Get the target user's ID
    const targetUsername = usernameToFollow.replace('@', '');
    console.log(`Fetching target user ID for username: ${targetUsername}`);

    // Prepare the request to get the target user's ID
    let url = `https://api.twitter.com/2/users/by/username/${targetUsername}`;
    let headers = {
      Authorization: `Bearer ${twitterAccessToken}`,
    };
    let params = {
      'user.fields': 'id',
    };

    console.log('Requesting target user ID with URL:', url);
    console.log('Headers:', headers);
    console.log('Params:', params);

    const targetUserResponse = await axios.get(url, {
      headers,
      params,
    });

    console.log('Target User Response:', targetUserResponse.data);

    const targetUserId = targetUserResponse.data.data.id;
    console.log('Target User ID:', targetUserId);

    if (!targetUserId) {
      throw new Error('Invalid username to follow');
    }

    console.log('Source User ID:', twitterUserId);

    // Fetch the list of users the source user is following
    let isFollowing = false;
    let paginationToken = undefined;
    const maxResults = 1000; // Maximum allowed by Twitter

    console.log('Starting to fetch following list...');
    do {
      url = `https://api.twitter.com/2/users/${twitterUserId}/following`;
      headers = {
        Authorization: `Bearer ${twitterAccessToken}`,
      };
      params = {
        max_results: maxResults,
        'user.fields': 'id',
      };
      if (paginationToken) {
        params.pagination_token = paginationToken;
      }

      console.log('Requesting following list with URL:', url);
      console.log('Headers:', headers);
      console.log('Params:', params);

      const followingResponse = await axios.get(url, {
        headers,
        params,
      });

      console.log(
        'Following Response:',
        JSON.stringify(followingResponse.data, null, 2)
      );

      const followingUsers = followingResponse.data.data || [];

      if (followingUsers.some((u) => u.id === targetUserId)) {
        console.log('Target user is being followed.');
        isFollowing = true;
        break;
      }

      paginationToken = followingResponse.data.meta?.next_token;
      console.log('Next Pagination Token:', paginationToken);
    } while (paginationToken);

    console.log('Is Following:', isFollowing);
    return isFollowing;
  } catch (error) {
    console.error(
      'Error verifying follow user:',
      error.response?.data || error.message || error
    );
    throw error;
  }
};

const refreshAccessToken = async (refreshToken, twitterAccount) => {
  try {
    const response = await axios.post(
      'https://api.twitter.com/2/oauth2/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.TWITTER_CLIENT_ID,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
          ).toString('base64')}`,
        },
      }
    );

    const {
      access_token,
      expires_in,
      refresh_token: newRefreshToken,
    } = response.data;

    // Update TwitterAccount with new tokens and expiration
    twitterAccount.twitterAccessToken = access_token;
    twitterAccount.twitterRefreshToken =
      newRefreshToken || twitterAccount.twitterRefreshToken;
    twitterAccount.twitterTokenExpiresAt = new Date(
      Date.now() + expires_in * 1000
    );

    // Save the updated token information to the database
    await prisma.twitterAccount.update({
      where: { id: twitterAccount.id },
      data: {
        twitterAccessToken: access_token,
        twitterRefreshToken: twitterAccount.twitterRefreshToken,
        twitterTokenExpiresAt: twitterAccount.twitterTokenExpiresAt,
      },
    });

    return access_token;
  } catch (error) {
    console.error(
      'Error refreshing access token:',
      error.response?.data || error.message
    );
    throw new Error('Failed to refresh access token');
  }
};

const verifyShortCircuit = async (verificationTask, userVerification) => {
  if (userVerification.shortCircuit) {
    // If the userVerification is set to shortCircuit, verify immediately
    return true;
  }

  // Existing logic for tasks with a global shortCircuit and timer
  const now = new Date();
  const taskStartTime = new Date(userVerification.createdAt);
  const elapsedTimeMillis = now - taskStartTime; // in milliseconds

  const delayMillis =
    (verificationTask.shortCircuitTimer || 0) * 60 * 60 * 1000; // Convert hours to milliseconds

  console.log(
    `Elapsed time: ${elapsedTimeMillis}ms, Required delay: ${delayMillis}ms`
  );

  if (elapsedTimeMillis >= delayMillis) {
    return true; // Task is verified
  } else {
    return false; // Task is not yet verified
  }
};

// Helper function to check if two dates are the same day
const isSameDay = (d1, d2) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

const verifyTweet = async (verificationTask, user, params) => {
  console.log('Starting verifyTweet...');

  // Ensure twitterAccount is included in user data
  if (!user.twitterAccount || user.twitterAccount.length === 0) {
    throw new Error('User has no linked Twitter accounts.');
  }

  const currentTwitterAccount = user.twitterAccount[0];

  if (
    !currentTwitterAccount ||
    !currentTwitterAccount.twitterUserId ||
    !currentTwitterAccount.twitterAccessToken
  ) {
    throw new Error('User is not authenticated with Twitter');
  }

  // Use the Twitter account details
  let twitterUserId = currentTwitterAccount.twitterUserId;
  let twitterAccessToken = currentTwitterAccount.twitterAccessToken;
  let twitterRefreshToken = currentTwitterAccount.twitterRefreshToken;
  let twitterTokenExpiresAt = currentTwitterAccount.twitterTokenExpiresAt;

  try {
    // Refresh access token if expired
    const now = new Date();
    if (twitterTokenExpiresAt && now >= twitterTokenExpiresAt) {
      if (twitterRefreshToken) {
        console.log('Access token expired. Refreshing token...');
        twitterAccessToken = await refreshAccessToken(
          twitterRefreshToken,
          currentTwitterAccount
        );
      } else {
        throw new Error('No refresh token available to refresh access token');
      }
    }

    // Fetch user's recent tweets from Twitter API
    const headers = {
      Authorization: `Bearer ${twitterAccessToken}`,
    };

    const paramsRequest = {
      'tweet.fields': 'created_at,text,entities',
      max_results: 100, // Adjust as needed
    };

    const url = `https://api.twitter.com/2/users/${twitterUserId}/tweets`;
    console.log('Fetching recent tweets with URL:', url);

    const tweetsResponse = await axios.get(url, {
      headers,
      params: paramsRequest,
    });
    const tweets = tweetsResponse.data.data || [];

    // Retrieve expected criteria from verificationTask and userVerification parameters
    const userVerificationParameters = params.userVerification.parameters || {};
    const taskParameters = verificationTask.parameters || {};

    const expectedKeywords = [];

    // For tasks with parameters.tweetText, use that as expected keyword
    if (taskParameters.tweetText) {
      expectedKeywords.push(taskParameters.tweetText);
    }

    // Also, include expectedKeyword from userVerification.parameters
    const expectedKeywordFromUserVerification =
      userVerificationParameters.expectedKeyword;
    if (expectedKeywordFromUserVerification) {
      expectedKeywords.push(expectedKeywordFromUserVerification);
    }

    const expectedMention = taskParameters.expectedMention;
    const expectedHashtag = taskParameters.expectedHashtag;

    console.log('Expected Keywords:', expectedKeywords);
    console.log('Expected Mention:', expectedMention);
    console.log('Expected Hashtag:', expectedHashtag);

    let matchedTweet = null;

    for (const tweet of tweets) {
      console.log('Evaluating Tweet:', tweet.text);

      let keywordsMatch = expectedKeywords.length > 0 ? false : true;
      let mentionMatch = expectedMention ? false : true;
      let hashtagMatch = expectedHashtag ? false : true;

      // Check for each condition: keywords, mentions, and hashtags
      if (expectedKeywords.length > 0) {
        keywordsMatch = expectedKeywords.every((keyword) => {
          const match = tweet.text
            .toLowerCase()
            .includes(keyword.toLowerCase());
          console.log(`Keyword "${keyword}" match:`, match);
          return match;
        });
      }

      if (expectedMention) {
        mentionMatch = tweet.entities?.mentions
          ? tweet.entities.mentions.some((mention) => {
              const match =
                mention.username.toLowerCase() ===
                expectedMention.toLowerCase();
              console.log(`Mention "${mention.username}" match:`, match);
              return match;
            })
          : false;
      }

      if (expectedHashtag) {
        hashtagMatch = tweet.entities?.hashtags
          ? tweet.entities.hashtags.some((hashtag) => {
              const match =
                hashtag.tag.toLowerCase() === expectedHashtag.toLowerCase();
              console.log(`Hashtag "${hashtag.tag}" match:`, match);
              return match;
            })
          : false;
      }

      console.log('keywordsMatch:', keywordsMatch);
      console.log('mentionMatch:', mentionMatch);
      console.log('hashtagMatch:', hashtagMatch);

      if (keywordsMatch && mentionMatch && hashtagMatch) {
        matchedTweet = tweet;
        console.log('Matched Tweet:', tweet.text);
        break;
      }
    }

    const isTweeted = !!matchedTweet;
    console.log('Is Tweeted:', isTweeted);

    if (!isTweeted) {
      throw new Error('Tweet not found matching the required criteria.');
    }

    return isTweeted;
  } catch (error) {
    console.error(
      'Error verifying tweet:',
      error.response?.data || error.message || error
    );

    if (error.response) {
      if (error.response.status === 429) {
        // Twitter API rate limit exceeded
        throw new Error('Twitter rate limit exceeded. Please try again later.');
      } else if (
        error.response.status === 401 ||
        error.response.status === 403
      ) {
        // Unauthorized or Forbidden
        throw new Error(
          'Twitter authentication failed. Please reconnect your Twitter account.'
        );
      } else {
        // Other Twitter API errors
        throw new Error('Twitter API error. Please try again later.');
      }
    } else if (
      error.message.includes('User is not authenticated with Twitter')
    ) {
      throw new Error('Please connect your Twitter account to proceed.');
    } else if (error.message.includes('Tweet not found')) {
      throw new Error(
        'Tweet matching the criteria was not found. Please ensure you have tweeted correctly.'
      );
    } else {
      // General error
      throw new Error('An unexpected error occurred. Please try again later.');
    }
  }
};

const verifyComment = async (verificationTask, user, params) => {
  console.log('Starting verifyComment...');

  // Ensure twitterAccount is included in user data
  if (!user.twitterAccount || user.twitterAccount.length === 0) {
    throw new Error('User has no linked Twitter accounts.');
  }

  const currentTwitterAccount = user.twitterAccount[0];

  if (
    !currentTwitterAccount ||
    !currentTwitterAccount.twitterUserId ||
    !currentTwitterAccount.twitterAccessToken
  ) {
    throw new Error('User is not authenticated with Twitter');
  }

  // Use the Twitter account details
  let twitterUserId = currentTwitterAccount.twitterUserId;
  let twitterAccessToken = currentTwitterAccount.twitterAccessToken;
  let twitterRefreshToken = currentTwitterAccount.twitterRefreshToken;
  let twitterTokenExpiresAt = currentTwitterAccount.twitterTokenExpiresAt;

  try {
    // Refresh access token if expired
    const now = new Date();
    if (twitterTokenExpiresAt && now >= twitterTokenExpiresAt) {
      if (twitterRefreshToken) {
        console.log('Access token expired. Refreshing token...');
        twitterAccessToken = await refreshAccessToken(
          twitterRefreshToken,
          currentTwitterAccount
        );
      } else {
        throw new Error('No refresh token available to refresh access token');
      }
    }

    // Fetch user's recent tweets from Twitter API
    const headers = {
      Authorization: `Bearer ${twitterAccessToken}`,
    };

    const paramsRequest = {
      'tweet.fields': 'referenced_tweets',
      max_results: 100, // Adjust as needed
    };

    const url = `https://api.twitter.com/2/users/${twitterUserId}/tweets`;
    console.log('Fetching recent tweets with URL:', url);

    const tweetsResponse = await axios.get(url, {
      headers,
      params: paramsRequest,
    });
    const tweets = tweetsResponse.data.data || [];

    // Retrieve the tweetId from task parameters
    const taskParameters = verificationTask.parameters || {};
    const targetTweetId = taskParameters.tweetId;

    if (!targetTweetId) {
      throw new Error('Target tweet ID is not specified in task parameters.');
    }

    console.log('Target Tweet ID:', targetTweetId);

    let replied = false;

    for (const tweet of tweets) {
      const referencedTweets = tweet.referenced_tweets || [];
      for (const refTweet of referencedTweets) {
        if (refTweet.type === 'replied_to' && refTweet.id === targetTweetId) {
          console.log('Found a reply to the target tweet:', tweet.text);
          replied = true;
          break;
        }
      }
      if (replied) {
        break;
      }
    }

    if (!replied) {
      throw new Error('Reply to the specified tweet not found.');
    }

    return replied;
  } catch (error) {
    console.error(
      'Error verifying comment:',
      error.response?.data || error.message || error
    );

    if (error.response) {
      if (error.response.status === 429) {
        // Twitter API rate limit exceeded
        throw new Error('Twitter rate limit exceeded. Please try again later.');
      } else if (
        error.response.status === 401 ||
        error.response.status === 403
      ) {
        // Unauthorized or Forbidden
        throw new Error(
          'Twitter authentication failed. Please reconnect your Twitter account.'
        );
      } else {
        // Other Twitter API errors
        throw new Error('Twitter API error. Please try again later.');
      }
    } else if (
      error.message.includes('User is not authenticated with Twitter')
    ) {
      throw new Error('Please connect your Twitter account to proceed.');
    } else if (
      error.message.includes('Reply to the specified tweet not found')
    ) {
      throw new Error(
        'Reply to the specified tweet not found. Please ensure you have replied correctly.'
      );
    } else {
      // General error
      throw new Error('An unexpected error occurred. Please try again later.');
    }
  }
};

const verifyRetweet = async (verificationTask, user, params) => {
  console.log('Starting verifyRetweet...');

  // Ensure twitterAccount is included in user data
  if (!user.twitterAccount || user.twitterAccount.length === 0) {
    throw new Error('User has no linked Twitter accounts.');
  }

  const currentTwitterAccount = user.twitterAccount[0];

  if (
    !currentTwitterAccount ||
    !currentTwitterAccount.twitterUserId ||
    !currentTwitterAccount.twitterAccessToken
  ) {
    throw new Error('User is not authenticated with Twitter');
  }

  // Use the Twitter account details
  let twitterUserId = currentTwitterAccount.twitterUserId;
  let twitterAccessToken = currentTwitterAccount.twitterAccessToken;
  let twitterRefreshToken = currentTwitterAccount.twitterRefreshToken;
  let twitterTokenExpiresAt = currentTwitterAccount.twitterTokenExpiresAt;

  try {
    // Refresh access token if expired
    const now = new Date();
    if (twitterTokenExpiresAt && now >= twitterTokenExpiresAt) {
      if (twitterRefreshToken) {
        console.log('Access token expired. Refreshing token...');
        twitterAccessToken = await refreshAccessToken(
          twitterRefreshToken,
          currentTwitterAccount
        );
      } else {
        throw new Error('No refresh token available to refresh access token');
      }
    }

    // Fetch user's recent tweets from Twitter API
    const headers = {
      Authorization: `Bearer ${twitterAccessToken}`,
    };

    const paramsRequest = {
      'tweet.fields': 'referenced_tweets',
      max_results: 100, // Adjust as needed
    };

    const url = `https://api.twitter.com/2/users/${twitterUserId}/tweets`;
    console.log('Fetching recent tweets with URL:', url);

    const tweetsResponse = await axios.get(url, {
      headers,
      params: paramsRequest,
    });
    const tweets = tweetsResponse.data.data || [];

    // Retrieve the tweetId from task parameters
    const taskParameters = verificationTask.parameters || {};
    const targetTweetId = taskParameters.tweetId;

    if (!targetTweetId) {
      throw new Error('Target tweet ID is not specified in task parameters.');
    }

    console.log('Target Tweet ID:', targetTweetId);

    let retweeted = false;

    for (const tweet of tweets) {
      const referencedTweets = tweet.referenced_tweets || [];
      for (const refTweet of referencedTweets) {
        if (refTweet.type === 'retweeted' && refTweet.id === targetTweetId) {
          console.log('Found a retweet of the target tweet:', tweet.text);
          retweeted = true;
          break;
        }
      }
      if (retweeted) {
        break;
      }
    }

    if (!retweeted) {
      throw new Error('Retweet of the specified tweet not found.');
    }

    return retweeted;
  } catch (error) {
    console.error(
      'Error verifying retweet:',
      error.response?.data || error.message || error
    );

    if (error.response) {
      if (error.response.status === 429) {
        // Twitter API rate limit exceeded
        throw new Error('Twitter rate limit exceeded. Please try again later.');
      } else if (
        error.response.status === 401 ||
        error.response.status === 403
      ) {
        // Unauthorized or Forbidden
        throw new Error(
          'Twitter authentication failed. Please reconnect your Twitter account.'
        );
      } else {
        // Other Twitter API errors
        throw new Error('Twitter API error. Please try again later.');
      }
    } else if (
      error.message.includes('User is not authenticated with Twitter')
    ) {
      throw new Error('Please connect your Twitter account to proceed.');
    } else if (
      error.message.includes('Retweet of the specified tweet not found')
    ) {
      throw new Error(
        'Retweet of the specified tweet not found. Please ensure you have retweeted correctly.'
      );
    } else {
      // General error
      throw new Error('An unexpected error occurred. Please try again later.');
    }
  }
};

const verifyMemeTweet = async (verificationTask, user, params) => {
  console.log('Starting verifyMemeTweet...');

  // Ensure twitterAccount is included in user data
  if (!user.twitterAccount || user.twitterAccount.length === 0) {
    throw new Error('User has no linked Twitter accounts.');
  }

  const currentTwitterAccount = user.twitterAccount[0];

  if (
    !currentTwitterAccount ||
    !currentTwitterAccount.twitterUserId ||
    !currentTwitterAccount.twitterAccessToken
  ) {
    throw new Error('User is not authenticated with Twitter');
  }

  // Use the Twitter account details
  let twitterUserId = currentTwitterAccount.twitterUserId;
  let twitterAccessToken = currentTwitterAccount.twitterAccessToken;
  let twitterRefreshToken = currentTwitterAccount.twitterRefreshToken;
  let twitterTokenExpiresAt = currentTwitterAccount.twitterTokenExpiresAt;

  try {
    // Refresh access token if expired
    const now = new Date();
    if (twitterTokenExpiresAt && now >= twitterTokenExpiresAt) {
      if (twitterRefreshToken) {
        console.log('Access token expired. Refreshing token...');
        twitterAccessToken = await refreshAccessToken(
          twitterRefreshToken,
          currentTwitterAccount
        );
      } else {
        throw new Error('No refresh token available to refresh access token');
      }
    }

    // Fetch user's recent tweets
    const headers = {
      Authorization: `Bearer ${twitterAccessToken}`,
    };

    const paramsRequest = {
      'tweet.fields': 'text',
      max_results: 100, // Adjust as needed
    };

    const url = `https://api.twitter.com/2/users/${twitterUserId}/tweets`;
    console.log('Fetching recent tweets with URL:', url);

    const tweetsResponse = await axios.get(url, {
      headers,
      params: paramsRequest,
    });
    const tweets = tweetsResponse.data.data || [];

    // Retrieve the tweetText from task parameters
    const taskParameters = verificationTask.parameters || {};
    const targetTweetText = taskParameters.tweetText;

    if (!targetTweetText) {
      throw new Error('Target tweet text is not specified in task parameters.');
    }

    console.log('Target Tweet Text:', targetTweetText);

    // Check if any tweet matches the target tweet text
    const matchingTweet = tweets.find(
      (tweet) => tweet.text.trim() === targetTweetText.trim()
    );

    if (!matchingTweet) {
      throw new Error('Tweet with the specified content not found.');
    }

    console.log('Matching Tweet Found:', matchingTweet.text);

    return true; // Verification successful
  } catch (error) {
    console.error(
      'Error verifying meme tweet:',
      error.response?.data || error.message || error
    );

    if (error.response) {
      if (error.response.status === 429) {
        // Twitter API rate limit exceeded
        throw new Error('Twitter rate limit exceeded. Please try again later.');
      } else if (
        error.response.status === 401 ||
        error.response.status === 403
      ) {
        // Unauthorized or Forbidden
        throw new Error(
          'Twitter authentication failed. Please reconnect your Twitter account.'
        );
      } else {
        // Other Twitter API errors
        throw new Error('Twitter API error. Please try again later.');
      }
    } else if (
      error.message.includes('User is not authenticated with Twitter')
    ) {
      throw new Error('Please connect your Twitter account to proceed.');
    } else if (
      error.message.includes('Tweet with the specified content not found')
    ) {
      throw new Error(
        'The required tweet was not found. Please ensure you posted the correct content and try again.'
      );
    } else {
      // General error
      throw new Error('An unexpected error occurred. Please try again later.');
    }
  }
};

const verifyAddToBio = async (verificationTask, user) => {
  console.log('Starting verifyAddToBio...');

  // Ensure twitterAccount is included in user data
  if (!user.twitterAccount || user.twitterAccount.length === 0) {
    throw new Error('User has no linked Twitter accounts.');
  }

  const currentTwitterAccount = user.twitterAccount[0];

  if (
    !currentTwitterAccount ||
    !currentTwitterAccount.twitterUserId ||
    !currentTwitterAccount.twitterAccessToken
  ) {
    throw new Error('User is not authenticated with Twitter');
  }

  // Use the Twitter account details
  let twitterAccessToken = currentTwitterAccount.twitterAccessToken;
  let twitterRefreshToken = currentTwitterAccount.twitterRefreshToken;
  let twitterTokenExpiresAt = currentTwitterAccount.twitterTokenExpiresAt;

  try {
    // Refresh access token if expired
    const now = new Date();
    if (twitterTokenExpiresAt && now >= twitterTokenExpiresAt) {
      if (twitterRefreshToken) {
        console.log('Access token expired. Refreshing token...');
        twitterAccessToken = await refreshAccessToken(
          twitterRefreshToken,
          currentTwitterAccount
        );
      } else {
        throw new Error('No refresh token available to refresh access token');
      }
    }

    // Fetch user's profile from Twitter API
    const headers = {
      Authorization: `Bearer ${twitterAccessToken}`,
    };

    const paramsRequest = {
      'user.fields': 'description',
    };

    const url = `https://api.twitter.com/2/users/me`;
    console.log('Fetching user profile with URL:', url);

    const profileResponse = await axios.get(url, {
      headers,
      params: paramsRequest,
    });
    const userData = profileResponse.data.data;

    if (!userData || !userData.description) {
      throw new Error('Unable to retrieve user bio.');
    }

    const userBio = userData.description;
    console.log('User Bio:', userBio);

    // Retrieve the expected bio text from task parameters
    const taskParameters = verificationTask.parameters || {};
    const expectedBioText =
      taskParameters.expectedBioText || '@CoinBeatsxyz Student';

    console.log('Expected Bio Text:', expectedBioText);

    // Check if the user bio contains the expected text
    const bioContainsExpectedText = userBio
      .toLowerCase()
      .includes(expectedBioText.toLowerCase());

    if (!bioContainsExpectedText) {
      throw new Error(
        'The required bio text was not found. Please update your bio accordingly.'
      );
    }

    console.log('Bio verification successful.');
    return true; // Verification successful
  } catch (error) {
    console.error(
      'Error verifying bio:',
      error.response?.data || error.message || error
    );

    if (error.response) {
      if (error.response.status === 429) {
        // Twitter API rate limit exceeded
        throw new Error('Twitter rate limit exceeded. Please try again later.');
      } else if (
        error.response.status === 401 ||
        error.response.status === 403
      ) {
        // Unauthorized or Forbidden
        throw new Error(
          'Twitter authentication failed. Please reconnect your Twitter account.'
        );
      } else {
        // Other Twitter API errors
        throw new Error('Twitter API error. Please try again later.');
      }
    } else if (
      error.message.includes('User is not authenticated with Twitter')
    ) {
      throw new Error('Please connect your Twitter account to proceed.');
    } else if (error.message.includes('The required bio text was not found')) {
      throw new Error(
        'The required bio text was not found. Please update your bio accordingly.'
      );
    } else {
      // General error
      throw new Error('An unexpected error occurred. Please try again later.');
    }
  }
};

const performVerification = async (verificationTask, user, params) => {
  const { userVerification } = params;

  // Check if the task is ONETIME and already completed
  if (verificationTask.intervalType === 'ONETIME') {
    if (userVerification && userVerification.verified) {
      throw new Error('This task has already been completed.');
    }
  }

  // Check if the task is REPEATED and interval has not passed
  if (verificationTask.intervalType === 'REPEATED') {
    const now = new Date();
    const lastCompletionDate = userVerification
      ? new Date(userVerification.completedAt)
      : null;

    // Check against repeat interval for REPEATED tasks
    if (lastCompletionDate && userVerification.verified) {
      const intervalMillis =
        verificationTask.repeatInterval * 24 * 60 * 60 * 1000; // repeatInterval in days
      if (now - lastCompletionDate < intervalMillis) {
        throw new Error(
          'This task has already been completed in the current interval.'
        );
      }
    }
  }

  // **Check `shortCircuit` before proceeding**
  if (verificationTask.shortCircuit || userVerification.shortCircuit) {
    const isVerified = await verifyShortCircuit(
      verificationTask,
      userVerification
    );
    if (isVerified) {
      return true;
    } else {
      throw new Error(
        'These tasks are manually verified. Come back in a few hours to verify.'
      );
    }
  }

  // Proceed with task verification based on method
  switch (verificationTask.verificationMethod) {
    case 'TWEET':
      return await verifyTweet(verificationTask, user, params);
    case 'FOLLOW_USER':
      return await verifyFollowUser(verificationTask, user);
    case 'COMMENT_ON_TWEET':
      return await verifyComment(verificationTask, user, params);
    case 'RETWEET':
      return await verifyRetweet(verificationTask, user, params);
    case 'MEME_TWEET':
      return await verifyMemeTweet(verificationTask, user, params);
    case 'ADD_TO_BIO':
      return await verifyAddToBio(verificationTask, user);
    case 'LEAVE_FEEDBACK':
      return true; // Feedback is auto-verified
    default:
      throw new Error('Unsupported verification method');
  }
};

// Export the performVerification function
module.exports = {
  performVerification,
  verifyTweet,
};
