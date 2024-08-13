// server/routes/confirmEmail.js
const express = require('express');
const prisma = require('../prisma'); // assuming you've set up prisma client

const router = express.Router();

router.get('/confirm-email', async (req, res) => {
  const { token } = req.query;

  try {
    const user = await prisma.user.findUnique({
      where: { emailConfirmationToken: token },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid token' });
    }

    await prisma.user.update({
      where: { emailConfirmationToken: token },
      data: {
        emailConfirmed: true,
        emailConfirmationToken: null,
      },
    });

    res.send('<h1>Email confirmation successful!</h1><script>setTimeout(() => { window.close(); }, 3000);</script>');
  } catch (err) {
    res.status(500).json({ error: 'Failed to confirm email' });
  }
});

module.exports = router;
