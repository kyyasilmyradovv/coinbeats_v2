// server/routes/register.js
const express = require('express');
const prisma = require('../prisma'); // assuming you've set up prisma client
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

const router = express.Router();

router.post('/register-creator', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const token = crypto.randomBytes(20).toString('hex');

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
        role: 'CREATOR',
        emailConfirmationToken: token,
      },
    });

    const confirmationLink = `${process.env.FRONTEND_URL}/confirm-email?token=${token}`;
    const html = `
      <p>Hello ${name},</p>
      <p>Thank you for registering. Please confirm your email by clicking the link below:</p>
      <a href="${confirmationLink}">Confirm your email</a>
    `;

    await sendEmail(email, 'Email Confirmation', html);

    res.status(201).json({ message: 'Registration successful! Please confirm your email.' });
  } catch (err) {
    res.status(400).json({ error: 'Registration failed' });
  }
});

module.exports = router;
