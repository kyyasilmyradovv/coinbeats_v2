// server/services/verificationService.js

const axios = require('axios');

// Helper function to get Twitter user ID by username
const getTwitterUserIdByUsername = async (username, bearerToken) => {
  const url = `https://api.twitter.com/2/users/by/username/${username.replace(
    '@',
    ''
  )}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
      params: {
        'user.fields': 'id',
      },
    });

    const userData = response.data.data;
    return userData.id; // Return the user ID
  } catch (error) {
    console.error(
      'Error fetching Twitter user ID:',
      error.response ? error.response.data : error.message
    );
    throw new Error('Error fetching Twitter user ID');
  }
};

const verifyFollowUser = async (verificationTask, user) => {
  if (!user.twitterUserId || !user.twitterAccessToken) {
    throw new Error('User is not authenticated with Twitter');
  }

  const usernameToFollow = verificationTask.parameters?.username;
  if (!usernameToFollow) {
    throw new Error('Username to follow is not specified');
  }

  try {
    const targetUserId = await getTwitterUserIdByUsername(
      usernameToFollow,
      user.twitterAccessToken
    );

    if (!targetUserId) {
      throw new Error('Invalid username to follow');
    }

    const sourceUserId = user.twitterUserId;

    let isFollowing = false;
    let paginationToken = null;

    do {
      const url = `https://api.twitter.com/2/users/${sourceUserId}/following`;
      const params = {
        'user.fields': 'id',
        max_results: 1000,
      };
      if (paginationToken) {
        params.pagination_token = paginationToken;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${user.twitterAccessToken}`,
        },
        params,
      });

      const followingData = response.data;
      const followingUsers = followingData.data || [];

      // Check if the target user is in the current page of following users
      if (followingUsers.some((u) => u.id === targetUserId)) {
        isFollowing = true;
        break;
      }

      // Check for next page
      paginationToken = followingData.meta?.next_token;
    } while (paginationToken);

    return isFollowing;
  } catch (error) {
    console.error(
      'Error verifying follow user:',
      error.response?.data || error.message
    );
    throw error;
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
      // Task has already been completed
      throw new Error('This task has already been completed.');
    }
  }

  // Check if the task is REPEATED and already completed today
  if (verificationTask.intervalType === 'REPEATED') {
    const now = new Date();
    const lastCompletionDate = userVerification
      ? new Date(userVerification.completedAt)
      : null;

    // If the user has completed the task today, prevent further completion
    if (lastCompletionDate && isSameDay(now, lastCompletionDate)) {
      throw new Error('This task has already been completed today.');
    }
  }

  switch (verificationTask.verificationMethod) {
    case 'FOLLOW_USER':
      return await verifyFollowUser(verificationTask, user);
    // Add other methods as needed
    default:
      if (verificationTask.shortCircuit) {
        return await verifyShortCircuit(verificationTask, userVerification);
      } else {
        throw new Error('Unsupported verification method');
      }
  }
};

// Export the performVerification function
module.exports = {
  performVerification,
};
