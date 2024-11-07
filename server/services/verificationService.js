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

// const verifyFollowUser = async (verificationTask, user) => {
//   console.log('Starting verifyFollowUser...');
//   console.log('Verification Task:', verificationTask);
//   console.log('User:', user);

//   if (!user.twitterUserId || !user.twitterAccessToken) {
//     throw new Error('User is not authenticated with Twitter');
//   }

//   const usernameToFollow = verificationTask.parameters?.username;
//   console.log('Username to follow:', usernameToFollow);

//   if (!usernameToFollow) {
//     throw new Error('Username to follow is not specified');
//   }

//   try {
//     // Initialize the Twitter API client with the user's access token
//     console.log('Initializing Twitter Client with user access token...');
//     const client = new Client(user.twitterAccessToken);

//     // Step 1: Get the target user's ID by username
//     const targetUsername = usernameToFollow.replace('@', '');
//     console.log(`Fetching target user ID for username: ${targetUsername}`);
//     const targetUserResponse = await client.users.findUserByUsername(
//       targetUsername,
//       {
//         'user.fields': ['id'],
//       }
//     );
//     console.log('Target User Response:', targetUserResponse);

//     const targetUserId = targetUserResponse.data.id;
//     console.log('Target User ID:', targetUserId);

//     if (!targetUserId) {
//       throw new Error('Invalid username to follow');
//     }

//     const sourceUserId = user.twitterUserId;
//     console.log('Source User ID:', sourceUserId);

//     // Step 2: Fetch the source user's following list
//     let isFollowing = false;
//     let paginationToken = undefined;
//     let pageCount = 0;

//     console.log('Starting to fetch following list...');
//     do {
//       console.log(`Fetching following page ${++pageCount}...`);
//       const followingResponse = await client.users.usersIdFollowing(
//         sourceUserId,
//         {
//           max_results: 1000,
//           pagination_token: paginationToken,
//           'user.fields': ['id'],
//         }
//       );
//       console.log('Following Response:', followingResponse);

//       const followingUsers = followingResponse.data || [];
//       console.log(`Number of users fetched: ${followingUsers.length}`);

//       // Check if the target user is in the current page of following users
//       if (followingUsers.some((u) => u.id === targetUserId)) {
//         console.log('Target user is being followed.');
//         isFollowing = true;
//         break;
//       }

//       // Update pagination token for next loop iteration
//       paginationToken = followingResponse.meta?.next_token;
//       console.log('Next Pagination Token:', paginationToken);
//     } while (paginationToken);

//     console.log('Is Following:', isFollowing);
//     return isFollowing;
//   } catch (error) {
//     console.error(
//       'Error verifying follow user:',
//       error.response?.data || error.message || error
//     );
//     throw error;
//   }
// };

// Twitter v1.1 endpoint with twitter sdk
// const verifyFollowUser = async (verificationTask, user) => {
//   console.log('Starting verifyFollowUser...');
//   console.log('Verification Task:', verificationTask);
//   console.log('User:', user);

//   const client = new Client(process.env.BEARER_TOKEN);

//   const response = await client.users.usersIdFollowers('1452634632936099841', {
//     max_results: 1000,
//     'user.fields': ['name'],
//   });

//   console.log('response', JSON.stringify(response, null, 2));

//   if (
//     !user.twitterUserId ||
//     !user.twitterAccessToken ||
//     !user.twitterAccessTokenSecret
//   ) {
//     throw new Error('User is not authenticated with Twitter');
//   }

//   const usernameToFollow = verificationTask.parameters?.username;
//   console.log('Username to follow:', usernameToFollow);

//   if (!usernameToFollow) {
//     throw new Error('Username to follow is not specified');
//   }

//   try {
//     // Initialize OAuth
//     const oauth = new OAuth(
//       'https://api.twitter.com/oauth/request_token',
//       'https://api.twitter.com/oauth/access_token',
//       process.env.TWITTER_API_KEY,
//       process.env.TWITTER_API_SECRET_KEY,
//       '1.0A',
//       null,
//       'HMAC-SHA1'
//     );

//     // Prepare parameters
//     const source_screen_name = user.twitterUsername;
//     const target_screen_name = usernameToFollow.replace('@', '');

