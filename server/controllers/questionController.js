// server/controllers/questionController.js

const { PrismaClient } = require('@prisma/client');
const createError = require('http-errors');
const prisma = new PrismaClient();

exports.getInitialQuestions = async (req, res, next) => {
  try {
    const { academyTypeId } = req.query;

    let whereClause = {};
    if (academyTypeId) {
      whereClause = { academyTypeId: parseInt(academyTypeId, 10) };
    }

    const initialQuestions = await prisma.initialQuestion.findMany({
      where: whereClause,
    });

    res.json(initialQuestions);
  } catch (error) {
    console.error('Error fetching initial questions:', error);
    next(createError(500, 'Error fetching initial questions'));
  }
};
