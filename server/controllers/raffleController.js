const { PrismaClient } = require('@prisma/client');
const createError = require('http-errors');
const prisma = new PrismaClient();

exports.getMyRaffles = async (req, res, next) => {
  try {
    const userId = +req.query?.userId;

    // Try to find the existing Raffle for the user
    let raffles = await prisma.raffle.findMany({
      where: { userId },
      orderBy: { id: 'desc' },
      include: {
        academy: true,
        task: true,
      },
    });

    res.status(200).json(raffles);
  } catch (error) {
    console.error('Error fetching surprise box:', error);
    next(createError(500, 'Error fetching surprise box'));
  }
};
