const axios = require('axios');

const BRIAN_API_URL = 'https://api.brianknows.org/api/v0/agent';
const BRIAN_API_KEY = 'brian_D7FzZdWEsB3N8sges';

const brianService = {
  async interactWithAgent({ prompt, address, chainId, messages }) {
    const body = {
      prompt,
      address,
      messages,
      chainId,
    };

    try {
      const response = await axios({
        method: 'POST',
        url: BRIAN_API_URL,
        headers: {
          'X-Brian-Api-Key': BRIAN_API_KEY,
          'Content-Type': 'application/json',
        },
        data: body,
      });
      return response.data;
    } catch (error) {
      console.error(
        'Brian API error =>',
        error.response?.data || error.message
      );
      return { error: error.response?.data?.error || 'Brian API error' };
    }
  },

  // Example method if you wanted Twitter data
  async getTwitterTrends() {
    // For demonstration. You can implement your real method here.
    return [{ trending: '#Web3' }, { trending: '#Crypto' }];
  },
};

module.exports = brianService;
