// server/controllers/sseController.js

const { PrismaClient } = require('@prisma/client');
const createError = require('http-errors');
const prisma = new PrismaClient();

/**
 * Register an SSE client to listen for email confirmation status.
 * This function is called when the client connects to the SSE endpoint.
 */
exports.emailConfirmationStatus = async (req, res, next) => {
    const userId = req.query.userId;

    if (!userId) {
        return next(createError(400, 'User ID is required.'));
    }

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Flush headers to establish SSE connection
    res.flushHeaders();

    const intervalId = setInterval(async () => {
        try {
            // Fetch user from database
            const user = await prisma.user.findUnique({
                where: { telegramUserId: Number(userId) }
            });

            if (!user) {
                clearInterval(intervalId);
                res.write(`data: ${JSON.stringify({ error: 'User not found' })}\n\n`);
                res.end();  // Close the SSE connection
                return;
            }

            if (user.emailConfirmed) {
                // Send email confirmation status to the client
                res.write(`data: ${JSON.stringify({ emailConfirmed: true })}\n\n`);
                clearInterval(intervalId);
                res.end();  // Close the SSE connection
            }
        } catch (error) {
            console.error('Error checking email confirmation:', error);

            // Send error message via SSE
            res.write(`data: ${JSON.stringify({ error: 'Failed to fetch user data' })}\n\n`);
            clearInterval(intervalId);
            res.end();  // Close the SSE connection
        }
    }, 1000);  // Check every second

    // Handle connection close
    req.on('close', () => {
        clearInterval(intervalId);
        res.end();
    });
};
