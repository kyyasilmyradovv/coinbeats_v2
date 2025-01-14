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

for (let i = 1; i < 1; i++) {
  integrateCoinranking(i)
    .then(async (data) => {
      for (let coin of data) {
        const data_ = {
          name: coin?.name,
          symbol: coin?.symbol,
          image: coin?.iconUrl,
          price: +coin?.price,
          price_change_24h: +coin?.change,
          market_cap: +coin?.marketCap,
          market_cap_rank: coin?.rank,
          listed_date: new Date(coin?.listedAt * 1000).toString(),
          contract_addresses: coin?.contractAddresses,
          coinranking_uuid: coin?.uuid,
        };

        console.log(coin);
        await prisma.coins.upsert({
          where: { name: coin?.name },
          update: data_,
          create: data_,
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

// COINRANKING ONE BY ONE
const fetchCoinFromCoinranking = async (id) => {
  try {
    const url = `https://api.coinranking.com/v2/coin/${id}`;
    const response = await axios.get(url);

    const coin = response.data?.data?.coin;

    return {
      homepage_links: coin?.websiteUrl?.length && [coin?.websiteUrl],
      twitter_screen_name: coin?.links?.filter((e) => e.type == 'twitter')?.[0]
        ?.name,
      price: +coin?.price,
      price_change_24h: +coin?.change,
      price_date: coin?.priceAt && new Date(coin?.priceAt * 1000),
      market_cap: +coin?.marketCap,
      market_cap_rank: coin?.rank,
      fdv: +coin?.fullyDilutedMarketCap,
      contract_addresses: coin?.contractAddresses,
      ath: +coin?.allTimeHigh?.price,
      ath_date:
        coin?.allTimeHigh?.timestamp && new Date(coin?.allTimeHigh?.timestamp),
    };
  } catch (error) {
    console.error('Error fetching coin from Coinranking:', error.message);
    throw new Error(error.message);
  }
};

const integrateCoinsOneByOneWithCoinranking = async () => {
  const coinsCount = await prisma.coins.count({
    where: { coinranking_uuid: { not: null } },
  });

  for (let i = 1; (i - 1) * 1000 < coinsCount; i++) {
    const coins = await prisma.coins.findMany({
      where: { coinranking_uuid: { not: null } },
      select: {
        id: true,
        coinranking_uuid: true,
      },
      orderBy: { id: 'desc' },
      take: i * 1000,
      skip: (i - 1) * 1000,
    });

    let k = 0;
    for (let coin of coins) {
      const data = await fetchCoinFromCoinranking(coin.coinranking_uuid);
      await prisma.coins.update({ where: { id: coin.id }, data });
      console.log(++k);
      await new Promise((resolve) => setTimeout(resolve, 3 * 1000));
    }
  }

  console.log(
    `${coinsCount} -Coins integrated successfully one-by-one with Coinranking`
  );
};

// integrateCoinsOneByOneWithCoinranking();
