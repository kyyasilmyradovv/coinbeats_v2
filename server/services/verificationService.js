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

const performVerification = async (verificationTask, user) => {
  switch (verificationTask.verificationMethod) {
    case 'FOLLOW_USER':
      return await verifyFollowUser(verificationTask, user);
    case 'TWEET':
      return await verifyTweet(verificationTask, user, params);
    // ... Implement other methods
    case 'SHORT_CIRCUIT':
      return await verifyShortCircuit(verificationTask);
    default:
      throw new Error('Unsupported verification method');
  }
};

const verifyFollowUser = async (verificationTask, user) => {
  // Implement API calls to X (Twitter) to verify if the user follows a specific account
};

const verifyShortCircuit = async (verificationTask) => {
  if (verificationTask.shortCircuitTimer) {
    await new Promise((resolve) =>
      setTimeout(resolve, verificationTask.shortCircuitTimer * 1000)
    );
  }
  return true;
};

// Export the performVerification function
module.exports = {
  performVerification,
};
