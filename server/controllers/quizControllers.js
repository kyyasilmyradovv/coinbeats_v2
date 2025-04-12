const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const asyncHandler = require('../utils/asyncHandler');

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
