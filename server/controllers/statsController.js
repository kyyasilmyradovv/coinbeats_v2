// server/controllers/statsController.js

const { PrismaClient } = require('@prisma/client');
const createError = require('http-errors');
const prisma = new PrismaClient();

exports.getUserCount = async (req, res, next) => {
  try {
    const count = await prisma.user.count();
    res.json({ count });
  } catch (error) {
    console.error('Error fetching user count:', error);
    next(createError(500, 'Error fetching user count'));
  }
};

exports.getAcademyCount = async (req, res, next) => {
  try {
    const count = await prisma.academy.count();
    res.json({ count });
  } catch (error) {
    console.error('Error fetching academy count:', error);
    next(createError(500, 'Error fetching academy count'));
  }
};

exports.getSessionCount = async (req, res, next) => {
  try {
    const count = await prisma.sessionLog.count();
    res.json({ count });
  } catch (error) {
    console.error('Error fetching session count:', error);
    next(createError(500, 'Error fetching session count'));
  }
};

exports.getUnreadInboxCount = async (req, res, next) => {
  try {
    const count = await prisma.inbox.count({ where: { read: false } });
    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread inbox count:', error);
    next(createError(500, 'Error fetching unread inbox count'));
  }
};

exports.getSubscriptionCount = async (req, res, next) => {
  try {
    const count = await prisma.subscription.count();
    res.json({ count });
  } catch (error) {
    console.error('Error fetching subscription count:', error);
    next(createError(500, 'Error fetching subscription count'));
  }
};
