// server/controllers/academyController.js

const { PrismaClient } = require('@prisma/client');
const createError = require('http-errors');
const prisma = new PrismaClient();
const { saveFile } = require('../uploadConfig'); // Reuse the saveFile function from the uploadConfig.js
const { checkAndApplyLevelUp } = require('../services/levelService');

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
      xpToAssign += 1; // Assign 1 extra XP from the remainder
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
      xpToAssign += 1; // Assign 1 extra XP from the remainder
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
      contractAddress = '',
      academyTypeId,
    } = req.body;

    const { id: userId, roles } = req.user;

    // Handle file uploads
    const logoUrl = handleFileUpload(req.files, 'logo');
    const coverPhotoUrl = handleFileUpload(req.files, 'coverPhoto');

    if (!name) {
      return next(createError(400, 'Name is required'));
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
      contractAddress:
        parsedInitialAnswers[3]?.contractAddress || contractAddress,
    };

    const categoryRecords = await Promise.all(
      parsedCategories.map(async (categoryName) => {
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
      parsedChains.map(async (chainName) => {
        const chain = await prisma.chain.findUnique({
          where: { name: chainName },
        });
        if (!chain) {
          throw new Error(`Chain "${chainName}" not found in database`);
        }
        return chain;
      })
    );

    // Get default XP from settings
    const setting = await prisma.setting.findUnique({
      where: { key: 'default_academy_xp' },
    });

    const totalXp = setting ? parseInt(setting.value, 10) : 500; // Default to 500 if not set

    // Create the academy with the xp field
    const academy = await prisma.academy.create({
      data: {
        name,
        ticker: ticker || null,
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
            answer:
              index === 3
                ? JSON.stringify(tokenomicsData)
                : initialAnswer.answer || '', // Save tokenomics data as JSON string for question 4
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
        academyTypeId: academyTypeId ? parseInt(academyTypeId, 10) : null,
        xp: totalXp, // Set the xp field
      },
    });

    // Allocate XP to Academy Questions and Quests
    await allocateXp(academy.id, totalXp); // Use the total XP from settings

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
      contractAddress = '',
      academyTypeId,
    } = req.body;

    const { id: userId, roles } = req.user;

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
      parsedChains.map(async (chainName) => {
        const chain = await prisma.chain.findUnique({
          where: { name: chainName },
        });
        if (!chain) {
          throw new Error(`Chain "${chainName}" not found in database`);
        }
        return chain;
      })
    );

    // Get default XP from settings
    const setting = await prisma.setting.findUnique({
      where: { key: 'default_academy_xp' },
    });

    const totalXp = setting ? parseInt(setting.value, 10) : 500; // Default to 500 if not set

    // Create the academy with the xp field
    const academy = await prisma.academy.create({
      data: {
        name,
        ticker: ticker || null,
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
        coingecko: coingeckoLink, // Save the coingecko link
        dexScreener: dexScreenerLink, // Save the dex screener link
        contractAddress, // Save the contract address
        tokenomics: tokenomicsData, // Save the tokenomics data as a JSON object
        teamBackground,
        congratsVideo,
        getStarted,
        webpageUrl,
        status: 'pending',
        creatorId: userId,
        academyTypeId: academyTypeId ? parseInt(academyTypeId, 10) : null,
        xp: totalXp, // Set the xp field
      },
    });

    res
      .status(201)
      .json({ message: 'Basic academy created successfully', academy });
  } catch (error) {
    console.error('Error creating basic academy:', error);
    next(createError(500, 'Error creating basic academy'));
  }
};

// Utility function to remove undefined fields
const removeUndefinedFields = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  );
};

