// server/controllers/academyController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createAcademy = async (req, res) => {
  try {
    // Log incoming request data
    console.log('Received academy creation request:', req.body);

    // Extract data from request body
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

    const { userId } = req.user; // Assuming userId is extracted from the token middleware

    // Verify that mandatory fields are provided
    if (!name || !ticker) {
      console.error('Missing name or ticker');
      return res.status(400).json({ error: 'Name and ticker are required' });
    }

    // Create an academy and associate initial questions and their answers
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
            question: initialAnswer.question || '',  // Include the question field
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
    res.status(500).json({ error: 'Error creating academy' });
  }
};

exports.listMyAcademies = async (req, res) => {
  try {
    const { userId } = req.user;

    const academies = await prisma.academy.findMany({
      where: { creatorId: userId },
    });

    res.json(academies);
  } catch (error) {
    console.error('Error fetching academies:', error);
    res.status(500).json({ error: 'Error fetching academies' });
  }
};

exports.getAcademyDetails = async (req, res) => {
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
      return res.status(404).json({ error: 'Academy not found' });
    }

    res.json(academy);
  } catch (error) {
    console.error('Error fetching academy details:', error);
    res.status(500).json({ error: 'Error fetching academy details' });
  }
};

exports.updateAcademy = async (req, res) => {
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
    res.status(500).json({ error: 'Error updating academy' });
  }
};
