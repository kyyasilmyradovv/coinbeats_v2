const { PrismaClient } = require('@prisma/client');
const createError = require('http-errors');
const prisma = new PrismaClient();

exports.getMyRaffles = async (req, res, next) => {
  try {
    const userId = +req.query?.userId;

    // Try to find the existing Raffle for the user
    let raffles = await prisma.raffle.findMany({
      where: { userId },
      orderBy: { id: 'desc' },
      include: {
        academy: true,
        task: true,
      },
    });

    res.status(200).json(raffles);
  } catch (error) {
    console.error('Error fetching my raffles:', error);
    next(createError(500, 'Error fetching my raffles'));
  }
};

exports.getMyTotalRaffles = async (req, res, next) => {
  try {
    const userId = +req.query?.userId;

    // Try to find the existing Raffle for the user
    let user = await prisma.user.findFirst({
      where: { id: userId },
    });

    res.status(200).json(user?.raffleAmount);
  } catch (error) {
    console.error('Error fetching surprise box:', error);
    next(createError(500, 'Error fetching surprise box'));
  }
};

// Admin controllers
exports.getOverallRaffle = async (req, res, next) => {
  try {
    // Check user type and construct where condition accordingly
    let where = {};
    if (req?.user?.roles?.includes('SUPERADMIN')) {
      where.type = 'platform';
    } else if (req?.user?.roles?.includes('CREATOR')) {
      where.creatorId = req.user.id;
    } else {
      return next(createError(403, 'Forbidden'));
    }

    let overallRaffle = await prisma.OverallRaffle.findFirst({ where });

    // If not found then create
    if (!overallRaffle) {
      overallRaffle = await prisma.OverallRaffle.create({ type: 'platform' });
    }

    if (overallRaffle.deadline)
      overallRaffle.deadline = overallRaffle.deadline.toString();

    res.status(200).json(overallRaffle);
  } catch (error) {
    console.error('Error fetching overall raffle:', error);
    next(createError(500, 'Error fetching overall raffle'));
  }
};

exports.updateOverallRaffle = async (req, res, next) => {
  try {
    let { minAmount, minPoints, winnersCount, deadline, reward } = req.body;

    if (deadline) deadline = new Date(deadline);

    const overallRaffle = await prisma.OverallRaffle.update({
      where: {
        type: 'platform',
      },
      data: {
        minAmount: +minAmount,
        minPoints: +minPoints,
        winnersCount: +winnersCount,
        deadline,
        reward,
      },
    });

    res.status(200).json(overallRaffle);
  } catch (error) {
    console.error('Error fetching overall raffle:', error);
    next(createError(500, 'Error fetching overall raffle'));
  }
};

exports.getRafflesHistory = async (req, res, next) => {
  try {
    let history = await prisma.$queryRaw`
    SELECT 
        id, 
        name, 
        TO_CHAR("startDate", 'YYYY-MM-DD') AS "startDate", 
        TO_CHAR("endDate", 'YYYY-MM-DD') AS "endDate", 
        "winnersCount", 
        "minPoints", 
        "minRaffles" 
      FROM "RafflesHistory"
      ORDER BY id DESC
    `;

    res.status(200).send(history);
  } catch (error) {
    console.error('Error fetching raffles history:', error);
    next(createError(500, 'Error fetching raffles history'));
  }
};

exports.getRaffleWinners = async (req, res, next) => {
  try {
    const { historyId } = req.query;

    if (!historyId) {
      return res.status(400).json({ message: 'historyId query is required' });
    }

    const winners = await prisma.raffleWinners.findMany({
      where: {
        historyId: +historyId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            telegramUserId: true,
            erc20WalletAddress: true,
            solanaWalletAddress: true,
            tonWalletAddress: true,
          },
        },
      },
    });

    res.status(200).send(winners);
  } catch (error) {
    console.error('Error fetching raffles history:', error);
    next(createError(500, 'Error fetching raffles history'));
  }
};
