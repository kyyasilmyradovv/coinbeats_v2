const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const asyncHandler = require('../utils/asyncHandler');

exports.getAllAcademies = asyncHandler(async (req, res, next) => {
  const { limit, offset } = req.query;

  const academies = await prisma.academy.findMany({
    select: {
      id: true,
      name: true,
      logoUrl: true,
      xp: true,
      pointCount: true,
      fomoNumber: true,
      fomoXp: true,
      academyTypeId: true,
    },
    take: +limit || 10,
    skip: +offset || 0,
  });

  res.json(academies);
});
