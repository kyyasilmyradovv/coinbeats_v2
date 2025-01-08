const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// COIN-RANKING
const integrateCoinranking = async (offset) => {
  try {
    const url = 'https://api.coinranking.com/v2/coins';
    const response = await axios.get(url, {
      params: {
        limit: 100,
        offset: offset * 100,
      },
    });

    return response.data.data.coins;
  } catch (error) {
    console.error('Error fetching coins from Coinranking:', error.message);
    throw new Error(error.message);
  }
};

for (let i = 1; i < 10; i++) {
  integrateCoinranking(i)
    .then(async (data) => {
      for (let coin of data) {
        await prisma.coins.upsert({
          where: { name: coin?.name },
          update: {
            name: coin?.name,
            symbol: coin?.symbol,
            image: coin?.iconUrl,
            price: coin?.price,
            price_date: null,
            market_cap: coin?.marketCap,
            market_cup_rank: coin?.rank,
            listed_date: new Date(coin?.listedAt * 1000).toLocaleDateString(),
            contract_addresses: coin?.contractAddresses,
          },
          create: {
            name: coin?.name,
            symbol: coin?.symbol,
            image: coin?.iconUrl,
            price: coin?.price,
            price_date: null,
            market_cap: coin?.marketCap,
            market_cup_rank: coin?.rank,
            listed_date: new Date(coin?.listedAt * 1000).toLocaleDateString(),
            coinranking_uuid: coin?.uuid,
            contract_addresses: coin?.contractAddresses,
          },
        });
      }

      console.log(
        'Coins integrated successfully with Coinranking:',
        data?.length
      );
    })
    .catch((error) => {
      console.error('Failed to integrate coins with Coinranking:', error);
    });
}

// COIN-GECKO
const integrateCoingecko = async (page) => {
  try {
    const url =
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=100';
    const response = await axios.get(url, {
      headers: {
        accept: 'application/json',
        'x-cg-demo-api-key': 'CG-5DzvYu67MCjpgWvHnov2Dhnr',
      },
      params: {
        per_page: 100,
        page,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching coins from Coinranking:', error.message);
    throw new Error(error.message);
  }
};

for (let i = 1; i < 20; i++) {
  integrateCoingecko(i)
    .then(async (data) => {
      for (let coin of data) {
        let price_change_24h;
        if (coin?.price_change_24h) {
          price_change_24h = String(coin.price_change_24h)?.slice(0, 5);
          if (['-0.00', '0.000'].include(price_change_24h))
            price_change_24h = null;
        }

        await prisma.coins.upsert({
          where: {
            name: coin?.name,
          },
          update: {
            name: coin?.name,
            symbol: coin?.symbol,
            image: coin?.image,
            price: String(coin?.current_price),
            price_date: coin?.last_updated,
            market_cap: String(coin?.market_cap),
            market_cup_rank: coin?.market_cup_rank,
            ath: String(coin?.ath),
            ath_date: coin?.ath_date,
            atl: String(coin?.atl),
            atl_date: coin?.atl_date,
            price_change_24h,
            gecko_id: coin?.id,
          },
          create: {
            name: coin?.name,
            symbol: coin?.symbol,
            image: coin?.image,
            price: String(coin?.current_price),
            price_date: coin?.last_updated,
            market_cap: String(coin?.market_cap),
            market_cup_rank: coin?.market_cup_rank,
            ath: String(coin?.ath),
            ath_date: coin?.ath_date,
            atl: String(coin?.atl),
            atl_date: coin?.atl_date,
            price_change_24h,
            gecko_id: coin?.id,
          },
        });
      }

      console.log(
        'Coins integrated successfully with Coingecko:',
        data?.length
      );
    })
    .catch((error) => {
      console.error('Failed to integrate coins with Coingecko:', error);
    });
}
