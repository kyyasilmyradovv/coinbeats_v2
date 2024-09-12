// controllers/pointsController.js

const { PrismaClient } = require('@prisma/client');
const createError = require('http-errors');
const prisma = new PrismaClient();

// Get points by user and academy
exports.getPointsByUserAndAcademy = async (req, res, next) => {
  console.log('getPointsByUserAndAcademy hit');
  
  const { userId, academyId } = req.params;

  console.log(`Parameters received: userId = ${userId}, academyId = ${academyId}`);

  try {
    const points = await prisma.point.findMany({
      where: {
        userId: parseInt(userId, 10),
        academyId: parseInt(academyId, 10),
      },
    });

    console.log(`Points fetched for User ID ${userId} and Academy ID ${academyId}:`, points);

    if (!points || points.length === 0) {
      console.log(`No points found for User ID ${userId} and Academy ID ${academyId}`);
      return next(createError(404, `No points found for User ID ${userId} and Academy ID ${academyId}`));
    }

    const totalPoints = points.reduce((acc, point) => acc + point.value, 0);

    console.log(`Total points for User ID ${userId} and Academy ID ${academyId}: ${totalPoints}`);

    res.status(200).json({ value: totalPoints });
  } catch (error) {
    console.error('Error fetching points:', error);
    next(createError(500, 'Internal Server Error: Error fetching points'));
  }
};

// Get leaderboard
exports.getLeaderboard = async (req, res, next) => {
  console.log('getLeaderboard hit');

  try {
    const leaderboard = await prisma.point.groupBy({
      by: ['userId'],
      _sum: { value: true },
      orderBy: { _sum: { value: 'desc' } },
    });

    console.log('Leaderboard fetched:', leaderboard);

    // Fetching the user data separately based on userId
    const leaderboardData = await Promise.all(
      leaderboard.map(async (entry) => {
        const user = await prisma.user.findUnique({
          where: { id: entry.userId },
        });
        console.log(`User fetched for userId ${entry.userId}:`, user);
        return {
                userId: entry.userId,
          name: user ? user.name : 'Unknown User',
          totalPoints: entry._sum.value,
        };
      })
    );

    console.log('Leaderboard data after user fetching:', leaderboardData);

    res.status(200).json(leaderboardData);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    next(createError(500, 'Internal Server Error: Error fetching leaderboard'));
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

    console.log(`Points fetched for User ID ${userId}:`, points);

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
    });

    console.log(`Points fetched for User ID ${userId}:`, points);

    if (!points || points.length === 0) {
      console.log(`No points found for User ID ${userId}`);
      return res.status(404).json({ message: `No points found for user ID ${userId}` });
    }

    res.status(200).json(points);
  } catch (error) {
    console.error('Error fetching user points breakdown:', error);
    return next(createError(500, 'Internal Server Error'));
  }
};
