// server/controllers/academyController.js

const { PrismaClient } = require('@prisma/client');
const createError = require('http-errors');
const prisma = new PrismaClient();
const path = require('path');
const fs = require('fs');

const saveFile = (file) => {
  const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filename = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
  const filePath = path.join(uploadDir, filename);
  fs.writeFileSync(filePath, file.buffer);

  // Return the relative path
  return path.join('uploads', filename);
};

exports.createAcademy = async (req, res, next) => {
  try {
    const {
      name,
      ticker,
      webpageUrl = '',
      categories = '[]',
      chains = '[]',
      twitter = '',
      telegram = '',
      discord = '',
      coingecko = '',
      initialAnswers = '[]',
      tokenomics = '',
      teamBackground = '',
      congratsVideo = '',
      getStarted = '',
      raffles = '[]',
      quests = '[]',
    } = req.body;

    const { userId } = req.user;

    const logo = req.files['logo'] ? saveFile(req.files['logo'][0]) : null;
    const coverPhoto = req.files['coverPhoto'] ? saveFile(req.files['coverPhoto'][0]) : null;

    if (!name || !ticker) {
      return next(createError(400, 'Name and ticker are required'));
    }

    // Parse the categories, chains, initialAnswers, raffles, and quests from JSON strings to arrays
    const parsedCategories = JSON.parse(categories);
    const parsedChains = JSON.parse(chains);
    const parsedInitialAnswers = JSON.parse(initialAnswers);
    const parsedRaffles = JSON.parse(raffles);
    const parsedQuests = JSON.parse(quests);

    const categoryRecords = await Promise.all(
      parsedCategories.map(async (categoryName) => {
        const category = await prisma.category.findUnique({ where: { name: categoryName } });
        if (!category) {
          throw new Error(`Category "${categoryName}" not found in database`);
        }
        return category;
      })
    );

    const chainRecords = await Promise.all(
      parsedChains.map(async (chainName) => {
        const chain = await prisma.chain.findUnique({ where: { name: chainName } });
        if (!chain) {
          throw new Error(`Chain "${chainName}" not found in database`);
        }
        return chain;
      })
    );

    const academy = await prisma.academy.create({
      data: {
        name,
        ticker,
        logoUrl: logo,
        coverPhotoUrl: coverPhoto,
        categories: {
          connect: categoryRecords.map((category) => ({ id: category.id })),
        },
        chains: {
          connect: chainRecords.map((chain) => ({ id: chain.id })),
        },
        twitter,
        telegram,
        discord,
        coingecko,
        tokenomics,
        teamBackground,
        congratsVideo,
        getStarted,
        academyQuestions: {
          create: parsedInitialAnswers.map((initialAnswer) => ({
            initialQuestionId: initialAnswer.initialQuestionId,
            question: initialAnswer.question || '',
            answer: initialAnswer.answer || '',
            quizQuestion: initialAnswer.quizQuestion || '',
            choices: {
              create: initialAnswer.choices.map((choice) => ({
                text: choice.answer || '',
                isCorrect: choice.correct || false,
              })),
            },
          })),
        },
        raffles: {
          create: parsedRaffles.map((raffle) => ({
            amount: parseInt(raffle.amount, 10) || 0,
            reward: raffle.reward || '',
            currency: raffle.currency || '',
            chain: raffle.chain || '',
            dates: raffle.dates || '',
            totalPool: parseInt(raffle.totalPool, 10) || 0,
          })),
        },
        quests: {
          create: parsedQuests.map((quest) => ({
            name: quest.name || '',
            link: quest.link || '',
            platform: quest.platform || '',
          })),
        },
        webpageUrl,
        status: 'pending',
        creatorId: userId,
      },
    });

    res.status(201).json({ message: 'Academy created successfully', academy });
  } catch (error) {
    console.error('Error creating academy:', error);
    next(createError(500, 'Error creating academy'));
  }
};

