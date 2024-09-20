// middleware/telegramAuth.js
module.exports = (req, res, next) => {
  const telegramUserId = req.headers['x-telegram-user-id'];

  if (!telegramUserId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  req.user = { telegramUserId: parseInt(telegramUserId, 10) };
  next();
};
