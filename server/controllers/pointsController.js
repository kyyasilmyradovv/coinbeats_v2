// controllers/pointsController.js

const { PrismaClient } = require('@prisma/client');
const createError = require('http-errors');
const prisma = new PrismaClient();

// Get points by user and academy
exports.getPointsByUserAndAcademy = async (req, res, next) => {
  const { userId, academyId } = req.params;

  console.log('Received request for points:');
  console.log(`UserId: ${userId}, AcademyId: ${academyId}`);

  try {
    const points = await prisma.point.findMany({
      where: {
        userId: parseInt(userId, 10),
        academyId: parseInt(academyId, 10),
      },
    });

    console.log('Points found:', points);

    if (!points || points.length === 0) {
      throw createError(404, `No points found for User ID ${userId} and Academy ID ${academyId}`);
    }

    // Summing up the points if there are multiple records
    const totalPoints = points.reduce((acc, point) => acc + point.value, 0);

    console.log('Total Points:', totalPoints);

    return res.status(200).json({ value: totalPoints });
  } catch (error) {
    if (error.status) {
      // If the error has a status, it's likely a createError instance
      next(error);
    } else {
      console.error('Error fetching points:', error);
    next(createError(500, 'Internal Server Error: Error fetching points'));
    }
  }
};
