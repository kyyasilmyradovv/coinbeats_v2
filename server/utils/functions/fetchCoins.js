const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// COIN-RANKING
// const integrateCoinranking = async (offset) => {
//   try {
//     const url = 'https://api.coinranking.com/v2/coins';
//     const response = await axios.get(url, {
//       params: {
//         limit: 100,
//         offset: offset * 100,
//       },
//     });

//     return response.data.data.coins;
//   } catch (error) {
//     console.error('Error fetching coins from Coinranking:', error.message);
//     throw new Error(error.message);
//   }
// };

// for (let i = 51; i < 55; i++) {
//   integrateCoinranking(i)
//     .then(async (data) => {
//       for (let coin of data) {
//         await prisma.coins.upsert({
//           where: { name: coin?.name },
//           update: {
//             name: coin?.name,
//             symbol: coin?.symbol,
//             image: coin?.iconUrl,
//             price: coin?.price,
//             price_date: null,
//             market_cap: coin?.marketCap,
//             market_cap_rank: coin?.rank,
//             listed_date: new Date(coin?.listedAt * 1000).toLocaleDateString(),
//             contract_addresses: coin?.contractAddresses,
//           },
//           create: {
//             name: coin?.name,
//             symbol: coin?.symbol,
//             image: coin?.iconUrl,
//             price: coin?.price,
//             price_date: null,
//             market_cap: coin?.marketCap,
//             market_cap_rank: coin?.rank,
//             listed_date: new Date(coin?.listedAt * 1000).toLocaleDateString(),
//             coinranking_uuid: coin?.uuid,
//             contract_addresses: coin?.contractAddresses,
//           },
//         });
//       }

//       console.log(
//         'Coins integrated successfully with Coinranking:',
//         data?.length
//       );
//     })
//     .catch((error) => {
//       console.error('Failed to integrate coins with Coinranking:', error);
//     });
// }

// // COIN-GECKO
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

for (let i = 5; i < 4; i++) {
  integrateCoingecko(i)
    .then(async (data) => {
      for (let coin of data) {
        const data_ = {
          name: coin?.name,
          symbol: coin?.symbol,
          image: coin?.image,
          price: coin?.current_price,
          price_date: coin?.last_updated,
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
        'x-cg-demo-api-key': 'CG-5DzvYu67MCjpgWvHnov2Dhnr',
      },
      params: {
        localization: false,
        tickers: false,
        developer_data: false,
        community_data: false,
      },
    });

    return {
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
      market_cap_rank: response.data?.market_data?.market_cap_rank,
      price_date: response.data?.market_data?.last_updated,
    };
  } catch (error) {
    console.error('Error fetching coins from Coinranking:', error.message);
    throw new Error(error.message);
  }
};

const integrateCoinsOneByOneWithCoingecko = async () => {
  const coinsCount = await prisma.coins.count({
    where: { gecko_id: { not: null } },
  });

  for (let i = 1; (i - 1) * 1000 < coinsCount; i++) {
    const coins = await prisma.coins.findMany({
      where: { gecko_id: { not: null } },
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
      await new Promise((resolve) => setTimeout(resolve, 3 * 1000));
    }
  }

  console.log(
    `${coinsCount} -Coins integrated successfully one-by-one with Coingecko`
  );
};

integrateCoinsOneByOneWithCoingecko();