// Update Academy Controller
exports.updateAcademy = async (req, res, next) => {
  const { id } = req.params;

  const {
    name,
    xp,
    sponsored,
    status,
    creatorEmail, // For transferring ownership
    categories,
    chains,
    ticker,
    twitter,
    telegram,
    discord,
    coingecko,
    dexScreener, // Changed to dexScreener
    contractAddress,
    initialAnswers,
    tokenomics,
    teamBackground,
    congratsVideo,
    getStarted,
    raffles,
    quests,
    webpageUrl,
    academyTypeId,
  } = req.body;

  try {
    // Parse JSON fields if they exist
    const parsedCategories = categories ? JSON.parse(categories) : undefined;
    const parsedChains = chains ? JSON.parse(chains) : undefined;
    const parsedInitialAnswers = initialAnswers
      ? JSON.parse(initialAnswers)
      : undefined;
    const parsedRaffles = raffles ? JSON.parse(raffles) : undefined;
    const parsedQuests = quests ? JSON.parse(quests) : undefined;
    const parsedTokenomics = tokenomics ? JSON.parse(tokenomics) : undefined;

    // Prepare data for update
    const dataToUpdate = {};

    // Update basic fields
    if (name !== undefined) dataToUpdate.name = name;
    if (ticker !== undefined) dataToUpdate.ticker = ticker;
    if (xp !== undefined) dataToUpdate.xp = parseInt(xp, 10);
    if (sponsored !== undefined) dataToUpdate.sponsored = sponsored;
    if (status !== undefined) dataToUpdate.status = status;
    if (academyTypeId !== undefined)
      dataToUpdate.academyTypeId = parseInt(academyTypeId, 10);
    if (twitter !== undefined) dataToUpdate.twitter = twitter;
    if (telegram !== undefined) dataToUpdate.telegram = telegram;
    if (discord !== undefined) dataToUpdate.discord = discord;
    if (coingecko !== undefined) dataToUpdate.coingecko = coingecko;
    if (dexScreener !== undefined) dataToUpdate.dexScreener = dexScreener;
    if (contractAddress !== undefined)
      dataToUpdate.contractAddress = contractAddress;
    if (webpageUrl !== undefined) dataToUpdate.webpageUrl = webpageUrl;
    if (teamBackground !== undefined)
      dataToUpdate.teamBackground = teamBackground;
    if (congratsVideo !== undefined) dataToUpdate.congratsVideo = congratsVideo;
    if (getStarted !== undefined) dataToUpdate.getStarted = getStarted;
    if (parsedTokenomics !== undefined)
      dataToUpdate.tokenomics = parsedTokenomics;

    // Handle creatorEmail for transferring ownership
    if (creatorEmail) {
      const newCreator = await prisma.user.findUnique({
        where: { email: creatorEmail },
      });

      if (!newCreator) {
        return next(createError(404, 'User with provided email not found'));
      }

      dataToUpdate.creatorId = newCreator.id;
    }

    // Handle file uploads
    if (req.files && req.files.logo) {
      dataToUpdate.logoUrl = handleFileUpload(req.files, 'logo');
    }
    if (req.files && req.files.coverPhoto) {
      dataToUpdate.coverPhotoUrl = handleFileUpload(req.files, 'coverPhoto');
    }

    // Update categories
    if (parsedCategories) {
      const categoryRecords = await Promise.all(
        parsedCategories.map(async (categoryName) => {
          const category = await prisma.category.findUnique({
            where: { name: categoryName },
          });
          if (!category) {
            throw new Error(`Category "${categoryName}" not found in database`);
          }
          return category;
        })
      );
      dataToUpdate.categories = {
        set: categoryRecords.map((category) => ({ id: category.id })),
      };
    }

    // Update chains
    if (parsedChains) {
      const chainRecords = await Promise.all(
        parsedChains.map(async (chainName) => {
          const chain = await prisma.chain.findUnique({
            where: { name: chainName },
          });
          if (!chain) {
            throw new Error(`Chain "${chainName}" not found in database`);
          }
          return chain;
        })
      );
      dataToUpdate.chains = {
        set: chainRecords.map((chain) => ({ id: chain.id })),
      };
    }

    // Update the academy basic data
    const updatedAcademy = await prisma.academy.update({
      where: { id: parseInt(id, 10) },
      data: dataToUpdate,
    });

    // If the xp field was updated, reallocate XP
    if (xp !== undefined) {
      try {
        // Reallocate XP among questions and quests
        await allocateXp(parseInt(id, 10), parseInt(xp, 10));
      } catch (allocationError) {
        console.error('Error allocating XP:', allocationError);
        // Optionally handle allocation errors (e.g., rollback transaction)
      }
    }

    // Handle initialAnswers (academyQuestions)
    if (parsedInitialAnswers !== undefined) {
      for (const initialAnswer of parsedInitialAnswers) {
        const {
          id: questionId,
          initialQuestionId,
          question,
          answer,
          quizQuestion,
          choices,
          video,
        } = initialAnswer;

        // Update or create the academyQuestion
        const updatedQuestion = await prisma.academyQuestion.upsert({
          where: { id: questionId || 0 }, // Use 0 to ensure upsert creates if not found
          update: {
            question,
            answer,
            quizQuestion,
            video,
          },
          create: {
            academyId: parseInt(id, 10),
            initialQuestionId,
            question,
            answer,
            quizQuestion,
            video,
          },
        });

        const questionIdToUse = updatedQuestion.id;

        // Handle choices
        if (choices && choices.length > 0) {
          // Delete existing choices for the question
          await prisma.choice.deleteMany({
            where: { academyQuestionId: questionIdToUse },
          });

          // Create new choices
          await prisma.choice.createMany({
            data: choices.map((choice) => ({
              academyQuestionId: questionIdToUse,
              text: choice.answer,
              isCorrect: choice.correct,
            })),
          });
        }
      }
    }

    // Handle raffles
    // Commented beacuse raffle table has changed
    // if (parsedRaffles !== undefined) {
    //   // Delete existing raffles
    //   await prisma.raffle.deleteMany({
    //     where: { academyId: parseInt(id, 10) },
    //   });

    // Create new raffles
    // if (parsedRaffles.length > 0) {
    //   await prisma.raffle.createMany({
    //     data: parsedRaffles.map((raffle) => ({
    //       academyId: parseInt(id, 10),
    //       amount: parseInt(raffle.amount, 10) || 0,
    //       reward: raffle.reward || '',
    //       currency: raffle.currency || '',
    //       chain: raffle.chain || '',
    //       dates: raffle.dates || '',
    //       totalPool: parseInt(raffle.totalPool, 10) || 0,
    //     })),
    //   });
    // }
    // }

    // Handle quests
    if (parsedQuests !== undefined) {
      // Delete existing quests
      await prisma.quest.deleteMany({
        where: { academyId: parseInt(id, 10) },
      });

      // Create new quests
      if (parsedQuests.length > 0) {
        await prisma.quest.createMany({
          data: parsedQuests.map((quest) => ({
            academyId: parseInt(id, 10),
            name: quest.name || '',
            link: quest.link || '',
            platform: quest.platform || '',
          })),
        });
      }
    }

    res.json({
      message: 'Academy updated successfully',
      academy: updatedAcademy,
    });
  } catch (error) {
    console.error('Error updating academy:', error);
    next(createError(500, 'Error updating academy'));
  }
};

