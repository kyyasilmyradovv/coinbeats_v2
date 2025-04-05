const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const asyncHandler = require('../utils/asyncHandler');

exports.getQuestions = asyncHandler(async (req, res, next) => {
  const { academyId } = req.query;

  const questions = await prisma.academyQuestion.findMany({
    where: { academyId: +academyId },
    select: {
      id: true,
      initialQuestionId: true,
      question: true,
      answer: true,
      quizQuestion: true,
      video: true,
      xp: true,
      choices: {
        where: { text: { not: '' } },
        select: { id: true, text: true },
      },
      initialQuestion: true,
    },
  });

  if (!questions || questions.length === 0)
    return res.status(404).json({ message: 'Questions not found' });

  res.json(questions);
});

exports.submitAnswer = asyncHandler(async (req, res, next) => {
  const { academyId } = req.query;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  // Find all user responses for the given academy
  const userResponses = await prisma.userResponse.findMany({
    where: {
      userId: userId,
      choice: { academyQuestion: { academyId: +academyId } },
    },
  });

  const totalPoints = userResponses.reduce(
    (sum, response) => sum + response.pointsAwarded,
    0
  );

  const existingPoints = await prisma.point.findFirst({
    where: {
      userId: userId,
      academyId: parseInt(academyId, 10),
    },
  });

  if (existingPoints) {
    // If the user already has points for this academy, update the existing record
    await prisma.point.update({
      where: { id: existingPoints.id },
      data: { value: totalPoints },
    });

    // Increase user pointCount & lastWeekPointCount
    await prisma.user.update({
      where: { id: +userId },
      data: {
        pointCount: { increment: totalPoints - existingPoints.value },
        lastWeekPointCount: { increment: totalPoints - existingPoints.value },
      },
    });

    console.log(
      `Updated existing points record for user ${userId} and academy ${academyId}`
    );
  } else {
    // Otherwise, create a new record
    await prisma.point.create({
      data: {
        userId,
        academyId: parseInt(academyId, 10),
        value: totalPoints,
      },
    });

    // Increase academy pointCount
    await prisma.academy.update({
      where: { id: +academyId },
      data: { pointCount: { increment: 1 } },
    });

    // Increase user pointCount & lastWeekPointCount
    await prisma.user.update({
      where: { id: +userId },
      data: {
        pointCount: { increment: totalPoints },
        lastWeekPointCount: { increment: totalPoints },
      },
    });

    console.log(
      `Created new points record for user ${userId} and academy ${academyId}`
    );
  }

  if (totalPoints > 99) {
    const incrementAmount = totalPoints / 100;

    // Create a raffle entry
    await prisma.raffle.create({
      data: {
        userId,
        academyId: parseInt(academyId, 10),
        amount: incrementAmount,
      },
    });

    // Update user's raffleAmount
    await prisma.user.update({
      where: { id: userId },
      data: { raffleAmount: { increment: incrementAmount } },
    });

    // Upsert the entry in academyRaffleEntries
    const hasRunningRaffle = await prisma.overallRaffle.findFirst({
      where: { academyId, isActive: true },
    });
    if (hasRunningRaffle != null) {
      await prisma.academyRaffleEntries.upsert({
        where: { userId_academyId: { userId, academyId } },
        update: {
          amount: { increment: incrementAmount },
        },
        create: {
          userId,
          academyId: parseInt(academyId, 10),
          amount: incrementAmount,
        },
      });
    }
  }

  // Call checkAndApplyLevelUp to handle level up and notifications
  console.log(`Calling checkAndApplyLevelUp for user ${userId}`);
  await checkAndApplyLevelUp(userId);
  console.log(`Completed checkAndApplyLevelUp for user ${userId}`);

  res.json({ message: `Congratulations! You've earned ${totalPoints} XP.` });
});
