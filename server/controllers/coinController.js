const { PrismaClient } = require('@prisma/client');
const createError = require('http-errors');
const prisma = new PrismaClient();

exports.getAllCoins = async (req, res, next) => {
  try {
    let { keyword, sortColumn, sortDirection, limit, offset } = req.query;

    let where = {};
    if (keyword?.length) {
      where.OR = [
        { name: { contains: keyword, mode: 'insensitive' } },
        { symbol: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    let coins = await prisma.coins.findMany({
      where,
      orderBy: { [sortColumn || 'id']: sortDirection || 'desc' },
      select: {
        id: true,
        name: true,
        symbol: true,
        image: true,
        price: true,
        fdv: true,
        market_cap_rank: true,
        price_change_1h: true,
        price_change_24h: true,
        price_change_7d: true,
      },
      take: +limit || 20,
      skip: +offset || 0,
    });

    res.status(200).json(coins);
  } catch (error) {
    console.error('Error fetching  coins:', error);
    next(createError(500, 'Error fetching coins'));
  }
};

exports.getCoinsCount = async (req, res, next) => {
  try {
    let coinsCount = await prisma.coins.count();

    res.status(200).json(coinsCount);
  } catch (error) {
    console.error('Error counting  coins:', error);
    next(createError(500, 'Error counting coins'));
  }
};

exports.getMyTotalCoins = async (req, res, next) => {
  try {
    const userId = +req.query?.userId;

    // Try to find the existing Coin for the user
    let user = await prisma.user.findFirst({
      where: { id: userId },
    });

    res.status(200).json(user?.coinAmount);
  } catch (error) {
    console.error('Error fetching surprise box:', error);
    next(createError(500, 'Error fetching surprise box'));
  }
};

// Admin controllers
exports.getCoin = async (req, res, next) => {
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

    let coins = await prisma.coin.findMany({ where });

    for (let r of coins) {
      if (r.deadline) r.deadline = r.deadline.toString();
    }

    res.status(200).json(coins);
  } catch (error) {
    console.error('Error fetching overall coin:', error);
    next(createError(500, 'Error fetching overall coin'));
  }
};

exports.createCoin = async (req, res, next) => {
  try {
    // Double check access
    if (!req?.user?.roles?.includes('CREATOR')) {
      return next(createError(403, 'Forbidden'));
    }

    let { minAmount, winnersCount, deadline, reward, isActive, academyId } =
      req.body;
    if (deadline) deadline = new Date(deadline);

    // Check if already exists
    let existingCoin = await prisma.coin.findFirst({
      where: { academyId: +academyId },
    });
    if (existingCoin !== null) {
      return res.status(409).json({ message: 'Coin already exists' });
    }

    const coin = await prisma.coin.create({
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

    res.status(200).json(coin);
  } catch (error) {
    console.error('Error fetching overall coin:', error);
    next(createError(500, 'Error fetching overall coin'));
  }
};

exports.updateCoin = async (req, res, next) => {
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

    const coin = await prisma.coin.update({
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

    res.status(200).json(coin);
  } catch (error) {
    console.error('Error fetching overall coin:', error);
    next(createError(500, 'Error fetching overall coin'));
  }
};

exports.getCoinsHistory = async (req, res, next) => {
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
          "minCoins"
        FROM "CoinsHistory"
        WHERE "coinId" = ${+req.params?.id}
        ORDER BY id DESC
    `;

    res.status(200).send(histories);
  } catch (error) {
    console.error('Error fetching coins history:', error);
    next(createError(500, 'Error fetching coins history'));
  }
};

exports.getCoinWinners = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'History id is required' });
    }

    const winners = await prisma.coinWinners.findMany({
      where: {
        historyId: +id,
      },
      orderBy: { id: 'desc' },
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
    console.error('Error fetching coins history:', error);
    next(createError(500, 'Error fetching coins history'));
  }
};