exports.listMyAcademies = async (req, res, next) => {
  try {
    const { id: userId } = req.user;

    const academies = await prisma.academy.findMany({
      where: { creatorId: userId },
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
        logoUrl: true,
        coverPhotoUrl: true,
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
  console.log('-----------');
  console.log('-----------');
  console.log('academy detial fetch');
  console.log('-----------');
  console.log('-----------');

  const { id } = req.params;
  const { id: userId, roles } = req.user; // Get userId and roles from the request
  try {
    const academy = await prisma.academy.findUnique({
      where: { id: parseInt(id, 10) },
      select: {
        id: true,
        name: true,
        creatorId: true,
        ticker: true,
        logoUrl: true,
        coverPhotoUrl: true,
        categories: true,
        chains: true,
        twitter: true,
        telegram: true,
        discord: true,
        coingecko: true,
        academyQuestions: {
          include: {
            choices: true,
            initialQuestion: true,
          },
        },
        raffles: true,
        quests: true,
        webpageUrl: true,
        status: true,
        teamBackground: true,
        congratsVideo: true,
        getStarted: true,
        contractAddress: true,
        dexScreener: true,
        tokenomics: true,
        academyTypeId: true,
        xp: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!academy) {
      return next(createError(404, 'Academy not found'));
    }

    // Authorization check: Allow access only if the user is the creator or has an admin role
    if (
      academy.creatorId !== userId &&
      !roles.includes('ADMIN') &&
      !roles.includes('SUPERADMIN')
    ) {
      return next(
        createError(403, 'You are not authorized to access this academy')
      );
    }

    // Ensure empty fields are returned
    academy.academyQuestions = academy.academyQuestions || [];
    academy.raffles = academy.raffles || [];
    academy.quests = academy.quests || [];

    res.json(academy);
  } catch (error) {
    console.error('Error fetching academy details:', error);
    next(createError(500, 'Error fetching academy details'));
  }
};

exports.getAcademyDetailsSuperadmin = async (req, res, next) => {
  const { id } = req.params;
  try {
    const academy = await prisma.academy.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        academyType: true,
        // Include other relations as needed
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
      include: { creator: true, categories: true, chains: true },
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

    let academy = await prisma.academy.findUnique({
      where: { id: parseInt(id, 10) },
      select: { id: true, name: true, status: true },
    });

    if (academy?.status !== 'approved') {
      academy = await prisma.academy.update({
        where: { id: parseInt(id, 10) },
        data: { status: 'approved' },
      });

      const userIds = await prisma.user.findMany({
        select: { id: true },
      });

      const notifications = userIds.map(({ id }) => ({
        type: 'ADMIN_BROADCAST',
        message: `New Academy Added: ${academy?.name}`,
        userId: id,
      }));

      // Bulk create notifications
      await prisma.notification.createMany({
        data: notifications,
      });
    }

    res.json({
      message: 'Academy approved successfully',
      academy,
    });
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

    res.json({
      message: 'Academy rejected successfully',
      academy: updatedAcademy,
    });
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

    res.json({
      message: 'Video lessons added successfully',
      academy: updatedAcademy,
    });
  } catch (error) {
    console.error('Error updating academy with videos:', error);
    next(createError(500, 'Error updating academy with videos'));
  }
};

exports.getVideoUrls = async (req, res, next) => {
  const { id } = req.params; // Academy ID

  if (isNaN(academyId) || academyId <= 0) {
    return res.status(400).json({ error: 'Invalid academyId' });
  }

  try {
    // Fetch the video URLs from the database
    const questions = await prisma.academyQuestion.findMany({
      where: { academyId: academyId },
      select: {
        initialQuestionId: true,
        video: true,
      },
    });

    if (!questions || questions.length === 0) {
      return res
        .status(404)
        .json({ message: 'No video URLs found for this academy' });
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
          in: academy.academyQuestions.map((q) => q.id),
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
        categories: {
          disconnect: academy.categories.map((cat) => ({ id: cat.id })),
        },
        chains: {
          disconnect: academy.chains.map((chain) => ({ id: chain.id })),
        },
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
    const academy = await prisma.academy.findUnique({
      where: { id: parseInt(id, 10) },
    });

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
        academyType: true,
      },
    });

    res.json(academies);
  } catch (error) {
    console.error('Error fetching academies:', error);
    next(createError(500, 'Error fetching academies'));
  }
};

exports.getAcademyRaffle = async (req, res, next) => {
  try {
    const { academyId } = req.query;
    if (!academyId) res.status(400).json({ message: 'Invalid credentials' });

    const raffle = await prisma.overallRaffle.findFirst({
      where: { academyId: +academyId },
    });

    res.status(200).json(raffle);
  } catch (error) {
    console.error('Error fetching overall raffle of academy:', error);
    next(createError(500, 'Error fetching overall raffle of academy'));
  }
};

exports.getAllAcademiesSuperadmin = async (req, res, next) => {
  try {
    const academies = await prisma.academy.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        academyType: true,
      },
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
      select: {
        id: true,
        initialQuestionId: true,
        question: true,
        answer: true,
        quizQuestion: true,
        video: true,
        xp: true,
        choices: {
          where: {
            text: {
              not: '',
            },
          },
          select: {
            id: true,
            text: true,
            // Exclude isCorrect to prevent revealing the correct answer
          },
        },
        initialQuestion: true, // Include the related initial question
      },
    });

    if (!questions || questions.length === 0) {
      return res
        .status(404)
        .json({ message: 'No questions found for this academy' });
    }

    res.json(questions);
  } catch (error) {
    console.error('Error fetching academy questions:', error);
    next(createError(500, 'Error fetching academy questions'));
  }
};

