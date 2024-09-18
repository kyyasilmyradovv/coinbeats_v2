// server/controllers/academyTypeController.js

const { PrismaClient } = require('@prisma/client');
const createError = require('http-errors');
const prisma = new PrismaClient();

// Create a new Academy Type
exports.createAcademyType = async (req, res, next) => {
  console.log('createAcademyType hit');
  const { name, description } = req.body;

  try {
    const newAcademyType = await prisma.academyType.create({
      data: {
        name,
        description,
      },
    });
    console.log('New Academy Type created:', newAcademyType);
    res.status(201).json(newAcademyType);
  } catch (error) {
    console.error('Error creating academy type:', error);
    next(
      createError(500, 'Internal Server Error: Error creating academy type')
    );
  }
};

// Get all Academy Types
exports.getAllAcademyTypes = async (req, res, next) => {
  console.log('getAllAcademyTypes hit');

  try {
    const academyTypes = await prisma.academyType.findMany({
      include: {
        initialQuestions: true,
      },
    });
    console.log('Academy Types fetched:', academyTypes);
    res.status(200).json(academyTypes);
  } catch (error) {
    console.error('Error fetching academy types:', error);
    next(
      createError(500, 'Internal Server Error: Error fetching academy types')
    );
  }
};

// Update an Academy Type
exports.updateAcademyType = async (req, res, next) => {
  console.log('updateAcademyType hit');
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const updatedAcademyType = await prisma.academyType.update({
      where: { id: parseInt(id, 10) },
      data: {
        ...(name && { name }),
        ...(description && { description }),
      },
    });
    console.log('Academy Type updated:', updatedAcademyType);
    res.status(200).json(updatedAcademyType);
  } catch (error) {
    console.error('Error updating academy type:', error);
    next(
      createError(500, 'Internal Server Error: Error updating academy type')
    );
  }
};

// Delete an Academy Type (Cascading delete of Initial Questions)
exports.deleteAcademyType = async (req, res, next) => {
  console.log('deleteAcademyType hit');
  const { id } = req.params;

  try {
    await prisma.academyType.delete({
      where: { id: parseInt(id, 10) },
    });
    console.log('Academy Type deleted');
    res.status(200).json({ message: 'Academy Type deleted successfully' });
  } catch (error) {
    console.error('Error deleting academy type:', error);
    next(
      createError(500, 'Internal Server Error: Error deleting academy type')
    );
  }
};

// Add an Initial Question to an Academy Type
exports.addInitialQuestion = async (req, res, next) => {
  console.log('addInitialQuestion hit');
  const { id } = req.params;
  const { question } = req.body;

  try {
    const newQuestion = await prisma.initialQuestion.create({
      data: {
        question,
        academyTypeId: parseInt(id, 10),
      },
    });
    console.log('New Initial Question added:', newQuestion);
    res.status(201).json(newQuestion);
  } catch (error) {
    console.error('Error adding initial question:', error);
    next(
      createError(500, 'Internal Server Error: Error adding initial question')
    );
  }
};

// Delete an Initial Question
exports.deleteInitialQuestion = async (req, res, next) => {
  console.log('deleteInitialQuestion hit');
  const { questionId } = req.params;

  try {
    await prisma.initialQuestion.delete({
      where: { id: parseInt(questionId, 10) },
    });
    console.log('Initial Question deleted');
    res.status(200).json({ message: 'Initial Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting initial question:', error);
    next(
      createError(500, 'Internal Server Error: Error deleting initial question')
    );
  }
};
