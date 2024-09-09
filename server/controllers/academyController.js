// server/controllers/academyController.js

const { PrismaClient } = require('@prisma/client');
const createError = require('http-errors');
const prisma = new PrismaClient();
const { saveFile } = require('../uploadConfig'); // Reuse the saveFile function from the uploadConfig.js

// Helper function to handle file uploads
const handleFileUpload = (files, fieldName) => {
  return files && files[fieldName] ? saveFile(files[fieldName][0]) : null;
};

// Helper function to allocate XP
const allocateXp = async (academyId, totalXp) => {
  // Fetch all the questions and quests for the academy
  const questions = await prisma.academyQuestion.findMany({
    where: { academyId },
  });
  
  const quests = await prisma.quest.findMany({
    where: { academyId },
  });

  const totalElements = questions.length + quests.length;
  
  // If there are no questions or quests, exit
  if (totalElements === 0) {
    throw new Error('No questions or quests to allocate XP.');
  }

  // Calculate the base XP per element and the remainder
  const baseXp = Math.floor(totalXp / totalElements);
  let remainderXp = totalXp % totalElements;

  // Allocate XP to questions
  for (let i = 0; i < questions.length; i++) {
    let xpToAssign = baseXp;
    if (remainderXp > 0) {
      xpToAssign += 1;  // Assign 1 extra XP from the remainder
      remainderXp -= 1;
    }

    await prisma.academyQuestion.update({
      where: { id: questions[i].id },
      data: { xp: xpToAssign },
    });
  }

  // Allocate XP to quests
  for (let i = 0; i < quests.length; i++) {
    let xpToAssign = baseXp;
    if (remainderXp > 0) {
      xpToAssign += 1;  // Assign 1 extra XP from the remainder
      remainderXp -= 1;
    }

    await prisma.quest.update({
      where: { id: quests[i].id },
      data: { xp: xpToAssign },
    });
  }
};