// TODO: Task 3
exports.submitQuizAnswers = async (req, res, next) => {
  const { academyId } = req.body;

  // Log the req.user object and req.body for debugging
  console.log('req.user:', req.user);
  console.log('req.body:', req.body);

  // Fallback to using userId from the request body if req.user is not defined
  const userId = req.user ? req.user.id : req.body.userId;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  console.log(
    `User ${userId} is submitting quiz answers for academy ${academyId}`
  );

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
    const totalPoints = userResponses.reduce(
      (sum, response) => sum + response.pointsAwarded,
      0
    );

    console.log(
      `User ${userId} earned ${totalPoints} points for academy ${academyId}`
    );

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

      // Increase user pointCount & lastWeekPointCount
      await prisma.user.update({
        where: { id: +userId },
        data: {
          pointCount: { increment: totalPoints - existingPoints.value },
          lastWeekPointCount: { increment: totalPoints - existingPoints.value },
        },
      });

      console.log(
        `Updated existing points record for user ${userId} and academy ${academyId}`
      );
    } else {
      // Otherwise, create a new record
      await prisma.point.create({
        data: {
          userId,
          academyId: parseInt(academyId, 10),
          value: totalPoints,
        },
      });

      // Increase academy pointCount
      await prisma.academy.update({
        where: { id: +academyId },
        data: { pointCount: { increment: 1 } },
      });

      // Increase user pointCount & lastWeekPointCount
      await prisma.user.update({
        where: { id: +userId },
        data: {
          pointCount: { increment: totalPoints },
          lastWeekPointCount: { increment: totalPoints },
        },
      });

      console.log(
        `Created new points record for user ${userId} and academy ${academyId}`
      );
    }

    if (totalPoints > 99) {
      const incrementAmount = totalPoints / 100;

      // Create a raffle entry
      await prisma.raffle.create({
        data: {
          userId,
          academyId: parseInt(academyId, 10),
          amount: incrementAmount,
        },
      });

      // Update user's raffleAmount
      await prisma.user.update({
        where: { id: userId },
        data: { raffleAmount: { increment: incrementAmount } },
      });

      // Upsert the entry in academyRaffleEntries
      const hasRunningRaffle = await prisma.overallRaffle.findFirst({
        where: { academyId, isActive: true },
      });
      if (hasRunningRaffle != null) {
        await prisma.academyRaffleEntries.upsert({
          where: { userId_academyId: { userId, academyId } },
          update: {
            amount: { increment: incrementAmount },
          },
          create: {
            userId,
            academyId: parseInt(academyId, 10),
            amount: incrementAmount,
          },
        });
      }
    }

    // Call checkAndApplyLevelUp to handle level up and notifications
    console.log(`Calling checkAndApplyLevelUp for user ${userId}`);
    await checkAndApplyLevelUp(userId);
    console.log(`Completed checkAndApplyLevelUp for user ${userId}`);

    res.json({ message: `Congratulations! You've earned ${totalPoints} XP.` });
  } catch (error) {
    console.error('Failed to submit quiz answers:', error);
    next(createError(500, 'Failed to submit quiz answers.'));
  }
};

