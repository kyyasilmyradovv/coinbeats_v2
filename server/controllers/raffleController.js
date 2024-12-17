const { PrismaClient } = require('@prisma/client');
const createError = require('http-errors');
const prisma = new PrismaClient();

// User controllers
exports.getOverallRafflesForUsers = async (req, res, next) => {
  try {
    const userId = +req.query?.userId;
    if (typeof userId !== 'number')
      return next(createError(400, 'Invalid credentials'));

    let overallRaffles = await prisma.$queryRaw`
      SELECT
        a.name,
        a."logoUrl",
        r.deadline,
        r.reward,
        r."winnersCount",
        r.type,
        (
	        SELECT amount
	        FROM "AcademyRaffleEntries" AS entries
	        WHERE entries."userId" = ${userId} AND entries."academyId" = r."academyId"
    	  ) AS "raffleCount"
      FROM
        "OverallRaffle" AS r
      LEFT JOIN "Academy" AS a ON a.id = r."academyId"
      WHERE
        r."isActive" = true AND r.deadline > NOW() 
      ORDER BY
        CASE WHEN r.type = 'PLATFORM' THEN 0 ELSE 1 END,
        r.deadline ASC;
    `;

    for (let r of overallRaffles) {
      if (r.deadline) r.deadline = r.deadline.toString();
    }

    res.status(200).send(overallRaffles);
  } catch (error) {
    console.error('Error fetching overall raffle:', error);
    next(createError(500, 'Error fetching overall raffle'));
  }
};

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
      where.type = 'PLATFORM';
    } else if (req?.user?.roles?.includes('CREATOR')) {
      where.creatorId = req.user.id;
    } else {
      return next(createError(403, 'Forbidden'));
    }

    let overallRaffles = await prisma.overallRaffle.findMany({ where });

    for (let r of overallRaffles) {
      if (r.deadline) r.deadline = r.deadline.toString();
    }

    res.status(200).json(overallRaffles);
  } catch (error) {
    console.error('Error fetching overall raffle:', error);
    next(createError(500, 'Error fetching overall raffle'));
  }
};

exports.createRaffle = async (req, res, next) => {
  try {
    // Double check access
    if (!req?.user?.roles?.includes('CREATOR')) {
      return next(createError(403, 'Forbidden'));
    }

    let { minAmount, winnersCount, deadline, reward, isActive, academyId } =
      req.body;
    if (deadline) deadline = new Date(deadline);

    // Check if already exists
    let existingRaffle = await prisma.overallRaffle.findFirst({
      where: { academyId: +academyId },
    });
    if (existingRaffle !== null) {
      return res.status(409).json({ message: 'Raffle already exists' });
    }

    const overallRaffle = await prisma.overallRaffle.create({
      data: {
        minAmount: +minAmount,
        minPoints: 0,
        winnersCount: +winnersCount,
        deadline,
        reward,
        isActive,
        type: 'ACADEMY',
        academyId: +academyId,
        creatorId: req?.user?.id,
      },
    });

    res.status(200).json(overallRaffle);
  } catch (error) {
    console.error('Error fetching overall raffle:', error);
    next(createError(500, 'Error fetching overall raffle'));
  }
};

exports.updateOverallRaffle = async (req, res, next) => {
  try {
    // Check user type and construct where condition accordingly
    let where = { id: +req?.params?.id };
    if (req?.user?.roles?.includes('SUPERADMIN')) {
      where.type = 'PLATFORM';
    } else if (req?.user?.roles?.includes('CREATOR')) {
      where.creatorId = req.user.id;
      where.type = 'ACADEMY';
    } else {
      return next(createError(403, 'Forbidden'));
    }

    let { minAmount, minPoints, winnersCount, deadline, reward, isActive } =
      req.body;
    if (deadline) deadline = new Date(deadline);

    const overallRaffle = await prisma.overallRaffle.update({
      where,
      data: {
        minAmount: +minAmount,
        minPoints: +minPoints,
        winnersCount: +winnersCount,
        deadline,
        reward,
        isActive,
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
    // Input checker
    if (typeof req.params?.id !== 'string')
      return next(createError(403, 'Forbidden'));

    let histories = await prisma.$queryRaw`
      SELECT
          id,
          name,
          TO_CHAR("startDate", 'YYYY-MM-DD') AS "startDate",
          TO_CHAR("endDate", 'YYYY-MM-DD') AS "endDate",
          "winnersCount",
          "minPoints",
          "minRaffles"
        FROM "RafflesHistory"
        WHERE "overallRaffleId" = ${+req.params?.id}
        ORDER BY id DESC
    `;

    res.status(200).send(histories);
  } catch (error) {
    console.error('Error fetching raffles history:', error);
    next(createError(500, 'Error fetching raffles history'));
  }
};

exports.getRaffleWinners = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'History id is required' });
    }

    const winners = await prisma.raffleWinners.findMany({
      where: {
        historyId: +id,
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
