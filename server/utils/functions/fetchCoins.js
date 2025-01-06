const axios = require('axios');

const fetchCoins = async () => {
  try {
    const api = 'https://api.coinranking.com/v2/coins';
    const response = await axios.get(api, {
      params: {
        limit: 1,
        offset: 0,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching coins:', error.message);
    throw new Error(error.message);
  }
};

fetchCoins()
  .then((data) => {
    console.log(
      'Coins data fetched successfully:',
      data.data.coins,
      data.data.coins.length
    );
  })
  .catch((error) => {
    console.error('Failed to fetch coins:', error);
  });