exports.checkAnswer = async (req, res, next) => {
  const { academyId, questionId, choiceId } = req.body;
  let telegramUserId = req.user?.telegramUserId || req.body?.telegramUserId;

  if (!telegramUserId || !academyId || !questionId || !choiceId) {
    return res
      .status(400)
      .json({ message: 'Bad Request: Missing required parameters.' });
  }

  try {
    // Check if the user exists
    let user = await prisma.user.findUnique({
      where: { telegramUserId: telegramUserId },
      select: { id: true },
    });
    if (!user) return next(createError(401, 'Unauthorized'));

    const userId = user.id;

    // Check if the user has already submitted an answer for this question
    const existingResponse = await prisma.userResponse.findFirst({
      where: { userId, choice: { academyQuestionId: questionId } },
    });

    if (existingResponse) {
      return res
        .status(400)
        .json({ message: 'You have already answered this question.' });
    }

    // Find the correct choice for the question
    const correctChoice = await prisma.choice.findFirst({
      where: {
        academyQuestionId: questionId,
        isCorrect: true,
      },
    });

    if (!correctChoice) {
      return res
        .status(404)
        .json({ message: 'Correct choice not found for the question.' });
    }

    // Get the maximum points for the question
    const question = await prisma.academyQuestion.findUnique({
      where: { id: questionId },
      select: {
        xp: true,
        academy: {
          select: {
            pointCount: true,
            fomoNumber: true,
          },
        },
      },
    });

    // Set maxPoint
    let maxPoints = question.xp;
    if (question?.academy?.fomoNumber > question?.academy?.pointCount) {
      maxPoints *= 2;
    }

    // Return the result to the client with the correctChoiceId
    res.json({
      correct: correctChoice.id === choiceId,
      maxPoints,
      correctChoiceId: correctChoice.id,
    });
  } catch (error) {
    console.error('Failed to check the answer:', error);
    next(createError(500, 'Failed to check the answer.'));
  }
};