exports.createBasicAcademy = async (req, res, next) => {
  try {
    const {
      name,
      ticker,
      categories = '[]',
      chains = '[]',
      twitter = '',
      telegram = '',
      discord = '',
      coingecko = '',
      tokenomics = '',
      teamBackground = '',
      congratsVideo = '',
      getStarted = '',
      webpageUrl = '',
    } = req.body;

    const { userId } = req.user;

    const logo = req.files['logo'] ? saveFile(req.files['logo'][0]) : null;
    const coverPhoto = req.files['coverPhoto'] ? saveFile(req.files['coverPhoto'][0]) : null;

    if (!name) {
      return next(createError(400, 'Name is required'));
    }

    // Parse the categories and chains from JSON strings to arrays
    const parsedCategories = JSON.parse(categories);
    const parsedChains = JSON.parse(chains);

    // Debug: Log the parsed categories and chains
    console.log('Parsed Categories:', parsedCategories);
    console.log('Parsed Chains:', parsedChains);

    const categoryRecords = await Promise.all(
      parsedCategories.map(async (categoryName) => {
        const category = await prisma.category.findUnique({ where: { name: categoryName } });
        if (!category) {
          throw new Error(`Category "${categoryName}" not found in database`);
        }
        return category;
      })
    );

    const chainRecords = await Promise.all(
      parsedChains.map(async (chainName) => {
        const chain = await prisma.chain.findUnique({ where: { name: chainName } });
        if (!chain) {
          throw new Error(`Chain "${chainName}" not found in database`);
        }
        return chain;
      })
    );

    const academy = await prisma.academy.create({
      data: {
        name,
        ticker,
        logoUrl: logo,
        coverPhotoUrl: coverPhoto,
        categories: {
          connect: categoryRecords.map((category) => ({ id: category.id })),
        },
        chains: {
          connect: chainRecords.map((chain) => ({ id: chain.id })),
        },
        twitter,
        telegram,
        discord,
        coingecko,
        tokenomics,
        teamBackground,
        congratsVideo,
        getStarted,
        webpageUrl,
        status: 'pending',
        creatorId: userId,
      },
    });

    res.status(201).json({ message: 'Basic academy created successfully', academy });
  } catch (error) {
    console.error('Error creating basic academy:', error);
    next(createError(500, 'Error creating basic academy'));
  }
};

exports.updateAcademy = async (req, res, next) => {
  const { id } = req.params;
  const {
    name,
    ticker,
    categories = [],
    chains = [],
    twitter = '',
    telegram = '',
    discord = '',
    coingecko = '',
    initialAnswers = [],
    quizQuestions = [],
    tokenomics = '',
    teamBackground = '',
    congratsVideo = '',
    getStarted = '',
    raffles = [],
    quests = [],
    webpageUrl = '',
  } = req.body;

  try {
    const logo = req.files['logo'] ? saveFile(req.files['logo'][0]) : null;
    const coverPhoto = req.files['coverPhoto'] ? saveFile(req.files['coverPhoto'][0]) : null;

    const updatedAcademy = await prisma.academy.update({
      where: { id: parseInt(id, 10) },
      data: {
        name,
        ticker,
        logoUrl: logo || undefined,
        coverPhotoUrl: coverPhoto || undefined,
        categories: { set: categories.map((category) => ({ name: category })) },
        chains: { set: chains.map((chain) => ({ name: chain })) },
        twitter,
        telegram,
        discord,
        coingecko,
        academyQuestions: {
          deleteMany: {}, // Clear old questions and answers
          create: quizQuestions.map((quizQuestion, index) => ({
            initialQuestionId: initialAnswers[index].initialQuestionId,
            answer: initialAnswers[index].answer,
            quizQuestion: quizQuestion.quizQuestion,
            choices: {
              create: quizQuestion.choices.map((choice, choiceIndex) => ({
                text: choice,
                isCorrect: quizQuestion.correct.includes(choiceIndex),
              })),
            },
          })),
        },
        tokenomics,
        teamBackground,
        congratsVideo,
        getStarted,
        raffles: {
          deleteMany: {},
          create: raffles.map((raffle) => ({
            amount: parseInt(raffle.amount, 10),
            reward: raffle.reward,
            currency: raffle.currency,
            chain: raffle.chain,
            dates: raffle.dates,
            totalPool: parseInt(raffle.totalPool, 10),
          })),
        },
        quests: {
          deleteMany: {},
          create: quests.map((quest) => ({
            name: quest.name,
            link: quest.link,
            platform: quest.platform,
          })),
        },
        webpageUrl,
      },
    });

    res.json({ message: 'Academy updated successfully', academy: updatedAcademy });
  } catch (error) {
    console.error('Error updating academy:', error);
    next(createError(500, 'Error updating academy'));
  }
};

exports.listMyAcademies = async (req, res, next) => {
  try {
    const { userId } = req.user;

    const academies = await prisma.academy.findMany({
      where: { creatorId: userId },
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true, // Add this line
      },
    });

    if (!academies.length) {
      return next(createError(404, 'No academies found for this user'));
    }

    res.json(academies);
  } catch (error) {
    console.error('Error fetching academies:', error);
    next(createError(500, 'Error fetching academies'));
  }
};

exports.getAcademyDetails = async (req, res, next) => {
  const { id } = req.params;
  try {
    const academy = await prisma.academy.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        categories: true,
        chains: true,
        academyQuestions: {
          include: {
            choices: true,
            initialQuestion: true,
          },
        },
        raffles: true,
        quests: true,
      },
    });

    if (!academy) {
      return next(createError(404, 'Academy not found'));
    }

    res.json(academy);
  } catch (error) {
    console.error('Error fetching academy details:', error);
    next(createError(500, 'Error fetching academy details'));
  }
};

