const { PrismaClient } = require('@prisma/client');
const createError = require('http-errors');

const prisma = new PrismaClient();

// Temporary in-memory store for SSE notifications
const sseClients = {};

/**
 * Handle email confirmation.
 * This function will be responsible for confirming the user's email address
 * by validating the token provided in the confirmation link.
 */
exports.confirmEmail = async (req, res, next) => {
  const { token } = req.query;

  try {
    // Log the token received for debugging purposes
    console.log("Received token for email confirmation:", token);

    // Find the user by the email confirmation token
    const user = await prisma.user.findFirst({
      where: { emailConfirmationToken: token },
    });

    // If no user is found with the given token, return an error
    if (!user) {
      console.log("User not found for token:", token);
      return next(createError(400, 'Invalid or expired token'));
    }

    // Update the user's email confirmation status and clear the token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailConfirmed: true,
        emailConfirmationToken: null,
      },
    });

    // Notify the SSE client if connected
    const sseClient = sseClients[user.id];
    if (sseClient) {
      sseClient.res.write(`data: ${JSON.stringify({ emailConfirmed: true })}\n\n`);
      delete sseClients[user.id]; // Clear the client after notification
    }

    // Send a response that sends a message to the Telegram app and closes the window after 3 seconds
    return res.send(`
      <h1>Email confirmation successful!</h1>
      <script>
        window.opener.postMessage('emailConfirmed', '*');
        setTimeout(() => {
          window.close();
        }, 3000);
      </script>
    `);
  } catch (error) {
    console.error('Error confirming email:', error);
    return res.send(`
      <h1>Email confirmation failed!</h1>
      <script>
        window.opener.postMessage('emailConfirmationFailed', '*');
        setTimeout(() => {
          window.close();
        }, 3000);
      </script>
    `);
  }
};

/**
 * Register an SSE client to listen for email confirmation status.
 */
exports.registerSSEClient = (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).send('User ID is required');
  }

  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // Flush headers to establish the SSE connection

  // Store the client connection
  sseClients[userId] = { res };

  // Handle client disconnection
  req.on('close', () => {
    delete sseClients[userId];
  });
};
