const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const selectRaffleWinners = async () => {
  try {
    const overallRaffles = await prisma.overallRaffle.findMany({
      where: {
        isActive: true,
        reward: { not: null },
      },
    });

    for (let raffle of overallRaffles) {
      const { id, minAmount, winnersCount, deadline, academyId, reward, type } =
        raffle;
      if (!minAmount) minAmount = 0;

      // Check if the current time matches the deadline exactly
      // Get the current date and time
      const now = new Date();
      const nowYear = now.getUTCFullYear();
      const nowMonth = now.getUTCMonth();
      const nowDay = now.getUTCDate();
      const nowHour = now.getUTCHours();

      // Extract year, month, date, and hour from the deadline
      const deadlineDate = new Date(deadline);
      const deadlineYear = deadlineDate.getUTCFullYear();
      const deadlineMonth = deadlineDate.getUTCMonth();
      const deadlineDay = deadlineDate.getUTCDate();
      const deadlineHour = deadlineDate.getUTCHours();

      // console.log(nowYear, nowMonth, nowDay, nowHour, '-now');
      // console.log(
      //   deadlineYear,
      //   deadlineMonth,
      //   deadlineDay,
      //   deadlineHour,
      //   '-deadline'
      // );

      // Check if year, month, day match
      if (
        nowYear !== deadlineYear ||
        nowMonth !== deadlineMonth ||
        nowDay !== deadlineDay ||
        nowHour < deadlineHour
      ) {
        console.log('This is not the right time to run raffle selection.');
      } else {
        // Check if already executed for the current week
        const deadlineDate_ = deadline.toISOString().split('T')[0];

        const existingHistory = await prisma.$queryRaw`
        SELECT "endDate"
        FROM "RafflesHistory"
        WHERE "RafflesHistory"."overallRaffleId" = ${id} AND "endDate"::date = ${deadlineDate_}::date;
    `;

        if (existingHistory.length > 0) {
          console.log('History exists on the given date');
        } else {
          let academy;
          if (academyId) {
            academy = await prisma.academy.findFirst({
              where: { id: +academyId },
            });
          }

          // Select winners
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 27);

          let users = [];

          if (type === 'PLATFORM') {
            users = await prisma.$queryRaw`
              WITH EligibleUsers AS (
                SELECT 
                    "userId",
                    COUNT(DISTINCT "academyId") AS "finishedAcademies"
                FROM "Point" 
                WHERE 
                    "academyId" IS NOT NULL -- Ensure points were earned through an academy
                    AND "createdAt" >= ${sevenDaysAgo}
                GROUP BY "userId"
                HAVING COUNT(DISTINCT "academyId") >= 10 -- At least 10 academies completed
              ),
              WeightedUsers AS (
                SELECT
                    u.id,
                    u.name,
                    u.email,
                    u."telegramUserId",
                    u."erc20WalletAddress",
                    u."solanaWalletAddress",
                    u."tonWalletAddress",
                    u."raffleAmount",
                    CAST(e."finishedAcademies" AS INTEGER), -- Include the academy count from EligibleUsers
                    generate_series(1, u."raffleAmount" / 100) AS weight
                FROM "User" u
                JOIN EligibleUsers e ON u.id = e."userId" -- Join with EligibleUsers to include academy info
                WHERE 
                  "raffleAmount" >= ${minAmount} 
                  AND
                    (
                        u."erc20WalletAddress" IS NOT NULL AND u."erc20WalletAddress" <> ''
                        OR u."solanaWalletAddress" IS NOT NULL AND u."solanaWalletAddress" <> ''
                        OR u."tonWalletAddress" IS NOT NULL AND u."tonWalletAddress" <> ''
                    )
              ),
              UniqueUsers AS (
                  SELECT
                      id,
                      name,
                      email,
                      "telegramUserId",
                      "erc20WalletAddress",
                      "solanaWalletAddress",
                      "tonWalletAddress",
                      "raffleAmount",
                      "finishedAcademies",
                      ROW_NUMBER() OVER (PARTITION BY id ORDER BY RANDOM()) AS row_num -- Assign random rank to each user
                  FROM WeightedUsers
              )
              SELECT 
                  id,
                  name,
                  email,
                  "telegramUserId",
                  "erc20WalletAddress",
                  "solanaWalletAddress",
                  "tonWalletAddress",
                  "raffleAmount",
                  "finishedAcademies"
              FROM UniqueUsers
              WHERE row_num = 1 -- Keep only the top random row for each user
              ORDER BY RANDOM() -- Randomize final selection
              LIMIT ${winnersCount || 10};
            `;
          } else if (academyId > 0) {
            users = await prisma.$queryRaw`
              WITH EligibleUsers AS (
                SELECT 
                    "userId",
                    COUNT(DISTINCT "academyId") AS "finishedAcademies"
                FROM "Point" 
                WHERE 
                    "academyId" IS NOT NULL -- Ensure points were earned through an academy
                    AND "createdAt" >= ${sevenDaysAgo}
                GROUP BY "userId"
                HAVING COUNT(DISTINCT "academyId") >= 10 -- At least 10 academies completed
              ),
              WeightedUsers AS (
                SELECT
                    u.id,
                    u.name,
                    u.email,
                    u."telegramUserId",
                    u."erc20WalletAddress",
                    u."solanaWalletAddress",
                    u."tonWalletAddress",
                    u."raffleAmount",
                    CAST(e."finishedAcademies" AS INTEGER),
                    generate_series(1, raf."amount") AS weight,
                    amount AS "academyRaffleCount"
                FROM "User" u
                JOIN EligibleUsers e ON u.id = e."userId" -- Join with EligibleUsers to include academy info
                JOIN "AcademyRaffleEntries" AS raf ON raf."academyId" = ${academyId} AND raf."userId" = u.id AND raf.amount>= ${minAmount}
                WHERE 
                  u."erc20WalletAddress" IS NOT NULL AND u."erc20WalletAddress" <> ''
                  OR u."solanaWalletAddress" IS NOT NULL AND u."solanaWalletAddress" <> ''
                  OR u."tonWalletAddress" IS NOT NULL AND u."tonWalletAddress" <> ''
              ),
              UniqueUsers AS (
                  SELECT
                      id,
                      name,
                      email,
                      "telegramUserId",
                      "erc20WalletAddress",
                      "solanaWalletAddress",
                      "tonWalletAddress",
                      "raffleAmount",
                      "finishedAcademies",
                      "academyRaffleCount",
                      ROW_NUMBER() OVER (PARTITION BY id ORDER BY RANDOM()) AS row_num -- Assign random rank to each user
                  FROM WeightedUsers
              )
              SELECT 
                  id,
                  name,
                  email,
                  "telegramUserId",
                  "erc20WalletAddress",
                  "solanaWalletAddress",
                  "tonWalletAddress",
                  "raffleAmount",
                  "finishedAcademies",
                  "academyRaffleCount"
              FROM UniqueUsers
              WHERE row_num = 1 -- Keep only the top random row for each user
              ORDER BY RANDOM() -- Randomize final selection
              LIMIT ${winnersCount || 10};
          `;
          }

          // Create Raffle History
          const newRaffleHistory = await prisma.rafflesHistory.create({
            data: {
              name:
                type === 'PLATFORM'
                  ? 'Overall CoinBeats Weekly Raffle'
                  : academy != null
                  ? `${academy.name} Raffle`
                  : null,
              endDate: now,
              winnersCount: users.length,
              minRaffles: minAmount,
              overallRaffleId: raffle.id,
            },
          });

          // Create RaffleWinners for each winning user
          const raffleWinnersData = users.map((user) => ({
            raffleAmount:
              type === 'PLATFORM' ? user.raffleAmount : user.academyRaffleCount,
            winningAmount: reward,
            historyId: newRaffleHistory.id,
            userId: user.id,
          }));

          await prisma.raffleWinners.createMany({
            data: raffleWinnersData,
          });

          // Create notification for each winner
          const notificationsData = raffleWinnersData.map(({ userId }) => ({
            userId,
            type: 'ADMIN_BROADCAST',
            message: `Congratulations 🎉 You have won the ${
              type === 'ACADEMY' && academy != null
                ? `${academy.name} Raffle`
                : 'CoinBeats Weekly Raffle'
            }. The rewards will be distributed within 48 hours.`,
            read: false,
          }));

          const a = await prisma.notification.createMany({
            data: notificationsData,
          });

          // // Set all users' raffles to zero to restart the competition
          if (type === 'PLATFORM') {
            await prisma.$queryRaw`UPDATE "User" SET "raffleAmount" = 0;`;
            await prisma.$queryRaw`DELETE FROM "Raffle";`;
          } else {
            await prisma.$queryRaw`UPDATE "AcademyRaffleEntries" SET amount = 0 WHERE "academyId" = ${academyId};`;
          }
        }
      }
    }

    console.log(
      'Overall Raffle Winners selection script has Executed. Time: ',
      new Date()
    );
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

selectRaffleWinners();

module.exports = selectRaffleWinners;