exports.getPendingAcademies = async (req, res, next) => {
  try {
    const academies = await prisma.academy.findMany({
      where: { status: 'pending' },
      include: { creator: true },
    });

    if (!academies.length) {
      return next(createError(404, 'No pending academies found'));
    }

    res.json(academies);
  } catch (error) {
    console.error('Failed to fetch pending academies:', error);
    next(createError(500, 'Internal server error'));
  }
};

exports.approveAcademy = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updatedAcademy = await prisma.academy.update({
      where: { id: parseInt(id, 10) },
      data: { status: 'approved' },
    });

    res.json({ message: 'Academy approved successfully', academy: updatedAcademy });
  } catch (error) {
    console.error('Error approving academy:', error);
    next(createError(500, 'Internal server error'));
  }
};

exports.rejectAcademy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const updatedAcademy = await prisma.academy.update({
      where: { id: parseInt(id, 10) },
      data: {
        status: 'rejected',
        rejectionReason: reason || null,
      },
    });

    res.json({ message: 'Academy rejected successfully', academy: updatedAcademy });
  } catch (error) {
    console.error('Error rejecting academy:', error);
    next(createError(500, 'Internal server error'));
  }
};

exports.addRaffles = async (req, res, next) => {
  const { id } = req.params;
  const { raffles } = req.body;

  try {
    const academy = await prisma.academy.update({
      where: { id: parseInt(id, 10) },
      data: {
        raffles: {
          create: raffles.map((raffle) => ({
            amount: parseInt(raffle.amount, 10) || 0,
            reward: raffle.reward || '',
            currency: raffle.currency || '',
            chain: raffle.chain || '',
            dates: raffle.dates || '',
            totalPool: parseInt(raffle.totalPool, 10) || 0,
          })),
        },
      },
    });

    res.status(200).json({ message: 'Raffles added successfully', academy });
  } catch (error) {
    console.error('Error adding raffles:', error);
    next(createError(500, 'Error adding raffles'));
  }
};

exports.addQuests = async (req, res, next) => {
  const { id } = req.params;
  const { quests } = req.body;

  try {
    const academy = await prisma.academy.update({
      where: { id: parseInt(id, 10) },
      data: {
        quests: {
          create: quests.map((quest) => ({
            name: quest.name || '',
            link: quest.link || '',
            platform: quest.platform || '',
          })),
        },
      },
    });

    res.status(200).json({ message: 'Quests added successfully', academy });
  } catch (error) {
    console.error('Error adding quests:', error);
    next(createError(500, 'Error adding quests'));
  }
};

exports.updateAcademyWithVideos = async (req, res, next) => {
  const { id } = req.params;
  const { videoUrls = [] } = req.body;

  try {
    const updatedAcademy = await prisma.academy.update({
      where: { id: parseInt(id, 10) },
      data: {
        academyQuestions: {
          updateMany: videoUrls.map((videoUrl, index) => ({
            where: { initialQuestionId: videoUrl.initialQuestionId },
            data: { video: videoUrl.url },
          })),
        },
      },
    });

    res.json({ message: 'Video lessons added successfully', academy: updatedAcademy });
  } catch (error) {
    console.error('Error updating academy with videos:', error);
    next(createError(500, 'Error updating academy with videos'));
  }
};

exports.deleteAcademy = async (req, res, next) => {
  const { id } = req.params;

  try {
    const academy = await prisma.academy.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        categories: true,
        chains: true,
        academyQuestions: true,
        raffles: true,
        quests: true,
      },
    });

    if (!academy) {
      return next(createError(404, 'Academy not found'));
    }

    await prisma.academy.update({
      where: { id: parseInt(id, 10) },
      data: {
        categories: { disconnect: true },
        chains: { disconnect: true },
        academyQuestions: {
          deleteMany: {}, // Deleting related academy questions
        },
        raffles: {
          deleteMany: {}, // Deleting related raffles
        },
        quests: {
          deleteMany: {}, // Deleting related quests
        },
      },
    });

    await prisma.academy.delete({ where: { id: parseInt(id, 10) } });

    res.json({ message: 'Academy deleted successfully' });
  } catch (error) {
    console.error('Error deleting academy:', error);
    next(createError(500, 'Failed to delete academy'));
  }
};

exports.allocateXp = async (req, res, next) => {
  const { id } = req.params;
  const { quizXp, questXp } = req.body;

  try {
    const academy = await prisma.academy.findUnique({ where: { id: parseInt(id, 10) } });

    if (!academy) {
      return next(createError(404, 'Academy not found'));
    }

    for (const questionId in quizXp) {
      await prisma.academyQuestion.update({
        where: { id: parseInt(questionId, 10) },
        data: { xp: quizXp[questionId] },
      });
    }

    for (const questId in questXp) {
      await prisma.quest.update({
        where: { id: parseInt(questId, 10) },
        data: { xp: questXp[questId] },
      });
    }

    res.json({ message: 'XP allocated successfully' });
  } catch (error) {
    console.error('Error allocating XP:', error);
    next(createError(500, 'Failed to allocate XP'));
  }
};
