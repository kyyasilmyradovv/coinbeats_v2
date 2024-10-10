// server/services/verificationService.js

const axios = require('axios');

const verifyTweet = async (verificationTask, user, params) => {
  const { twitterHandle } = params;
  if (!twitterHandle) {
    throw new Error('Twitter handle is required for tweet verification');
  }

  // Use Twitter API to search for the tweet
  const tweetText = verificationTask.description; // Assuming the task description contains the required tweet text

  // Get bearer token from environment variables
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;

  // Build the query to search for recent tweets from the user containing the text
  const query = `from:${twitterHandle} "${tweetText}"`;

  const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(
    query
  )}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    });

    const tweets = response.data.data;

    if (tweets && tweets.length > 0) {
      // The user has tweeted the required message
      return true;
    } else {
      // No matching tweets found
      return false;
    }
  } catch (error) {
    console.error('Error verifying tweet:', error);
    throw new Error('Error verifying tweet');
  }
};

// const performVerification = async (verificationTask, user, params) => {
//   const { userVerification } = params;

//   switch (verificationTask.verificationMethod) {
//     case 'TWEET':
//       if (verificationTask.shortCircuit) {
//         return await verifyShortCircuit(verificationTask, userVerification);
//       }
//       return await verifyTweet(verificationTask, user, params);
//     case 'FOLLOW_USER':
//       if (verificationTask.shortCircuit) {
//         return await verifyShortCircuit(verificationTask, userVerification);
//       }
//       return await verifyFollowUser(verificationTask, user, params);
//     // Add other methods...
//     default:
//       throw new Error('Unsupported verification method');
//   }
// };

const verifyFollowUser = async (verificationTask, user) => {
  // Implement API calls to X (Twitter) to verify if the user follows a specific account
};

// const verifyShortCircuit = async (verificationTask, userVerification) => {
//   const now = new Date();
//   const taskStartTime = new Date(userVerification.createdAt);
//   const elapsedTime = (now - taskStartTime) / 1000; // in seconds
//   const requiredTime = verificationTask.shortCircuitTimer || 0;

//   console.log(`Elapsed Time: ${elapsedTime}, Required Time: ${requiredTime}`);

//   if (elapsedTime >= requiredTime) {
//     return true;
//   } else {
//     return false;
//   }
// };

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

  // Proceed with short circuit verification logic if needed
  return await verifyShortCircuit(verificationTask, userVerification);
};

const verifyShortCircuit = async (verificationTask, userVerification) => {
  const now = new Date();
  const taskStartTime = new Date(userVerification.createdAt);
  const elapsedTime = (now - taskStartTime) / 1000; // in seconds

  // 1 hour delay in seconds
  const delay = 3600; // 1 hour = 3600 seconds

  // Log the time comparison for debugging
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

// Export the performVerification function
module.exports = {
  performVerification,
};
