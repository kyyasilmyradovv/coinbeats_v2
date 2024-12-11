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
        where: { userId, academyId: null },
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

    // If the user doesn't have the suprise box then create
    if (!box) {
      completedAcademies =
        (await prisma.point.count({
          where: { userId, academyId: null },
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
      await prisma.user.update({
        where: { id: userId },
        data: { raffleAmount: { increment: surprisePoint / 100 } },
      });
    }

    await checkAndApplyLevelUp(userId);

    res.status(200).json(box);
  } catch (error) {
    console.error('Error updating surprise box:', error);
    next(createError(500, 'Error updating surprise box'));
  }
};
