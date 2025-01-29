const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// // COIN-GECKO
const integrateCoingecko = async (page) => {
  try {
    const url =
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=100';
    const response = await axios.get(url, {
      headers: {
        accept: 'application/json',
        'x-cg-demo-api-key': 'CG-zKSCDCPfgDJvuFjBv6Ww14Uy',
      },
      params: {
        per_page: 100,
        page,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching coins from Coingecko:', error.message);
    throw new Error(error.message);
  }
};

for (let i = 150; i < 170; i++) {
  integrateCoingecko(i)
    .then(async (data) => {
      for (let coin of data) {
        const data_ = {
          name: coin?.name,
          symbol: coin?.symbol,
          image: coin?.image,
          price: coin?.current_price,
          price_date: coin?.last_updated,
          fdv: coin?.fully_diluted_valuation,
          market_cap: coin?.market_cap,
          market_cap_rank: coin?.market_cap_rank,
          ath: coin?.ath,
          ath_date: coin?.ath_date,
          atl: coin?.atl,
          atl_date: coin?.atl_date,
          gecko_id: coin?.id,
        };

        await prisma.coins.upsert({
          where: {
            name: coin?.name,
          },
          update: data_,
          create: data_,
        });
      }

      console.log(
        'Coins list integrated successfully with Coingecko:',
        data?.length
      );
      await new Promise((resolve) => setTimeout(resolve, 3 * 1000));
    })
    .catch((error) => {
      console.error('Failed to integrate coins with Coingecko:', error);
    });
}

// COIN-GECKO ONE BY ONE
const fetchCoinFromCoingecko = async (id) => {
  try {
    const url = `https://api.coingecko.com/api/v3/coins/${id}`;
    const response = await axios.get(url, {
      headers: {
        accept: 'application/json',
        'x-cg-demo-api-key': 'CG-zKSCDCPfgDJvuFjBv6Ww14Uy',
      },
      params: {
        localization: false,
        tickers: false,
        developer_data: false,
        community_data: false,
      },
    });

    return {
      categories: response.data?.categories,
      homepage_links: response.data?.links?.homepage,
      official_forum_urls: response.data?.links?.official_forum_url,
      twitter_screen_name: response.data?.links?.twitter_screen_name,
      price_change_1h:
        response.data?.market_data?.price_change_percentage_1h_in_currency?.usd,
      price_change_24h: response.data?.market_data?.price_change_percentage_24h,
      price_change_7d: response.data?.market_data?.price_change_percentage_7d,
      price_change_14d: response.data?.market_data?.price_change_percentage_14d,
      price_change_30d: response.data?.market_data?.price_change_percentage_30d,
      price_change_1y: response.data?.market_data?.price_change_percentage_1y,
      market_cap: response.data?.market_data?.market_cap?.usd,
      market_cap_rank: response.data?.market_data?.market_cap_rank,
      fdv: response.data?.market_data?.fully_diluted_valuation?.usd,
      price_date: response.data?.market_data?.last_updated,
    };
  } catch (error) {
    console.error('Error fetching coin from Coingecko:', error.message);
    throw new Error(error.message);
  }
};

const integrateCoinsOneByOneWithCoingecko = async () => {
  const coinsCount = await prisma.coins.count({
    where: { gecko_id: { not: null } },
  });

  for (let i = 1; (i - 1) * 1000 < coinsCount; i++) {
    const coins = await prisma.coins.findMany({
      where: { gecko_id: { not: null }, price_change_1h: null },
      select: {
        id: true,
        gecko_id: true,
      },
      orderBy: { id: 'desc' },
      take: i * 1000,
      skip: (i - 1) * 1000,
    });

    let k = 0;
    for (let coin of coins) {
      const data = await fetchCoinFromCoingecko(coin.gecko_id);
      await prisma.coins.update({ where: { id: coin.id }, data });
      console.log(++k);
      await new Promise((resolve) => setTimeout(resolve, 2 * 1000));
    }
  }

  console.log(
    `${coinsCount} -Coins integrated successfully one-by-one with Coingecko`
  );
};

// integrateCoinsOneByOneWithCoingecko();
