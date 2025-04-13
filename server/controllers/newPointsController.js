const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { zonedTimeToUtc, utcToZonedTime } = require('date-fns-tz');
const { format } = require('date-fns');
const asyncHandler = require('../utils/asyncHandler');

exports.getLeaderboard = asyncHandler(async (req, res, next) => {
  const { period, limit, offset } = req.query;

  let orderBy =
    period === 'weekly'
      ? { lastWeekPointCount: 'desc' }
      : { pointCount: 'desc' };

  let where = period === 'weekly' ? { lastWeekPointCount: { gt: 0 } } : {};

  const leaderboardData = await prisma.user.findMany({
    where,
    select: { name: true, pointCount: true, lastWeekPointCount: true },
    orderBy,
    take: +limit || 30,
    skip: +offset || 0,
  });

  res.status(200).json(leaderboardData);
});

exports.getMyStats = async (req, res, next) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { pointCount: true, lastWeekPointCount: true },
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
    pointCount: user.pointCount,
    lastWeekPointCount: user.lastWeekPointCount,
    rankOverall: rankOverall + 1,
    rankLastWeek: rankLastWeek + 1,
  });
};

// // Get user points breakdown
// exports.getUserPointsBreakdown = async (req, res, next) => {
//   console.log('getUserPointsBreakdown hit');

//   const { userId } = req.params;

//   console.log(`Parameters received: userId = ${userId}`);

//   if (!userId || userId === 'null') {
//     console.log('Invalid user ID received');
//     return res.status(400).json({ message: 'Invalid user ID' });
//   }

//   try {
//     const points = await prisma.point.findMany({
//       where: { userId: parseInt(userId, 10) },
//       include: {
//         academy: true,
//         verificationTask: true,
//       },
//       orderBy: {
//         createdAt: 'desc', // Order by createdAt directly in the query
//       },
//     });

//     console.log(`Points fetched for User ID ${userId}:`);

//     if (!points || points.length === 0) {
//       console.log(`No points found for User ID ${userId}`);
//       return res
//         .status(404)
//         .json({ message: `No points found for user ID ${userId}` });
//     }

//     res.status(200).json(points);
//   } catch (error) {
//     console.error('Error fetching user points breakdown:', error);
//     return next(createError(500, 'Internal Server Error'));
//   }
// };
