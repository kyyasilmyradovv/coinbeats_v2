// server/controllers/sessionController.js

const { PrismaClient } = require('@prisma/client');
const createError = require('http-errors');
const prisma = new PrismaClient();

exports.logSession = async (req, res, next) => {
  try {
    const {
      telegramUserId,
      sessionStart,
      sessionEnd,
      duration,
      routeDurations,
    } = req.body;

    // Debugging: log incoming request data
    console.log('Received session data:', req.body);

    // Validate and parse dates
    const parsedSessionStart = new Date(sessionStart);
    const parsedSessionEnd = new Date(sessionEnd);

    // Check if dates are valid
    if (isNaN(parsedSessionStart.getTime()) || isNaN(parsedSessionEnd.getTime())) {
      return next(createError(400, 'Invalid date format'));
    }

    // Check required fields
    if (!telegramUserId || !duration || !routeDurations) {
      return next(createError(400, 'Missing required fields'));
    }

    // Create a new session log entry in the database
    const sessionLog = await prisma.sessionLog.create({
      data: {
        telegramUserId,
        sessionStart: parsedSessionStart,
        sessionEnd: parsedSessionEnd,
        duration,
        routeDurations: JSON.stringify(routeDurations),
      },
    });

    res.status(201).json(sessionLog);
  } catch (error) {
    console.error('Error logging session:', error);
    next(createError(500, 'Failed to log session'));
  }
};
