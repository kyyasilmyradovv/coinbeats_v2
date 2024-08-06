// server/controllers/statsController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getUserCount = async (req, res) => {
  try {
    const count = await prisma.user.count();
    res.json({ count });
  } catch (error) {
    console.error('Error fetching user count:', error);
    res.status(500).json({ error: 'Error fetching user count' });
  }
};

exports.getAcademyCount = async (req, res) => {
  try {
    const count = await prisma.academy.count();
    res.json({ count });
  } catch (error) {
    console.error('Error fetching academy count:', error);
    res.status(500).json({ error: 'Error fetching academy count' });
  }
};

exports.getSessionCount = async (req, res) => {
  try {
    const count = await prisma.sessionLog.count();
    res.json({ count });
  } catch (error) {
    console.error('Error fetching session count:', error);
    res.status(500).json({ error: 'Error fetching session count' });
  }
};

exports.getUnreadInboxCount = async (req, res) => {
  try {
    const count = await prisma.inbox.count({ where: { read: false } });
    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread inbox count:', error);
    res.status(500).json({ error: 'Error fetching unread inbox count' });
  }
};

exports.getSubscriptionCount = async (req, res) => {
  try {
    const count = await prisma.subscription.count();
    res.json({ count });
  } catch (error) {
    console.error('Error fetching subscription count:', error);
    res.status(500).json({ error: 'Error fetching subscription count' });
  }
};
