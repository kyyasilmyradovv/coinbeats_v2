const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const selectRaffleWinners = async () => {
  try {
    const {
      minAmount: minRaffles,
      winnersCount,
      minPoints,
      deadline,
    } = await prisma.overallRaffle.findFirst();

    // Check if the current time matches the deadline exactly
    // Get the current date and time
    const now = new Date();
    const nowYear = now.getUTCFullYear();
    const nowMonth = now.getUTCMonth();
    const nowDate = now.getUTCDate();
    const nowHour = now.getUTCHours();

    // Extract year, month, date, and hour from the deadline
    const deadlineDate = new Date(deadline);
    const deadlineYear = deadlineDate.getUTCFullYear();
    const deadlineMonth = deadlineDate.getUTCMonth();
    const deadlineDay = deadlineDate.getUTCDate();
    const deadlineHour = deadlineDate.getUTCHours();

    // Check if year, month, day match
    if (
      nowYear !== deadlineYear ||
      nowMonth !== deadlineMonth ||
      nowDate !== deadlineDay
    ) {
      console.log('This is not the right time to run raffle selection.');
      return;
    }

    // Check if already executed for the current week
    const deadlineDate_ = deadline.toISOString().split('T')[0];

    const existingHistory = await prisma.$queryRaw`
        SELECT "endDate"
        FROM "RafflesHistory"
        WHERE "endDate"::date = ${deadlineDate_}::date;
    `;

    if (existingHistory.length > 0) {
      console.log('History exists on the given date');
      return;
    }

    // Select random winners
    const users = await prisma.$queryRaw`
        SELECT id, name, email, "telegramUserId", "erc20WalletAddress", "solanaWalletAddress", "tonWalletAddress", "raffleAmount"
        FROM "User"
        WHERE "raffleAmount" > ${minRaffles}
        AND (
            "erc20WalletAddress" IS NOT NULL AND "erc20WalletAddress" <> ''
            OR "solanaWalletAddress" IS NOT NULL AND "solanaWalletAddress" <> ''
            OR "tonWalletAddress" IS NOT NULL AND "tonWalletAddress" <> ''
        )
        ORDER BY RANDOM()
        LIMIT ${winnersCount};
    `;

    // Create Raffle History (one history for each week)
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const newRaffleHistory = await prisma.rafflesHistory.create({
      data: {
        name: 'Overall CoinBeats Weekly Raffle',
        startDate: weekAgo,
        endDate: today,
        winnersCount: users.length,
        minPoints,
        minRaffles,
      },
    });

    // Create RaffleWinners for each winning user
    const raffleWinnersData = users.map((user) => ({
      raffleAmount: user.raffleAmount,
      // winningAmount: 10,
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
      message:
        'Congratulations 🎉 You have won the CoinBeats Weekly Raffle. The rewards will be distributed within 48 hours.',
      read: false,
    }));

    const a = await prisma.notification.createMany({ data: notificationsData });

    // Set all users' raffles to zero to restart the competition
    await prisma.$queryRaw`UPDATE "User" set "raffleAmount" = 0;`;
    await prisma.$queryRaw`DELETE FROM "Raffle";`;

    console.log(
      'Overall Raffle Winners selection script has Executed. Time: ',
      new Date()
    );
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

module.exports = selectRaffleWinners;
