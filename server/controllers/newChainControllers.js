const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const asyncHandler = require('../utils/asyncHandler');

exports.getAllChains = asyncHandler(async (req, res, next) => {
  const { keyword, limit, offset } = req.query;

  const where = {};

  if (keyword && keyword.trim().length >= 2) {
    where.name = {
      contains: keyword.trim(),
      mode: 'insensitive',
    };
  }

  const chains = await prisma.chain.findMany({
    where,
    take: +limit || 10,
    skip: +offset || 0,
  });

  res.json(chains);
});
