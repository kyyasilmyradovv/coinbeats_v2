const fetch = require('node-fetch');

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

    const response = await fetch(BRIAN_API_URL, {
      method: 'POST',
      headers: {
        'X-Brian-Api-Key': BRIAN_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Brian API error =>', errorData);
      return { error: errorData.error || 'Brian API error' };
    }
    return response.json();
  },

  // Example method if you wanted Twitter data
  async getTwitterTrends() {
    // For demonstration. You can implement your real method here.
    return [{ trending: '#Web3' }, { trending: '#Crypto' }];
  },
};

module.exports = brianService;
