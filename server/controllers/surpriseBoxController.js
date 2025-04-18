const { PrismaClient } = require('@prisma/client');
const createError = require('http-errors');
const prisma = new PrismaClient();
const { checkAndApplyLevelUp } = require('../services/levelService');

exports.getSurpriseBoxes = async (req, res, next) => {
  try {
    const userId = +req.query?.userId;

    // Try to find the existing SurpriseBox for the user
    let surpriseBox = await prisma.surpriseBox.findFirst({
      where: { userId },
    });

    // If the SurpriseBox does not exist, create a new one
    if (!surpriseBox) {
      // Get the total number of completed academies for the user from the "Point" table
      const completedAcademiesCount = await prisma.point.count({
        where: { userId, academyId: { not: null } },
      });

      surpriseBox = await prisma.surpriseBox.create({
        data: {
          userId,
          completedAcademies: completedAcademiesCount,
          nextBox: completedAcademiesCount + 3,
        },
      });
    }

    res.status(200).json(surpriseBox);
  } catch (error) {
    console.error('Error fetching surprise box:', error);
    next(createError(500, 'Error fetching surprise box'));
  }
};

exports.updateSurpriseBoxes = async (req, res, next) => {
  try {
    const userId = +req.query?.userId;
    let { completedAcademies, lastBox, nextBox, surprisePoint } = req.body;

    let box = await prisma.surpriseBox.findFirst({
      where: { userId },
    });

    // If the user doesn't have the surprise box then create
    if (!box) {
      completedAcademies =
        (await prisma.point.count({
          where: { userId, academyId: { not: null } },
        })) || 0;

      nextBox = completedAcademies + 3;

      box = await prisma.surpriseBox.create({
        data: { completedAcademies, lastBox, nextBox, userId },
      });
    } else {
      // If exists already, just update
      await prisma.surpriseBox.update({
        where: { id: box.id, userId },
        data: { completedAcademies, lastBox, nextBox },
      });
    }

    if (surprisePoint > 0) {
      await prisma.point.create({
        data: {
          userId,
          value: surprisePoint,
          description: 'Surprise XP Boost',
        },
      });

      await prisma.raffle.create({
        data: {
          userId,
          desc: 'Surprise Raffle Boost',
          amount: surprisePoint / 100,
        },
      });

      // Increase user pointCount & lastWeekPointCount & raffleAmount
      await prisma.user.update({
        where: { id: userId },
        data: {
          pointCount: { increment: surprisePoint },
          lastWeekPointCount: { increment: surprisePoint },
          raffleAmount: { increment: surprisePoint / 100 },
        },
      });
    }

    await checkAndApplyLevelUp(userId);

    res.status(200).json(box);
  } catch (error) {
    console.error('Error updating surprise box:', error);
    next(createError(500, 'Error updating surprise box'));
  }
};

// For admin
exports.getSurprisePoints = async (req, res, next) => {
  try {
    let { keyword, limit, offset } = req.query;
    if (keyword) keyword = '%' + keyword + '%';

    const surprisePoints = await prisma.$queryRaw`
      SELECT 
          p.id, 
          p.value,
          TO_CHAR(p."createdAt", 'YYYY-MM-DD') AS "createdAt",
          u.name as username
      FROM 
          "Point" p
      JOIN 
          "User" u 
      ON 
          p."userId" = u.id
      WHERE 
          p.description = 'Surprise XP Boost'
          AND u.name ILIKE ${keyword || '%%'}
      LIMIT 
          ${+limit || 20} 
      OFFSET 
          ${+offset || 0};
      `;

    res.status(200).json(surprisePoints);
  } catch (error) {
    console.error('Error fetching surprise pints:', error);
    next(createError(500, 'Error fetching surprise points'));
  }
};
