const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const asyncHandler = require('../utils/asyncHandler');

exports.getAllAcademyTypes = asyncHandler(async (req, res, next) => {
  const { keyword, limit, offset } = req.query;

  const where = { restricted: false };

  if (keyword && keyword.trim().length >= 2) {
    where.name = {
      contains: keyword.trim(),
      mode: 'insensitive',
    };
  }

  const types = await prisma.academyType.findMany({
    where,
    select: {
      id: true,
      name: true,
      description: true,
    },
    take: +limit || 10,
    skip: +offset || 0,
  });

  res.json(types);
});
