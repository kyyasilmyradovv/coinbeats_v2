// server/controllers/questionController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getInitialQuestions = async (req, res) => {
  try {
    const questions = await prisma.initialQuestion.findMany({
      include: {
        AcademyQuestion: { // Use the correct relation name
          include: {
            choices: true, // This is within the AcademyQuestion relation
          },
        },
      },
    });

    res.json(questions);
  } catch (error) {
    console.error('Error fetching initial questions:', error);
    res.status(500).json({ error: 'Error fetching initial questions' });
  }
};
