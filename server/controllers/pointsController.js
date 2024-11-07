// controllers/pointsController.js

const { PrismaClient } = require('@prisma/client');
const createError = require('http-errors');
const prisma = new PrismaClient();
const { zonedTimeToUtc, utcToZonedTime } = require('date-fns-tz');
const { format } = require('date-fns');

// Get points by user and academy
exports.getPointsByUserAndAcademy = async (req, res, next) => {
  console.log('getPointsByUserAndAcademy hit');

  const { userId, academyId } = req.params;

  console.log(
    `Parameters received: userId = ${userId}, academyId = ${academyId}`
  );

  try {
    const points = await prisma.point.findMany({
      where: {
        userId: parseInt(userId, 10),
        academyId: parseInt(academyId, 10),
      },
    });

    if (!points || points.length === 0) {
      console.log(
        `No points found for User ID ${userId} and Academy ID ${academyId}`
      );
      return next(
        createError(
          404,
          `No points found for User ID ${userId} and Academy ID ${academyId}`
        )
      );
    }

    const totalPoints = points.reduce((acc, point) => acc + point.value, 0);

    console.log(
      `Total points for User ID ${userId} and Academy ID ${academyId}: ${totalPoints}`
    );

    res.status(200).json({ value: totalPoints });
  } catch (error) {
    console.error('Error fetching points:', error);
    next(createError(500, 'Internal Server Error: Error fetching points'));
  }
};

exports.getLeaderboard = async (req, res, next) => {
  console.log('getLeaderboard hit');

  const { period } = req.query;

  let dateFilter = {};

  if (period === 'weekly') {
    const lastSunday = getLastSunday();

    dateFilter = {
      createdAt: {
        gte: lastSunday,
      },
    };
  }

  try {
    const leaderboard = await prisma.point.groupBy({
      by: ['userId'],
      where: dateFilter,
      _sum: { value: true },
      orderBy: { _sum: { value: 'desc' } },
    });

    // Fetch user data for each leaderboard entry
    const leaderboardData = await Promise.all(
      leaderboard.map(async (entry) => {
        const user = await prisma.user.findUnique({
          where: { id: entry.userId },
        });
        return {
          userId: entry.userId,
          name: user ? user.name : 'Unknown User',
          totalPoints: entry._sum.value,
        };
      })
    );

    res.status(200).json(leaderboardData);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    next(createError(500, 'Internal Server Error: Error fetching leaderboard'));
  }
};

// Helper function to get last Sunday at 00:00
function getLastSunday() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 (Sunday) to 6 (Saturday)
  const lastSunday = new Date(now);
  lastSunday.setDate(now.getDate() - dayOfWeek);
  lastSunday.setHours(0, 0, 0, 0); // Set to 00:00:00
  return lastSunday;
}

// Helper function to get the start of the week
function getStartOfWeek(date) {
  const dayOfWeek = date.getDay();
  const start = new Date(date);
  start.setDate(date.getDate() - dayOfWeek);
  start.setHours(0, 0, 0, 0);
  return start;
}

// Get list of weekly snapshots (SUPERADMIN only)
function getWeekStartEndCET(date) {
  const timeZone = 'Europe/Berlin'; // CET timezone

  // Convert date to CET timezone
  const zonedDate = utcToZonedTime(date, timeZone);

  // Get the previous Saturday
  let day = zonedDate.getDay(); // 0 (Sunday) to 6 (Saturday)
  let diff = (day + 1) % 7; // Days since Saturday

  let startOfWeekCET = new Date(zonedDate);
  startOfWeekCET.setDate(zonedDate.getDate() - diff);
  startOfWeekCET.setHours(23, 0, 0, 0); // Set to 23:00 CET

  // Adjust to UTC
  const startOfWeekUTC = zonedTimeToUtc(startOfWeekCET, timeZone);

  // End of week is next Saturday at 22:59:59.999 CET
  let endOfWeekCET = new Date(startOfWeekCET);
  endOfWeekCET.setDate(endOfWeekCET.getDate() + 7);
  endOfWeekCET.setMilliseconds(-1);

  // Adjust to UTC
  const endOfWeekUTC = zonedTimeToUtc(endOfWeekCET, timeZone);

  return { startOfWeekUTC, endOfWeekUTC };
}

