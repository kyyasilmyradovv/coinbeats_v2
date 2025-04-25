const { PrismaClient } = require('@prisma/client');
const asyncHandler = require('../utils/asyncHandler');
const prisma = new PrismaClient();

exports.getAllMessages = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { limit = 10, offset = 0 } = req.query;

  const chat = await prisma.aiChats.findUnique({
    where: { id: +id, user_id: req.user?.id },
    select: { id: true },
  });
  if (!chat) return res.status(404).json({ message: 'Chat not found' });

  let messages = await prisma.aiChatMessages.findMany({
    where: { chat_id: +id },
    select: {
      id: true,
      message: true,
      sender: true,
      academies: { select: { id: true, name: true, logoUrl: true } },
    },
    orderBy: { id: 'desc' },
    take: +limit,
    skip: +offset,
  });

  res.status(200).send(messages);
});

exports.createMessage = asyncHandler(async (req, res, next) => {
  let { id } = req.params;
  let { message, sender, academy_ids } = req.body;

  const chat = await prisma.aiChats.findUnique({
    where: { id: +id, user_id: req.user?.id },
    select: { id: true },
  });
  if (!chat) return res.status(404).json({ message: 'Chat not found' });

  const newMessage = await prisma.aiChatMessages.create({
    data: {
      message,
      sender,
      chat_id: +id,
      user_id: req.user?.id,
      ...(academy_ids?.length > 0 && {
        academies: {
          connect: academy_ids.map((id) => ({ id: +id })),
        },
      }),
    },
    select: { id: true, message: true, sender: true },
  });

  res.status(200).send(newMessage);
});
