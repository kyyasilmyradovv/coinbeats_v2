// server/controllers/contentController.js

const { PrismaClient } = require('@prisma/client');
const createError = require('http-errors');
const prisma = new PrismaClient();
const { saveFile } = require('../uploadConfig');

const handleFileUpload = (files, fieldName) => {
  return files && files[fieldName] ? saveFile(files[fieldName][0]) : null;
};

// Create Podcast
exports.createPodcast = async (req, res, next) => {
  try {
    const {
      name,
      description,
      spotifyUrl = '',
      appleUrl = '',
      youtubeUrl = '',
      categories = '[]',
      chains = '[]',
      contentOrigin, // This is now passed from the front end
    } = req.body;

    const categoryNames = JSON.parse(categories);
    const chainNames = JSON.parse(chains);

    const logoUrl = handleFileUpload(req.files, 'logo');
    const coverPhotoUrl = handleFileUpload(req.files, 'coverPhoto');

    if (!name) {
      return next(createError(400, 'Name is required'));
    }

    const categoryRecords = await Promise.all(
      categoryNames.map(async (categoryName) => {
        const category = await prisma.category.findUnique({
          where: { name: categoryName },
        });
        if (!category) {
          throw new Error(`Category "${categoryName}" not found in database`);
        }
        return category;
      })
    );

    const chainRecords = await Promise.all(
      chainNames.map(async (chainName) => {
        const chain = await prisma.chain.findUnique({
          where: { name: chainName },
        });
        if (!chain) {
          throw new Error(`Chain "${chainName}" not found in database`);
        }
        return chain;
      })
    );

    const podcast = await prisma.podcast.create({
      data: {
        name,
        description,
        logoUrl,
        coverPhotoUrl,
        spotifyUrl,
        appleUrl,
        youtubeUrl,
        contentOrigin:
          contentOrigin === 'PLATFORM_BASED'
            ? 'PLATFORM_BASED'
            : 'CREATOR_BASED',
        categories: {
          connect: categoryRecords.map((category) => ({ id: category.id })),
        },
        chains: {
          connect: chainRecords.map((chain) => ({ id: chain.id })),
        },
      },
    });

    res.status(201).json({ message: 'Podcast created successfully', podcast });
  } catch (error) {
    console.error('Error creating podcast:', error);
    next(createError(500, 'Error creating podcast'));
  }
};

// Create Educator
exports.createEducator = async (req, res, next) => {
  try {
    const {
      name,
      bio,
      youtubeUrl = '',
      twitterUrl = '',
      telegramUrl = '',
      discordUrl = '',
      categories = '[]',
      chains = '[]',
      contentOrigin,
    } = req.body;

    const categoryNames = JSON.parse(categories);
    const chainNames = JSON.parse(chains);

    const logoUrl = handleFileUpload(req.files, 'logo');
    const coverPhotoUrl = handleFileUpload(req.files, 'coverPhoto');

    if (!name) {
      return next(createError(400, 'Name is required'));
    }

    const categoryRecords = await Promise.all(
      categoryNames.map(async (categoryName) => {
        const category = await prisma.category.findUnique({
          where: { name: categoryName },
        });
        if (!category) {
          throw new Error(`Category "${categoryName}" not found in database`);
        }
        return category;
      })
    );

    const chainRecords = await Promise.all(
      chainNames.map(async (chainName) => {
        const chain = await prisma.chain.findUnique({
          where: { name: chainName },
        });
        if (!chain) {
          throw new Error(`Chain "${chainName}" not found in database`);
        }
        return chain;
      })
    );

    const educator = await prisma.educator.create({
      data: {
        name,
        bio,
        logoUrl,
        coverPhotoUrl,
        youtubeUrl,
        twitterUrl,
        telegramUrl,
        discordUrl,
        contentOrigin:
          contentOrigin === 'PLATFORM_BASED'
            ? 'PLATFORM_BASED'
            : 'CREATOR_BASED',
        categories: {
          connect: categoryRecords.map((category) => ({ id: category.id })),
        },
        chains: {
          connect: chainRecords.map((chain) => ({ id: chain.id })),
        },
      },
    });

    res
      .status(201)
      .json({ message: 'Educator created successfully', educator });
  } catch (error) {
    console.error('Error creating educator:', error);
    next(createError(500, 'Error creating educator'));
  }
};

// Create Tutorial
exports.createTutorial = async (req, res, next) => {
  try {
    const {
      title,
      description,
      contentUrl,
      type,
      categories = '[]',
      chains = '[]',
      contentOrigin,
    } = req.body;

    const categoryNames = JSON.parse(categories);
    const chainNames = JSON.parse(chains);

    const logoUrl = handleFileUpload(req.files, 'logo');
    const coverPhotoUrl = handleFileUpload(req.files, 'coverPhoto');

    if (!title || !contentUrl || !type) {
      return next(
        createError(400, 'Title, content URL, and type are required')
      );
    }

    const categoryRecords = await Promise.all(
      categoryNames.map(async (categoryName) => {
        const category = await prisma.category.findUnique({
          where: { name: categoryName },
        });
        if (!category) {
          throw new Error(`Category "${categoryName}" not found in database`);
        }
        return category;
      })
    );

    const chainRecords = await Promise.all(
      chainNames.map(async (chainName) => {
        const chain = await prisma.chain.findUnique({
          where: { name: chainName },
        });
        if (!chain) {
          throw new Error(`Chain "${chainName}" not found in database`);
        }
        return chain;
      })
    );

    const tutorial = await prisma.tutorial.create({
      data: {
        title,
        description,
        contentUrl,
        type,
        logoUrl,
        coverPhotoUrl,
        contentOrigin:
          contentOrigin === 'PLATFORM_BASED'
            ? 'PLATFORM_BASED'
            : 'CREATOR_BASED',
        categories: {
          connect: categoryRecords.map((category) => ({ id: category.id })),
        },
        chains: {
          connect: chainRecords.map((chain) => ({ id: chain.id })),
        },
      },
    });

    res
      .status(201)
      .json({ message: 'Tutorial created successfully', tutorial });
  } catch (error) {
    console.error('Error creating tutorial:', error);
    next(createError(500, 'Error creating tutorial'));
  }
};

// Get Podcasts
exports.getPodcasts = async (req, res, next) => {
  try {
    const podcasts = await prisma.podcast.findMany({
      include: {
        categories: true,
        chains: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json(podcasts);
  } catch (error) {
    console.error('Error fetching podcasts:', error);
    next(createError(500, 'Error fetching podcasts'));
  }
};

// Get Educators
exports.getEducators = async (req, res, next) => {
  try {
    const educators = await prisma.educator.findMany({
      include: {
        categories: true,
        chains: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json(educators);
  } catch (error) {
    console.error('Error fetching educators:', error);
    next(createError(500, 'Error fetching educators'));
  }
};

// Get Tutorials
exports.getTutorials = async (req, res, next) => {
  try {
    const tutorials = await prisma.tutorial.findMany({
      include: {
        categories: true,
        chains: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json(tutorials);
  } catch (error) {
    console.error('Error fetching tutorials:', error);
    next(createError(500, 'Error fetching tutorials'));
  }
};
