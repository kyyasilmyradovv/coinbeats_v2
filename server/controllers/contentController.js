// server/controllers/contentController.js

const { PrismaClient } = require('@prisma/client');
const createError = require('http-errors');
const prisma = new PrismaClient();
const { saveFile } = require('../uploadConfig'); // Reuse the saveFile function from uploadConfig.js

// Helper function to handle file uploads
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
      categories = '[]', // Expecting a JSON stringified array
      chains = '[]', // Expecting a JSON stringified array
    } = req.body;

    // Parse categories and chains
    const categoryNames = JSON.parse(categories);
    const chainNames = JSON.parse(chains);

    // Handle file uploads
    const logoUrl = handleFileUpload(req.files, 'logo');
    const coverPhotoUrl = handleFileUpload(req.files, 'coverPhoto');

    if (!name) {
      return next(createError(400, 'Name is required'));
    }

    // Fetch category records
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

    // Fetch chain records
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
      categories = '[]', // Expecting a JSON stringified array
      chains = '[]', // Expecting a JSON stringified array
    } = req.body;

    // Parse categories and chains
    const categoryNames = JSON.parse(categories);
    const chainNames = JSON.parse(chains);

    // Handle file uploads
    const logoUrl = handleFileUpload(req.files, 'logo');
    const coverPhotoUrl = handleFileUpload(req.files, 'coverPhoto');

    if (!name) {
      return next(createError(400, 'Name is required'));
    }

    // Fetch category records
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

    // Fetch chain records
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
      categories = '[]', // Expecting a JSON stringified array
      chains = '[]', // Expecting a JSON stringified array
    } = req.body;

    // Parse categories and chains
    const categoryNames = JSON.parse(categories);
    const chainNames = JSON.parse(chains);

    // Handle file uploads
    const logoUrl = handleFileUpload(req.files, 'logo');
    const coverPhotoUrl = handleFileUpload(req.files, 'coverPhoto');

    if (!title || !contentUrl || !type) {
      return next(
        createError(400, 'Title, content URL, and type are required')
      );
    }

    // Fetch category records
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

    // Fetch chain records
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
