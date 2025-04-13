const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const asyncHandler = require('../utils/asyncHandler');
const { checkAndApplyLevelUp } = require('../services/levelService');

exports.getQuestions = asyncHandler(async (req, res, next) => {
  const { academyId } = req.query;

  const questions = await prisma.academyQuestion.findMany({
    where: { academyId: +academyId },
    select: {
      id: true,
      question: true,
      answer: true,
      quizQuestion: true,
      xp: true,
      choices: {
        where: { text: { not: '' } },
        select: {
          id: true,
          text: true,
          isCorrect: true,
          userResponses: {
            where: { userId: req.user.id },
            select: { isCorrect: true, pointsAwarded: true },
          },
        },
      },
    },
  });
  if (!questions || questions.length === 0)
    return res.status(404).json({ message: 'Questions not found' });

  // Process each question to determine whether to keep isCorrect
  for (let question of questions) {
    let hasIncorrectAnswer = false;

    for (let choice of question.choices) {
      if (
        choice.userResponses &&
        choice.userResponses.length > 0 &&
        choice.userResponses[0].isCorrect === false
      ) {
        hasIncorrectAnswer = true;
        break;
      }
    }

    if (!hasIncorrectAnswer) {
      for (let choice of question.choices) {
        delete choice.isCorrect;
      }
    }
  }

  res.json(questions);
});

exports.submitAnswer = asyncHandler(async (req, res, next) => {
  const { questionId: academyQuestionId, choiceId, secondsLeft } = req.body;

  const alreadyAnswered = await prisma.userResponse.findFirst({
    where: { userId: req.user.id, academyQuestionId },
    select: { id: true },
  });
  if (alreadyAnswered) {
    return res.status(409).json({ message: 'Already answered' });
  }

  const choice = await prisma.choice.findFirst({
    where: { id: choiceId },
    select: { isCorrect: true, academyQuestion: { select: { xp: true } } },
  });
  if (!choice) {
    return res.status(404).json({ message: 'Choice not found' });
  }

  let pointsAwarded = 0;
  let correctChoiceId = null;

  if (choice.isCorrect) {
    const totalXP = choice.academyQuestion.xp;
    if (secondsLeft > 25) {
      pointsAwarded = totalXP;
    } else if (secondsLeft > 0) {
      const basePoints = Math.floor(totalXP * 0.25);
      const remainingPoints = totalXP - basePoints;
      const elapsedSeconds = 25 - secondsLeft;
      const pointsDeducted = Math.floor(
        (remainingPoints / 25) * elapsedSeconds
      );
      pointsAwarded = totalXP - pointsDeducted;
    } else {
      pointsAwarded = Math.floor(totalXP * 0.25);
    }
  } else {
    const correctChoice = await prisma.choice.findFirst({
      where: { academyQuestionId, isCorrect: true },
      select: { id: true },
    });
    correctChoiceId = correctChoice?.id;
  }

  await prisma.userResponse.create({
    data: {
      userId: req.user.id,
      choiceId,
      isCorrect: choice.isCorrect,
      academyQuestionId,
      pointsAwarded,
    },
  });

  res
    .status(200)
    .json({ isCorrect: choice.isCorrect, pointsAwarded, correctChoiceId });
});

exports.finishQuiz = asyncHandler(async (req, res, next) => {
  const academyId = +req.query?.academyId,
    userId = req.user.id;

  if (!academyId)
    return res.status(400).json({ message: 'Academy ID is required.' });

  // Find all user responses for the given academy
  const userResponses = await prisma.userResponse.findMany({
    where: {
      userId,
      choice: { academyQuestion: { academyId } },
    },
  });

  if (userResponses.length === 0) {
    return res
      .status(409)
      .json({ message: 'No answers submitted for this quiz.' });
  }

  // Sum up the points awarded
  const totalPoints = userResponses.reduce(
    (sum, response) => sum + response.pointsAwarded,
    0
  );

  // Save the total points to the Points table
  const existingPoints = await prisma.point.findFirst({
    where: { userId, academyId },
  });
  if (existingPoints) {
    return res.status(409).json({ message: 'You already submitted' });
  }

  await prisma.point.create({
    data: { userId, academyId, value: totalPoints },
  });

  // Increase academy pointCount
  await prisma.academy.update({
    where: { id: academyId },
    data: { pointCount: { increment: 1 } },
  });

  // Increase user pointCount & lastWeekPointCount
  await prisma.user.update({
    where: { id: userId },
    data: {
      pointCount: { increment: totalPoints },
      lastWeekPointCount: { increment: totalPoints },
    },
  });

  let raffleIncrement = 0;
  if (totalPoints > 99) {
    raffleIncrement = Math.floor(totalPoints / 100);

    // Create a raffle entry
    await prisma.raffle.create({
      data: { userId, academyId, amount: raffleIncrement },
    });

    // Update user's raffleAmount
    await prisma.user.update({
      where: { id: userId },
      data: { raffleAmount: { increment: raffleIncrement } },
    });

    // Check for active raffle and update entries if found
    const hasRunningRaffle = await prisma.overallRaffle.findFirst({
      where: { academyId: academyId, isActive: true },
    });

    if (hasRunningRaffle) {
      await prisma.academyRaffleEntries.create({
        userId,
        academyId,
        amount: raffleIncrement,
      });
    }
  }

  await checkAndApplyLevelUp(userId);

  // Get the number of correct answers
  const correctAnswers = userResponses.filter(
    (response) => response.isCorrect
  ).length;
  const totalQuestions = userResponses.length;

  return res.status(200).json({
    totalPoints,
    rafflesEarned: raffleIncrement,
    correctAnswers,
    totalQuestions,
  });
});
