// controllers/superadminController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const createError = require('http-errors');
const { zonedTimeToUtc, utcToZonedTime } = require('date-fns-tz');
const { startOfDay } = require('date-fns'); // Corrected import

exports.getDashboardStats = async (req, res, next) => {
  try {
    const timeZone = 'Europe/Tallinn'; // Estonia timezone

    // Get current date in Estonia timezone
    const now = new Date();
    const estoniaDate = utcToZonedTime(now, timeZone);

    // Get start of the day in Estonia timezone
    const startOfTodayEstonia = startOfDay(estoniaDate);

    // Convert start of day back to UTC
    const startOfTodayUTC = zonedTimeToUtc(startOfTodayEstonia, timeZone);

    // Query for users created today
    const usersTodayCount = await prisma.user.count({
      where: {
        createdAt: {
          gte: startOfTodayUTC,
        },
      },
    });

    // Total users
    const totalUsersCount = await prisma.user.count();

    // Currently active users
    // Define "currently active" as users who have session logs in the last 5 minutes
    const fiveMinutesAgoUTC = new Date(now.getTime() - 5 * 60 * 1000);

    const activeUsers = await prisma.sessionLog.findMany({
      where: {
        sessionEnd: {
          gte: fiveMinutesAgoUTC,
        },
        userId: { not: null }, // Ensure userId is not null
      },
      select: {
        userId: true,
      },
      distinct: ['userId'],
    });

    const activeUsersCount = activeUsers.length;

    // Prepare stats object
    const stats = {
      usersToday: usersTodayCount,
      totalUsers: totalUsersCount,
      activeUsers: activeUsersCount,
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    next(createError(500, 'Error fetching dashboard stats'));
  }
};