// Get list of weekly snapshots (SUPERADMIN only)
exports.getWeeklySnapshots = async (req, res, next) => {
  console.log('getWeeklySnapshots hit');

  try {
    const minDateResult = await prisma.point.aggregate({
      _min: { createdAt: true },
    });

    const maxDateResult = await prisma.point.aggregate({
      _max: { createdAt: true },
    });

    const minDate = minDateResult._min.createdAt;
    const maxDate = maxDateResult._max.createdAt;

    if (!minDate || !maxDate) {
      return res.status(200).json({ snapshots: [] });
    }

    const snapshots = [];
    let { startOfWeekUTC: currentWeekStartUTC } = getWeekStartEndCET(minDate);
    const { startOfWeekUTC: lastWeekStartUTC } = getWeekStartEndCET(maxDate);

    while (currentWeekStartUTC <= lastWeekStartUTC) {
      // Convert currentWeekStartUTC to CET date string
      const currentWeekStartCET = utcToZonedTime(
        currentWeekStartUTC,
        'Europe/Berlin'
      );
      const weekLabel = format(currentWeekStartCET, 'yyyy-MM-dd HH:mm:ss');

      snapshots.push(weekLabel);

      // Move to next week
      currentWeekStartUTC = new Date(
        currentWeekStartUTC.getTime() + 7 * 24 * 60 * 60 * 1000
      );
    }

    res.status(200).json({ snapshots });
  } catch (error) {
    console.error('Error fetching weekly snapshots:', error);
    next(
      createError(500, 'Internal Server Error: Error fetching weekly snapshots')
    );
  }
};

// Get weekly leaderboard snapshot (SUPERADMIN only)
exports.getWeeklyLeaderboardSnapshot = async (req, res, next) => {
  console.log('getWeeklyLeaderboardSnapshot hit');

  const { week } = req.query;

  if (!week) {
    return next(createError(400, 'Week parameter is required'));
  }

  const timeZone = 'Europe/Berlin';
  const weekDateCET = new Date(week);
  const weekDateUTC = zonedTimeToUtc(weekDateCET, timeZone);

  const { startOfWeekUTC, endOfWeekUTC } = getWeekStartEndCET(weekDateUTC);

  const dateFilter = {
    createdAt: {
      gte: startOfWeekUTC,
      lte: endOfWeekUTC,
    },
  };

  try {
    const leaderboard = await prisma.point.groupBy({
      by: ['userId'],
      where: dateFilter,
      _sum: { value: true },
      orderBy: { _sum: { value: 'desc' } },
      take: 100,
    });

    const leaderboardData = await Promise.all(
      leaderboard.map(async (entry) => {
        const user = await prisma.user.findUnique({
          where: { id: entry.userId },
        });
        return {
          userId: entry.userId,
          name: user ? user.name : 'Unknown User',
          telegramUserId: user ? user.telegramUserId : null,
          totalPoints: entry._sum.value,
          erc20WalletAddress: user ? user.erc20WalletAddress : '',
          solanaWalletAddress: user ? user.solanaWalletAddress : '',
          tonWalletAddress: user ? user.tonWalletAddress : '',
        };
      })
    );

    res.status(200).json(leaderboardData);
  } catch (error) {
    console.error('Error fetching weekly leaderboard snapshot:', error);
    next(
      createError(
        500,
        'Internal Server Error: Error fetching weekly leaderboard snapshot'
      )
    );
  }
};

// Get user points
exports.getUserPoints = async (req, res, next) => {
  console.log('getUserPoints hit');

  const { userId } = req.params;

  console.log(`Parameters received: userId = ${userId}`);

  try {
    const points = await prisma.point.findMany({
      where: { userId: parseInt(userId, 10) },
      include: {
        academy: true,
        verificationTask: true,
      },
    });

    console.log(`Points fetched for User ID ${userId}:`);

    res.status(200).json(points);
  } catch (error) {
    console.error('Error fetching user points:', error);
    next(createError(500, 'Internal Server Error: Error fetching user points'));
  }
};

// Get user points breakdown
exports.getUserPointsBreakdown = async (req, res, next) => {
  console.log('getUserPointsBreakdown hit');

  const { userId } = req.params;

  console.log(`Parameters received: userId = ${userId}`);

  if (!userId || userId === 'null') {
    console.log('Invalid user ID received');
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  try {
    const points = await prisma.point.findMany({
      where: { userId: parseInt(userId, 10) },
      include: {
        academy: true,
        verificationTask: true,
      },
      orderBy: {
        createdAt: 'desc', // Order by createdAt directly in the query
      },
    });

    console.log(`Points fetched for User ID ${userId}:`);

    if (!points || points.length === 0) {
      console.log(`No points found for User ID ${userId}`);
      return res
        .status(404)
        .json({ message: `No points found for user ID ${userId}` });
    }

    res.status(200).json(points);
  } catch (error) {
    console.error('Error fetching user points breakdown:', error);
    return next(createError(500, 'Internal Server Error'));
  }
};
