// middleware/telegramAuth.js

module.exports = (req, res, next) => {
  const telegramUserIdHeader = req.headers['x-telegram-user-id'];

  if (!telegramUserIdHeader) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Convert telegramUserId to BigInt
  const telegramUserId = BigInt(telegramUserIdHeader);

  req.user = { telegramUserId };
  next();
};