exports.saveUserResponse = async (req, res, next) => {
  const { academyId, questionId, choiceId, isCorrect, pointsAwarded } =
    req.body;
  let telegramUserId = req.user?.telegramUserId || req.body?.telegramUserId;

  if (!telegramUserId || !academyId || !questionId || !choiceId) {
    return res
      .status(400)
      .json({ message: 'Bad Request: Missing required parameters.' });
  }

  try {
    // Check if the user exists
    let user = await prisma.user.findUnique({
      where: { telegramUserId: telegramUserId },
      select: { id: true },
    });
    if (!user) return next(createError(401, 'Unauthorized'));

    const userId = user.id;

    /// Check if the user has already submitted an answer for this question
    const existingResponse = await prisma.userResponse.findFirst({
      where: { userId, choice: { academyQuestionId: questionId } },
    });

    if (existingResponse) {
      return res
        .status(400)
        .json({ message: 'You have already answered this question.' });
    }

    // Save the user's response with points
    await prisma.userResponse.create({
      data: {
        userId,
        choiceId,
        isCorrect,
        pointsAwarded,
      },
    });

    res.json({ message: 'User response saved successfully.' });
  } catch (error) {
    console.error('Failed to save user response:', error);
    next(createError(500, 'Failed to save user response.'));
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

exports.getCorrectChoicesForAnsweredQuestions = async (req, res, next) => {
  const { academyId } = req.params;
  let { telegramUserId, questionIds } = req.body;

  if (
    !telegramUserId ||
    !academyId ||
    !questionIds ||
    !Array.isArray(questionIds)
  ) {
    console.log('Missing parameters:', {
      telegramUserId,
      academyId,
      questionIds,
    });
    return res
      .status(400)
      .json({ message: 'Bad Request: Missing required parameters.' });
  }

  try {
    // Convert telegramUserId to BigInt
    telegramUserId = BigInt(telegramUserId);

    // Find user by telegramUserId
    const user = await prisma.user.findUnique({
      where: { telegramUserId: telegramUserId },
    });

    if (!user) {
      // User not found
      return res.status(404).json({ message: 'User not found' });
    }

    const userId = user.id;

    // Fetch user responses to ensure they have answered the questions
    const userResponses = await prisma.userResponse.findMany({
      where: {
        userId: userId,
        choice: {
          academyQuestionId: {
            in: questionIds.map((id) => parseInt(id, 10)),
          },
        },
      },
      select: {
        choice: {
          select: {
            academyQuestionId: true,
          },
        },
      },
    });

    const answeredQuestionIds = userResponses.map(
      (response) => response.choice.academyQuestionId
    );

    // Fetch correct choices for the answered questions
    const correctChoices = await prisma.choice.findMany({
      where: {
        academyQuestionId: {
          in: answeredQuestionIds,
        },
        isCorrect: true,
      },
      select: {
        academyQuestionId: true,
        id: true,
      },
    });

    const correctChoiceMap = {};
    correctChoices.forEach((choice) => {
      correctChoiceMap[choice.academyQuestionId] = choice.id;
    });

    res.json({ correctChoices: correctChoiceMap });
  } catch (error) {
    console.error('Failed to get correct choices:', error);
    next(createError(500, 'Failed to get correct choices.'));
  }
};
