// server/controllers/sessionController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.logSession = async (req, res) => {
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
      return res.status(400).json({ error: 'Invalid date format' });
    }

    // Check required fields
    if (!telegramUserId || !duration || !routeDurations) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create a new session log entry in the database
    const sessionLog = await prisma.sessionLog.create({
      data: {
        telegramUserId,
        sessionStart: parsedSessionStart,
        sessionEnd: parsedSessionEnd,
        duration,
        routeDurations: JSON.stringify(routeDurations), // Ensure routeDurations is serialized as JSON
      },
    });

    res.status(201).json(sessionLog);
  } catch (error) {
    console.error('Error logging session:', error);
    res.status(500).json({ error: 'Failed to log session' });
  }
};
