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
      webpageUrl = '',
      substackUrl = '',
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
        webpageUrl,
        substackUrl,
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

exports.createYoutubeChannel = async (req, res, next) => {
  try {
    const {
      name,
      description,
      youtubeUrl = '',
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

    // Validate categories
    const categoryRecords = await Promise.all(
      categoryNames.map(async (categoryName) => {
        const category = await prisma.category.findUnique({
          where: { name: categoryName },
        });
        if (!category) {
          throw new Error(`Category "${categoryName}" not found`);
        }
        return category;
      })
    );

    // Validate chains
    const chainRecords = await Promise.all(
      chainNames.map(async (chainName) => {
        const chain = await prisma.chain.findUnique({
          where: { name: chainName },
        });
        if (!chain) {
          throw new Error(`Chain "${chainName}" not found`);
        }
        return chain;
      })
    );

    const channel = await prisma.youtubeChannel.create({
      data: {
        name,
        description,
        youtubeUrl,
        logoUrl,
        coverPhotoUrl,
        contentOrigin:
          contentOrigin === 'PLATFORM_BASED'
            ? 'PLATFORM_BASED'
            : 'CREATOR_BASED',
        categories: {
          connect: categoryRecords.map((cat) => ({ id: cat.id })),
        },
        chains: {
          connect: chainRecords.map((chain) => ({ id: chain.id })),
        },
      },
    });

    return res
      .status(201)
      .json({ message: 'YouTube Channel created successfully', channel });
  } catch (error) {
    console.error('Error creating YouTube Channel:', error);
    return next(createError(500, 'Error creating YouTube Channel'));
  }
};

exports.getYoutubeChannels = async (req, res, next) => {
  try {
    const channels = await prisma.youtubeChannel.findMany({
      include: {
        categories: true,
        chains: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json(channels);
  } catch (error) {
    console.error('Error fetching YouTube channels:', error);
    next(createError(500, 'Error fetching YouTube channels'));
  }
};

// ============= TELEGRAM GROUPS (NEW) =============

exports.createTelegramGroup = async (req, res, next) => {
  try {
    const {
      name,
      description,
      telegramUrl = '',
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

    // Validate categories
    const categoryRecords = await Promise.all(
      categoryNames.map(async (categoryName) => {
        const category = await prisma.category.findUnique({
          where: { name: categoryName },
        });
        if (!category) {
          throw new Error(`Category "${categoryName}" not found`);
        }
        return category;
      })
    );

    // Validate chains
    const chainRecords = await Promise.all(
      chainNames.map(async (chainName) => {
        const chain = await prisma.chain.findUnique({
          where: { name: chainName },
        });
        if (!chain) {
          throw new Error(`Chain "${chainName}" not found`);
        }
        return chain;
      })
    );

    const group = await prisma.telegramGroup.create({
      data: {
        name,
        description,
        telegramUrl,
        logoUrl,
        coverPhotoUrl,
        contentOrigin:
          contentOrigin === 'PLATFORM_BASED'
            ? 'PLATFORM_BASED'
            : 'CREATOR_BASED',
        categories: {
          connect: categoryRecords.map((cat) => ({ id: cat.id })),
        },
        chains: {
          connect: chainRecords.map((chain) => ({ id: chain.id })),
        },
      },
    });

    return res
      .status(201)
      .json({ message: 'Telegram Group created successfully', group });
  } catch (error) {
    console.error('Error creating Telegram Group:', error);
    return next(createError(500, 'Error creating Telegram Group'));
  }
};

exports.getTelegramGroups = async (req, res, next) => {
  try {
    const groups = await prisma.telegramGroup.findMany({
      include: {
        categories: true,
        chains: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json(groups);
  } catch (error) {
    console.error('Error fetching Telegram Groups:', error);
    next(createError(500, 'Error fetching Telegram Groups'));
  }
};

// 1) Delete Podcast
exports.deletePodcast = async (req, res, next) => {
  const { id } = req.params;
  try {
    const podcast = await prisma.podcast.findUnique({
      where: { id: Number(id) },
    });
    if (!podcast) {
      return next(createError(404, 'Podcast not found'));
    }
    await prisma.podcast.delete({ where: { id: Number(id) } });
    return res.json({
      message: 'Podcast deleted successfully',
      id: Number(id),
    });
  } catch (error) {
    console.error('Error deleting podcast:', error);
    return next(createError(500, 'Error deleting podcast'));
  }
};

// 2) Delete Educator
exports.deleteEducator = async (req, res, next) => {
  const { id } = req.params;
  try {
    const educator = await prisma.educator.findUnique({
      where: { id: Number(id) },
    });
    if (!educator) {
      return next(createError(404, 'Educator not found'));
    }
    await prisma.educator.delete({ where: { id: Number(id) } });
    return res.json({
      message: 'Educator deleted successfully',
      id: Number(id),
    });
  } catch (error) {
    console.error('Error deleting educator:', error);
    return next(createError(500, 'Error deleting educator'));
  }
};

// 3) Delete Tutorial
exports.deleteTutorial = async (req, res, next) => {
  const { id } = req.params;
  try {
    const tutorial = await prisma.tutorial.findUnique({
      where: { id: Number(id) },
    });
    if (!tutorial) {
      return next(createError(404, 'Tutorial not found'));
    }
    await prisma.tutorial.delete({ where: { id: Number(id) } });
    return res.json({
      message: 'Tutorial deleted successfully',
      id: Number(id),
    });
  } catch (error) {
    console.error('Error deleting tutorial:', error);
    return next(createError(500, 'Error deleting tutorial'));
  }
};

// 4) Delete YouTube Channel
exports.deleteYoutubeChannel = async (req, res, next) => {
  const { id } = req.params;
  try {
    const channel = await prisma.youtubeChannel.findUnique({
      where: { id: Number(id) },
    });
    if (!channel) {
      return next(createError(404, 'YouTube channel not found'));
    }
    await prisma.youtubeChannel.delete({ where: { id: Number(id) } });
    return res.json({
      message: 'YouTube Channel deleted successfully',
      id: Number(id),
    });
  } catch (error) {
    console.error('Error deleting YouTube channel:', error);
    return next(createError(500, 'Error deleting YouTube channel'));
  }
};

// 5) Delete Telegram Group
exports.deleteTelegramGroup = async (req, res, next) => {
  const { id } = req.params;
  try {
    const group = await prisma.telegramGroup.findUnique({
      where: { id: Number(id) },
    });
    if (!group) {
      return next(createError(404, 'Telegram group not found'));
    }
    await prisma.telegramGroup.delete({ where: { id: Number(id) } });
    return res.json({
      message: 'Telegram Group deleted successfully',
      id: Number(id),
    });
  } catch (error) {
    console.error('Error deleting Telegram group:', error);
    return next(createError(500, 'Error deleting Telegram group'));
  }
};

exports.updatePodcast = async (req, res, next) => {
  try {
    const { id } = req.params;
    const podcastId = Number(id);

    // 1) Check if it exists
    const existing = await prisma.podcast.findUnique({
      where: { id: podcastId },
    });
    if (!existing) {
      return next(createError(404, 'Podcast not found'));
    }

    // 2) Extract fields from req.body
    const {
      name,
      description,
      spotifyUrl,
      appleUrl,
      youtubeUrl,
      categories = '[]',
      chains = '[]',
      contentOrigin,
    } = req.body;

    // Convert category/chain arrays
    const categoryNames = JSON.parse(categories);
    const chainNames = JSON.parse(chains);

    // 3) Handle new file uploads if present
    let logoUrl = existing.logoUrl;
    let coverPhotoUrl = existing.coverPhotoUrl;

    const newLogo = handleFileUpload(req.files, 'logo');
    if (newLogo) logoUrl = newLogo;

    const newCover = handleFileUpload(req.files, 'coverPhoto');
    if (newCover) coverPhotoUrl = newCover;

    // 4) Validate categories and chains
    const categoryRecords = await Promise.all(
      categoryNames.map(async (catName) => {
        const cat = await prisma.category.findUnique({
          where: { name: catName },
        });
        if (!cat) throw new Error(`Category "${catName}" not found`);
        return cat;
      })
    );

    const chainRecords = await Promise.all(
      chainNames.map(async (chainName) => {
        const chain = await prisma.chain.findUnique({
          where: { name: chainName },
        });
        if (!chain) throw new Error(`Chain "${chainName}" not found`);
        return chain;
      })
    );

    // 5) Update record
    const updated = await prisma.podcast.update({
      where: { id: podcastId },
      data: {
        name: name !== undefined ? name : existing.name,
        description,
        spotifyUrl,
        appleUrl,
        youtubeUrl,
        logoUrl,
        coverPhotoUrl,
        contentOrigin:
          contentOrigin === 'PLATFORM_BASED'
            ? 'PLATFORM_BASED'
            : 'CREATOR_BASED',

        // Reset and reconnect categories/chains
        categories: {
          set: [],
          connect: categoryRecords.map((c) => ({ id: c.id })),
        },
        chains: {
          set: [],
          connect: chainRecords.map((c) => ({ id: c.id })),
        },
      },
    });

    res.json({ message: 'Podcast updated successfully', updated });
  } catch (error) {
    console.error('Error updating podcast:', error);
    next(createError(500, 'Error updating podcast'));
  }
};

/**
 * UPDATE Educator
 */
exports.updateEducator = async (req, res, next) => {
  try {
    const { id } = req.params;
    const educatorId = Number(id);

    const existing = await prisma.educator.findUnique({
      where: { id: educatorId },
    });
    if (!existing) {
      return next(createError(404, 'Educator not found'));
    }

    const {
      name,
      bio,
      youtubeUrl,
      twitterUrl,
      telegramUrl,
      discordUrl,
      categories = '[]',
      chains = '[]',
      contentOrigin,
      webpageUrl,
      substackUrl,
    } = req.body;

    const categoryNames = JSON.parse(categories);
    const chainNames = JSON.parse(chains);

    // handle files
    let logoUrl = existing.logoUrl;
    let coverPhotoUrl = existing.coverPhotoUrl;

    const newLogo = handleFileUpload(req.files, 'logo');
    if (newLogo) logoUrl = newLogo;

    const newCover = handleFileUpload(req.files, 'coverPhoto');
    if (newCover) coverPhotoUrl = newCover;

    // Validate categories/chains
    const categoryRecords = await Promise.all(
      categoryNames.map(async (catName) => {
        const cat = await prisma.category.findUnique({
          where: { name: catName },
        });
        if (!cat) throw new Error(`Category "${catName}" not found`);
        return cat;
      })
    );

    const chainRecords = await Promise.all(
      chainNames.map(async (chainName) => {
        const chain = await prisma.chain.findUnique({
          where: { name: chainName },
        });
        if (!chain) throw new Error(`Chain "${chainName}" not found`);
        return chain;
      })
    );

    const updated = await prisma.educator.update({
      where: { id: educatorId },
      data: {
        name: name !== undefined ? name : existing.name,
        bio,
        youtubeUrl,
        twitterUrl,
        telegramUrl,
        discordUrl,
        logoUrl,
        coverPhotoUrl,
        contentOrigin:
          contentOrigin === 'PLATFORM_BASED'
            ? 'PLATFORM_BASED'
            : 'CREATOR_BASED',
        webpageUrl,
        substackUrl,
        categories: {
          set: [],
          connect: categoryRecords.map((c) => ({ id: c.id })),
        },
        chains: {
          set: [],
          connect: chainRecords.map((c) => ({ id: c.id })),
        },
      },
    });

    res.json({ message: 'Educator updated successfully', updated });
  } catch (error) {
    console.error('Error updating educator:', error);
    next(createError(500, 'Error updating educator'));
  }
};

/**
 * UPDATE Tutorial
 */
exports.updateTutorial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tutorialId = Number(id);

    const existing = await prisma.tutorial.findUnique({
      where: { id: tutorialId },
    });
    if (!existing) {
      return next(createError(404, 'Tutorial not found'));
    }

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

    let logoUrl = existing.logoUrl;
    let coverPhotoUrl = existing.coverPhotoUrl;

    const newLogo = handleFileUpload(req.files, 'logo');
    if (newLogo) logoUrl = newLogo;

    const newCover = handleFileUpload(req.files, 'coverPhoto');
    if (newCover) coverPhotoUrl = newCover;

    // Validate categories/chains
    const categoryRecords = await Promise.all(
      categoryNames.map(async (catName) => {
        const cat = await prisma.category.findUnique({
          where: { name: catName },
        });
        if (!cat) throw new Error(`Category "${catName}" not found`);
        return cat;
      })
    );

    const chainRecords = await Promise.all(
      chainNames.map(async (chainName) => {
        const chain = await prisma.chain.findUnique({
          where: { name: chainName },
        });
        if (!chain) throw new Error(`Chain "${chainName}" not found`);
        return chain;
      })
    );

    const updated = await prisma.tutorial.update({
      where: { id: tutorialId },
      data: {
        title: title !== undefined ? title : existing.title,
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
          set: [],
          connect: categoryRecords.map((c) => ({ id: c.id })),
        },
        chains: {
          set: [],
          connect: chainRecords.map((c) => ({ id: c.id })),
        },
      },
    });

    res.json({ message: 'Tutorial updated successfully', updated });
  } catch (error) {
    console.error('Error updating tutorial:', error);
    next(createError(500, 'Error updating tutorial'));
  }
};

/**
 * UPDATE YouTube Channel
 */
exports.updateYoutubeChannel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const channelId = Number(id);

    const existing = await prisma.youtubeChannel.findUnique({
      where: { id: channelId },
    });
    if (!existing) {
      return next(createError(404, 'YouTube channel not found'));
    }

    const {
      name,
      description,
      youtubeUrl,
      categories = '[]',
      chains = '[]',
      contentOrigin,
    } = req.body;

    const categoryNames = JSON.parse(categories);
    const chainNames = JSON.parse(chains);

    let logoUrl = existing.logoUrl;
    let coverPhotoUrl = existing.coverPhotoUrl;

    const newLogo = handleFileUpload(req.files, 'logo');
    if (newLogo) logoUrl = newLogo;

    const newCover = handleFileUpload(req.files, 'coverPhoto');
    if (newCover) coverPhotoUrl = newCover;

    // Validate categories/chains
    const categoryRecords = await Promise.all(
      categoryNames.map(async (catName) => {
        const cat = await prisma.category.findUnique({
          where: { name: catName },
        });
        if (!cat) throw new Error(`Category "${catName}" not found`);
        return cat;
      })
    );

    const chainRecords = await Promise.all(
      chainNames.map(async (chainName) => {
        const chain = await prisma.chain.findUnique({
          where: { name: chainName },
        });
        if (!chain) throw new Error(`Chain "${chainName}" not found`);
        return chain;
      })
    );

    const updated = await prisma.youtubeChannel.update({
      where: { id: channelId },
      data: {
        name: name !== undefined ? name : existing.name,
        description,
        youtubeUrl,
        logoUrl,
        coverPhotoUrl,
        contentOrigin:
          contentOrigin === 'PLATFORM_BASED'
            ? 'PLATFORM_BASED'
            : 'CREATOR_BASED',

        categories: {
          set: [],
          connect: categoryRecords.map((c) => ({ id: c.id })),
        },
        chains: {
          set: [],
          connect: chainRecords.map((c) => ({ id: c.id })),
        },
      },
    });

    res.json({ message: 'YouTube Channel updated successfully', updated });
  } catch (error) {
    console.error('Error updating YouTube channel:', error);
    next(createError(500, 'Error updating YouTube channel'));
  }
};

/**
 * UPDATE Telegram Group
 */
exports.updateTelegramGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const groupId = Number(id);

    const existing = await prisma.telegramGroup.findUnique({
      where: { id: groupId },
    });
    if (!existing) {
      return next(createError(404, 'Telegram group not found'));
    }

    const {
      name,
      description,
      telegramUrl,
      categories = '[]',
      chains = '[]',
      contentOrigin,
    } = req.body;

    const categoryNames = JSON.parse(categories);
    const chainNames = JSON.parse(chains);

    let logoUrl = existing.logoUrl;
    let coverPhotoUrl = existing.coverPhotoUrl;

    const newLogo = handleFileUpload(req.files, 'logo');
    if (newLogo) logoUrl = newLogo;

    const newCover = handleFileUpload(req.files, 'coverPhoto');
    if (newCover) coverPhotoUrl = newCover;

    // Validate categories/chains
    const categoryRecords = await Promise.all(
      categoryNames.map(async (catName) => {
        const cat = await prisma.category.findUnique({
          where: { name: catName },
        });
        if (!cat) throw new Error(`Category "${catName}" not found`);
        return cat;
      })
    );

    const chainRecords = await Promise.all(
      chainNames.map(async (chainName) => {
        const chain = await prisma.chain.findUnique({
          where: { name: chainName },
        });
        if (!chain) throw new Error(`Chain "${chainName}" not found`);
        return chain;
      })
    );

    const updated = await prisma.telegramGroup.update({
      where: { id: groupId },
      data: {
        name: name !== undefined ? name : existing.name,
        description,
        telegramUrl,
        logoUrl,
        coverPhotoUrl,
        contentOrigin:
          contentOrigin === 'PLATFORM_BASED'
            ? 'PLATFORM_BASED'
            : 'CREATOR_BASED',

        categories: {
          set: [],
          connect: categoryRecords.map((c) => ({ id: c.id })),
        },
        chains: {
          set: [],
          connect: chainRecords.map((c) => ({ id: c.id })),
        },
      },
    });

    res.json({ message: 'Telegram Group updated successfully', updated });
  } catch (error) {
    console.error('Error updating Telegram Group:', error);
    next(createError(500, 'Error updating Telegram Group'));
  }
};