// Create Academy Controller
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
      coingeckoLink = '',
      dexScreenerLink = '',
      contractAddress = ''
    } = req.body;

    const { userId } = req.user;

    // Handle file uploads
    const logoUrl = handleFileUpload(req.files, 'logo');
    const coverPhotoUrl = handleFileUpload(req.files, 'coverPhoto');

    if (!name || !ticker) {
      return next(createError(400, 'Name and ticker are required'));
    }

    const parsedCategories = JSON.parse(categories);
    const parsedChains = JSON.parse(chains);
    const parsedInitialAnswers = JSON.parse(initialAnswers);
    const parsedRaffles = JSON.parse(raffles);
    const parsedQuests = JSON.parse(quests);

    // Handle tokenomics data (question 4)
    const tokenomicsData = {
      chains: parsedInitialAnswers[3]?.chains || [],
      utility: parsedInitialAnswers[3]?.utility || '',
      totalSupply: parsedInitialAnswers[3]?.totalSupply || '',
      logic: parsedInitialAnswers[3]?.logic || '',
      coingecko: parsedInitialAnswers[3]?.coingecko || coingeckoLink,
      dexScreener: parsedInitialAnswers[3]?.dexScreener || dexScreenerLink,
      contractAddress: parsedInitialAnswers[3]?.contractAddress || contractAddress,
    };

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
        logoUrl,
        coverPhotoUrl,
        categories: {
          connect: categoryRecords.map((category) => ({ id: category.id })),
        },
        chains: {
          connect: chainRecords.map((chain) => ({ id: chain.id })),
        },
        twitter,
        telegram,
        discord,
        coingecko: coingeckoLink,
        dexScreener: dexScreenerLink,
        contractAddress,
        tokenomics: tokenomicsData,
        teamBackground,
        congratsVideo,
        getStarted,
        academyQuestions: {
          create: parsedInitialAnswers.map((initialAnswer, index) => ({
            initialQuestionId: initialAnswer.initialQuestionId,
            question: initialAnswer.question || '',
            answer: index === 3 ? JSON.stringify(tokenomicsData) : initialAnswer.answer || '',  // Save tokenomics data as JSON string for question 4
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

    // Allocate XP to Academy Questions and Quests
    await allocateXp(academy.id, 200);  // Total XP to allocate is 200

    res.status(201).json({ message: 'Academy created successfully', academy });
  } catch (error) {
    console.error('Error creating academy:', error);
    next(createError(500, 'Error creating academy'));
  }
};

// Create Basic Academy Controller
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
      coingeckoLink = '',
      dexScreenerLink = '',
      contractAddress = ''
    } = req.body;

    const { userId } = req.user;

    // Handle file uploads
    const logoUrl = handleFileUpload(req.files, 'logo');
    const coverPhotoUrl = handleFileUpload(req.files, 'coverPhoto');

    if (!name) {
      return next(createError(400, 'Name is required'));
    }

    const parsedCategories = JSON.parse(categories);
    const parsedChains = JSON.parse(chains);

    // Handle tokenomics data
    const tokenomicsData = {
      coingecko: coingeckoLink,
      dexScreener: dexScreenerLink,
      contractAddress,
    };

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
        logoUrl,
        coverPhotoUrl,
        categories: {
          connect: categoryRecords.map((category) => ({ id: category.id })),
        },
        chains: {
          connect: chainRecords.map((chain) => ({ id: chain.id })),
        },
        twitter,
        telegram,
        discord,
        coingecko: coingeckoLink,  // Save the coingecko link
        dexScreener: dexScreenerLink,  // Save the dex screener link
        contractAddress,  // Save the contract address
        tokenomics: tokenomicsData,  // Save the tokenomics data as a JSON object
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

// Update Academy Controller
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
    tokenomics = '',
    teamBackground = '',
    congratsVideo = '',
    getStarted = '',
    raffles = [],
    quests = [],
    webpageUrl = '',
  } = req.body;

  try {
    const parsedCategories = Array.isArray(categories) ? categories : JSON.parse(categories);
    const parsedChains = Array.isArray(chains) ? chains : JSON.parse(chains);
    const parsedInitialAnswers = Array.isArray(initialAnswers) ? initialAnswers : JSON.parse(initialAnswers);
    const parsedRaffles = Array.isArray(raffles) ? raffles : JSON.parse(raffles);
    const parsedQuests = Array.isArray(quests) ? quests : JSON.parse(quests);

    // Handle file uploads
    const logoUrl = handleFileUpload(req.files, 'logo');
    const coverPhotoUrl = handleFileUpload(req.files, 'coverPhoto');

    const updatedAcademy = await prisma.academy.update({
      where: { id: parseInt(id, 10) },
      data: {
        name,
        ticker,
        logoUrl: logoUrl || undefined, // Use existing if no new file is uploaded
        coverPhotoUrl: coverPhotoUrl || undefined, // Use existing if no new file is uploaded
        categories: { set: parsedCategories.map((category) => ({ name: category })) },
        chains: { set: parsedChains.map((chain) => ({ name: chain })) },
        twitter,
        telegram,
        discord,
        coingecko,
        tokenomics,
        teamBackground,
        congratsVideo,
        getStarted,
        academyQuestions: {
          deleteMany: {}, // Clear existing questions
          create: parsedInitialAnswers.map((initialAnswer) => ({
            initialQuestionId: initialAnswer.initialQuestionId,
            question: initialAnswer.question,
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
          deleteMany: {},
          create: parsedRaffles.map((raffle) => ({
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
          create: parsedQuests.map((quest) => ({
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

// Additional Controllers (for fetching, approving, rejecting academies) remain unchanged


exports.listMyAcademies = async (req, res, next) => {
  try {
    const { userId } = req.user;

    const academies = await prisma.academy.findMany({
      where: { creatorId: userId },
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
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

    // Ensure empty fields are returned
    academy.academyQuestions = academy.academyQuestions || [];
    academy.raffles = academy.raffles || [];
    academy.quests = academy.quests || [];

    console.log("Academy details response:", academy); // Log for debugging

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
          updateMany: videoUrls.map((videoUrl) => ({
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

exports.getVideoUrls = async (req, res, next) => {
  const { id } = req.params; // Academy ID
  
  // Log the raw academyId to verify it's being received correctly
  console.log("Raw academyId from request params:", id);
  
  // Ensure that the ID is properly parsed
  const academyId = parseInt(id, 10);
  console.log("Parsed academyId:", academyId);

  if (isNaN(academyId)) {
    return res.status(400).json({ error: 'Invalid academyId' });
  }

  try {
    const questions = await prisma.academyQuestion.findMany({
      where: { academyId: academyId },
      select: {
        initialQuestionId: true,
        video: true,
      },
    });

    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: 'No video URLs found for this academy' });
    }

    res.json({ videoUrls: questions });
  } catch (error) {
    console.error('Error fetching video URLs:', error);
    next(createError(500, 'Error fetching video URLs'));
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
        academyQuestions: {
          include: {
            choices: true, // Ensure choices are included in the deletion cascade
          },
        },
        raffles: true,
        quests: true,
      },
    });

    if (!academy) {
      return next(createError(404, 'Academy not found'));
    }

    // First, delete all related records that have foreign key constraints
    await prisma.choice.deleteMany({
      where: {
        academyQuestionId: {
          in: academy.academyQuestions.map(q => q.id),
        },
      },
    });

    await prisma.academyQuestion.deleteMany({
      where: {
        academyId: parseInt(id, 10),
      },
    });

    await prisma.raffle.deleteMany({
      where: {
        academyId: parseInt(id, 10),
      },
    });

    await prisma.quest.deleteMany({
      where: {
        academyId: parseInt(id, 10),
      },
    });

    await prisma.academy.update({
      where: { id: parseInt(id, 10) },
      data: {
        categories: { disconnect: academy.categories.map(cat => ({ id: cat.id })) },
        chains: { disconnect: academy.chains.map(chain => ({ id: chain.id })) },
      },
    });

    // Finally, delete the academy itself
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

exports.getAllAcademies = async (req, res, next) => {
  try {
    const academies = await prisma.academy.findMany({
      include: {
        categories: true,
        chains: true,
      },
      orderBy: [
        { createdAt: 'desc' }, // Order by creation date for the "New" filter
      ],
    });

    res.json(academies);
  } catch (error) {
    console.error('Error fetching academies:', error);
    next(createError(500, 'Error fetching academies'));
  }
};

exports.getAcademyQuestions = async (req, res, next) => {
  const { id } = req.params; // academyId

  try {
    const questions = await prisma.academyQuestion.findMany({
      where: { academyId: parseInt(id, 10) },
      include: {
        choices: true, // Include the choices associated with the questions
        initialQuestion: true, // Include the related initial question
      },
    });

    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: 'No questions found for this academy' });
    }

    res.json(questions);
  } catch (error) {
    console.error('Error fetching academy questions:', error);
    next(createError(500, 'Error fetching academy questions'));
  }
};

exports.submitQuizAnswers = async (req, res, next) => {
  const { academyId } = req.body;
  
  // Log the req.user object and req.body for debugging
  console.log("req.user:", req.user);
  console.log("req.body:", req.body);

  // Fallback to using userId from the request body if req.user is not defined
  const userId = req.user ? req.user.id : req.body.userId;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  try {
    // Find all user responses for the given academy
    const userResponses = await prisma.userResponse.findMany({
      where: {
        userId: userId,
        choice: {
          academyQuestion: {
            academyId: parseInt(academyId, 10),
          },
        },
      },
    });

    // Sum up the points awarded
    const totalPoints = userResponses.reduce((sum, response) => sum + response.pointsAwarded, 0);

    // Save the total points to the Points table
    const existingPoints = await prisma.point.findFirst({
      where: {
        userId: userId,
        academyId: parseInt(academyId, 10),
      },
    });

    if (existingPoints) {
      // If the user already has points for this academy, update the existing record
      await prisma.point.update({
        where: { id: existingPoints.id },
        data: { value: totalPoints },
      });
    } else {
      // Otherwise, create a new record
      await prisma.point.create({
        data: {
          userId: userId,
          academyId: parseInt(academyId, 10),
          value: totalPoints,
        },
      });
    }

    res.json({ message: `Congratulations! You've earned ${totalPoints} XP.` });
  } catch (error) {
    console.error("Failed to submit quiz answers:", error);
    next(createError(500, 'Failed to submit quiz answers.'));
  }
};

exports.checkAnswer = async (req, res, next) => {
  const { academyId, questionId, choiceId } = req.body;
  const telegramUserId = req.user ? req.user.telegramUserId : req.body.telegramUserId;

  if (!telegramUserId || !academyId || !questionId || !choiceId) {
    return res.status(400).json({ message: 'Bad Request: Missing required parameters.' });
  }

  try {
    // Check if the user exists by telegramUserId
    let user = await prisma.user.findUnique({
      where: { telegramUserId },
    });

    // If the user doesn't exist, create a new user
    if (!user) {
      user = await prisma.user.create({
        data: {
          telegramUserId,
          role: 'USER',
          name: '', // Assuming name is optional and can be empty
        },
      });
    }

    const userId = user.id;

    // Check if the user has already submitted an answer for this question
    const existingResponse = await prisma.userResponse.findFirst({
      where: {
        userId,
        choice: {
          academyQuestionId: questionId,
        },
      },
    });

    if (existingResponse) {
      return res.status(400).json({ message: 'You have already answered this question.' });
    }

    // Find the correct choice for the question
    const correctChoice = await prisma.choice.findFirst({
      where: {
        academyQuestionId: questionId,
        isCorrect: true,
      },
    });

    if (!correctChoice) {
      return res.status(404).json({ message: 'Correct choice not found for the question.' });
    }

    // Check if the user's choice is correct
    const isCorrect = correctChoice.id === choiceId;

    // Calculate points (if correct)
    const question = await prisma.academyQuestion.findUnique({
      where: { id: questionId },
      select: { xp: true },
    });

    const pointsAwarded = isCorrect ? question.xp : 0;

    // Save the user's response
    await prisma.userResponse.create({
      data: {
        userId,
        choiceId,
        isCorrect,
        pointsAwarded,
      },
    });

    // Return the result to the client
    res.json({ correct: isCorrect, pointsAwarded });
  } catch (error) {
    console.error('Failed to check the answer:', error);
    next(createError(500, 'Failed to check the answer.'));
  }
};

exports.getUserResponses = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const academyId = parseInt(req.params.academyId, 10);

    // Ensure academyId is a valid number
    if (isNaN(academyId)) {
      console.error('Invalid academyId:', academyId);
      return res.status(400).json({ error: 'Invalid academyId' });
    }

    // Fetch user responses using Prisma
    const userResponses = await prisma.userResponse.findMany({
      where: {
        userId: userId,
        choice: {
          academyQuestion: {
            academyId: academyId,
          },
        },
      },
      include: {
        choice: true,
      },
    });

    return res.json(userResponses);
  } catch (error) {
    console.error('Error fetching user responses:', error);
    return res.status(500).json({ error: 'Error fetching user responses' });
  }
};