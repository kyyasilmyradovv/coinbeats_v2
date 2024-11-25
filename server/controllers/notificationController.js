// server/controllers/notificationController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const createError = require('http-errors');

exports.getUserNotifications = async (req, res, next) => {
  const telegramUserIdHeader = req.headers['x-telegram-user-id'];
  let telegramUserId;

  if (telegramUserIdHeader) {
    telegramUserId = BigInt(telegramUserIdHeader);
  } else if (req.query.telegramUserId) {
    telegramUserId = BigInt(req.query.telegramUserId);
  } else {
    return next(createError(400, 'Telegram User ID is required'));
  }

  try {
    const user = await prisma.user.findUnique({
      where: { telegramUserId },
      select: { id: true },
    });

    if (!user) {
      return res.json([]); // Return empty array if user not found
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id, read: false },
      orderBy: { createdAt: 'desc' },
    });

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    next(createError(500, 'Error fetching notifications'));
  }
};

exports.markNotificationAsRead = async (req, res, next) => {
  const { notificationId } = req.params;

  try {
    await prisma.notification.update({
      where: { id: parseInt(notificationId, 10) },
      data: { read: true },
    });

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    next(createError(500, 'Error marking notification as read'));
  }
};

exports.createNotification = async (req, res, next) => {
  const { userIds, message, type } = req.body;

  try {
    // If userIds is empty or not provided, send to all users
    let targetUserIds = userIds;
    if (!userIds || userIds.length === 0) {
      const users = await prisma.user.findMany({ select: { id: true } });
      targetUserIds = users.map((user) => user.id);
    }

    // Create notifications for each target user
    const notificationsData = targetUserIds.map((userId) => ({
      userId,
      message,
      type,
      read: false,
    }));

    await prisma.notification.createMany({ data: notificationsData });

    res.json({ message: 'Notifications created successfully' });
  } catch (error) {
    console.error('Error creating notifications:', error);
    next(createError(500, 'Error creating notifications'));
  }
};
