// server/controllers/discoverController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const createError = require('http-errors');

// Get all Educators
exports.getAllEducators = async (req, res, next) => {
  try {
    const educators = await prisma.educator.findMany({
      include: {
        lessons: true,
        categories: true,
        chains: true,
      },
    });
    res.json(educators);
  } catch (error) {
    console.error('Error fetching educators:', error);
    next(createError(500, 'Error fetching educators'));
  }
};

// Get Educator by ID
exports.getEducatorById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const educator = await prisma.educator.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        lessons: true,
        categories: true,
        chains: true,
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

// Get all Tutorials
exports.getAllTutorials = async (req, res, next) => {
  try {
    const tutorials = await prisma.tutorial.findMany({
      include: {
        categories: true,
        chains: true,
      },
    });
    res.json(tutorials);
  } catch (error) {
    console.error('Error fetching tutorials:', error);
    next(createError(500, 'Error fetching tutorials'));
  }
};

// Get Tutorial by ID
exports.getTutorialById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const tutorial = await prisma.tutorial.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        categories: true,
        chains: true,
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

// Get all Podcasts
exports.getAllPodcasts = async (req, res, next) => {
  try {
    const podcasts = await prisma.podcast.findMany({
      include: {
        categories: true,
        chains: true,
      },
    });
    res.json(podcasts);
  } catch (error) {
    console.error('Error fetching podcasts:', error);
    next(createError(500, 'Error fetching podcasts'));
  }
};

// Get Podcast by ID
exports.getPodcastById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const podcast = await prisma.podcast.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        categories: true,
        chains: true,
      },
    });
    if (!podcast) {
      return next(createError(404, 'Podcast not found'));
    }
    res.json(podcast);
  } catch (error) {
    console.error('Error fetching podcast:', error);
    next(createError(500, 'Error fetching podcast'));
  }
};
