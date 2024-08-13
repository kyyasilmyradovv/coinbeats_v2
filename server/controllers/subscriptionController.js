// server/controllers/subscriptionController.js

const { PrismaClient } = require('@prisma/client');
const createError = require('http-errors');
const prisma = new PrismaClient();

exports.getSubscriptionSettings = async (req, res, next) => {
  try {
    const settings = await prisma.subscriptionSettings.findFirst();
    if (!settings) {
      return next(createError(404, 'Subscription settings not found'));
    }
    res.json(settings);
  } catch (error) {
    console.error('Error fetching subscription settings:', error);
    next(createError(500, 'Error fetching subscription settings'));
  }
};

exports.toggleSubscriptionStatus = async (req, res, next) => {
  try {
    const { enabled } = req.body;
    const updatedSettings = await prisma.subscriptionSettings.update({
      where: { id: 1 },
      data: { enabled },
    });
    res.json({ message: 'Subscription status updated', updatedSettings });
  } catch (error) {
    console.error('Error toggling subscription status:', error);
    next(createError(500, 'Error toggling subscription status'));
  }
};

exports.updateMonthlyFee = async (req, res, next) => {
  try {
    const { monthlyFee } = req.body;
    const updatedSettings = await prisma.subscriptionSettings.update({
      where: { id: 1 },
      data: { monthlyFee },
    });
    res.json({ message: 'Monthly fee updated', updatedSettings });
  } catch (error) {
    console.error('Error updating monthly fee:', error);
    next(createError(500, 'Error updating monthly fee'));
  }
};

exports.calculateMonthlyIncome = async (req, res, next) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      where: { active: true },
    });
    const monthlyIncome = subscriptions.reduce((sum, sub) => sum + sub.monthlyFee, 0);
    res.json({ monthly: monthlyIncome });
  } catch (error) {
    console.error('Error calculating monthly income:', error);
    next(createError(500, 'Error calculating monthly income'));
  }
};
