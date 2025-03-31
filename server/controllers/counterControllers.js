const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const asyncHandler = require('../utils/asyncHandler');
const createError = require('http-errors');

exports.getCounter = asyncHandler(async (req, res, next) => {
  const { table } = req.query;

  const counter = await prisma.counter.findUnique({
    where: { table },
    select: { count: true },
  });

  res.json(counter?.count || null);
});