//     // Make API call to friendships/show.json
//     const url = `https://api.twitter.com/1.1/friendships/show.json?source_screen_name=${encodeURIComponent(
//       source_screen_name
//     )}&target_screen_name=${encodeURIComponent(target_screen_name)}`;

//     return new Promise((resolve, reject) => {
//       oauth.get(
//         url,
//         user.twitterAccessToken,
//         user.twitterAccessTokenSecret,
//         (error, data, response) => {
//           if (error) {
//             console.error('Error calling friendships/show:', error);
//             reject(new Error('Error verifying follow user'));
//           } else {
//             const friendship = JSON.parse(data);
//             const isFollowing = friendship.relationship.source.following;
//             console.log('Is Following:', isFollowing);
//             resolve(isFollowing);
//           }
//         }
//       );
//     });
//   } catch (error) {
//     console.error('Error verifying follow user:', error.message || error);
//     throw error;
//   }
// };

// twitter v2 flow with twitter sdk
// const verifyFollowUser = async (verificationTask, user) => {
//   if (!user.twitterUserId || !user.twitterAccessToken) {
//     throw new Error('User is not authenticated with Twitter');
//   }

//   const usernameToFollow = verificationTask.parameters?.username;
//   if (!usernameToFollow) {
//     throw new Error('Username to follow is not specified');
//   }

//   try {
//     // Check if access token is expired
//     const now = new Date();
//     if (user.twitterTokenExpiresAt && now >= user.twitterTokenExpiresAt) {
//       if (user.twitterRefreshToken) {
//         // Refresh the access token
//         user.twitterAccessToken = await refreshAccessToken(
//           user.twitterRefreshToken,
//           user
//         );
//       } else {
//         throw new Error('No refresh token available to refresh access token');
//       }
//     }

//     const client = new Client(user.twitterAccessToken);

//     // Get the target user's ID
//     const targetUsername = usernameToFollow.replace('@', '');
//     const targetUserResponse = await client.users.findUserByUsername(
//       targetUsername,
//       {
//         'user.fields': ['id'],
//       }
//     );
//     const targetUserId = targetUserResponse.data.id;

//     if (!targetUserId) {
//       throw new Error('Invalid username to follow');
//     }

//     const sourceUserId = user.twitterUserId;

//     // Fetch the list of users the source user is following
//     let isFollowing = false;
//     let paginationToken = undefined;

//     do {
//       const followingResponse = await client.users.usersIdFollowing(
//         sourceUserId,
//         {
//           max_results: 1000,
//           pagination_token: paginationToken,
//           'user.fields': ['id'],
//         }
//       );

//       const followingUsers = followingResponse.data || [];

//       if (followingUsers.some((u) => u.id === targetUserId)) {
//         isFollowing = true;
//         break;
//       }

//       paginationToken = followingResponse.meta?.next_token;
//     } while (paginationToken);

//     return isFollowing;
//   } catch (error) {
//     console.error(
//       'Error verifying follow user:',
//       error.response?.data || error.message || error
//     );
//     throw error;
//   }
// };

// // Function to refresh access token
// const refreshAccessToken = async (refreshToken, user) => {
//   const tokenUrl = 'https://api.twitter.com/2/oauth2/token';

//   const params = new URLSearchParams();
//   params.append('grant_type', 'refresh_token');
//   params.append('refresh_token', refreshToken);
//   params.append('client_id', process.env.TWITTER_CLIENT_ID);

//   try {
//     const response = await axios.post(tokenUrl, params.toString(), {
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//       },
//     });

//     const newAccessToken = response.data.access_token;
//     const newRefreshToken = response.data.refresh_token;
//     const expiresIn = response.data.expires_in;

//     // Update user's tokens and expiration time in the database
//     await prisma.user.update({
//       where: { id: user.id },
//       data: {
//         twitterAccessToken: newAccessToken,
//         twitterRefreshToken: newRefreshToken,
//         twitterTokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
//       },
//     });

//     return newAccessToken;
//   } catch (error) {
//     console.error(
//       'Error refreshing access token:',
//       error.response?.data || error.message
//     );
//     throw error;
//   }
// };

