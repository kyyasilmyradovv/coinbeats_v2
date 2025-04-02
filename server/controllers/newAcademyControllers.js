const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const asyncHandler = require('../utils/asyncHandler');

exports.getAllAcademies = asyncHandler(async (req, res, next) => {
  const { limit, offset } = req.query;

  const academies = await prisma.academy.findMany({
    where: { status: 'approved' },
    select: {
      id: true,
      name: true,
      logoUrl: true,
      xp: true,
      pointCount: true,
      fomoNumber: true,
      fomoXp: true,
      academyTypeId: true,
      createdAt: true,
    },
    take: +limit || 10,
    skip: +offset || 0,
  });

  res.json(academies);
});

exports.getAcademy = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  // const { id: userId, roles } = req.user;

  // if (!roles.includes('ADMIN') && !roles.includes('SUPERADMIN')) {
  //   return next(
  //     createError(403, 'You are not authorized to access this academy')
  //   );
  // }

  const academy = await prisma.academy.findUnique({
    where: { id: parseInt(id, 10) },
    // where: { id: parseInt(id, 10), creatorId: userId },
    select: {
      academyQuestions: {
        include: {
          choices: true,
          initialQuestion: true,
        },
      },
      raffles: true,
      quests: true,
    },
  });
  if (!academy) {
    return res.status(404).json({ message: 'Academy not found' });
  }

  // academy.academyQuestions = academy.academyQuestions || [];
  // academy.raffles = academy.raffles || [];
  // academy.quests = academy.quests || [];

  res.json(academy);
});
