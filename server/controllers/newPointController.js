const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { zonedTimeToUtc, utcToZonedTime } = require('date-fns-tz');
const { format } = require('date-fns');
const asyncHandler = require('../utils/asyncHandler');

exports.getLeaderboard = asyncHandler(async (req, res, next) => {
  const { period, limit, offset } = req.query;
  if (offset >= 400) res.status(200).json([]);

  let orderBy =
    period === 'weekly'
      ? { lastWeekPointCount: 'desc' }
      : { pointCount: 'desc' };

  let where = period === 'weekly' ? { lastWeekPointCount: { gt: 0 } } : {};

  const leaderboardData = await prisma.user.findMany({
    where,
    select: { name: true, pointCount: true, lastWeekPointCount: true },
    orderBy,
    take: +limit || 20,
    skip: +offset || 0,
  });

  res.status(200).json(leaderboardData);
});

exports.getMyStats = asyncHandler(async (req, res, next) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { raffleAmount: true, pointCount: true, lastWeekPointCount: true },
  });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const rankOverall = await prisma.user.count({
    where: { pointCount: { gt: user.pointCount } },
  });

  const rankLastWeek = await prisma.user.count({
    where: { lastWeekPointCount: { gt: user.lastWeekPointCount } },
  });

  res.status(200).json({
    raffleAmount: user.raffleAmount,
    pointCount: user.pointCount,
    lastWeekPointCount: user.lastWeekPointCount,
    rankOverall: rankOverall + 1,
    rankLastWeek: rankLastWeek + 1,
  });
});

exports.getMyPointsHistory = asyncHandler(async (req, res, next) => {
  const { limit, offset } = req.query;
  if (limit > 20) limit = 20;

  const points = await prisma.point.findMany({
    where: { userId: req.user?.id, is_active: true },
    select: {
      value: true,
      description: true,
      createdAt: true,
      academy: { select: { name: true, logoUrl: true } },
      verificationTask: { select: { name: true } },
    },
    orderBy: { id: 'desc' },
    take: +limit || 20,
    skip: +offset || 0,
  });

  res.status(200).json(points || []);
});
