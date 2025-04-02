const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const asyncHandler = require('../utils/asyncHandler');

exports.getAllCategories = asyncHandler(async (req, res, next) => {
  const { keyword, limit, offset } = req.query;

  const where = {};

  if (keyword && keyword.trim().length >= 2) {
    where.name = {
      contains: keyword.trim(),
      mode: 'insensitive',
    };
  }

  const categories = await prisma.category.findMany({
    where,
    take: +limit || 10,
    skip: +offset || 0,
  });

  res.json(categories);
});
