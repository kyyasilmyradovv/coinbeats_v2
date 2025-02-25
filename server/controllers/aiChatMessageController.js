const { PrismaClient } = require('@prisma/client');
const createError = require('http-errors');
const prisma = new PrismaClient();

exports.getAllMessages = async (req, res, next) => {
  try {
    const telegramUserId = +req.headers['x-telegram-user-id'];
    if (!telegramUserId)
      return next(createError(400, 'Telegram User ID is required'));

    const user = await prisma.user.findUnique({
      where: { telegramUserId },
      select: { id: true },
    });
    if (!user) return next(createError(404, 'User not found'));

    const { id } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    const where = { chat_id: +id, user_id: user?.id };

    let messages = await prisma.aiChatMessages.findMany({
      where,
      select: { id: true, message: true, sender: true },
      orderBy: { id: 'desc' },
      take: +limit,
      skip: +offset,
    });

    res.status(200).send(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    next(createError(500, 'Error fetching messages'));
  }
};

exports.createMessage = async (req, res, next) => {
  try {
    const telegramUserId = +req.headers['x-telegram-user-id'];
    if (!telegramUserId)
      return next(createError(400, 'Telegram User ID is required'));

    const user = await prisma.user.findUnique({
      where: { telegramUserId },
      select: { id: true },
    });
    if (!user) return next(createError(404, 'User not found'));

    let { id } = req.params;
    let { message, sender, academy_ids } = req.body;

    if (!id || !message || !['user', 'ai'].includes(sender))
      return next(createError(400, 'Bad request'));

    const newMessage = await prisma.aiChatMessages.create({
      data: {
        message,
        sender,
        chat_id: +id,
        user_id: user?.id,
        ...(academy_ids?.length > 0 && {
          academies: {
            connect: academy_ids.map((id) => ({ id: +id })),
          },
        }),
      },
    });

    res.status(200).send(newMessage);
  } catch (error) {
    console.error('Error creating message:', error);
    next(createError(500, 'Error creating message'));
  }
};
