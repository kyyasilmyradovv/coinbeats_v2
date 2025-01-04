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

exports.getAllYoutubeChannels = async (req, res, next) => {
  try {
    const channels = await prisma.youtubeChannel.findMany({
      include: {
        categories: true,
        chains: true,
      },
    });
    res.json(channels);
  } catch (error) {
    console.error('Error fetching YouTube channels:', error);
    next(createError(500, 'Error fetching YouTube channels'));
  }
};

exports.getYoutubeChannelById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const channel = await prisma.youtubeChannel.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        categories: true,
        chains: true,
      },
    });
    if (!channel) {
      return next(createError(404, 'YouTube Channel not found'));
    }
    res.json(channel);
  } catch (error) {
    console.error('Error fetching YouTube channel:', error);
    next(createError(500, 'Error fetching YouTube channel'));
  }
};

exports.createYoutubeChannel = async (req, res, next) => {
  try {
    const {
      name,
      description,
      youtubeUrl,
      categories,
      chains,
      // ...any other fields
    } = req.body;

    // Create the channel
    const newChannel = await prisma.youtubeChannel.create({
      data: {
        name,
        description,
        youtubeUrl,
        // If you're handling images or contentOrigin, set them here...
        categories: {
          connect: categories?.map((catName) => ({ name: catName })) || [],
        },
        chains: {
          connect: chains?.map((chainName) => ({ name: chainName })) || [],
        },
      },
      include: {
        categories: true,
        chains: true,
      },
    });

    res.json(newChannel);
  } catch (error) {
    console.error('Error creating YouTube channel:', error);
    next(createError(500, 'Error creating YouTube channel'));
  }
};

// ========== TELEGRAM GROUPS ==========
exports.getAllTelegramGroups = async (req, res, next) => {
  try {
    const groups = await prisma.telegramGroup.findMany({
      include: {
        categories: true,
        chains: true,
      },
    });
    res.json(groups);
  } catch (error) {
    console.error('Error fetching Telegram groups:', error);
    next(createError(500, 'Error fetching Telegram groups'));
  }
};

exports.getTelegramGroupById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const group = await prisma.telegramGroup.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        categories: true,
        chains: true,
      },
    });
    if (!group) {
      return next(createError(404, 'Telegram Group not found'));
    }
    res.json(group);
  } catch (error) {
    console.error('Error fetching Telegram group:', error);
    next(createError(500, 'Error fetching Telegram group'));
  }
};

exports.createTelegramGroup = async (req, res, next) => {
  try {
    const {
      name,
      description,
      telegramUrl,
      categories,
      chains,
      // ...any other fields
    } = req.body;

    const newGroup = await prisma.telegramGroup.create({
      data: {
        name,
        description,
        telegramUrl,
        categories: {
          connect: categories?.map((catName) => ({ name: catName })) || [],
        },
        chains: {
          connect: chains?.map((chainName) => ({ name: chainName })) || [],
        },
      },
      include: {
        categories: true,
        chains: true,
      },
    });

    res.json(newGroup);
  } catch (error) {
    console.error('Error creating Telegram group:', error);
    next(createError(500, 'Error creating Telegram group'));
  }
};
