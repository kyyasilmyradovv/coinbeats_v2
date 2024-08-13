// server/controllers/academyController.js

const { PrismaClient } = require('@prisma/client');
const createError = require('http-errors');
const prisma = new PrismaClient();

exports.createAcademy = async (req, res, next) => {
  try {
    console.log('Received academy creation request:', req.body);

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
      tokenomics = '',
      teamBackground = '',
      congratsVideo = '',
      getStarted = '',
      raffles = [],
      quests = [],
      webpageUrl = '',
    } = req.body;

    const { userId } = req.user;

    if (!name || !ticker) {
      console.error('Missing name or ticker');
      return next(createError(400, 'Name and ticker are required'));
    }

    const academy = await prisma.academy.create({
      data: {
        name,
        ticker,
        categories: {
          connect: categories.map((category) => ({ name: category })),
        },
        chains: {
          connect: chains.map((chain) => ({ name: chain })),
        },
        twitter,
        telegram,
        discord,
        coingecko,
        academyQuestions: {
          create: initialAnswers.map((initialAnswer) => ({
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
        tokenomics,
        teamBackground,
        congratsVideo,
        getStarted,
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
        quests: {
          create: quests.map((quest) => ({
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

exports.listMyAcademies = async (req, res, next) => {
  try {
    const { userId } = req.user;

    const academies = await prisma.academy.findMany({
      where: { creatorId: userId },
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
    logoUrl = '',
    coverPhotoUrl = '',
    webpageUrl = '',
  } = req.body;

  try {
    const updatedAcademy = await prisma.academy.update({
      where: { id: parseInt(id, 10) },
      data: {
        name,
        ticker,
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
        logoUrl,
        coverPhotoUrl,
        webpageUrl,
      },
    });

    res.json({ message: 'Academy updated successfully', academy: updatedAcademy });
  } catch (error) {
    console.error('Error updating academy:', error);
    next(createError(500, 'Error updating academy'));
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
