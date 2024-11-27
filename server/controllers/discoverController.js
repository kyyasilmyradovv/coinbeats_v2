// controllers/discoverController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const createError = require('http-errors');

// Get all educators
exports.getAllEducators = async (req, res, next) => {
  try {
    const educators = await prisma.educator.findMany({
      include: {
        lessons: true,
      },
    });
    res.json(educators);
  } catch (error) {
    console.error('Error fetching educators:', error);
    next(createError(500, 'Error fetching educators'));
  }
};

// Get educator by ID
exports.getEducatorById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const educator = await prisma.educator.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        lessons: true,
      },
    });
    if (!educator) {
      return next(createError(404, 'Educator not found'));
    }
    res.json(educator);
  } catch (error) {
    console.error('Error fetching educator:', error);
    next(createError(500, 'Error fetching educator'));
  }
};

// Get all tutorials
exports.getAllTutorials = async (req, res, next) => {
  try {
    const tutorials = await prisma.tutorial.findMany({
      include: {
        categories: true,
      },
    });
    res.json(tutorials);
  } catch (error) {
    console.error('Error fetching tutorials:', error);
    next(createError(500, 'Error fetching tutorials'));
  }
};

// Get tutorial by ID
exports.getTutorialById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const tutorial = await prisma.tutorial.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        categories: true,
      },
    });
    if (!tutorial) {
      return next(createError(404, 'Tutorial not found'));
    }
    res.json(tutorial);
  } catch (error) {
    console.error('Error fetching tutorial:', error);
    next(createError(500, 'Error fetching tutorial'));
  }
};

// Similarly, implement getAllPodcasts, getPodcastById, etc.
