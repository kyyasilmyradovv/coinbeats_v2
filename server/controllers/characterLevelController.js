// server/controllers/characterLevelController.js

const { PrismaClient } = require('@prisma/client');
const createError = require('http-errors');
const prisma = new PrismaClient();
const { saveFile } = require('../uploadConfig'); // For image upload handling

// Create a new character level
exports.createCharacterLevel = async (req, res, next) => {
  try {
    const { levelName, minPoints, maxPoints, rewardPoints } = req.body;

    // Handle Lottie file upload
    const lottieFile = req.files['lottie'] ? req.files['lottie'][0] : null;
    const lottieFileUrl = lottieFile ? saveFile(lottieFile) : null;

    // Validate required fields
    if (!levelName || !minPoints || !maxPoints || !rewardPoints) {
      return next(createError(400, 'All fields are required.'));
    }

    const newLevel = await prisma.characterLevel.create({
      data: {
        levelName,
        minPoints: parseInt(minPoints, 10),
        maxPoints: parseInt(maxPoints, 10),
        rewardPoints: parseInt(rewardPoints, 10),
        lottieFileUrl,
      },
    });

    res.status(201).json({
      message: 'Character level created successfully',
      level: newLevel,
    });
  } catch (error) {
    console.error('Error creating character level:', error);
    next(createError(500, 'Error creating character level'));
  }
};

// Get all character levels
exports.getCharacterLevels = async (req, res, next) => {
  try {
    const levels = await prisma.characterLevel.findMany({
      orderBy: { minPoints: 'asc' },
    });
    res.json(levels);
  } catch (error) {
    console.error('Error fetching character levels:', error);
    next(createError(500, 'Error fetching character levels'));
  }
};

// Update a character level
exports.updateCharacterLevel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { levelName, minPoints, maxPoints, rewardPoints } = req.body;

    // Handle Lottie file upload
    const lottieFile = req.files['lottie'] ? req.files['lottie'][0] : null;
    const lottieFileUrl = lottieFile ? saveFile(lottieFile) : undefined;

    const dataToUpdate = {
      levelName,
      minPoints: minPoints ? parseInt(minPoints, 10) : undefined,
      maxPoints: maxPoints ? parseInt(maxPoints, 10) : undefined,
      rewardPoints: rewardPoints ? parseInt(rewardPoints, 10) : undefined,
      lottieFileUrl,
    };

    // Remove undefined fields
    Object.keys(dataToUpdate).forEach(
      (key) => dataToUpdate[key] === undefined && delete dataToUpdate[key]
    );

    const updatedLevel = await prisma.characterLevel.update({
      where: { id: parseInt(id, 10) },
      data: dataToUpdate,
    });

    res.json({
      message: 'Character level updated successfully',
      level: updatedLevel,
    });
  } catch (error) {
    console.error('Error updating character level:', error);
    next(createError(500, 'Error updating character level'));
  }
};

// Delete a character level
exports.deleteCharacterLevel = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.characterLevel.delete({
      where: { id: parseInt(id, 10) },
    });

    res.json({ message: 'Character level deleted successfully' });
  } catch (error) {
    console.error('Error deleting character level:', error);
    next(createError(500, 'Error deleting character level'));
  }
};
