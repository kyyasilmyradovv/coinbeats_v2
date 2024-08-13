// server/controllers/questionController.js

const { PrismaClient } = require('@prisma/client');
const createError = require('http-errors');
const prisma = new PrismaClient();

exports.getInitialQuestions = async (req, res, next) => {
  try {
    const questions = await prisma.initialQuestion.findMany({
      include: {
        AcademyQuestion: {
          include: {
            choices: true,
          },
        },
      },
    });

    if (!questions.length) {
      return next(createError(404, 'No initial questions found'));
    }

    res.json(questions);
  } catch (error) {
    console.error('Error fetching initial questions:', error);
    next(createError(500, 'Error fetching initial questions'));
  }
};
