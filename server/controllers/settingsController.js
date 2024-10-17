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

// Get the scholarship text
exports.getScholarshipText = async (req, res, next) => {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'scholarship_text' },
    });

    res.status(200).json({ value: setting ? setting.value : '' });
  } catch (error) {
    console.error('Error fetching scholarship text:', error);
    next(createError(500, 'Error fetching scholarship text'));
  }
};

// Update the scholarship text
exports.updateScholarshipText = async (req, res, next) => {
  const { value } = req.body;

  if (typeof value !== 'string') {
    return next(createError(400, 'Invalid scholarship text value'));
  }

  try {
    const setting = await prisma.setting.upsert({
      where: { key: 'scholarship_text' },
      update: { value },
      create: { key: 'scholarship_text', value },
    });

    res.status(200).json({ value: setting.value });
  } catch (error) {
    console.error('Error updating scholarship text:', error);
    next(createError(500, 'Error updating scholarship text'));
  }
};
