// server/controllers/settingsController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const createError = require('http-errors');

// Get the default academy XP value
exports.getDefaultAcademyXp = async (req, res, next) => {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'default_academy_xp' },
    });

    const defaultXp = setting ? parseInt(setting.value, 10) : 0;
    res.json({ defaultXp });
  } catch (error) {
    console.error('Error getting default academy XP:', error);
    next(createError(500, 'Error getting default academy XP'));
  }
};

// Set the default academy XP value
exports.setDefaultAcademyXp = async (req, res, next) => {
  try {
    const { defaultXp } = req.body;

    if (isNaN(defaultXp)) {
      return next(createError(400, 'Invalid default XP value'));
    }

    await prisma.setting.upsert({
      where: { key: 'default_academy_xp' },
      update: { value: defaultXp.toString() },
      create: { key: 'default_academy_xp', value: defaultXp.toString() },
    });

    res.json({ message: 'Default academy XP updated successfully' });
  } catch (error) {
    console.error('Error setting default academy XP:', error);
    next(createError(500, 'Error setting default academy XP'));
  }
};
