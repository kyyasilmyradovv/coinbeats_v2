const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const asyncHandler = require('../utils/asyncHandler');

exports.getAllAcademies = asyncHandler(async (req, res, next) => {
  const { keyword, categoryId, chainId, limit, offset } = req.query;

  const where = { status: 'approved' };

  if (keyword && keyword.trim().length > 0) {
    where.name = {
      contains: keyword.trim(),
      mode: 'insensitive',
    };
  }
  if (categoryId) where.categories = { some: { id: +categoryId } };
  if (chainId) where.chains = { some: { id: +chainId } };

  const academies = await prisma.academy.findMany({
    where,
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

  const academy = await prisma.academy.findUnique({
    where: { id: +id },
    select: {
      id: true,
      name: true,
      ticker: true,
      coingecko: true,
      discord: true,
      telegram: true,
      twitter: true,
      webpageUrl: true,
      coverPhotoUrl: true,
      logoUrl: true,
      dexScreener: true,
      xp: true,
      pointCount: true,
      fomoNumber: true,
      fomoXp: true,
      categories: {
        select: {
          id: true,
          name: true,
        },
      },
      chains: { select: { id: true, name: true } },
      academyType: { select: { id: true, name: true } },
      overallRaffle: {
        where: {
          isActive: true,
          deadline: { gte: new Date() },
        },
        select: {
          id: true,
          minAmount: true,
          winnersCount: true,
          deadline: true,
          minPoints: true,
          reward: true,
        },
      },
      ...(req.user?.id
        ? {
            points: {
              where: { userId: req.user.id, verificationTaskId: null },
              select: { value: true },
            },
          }
        : {}),
    },
  });
  if (!academy) return res.status(404).json({ message: 'Academy not found' });

  res.json(academy);
});
