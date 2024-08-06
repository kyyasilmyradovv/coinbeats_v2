// server/controllers/subscriptionController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getSubscriptionSettings = async (req, res) => {
  try {
    const settings = await prisma.subscriptionSettings.findFirst();
    res.json(settings);
  } catch (error) {
    console.error('Error fetching subscription settings:', error);
    res.status(500).json({ error: 'Error fetching subscription settings' });
  }
};

exports.toggleSubscriptionStatus = async (req, res) => {
  try {
    const { enabled } = req.body;
    await prisma.subscriptionSettings.update({
      where: { id: 1 }, // Assuming there's a single settings row
      data: { enabled },
    });
    res.json({ message: 'Subscription status updated' });
  } catch (error) {
    console.error('Error toggling subscription status:', error);
    res.status(500).json({ error: 'Error toggling subscription status' });
  }
};

exports.updateMonthlyFee = async (req, res) => {
  try {
    const { monthlyFee } = req.body;
    await prisma.subscriptionSettings.update({
      where: { id: 1 }, // Assuming there's a single settings row
      data: { monthlyFee },
    });
    res.json({ message: 'Monthly fee updated' });
  } catch (error) {
    console.error('Error updating monthly fee:', error);
    res.status(500).json({ error: 'Error updating monthly fee' });
  }
};

exports.calculateMonthlyIncome = async (req, res) => {
  try {
    // Assuming each subscription has a field 'monthlyFee'
    const subscriptions = await prisma.subscription.findMany({
      where: { active: true },
    });
    const monthlyIncome = subscriptions.reduce((sum, sub) => sum + sub.monthlyFee, 0);
    res.json({ monthly: monthlyIncome });
  } catch (error) {
    console.error('Error calculating monthly income:', error);
    res.status(500).json({ error: 'Error calculating monthly income' });
  }
};
