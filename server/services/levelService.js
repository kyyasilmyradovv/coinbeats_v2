// server/services/levelService.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const checkAndApplyLevelUp = async (userId) => {
  try {
    console.log(`Checking level up for userId: ${userId}`);

    // Fetch total points of the user
    const totalPointsResult = await prisma.point.aggregate({
      where: { userId },
      _sum: { value: true },
    });
    const totalPoints = totalPointsResult._sum.value || 0;
    console.log(`Total points for user ${userId}: ${totalPoints}`);

    // Fetch all character levels
    const characterLevels = await prisma.characterLevel.findMany({
      orderBy: { minPoints: 'asc' },
    });

    // Find the highest level the user qualifies for
    let newLevel = null;
    for (const level of characterLevels) {
      if (totalPoints >= level.minPoints && totalPoints <= level.maxPoints) {
        newLevel = level;
      }
    }
    if (newLevel) {
      console.log(`New level identified for user ${userId}:`, newLevel);
    } else {
      console.log(`No new level for user ${userId}`);
    }

    if (!newLevel) {
      // No level found for current points
      return;
    }

    // Fetch current level of the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { characterLevelId: true },
    });
    console.log(`Current level for user ${userId}: ${user.characterLevelId}`);

    if (user.characterLevelId === newLevel.id) {
      // User is already at this level
      console.log(`User ${userId} is already at level ${newLevel.id}`);
      return;
    }

    // Update user's character level
    await prisma.user.update({
      where: { id: userId },
      data: { characterLevelId: newLevel.id },
    });
    console.log(`User ${userId} level updated to ${newLevel.id}`);

    // Award reward points
    await prisma.point.create({
      data: {
        userId,
        value: newLevel.rewardPoints,
        description: newLevel.levelName,
      },
    });
    console.log(`Awarded ${newLevel.rewardPoints} points to user ${userId}`);

    if (newLevel?.rewardPoints > 99) {
      await prisma.raffle.create({
        data: {
          userId,
          amount: newLevel?.rewardPoints / 100,
          desc: newLevel.levelName,
        },
      });
      await prisma.user.update({
        where: { id: userId },
        data: { raffleAmount: { increment: newLevel?.rewardPoints / 100 } },
      });
    }

    // Create a notification for the user
    await prisma.notification.create({
      data: {
        userId,
        type: 'LEVEL_UP',
        message: `🎉 Congratulations! You've reached ${newLevel.levelName} and earned ${newLevel.rewardPoints} bonus coins.`,
        read: false,
      },
    });
    console.log(`Notification created for user ${userId}`);
  } catch (error) {
    console.error(`Error in checkAndApplyLevelUp for user ${userId}:`, error);
    throw error;
  }
};

module.exports = {
  checkAndApplyLevelUp,
};