const verifyFollowUser = async (verificationTask, user) => {
  console.log('Starting verifyFollowUser...');
  console.log('Verification Task:', JSON.stringify(verificationTask, null, 2));

  // Handle BigInt serialization for the user object
  console.log(
    'User:',
    JSON.stringify(
      user,
      (key, value) => (typeof value === 'bigint' ? value.toString() : value),
      2
    )
  );

  if (!user.twitterUserId || !user.twitterAccessToken) {
    throw new Error('User is not authenticated with Twitter');
  }

  const usernameToFollow = verificationTask.parameters?.username;
  console.log('Username to follow:', usernameToFollow);

  if (!usernameToFollow) {
    throw new Error('Username to follow is not specified');
  }

  try {
    // Check if access token is expired
    const now = new Date();
    if (user.twitterTokenExpiresAt && now >= user.twitterTokenExpiresAt) {
      if (user.twitterRefreshToken) {
        // Refresh the access token
        console.log('Access token expired. Refreshing token...');
        user.twitterAccessToken = await refreshAccessToken(
          user.twitterRefreshToken,
          user
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
      Authorization: `Bearer ${user.twitterAccessToken}`,
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

    const sourceUserId = user.twitterUserId;
    console.log('Source User ID:', sourceUserId);

    // Fetch the list of users the source user is following
    let isFollowing = false;
    let paginationToken = undefined;
    const maxResults = 1000; // Maximum allowed by Twitter

    console.log('Starting to fetch following list...');
    do {
      url = `https://api.twitter.com/2/users/${sourceUserId}/following`;
      headers = {
        Authorization: `Bearer ${user.twitterAccessToken}`,
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

// Function to refresh access token

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

    const { access_token, expires_in } = response.data;

    // Update TwitterAccount with new token and expiration
    twitterAccount.twitterAccessToken = access_token;
    twitterAccount.twitterTokenExpiresAt = new Date(
      Date.now() + expires_in * 1000
    );

    // Save the updated token information to the database
    await prisma.twitterAccount.update({
      where: { id: twitterAccount.id },
      data: {
        twitterAccessToken: access_token,
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

// Add other verification methods as needed

const verifyShortCircuit = async (verificationTask, userVerification) => {
  const now = new Date();
  const taskStartTime = new Date(userVerification.createdAt);
  const elapsedTime = (now - taskStartTime) / 1000; // in seconds

  const delay = verificationTask.shortCircuitTimer || 0;

  console.log(`Elapsed time: ${elapsedTime}s, Required delay: ${delay}s`);

  if (elapsedTime >= delay) {
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

const performVerification = async (verificationTask, user, params) => {
  const { userVerification } = params;

  // Check if the task is ONETIME and already completed
  if (verificationTask.intervalType === 'ONETIME') {
    if (userVerification && userVerification.verified) {
      throw new Error('This task has already been completed.');
    }
  }

  // Check if the task is REPEATED and already completed today
  if (verificationTask.intervalType === 'REPEATED') {
    const now = new Date();
    const lastCompletionDate = userVerification
      ? new Date(userVerification.completedAt)
      : null;

    // Check against repeat interval for REPEATED tasks
    if (lastCompletionDate) {
      const intervalMillis = verificationTask.repeatInterval * 60 * 1000; // repeatInterval in minutes
      if (now - lastCompletionDate < intervalMillis) {
        throw new Error(
          'This task has already been completed in the current interval.'
        );
      }
    }
  }

  // Proceed with task verification based on method
  switch (verificationTask.verificationMethod) {
    case 'TWEET':
      return await verifyTweet(verificationTask, user, params);
    case 'FOLLOW_USER':
      return await verifyFollowUser(verificationTask, user);
    default:
      if (verificationTask.shortCircuit) {
        return await verifyShortCircuit(verificationTask, userVerification);
      } else {
        throw new Error('Unsupported verification method');
      }
  }
};

const verifyTweet = async (verificationTask, user, params) => {
  console.log('Starting verifyTweet...');

  // Get the user's connected Twitter account
  const currentTwitterAccount = user.twitterAccounts[0];

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
  let twitterAccessTokenSecret = currentTwitterAccount.twitterAccessTokenSecret;
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

    const expectedKeywords = taskParameters.expectedKeywords || [];
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

    return isTweeted;
  } catch (error) {
    console.error(
      'Error verifying tweet:',
      error.response?.data || error.message || error
    );
    throw error;
  }
};

// Export the performVerification function
module.exports = {
  performVerification,
  verifyTweet,
};
