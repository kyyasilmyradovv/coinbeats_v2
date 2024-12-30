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

exports.scamManagementList = async (req, res, next) => {
  try {
    const { limit = 20, offset = 0, mode = [], keyword = '' } = req.query;
    // mode can be "IP" or "FINGERPRINT" or "BANNED" or an array of them
    // keyword can match user name, telegramUserId, or an actual IP/fingerprint

    // 1) We need to find the groups. This might require custom queries:
    //    e.g., group by registrationIp if "IP" in mode,
    //          group by registrationFingerprint if "FINGERPRINT" in mode,
    //          only isBanned if "BANNED" in mode, etc.
    // 2) Then for each group, gather the user list.

    // Example: If "IP" is in mode, we group by `registrationIp` ignoring nulls or empties.
    // Then count how many distinct users in each IP.
    // Sort descending by count. Then take the top [limit], skip [offset].
    // If we also have "FINGERPRINT" in mode, we do a union? Or we run two queries and combine?

    // This is your logic. For brevity, let's do a simple "IP only" example:

    // We'll demonstrate for IP:
    // We do a raw query or prisma usage:
    let result = [];
    if (mode.includes('IP')) {
      const ipGroups = await prisma.user.groupBy({
        by: ['registrationIp'],
        where: {
          registrationIp: { not: null },
          // optional filters: name contains keyword, or telegramUserId, etc.
          OR: keyword
            ? [
                { name: { contains: keyword, mode: 'insensitive' } },
                {
                  telegramUserId: BigInt(keyword).valueOf()
                    ? { equals: BigInt(keyword) }
                    : undefined,
                },
                { registrationIp: { contains: keyword } },
              ]
            : undefined,
        },
        _count: {
          registrationIp: true,
        },
        orderBy: {
          _count: {
            registrationIp: 'desc',
          },
        },
        take: Number(limit),
        skip: Number(offset),
      });
      // Each ipGroups[i] = { registrationIp: '1.2.3.4', _count: { registrationIp: 5 } }

      for (const grp of ipGroups) {
        const userList = await prisma.user.findMany({
          where: { registrationIp: grp.registrationIp },
          select: {
            id: true,
            name: true,
            telegramUserId: true,
            isBanned: true,
            roles: true,
          },
        });
        // Decide if entire group is banned => e.g. isBanned if ALL users in group are isBanned == true
        const allBanned = userList.every((u) => u.isBanned);
        result.push({
          groupKey: grp.registrationIp,
          count: grp._count.registrationIp,
          isBanned: allBanned,
          users: userList,
        });
      }
    }

    // Then similarly for "FINGERPRINT". If mode includes 'FINGERPRINT', gather those groups, push them in `result`.
    // If "BANNED" is included, you might filter or separate them out.

    // For demonstration, let's just return the IP result for now:
    res.json(result);
  } catch (error) {
    console.error('scamManagementList error:', error);
    return next(createError(500, 'Failed to gather scam management list'));
  }
};

exports.banGroup = async (req, res, next) => {
  try {
    // e.g. { groupKey: "1.2.3.4", searchModes: ["IP"] }
    const { groupKey, searchModes } = req.body;
    if (!groupKey) return next(createError(400, 'groupKey is required'));

    // Find all users in that group
    // Example for IP only:
    if (searchModes.includes('IP')) {
      await prisma.user.updateMany({
        where: { registrationIp: groupKey },
        data: { isBanned: true },
      });
    }
    // If includes 'FINGERPRINT' => do the same for registrationFingerprint = groupKey

    res.json({ message: `Banned all in group ${groupKey}` });
  } catch (error) {
    console.error('banGroup error:', error);
    return next(createError(500, 'Failed to ban group'));
  }
};

exports.unbanGroup = async (req, res, next) => {
  try {
    const { groupKey, searchModes } = req.body;
    if (!groupKey) return next(createError(400, 'groupKey is required'));

    if (searchModes.includes('IP')) {
      await prisma.user.updateMany({
        where: { registrationIp: groupKey },
        data: { isBanned: false },
      });
    }
    // Similarly for FINGERPRINT
    res.json({ message: `Unbanned all in group ${groupKey}` });
  } catch (error) {
    console.error('unbanGroup error:', error);
    return next(createError(500, 'Failed to unban group'));
  }
};

exports.deleteGroup = async (req, res, next) => {
  try {
    // The request might be: DELETE /api/superadmin/scam-management/delete-group?groupKey=1.2.3.4
    const { groupKey } = req.query;
    const { searchModes } = req.body; // or pass them as query as well

    if (!groupKey) return next(createError(400, 'groupKey is required'));

    if (searchModes.includes('IP')) {
      // Deleting might mean "delete all user accounts with that IP"
      // But be very careful with cascading.
      await prisma.user.deleteMany({
        where: { registrationIp: String(groupKey) },
      });
    }
    // For fingerprint similarly

    res.json({ message: `Deleted group ${groupKey} successfully` });
  } catch (error) {
    console.error('deleteGroup error:', error);
    return next(createError(500, 'Failed to delete group'));
  }
};

exports.banUser = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) return next(createError(400, 'userId is required'));

    await prisma.user.update({
      where: { id: Number(userId) },
      data: { isBanned: true },
    });
    res.json({ message: `User ${userId} banned` });
  } catch (error) {
    console.error('banUser error:', error);
    return next(createError(500, 'Failed to ban user'));
  }
};

exports.unbanUser = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) return next(createError(400, 'userId is required'));

    await prisma.user.update({
      where: { id: Number(userId) },
      data: { isBanned: false },
    });
    res.json({ message: `User ${userId} unbanned` });
  } catch (error) {
    console.error('unbanUser error:', error);
    return next(createError(500, 'Failed to unban user'));
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) return next(createError(400, 'userId is required'));

    await prisma.user.delete({
      where: { id: Number(userId) },
    });
    res.json({ message: `User ${userId} deleted` });
  } catch (error) {
    console.error('deleteUser error:', error);
    return next(createError(500, 'Failed to delete user'));
  }
};
