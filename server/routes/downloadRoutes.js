// routes/downloadRoutes.js

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const sendEmail = require('../utils/sendEmail');
const { authenticateToken } = require('../middleware/auth'); // Import the middleware

const prisma = new PrismaClient();

// POST /api/download-csv-email
router.post('/download-csv-email', authenticateToken, async (req, res) => {
  try {
    const { dataType, data, selectedWalletType, fileName } = req.body;

    // Get the user's email from the database
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user || !user.email) {
      return res.status(400).json({ error: 'User email not found' });
    }

    let csvContent = '';
    if (dataType === 'leaderboard') {
      csvContent = generateLeaderboardCSV(data, selectedWalletType);
    } else if (dataType === 'referrers') {
      csvContent = generateReferrersCSV(data, selectedWalletType);
    } else if (dataType === 'raffle_winners') {
      csvContent = generateRaffleWinnersCSV(data);
    } else {
      return res.status(400).json({ error: 'Invalid data type' });
    }

    // Save CSV to a temporary file
    const tempFilePath = path.join(
      __dirname,
      '..',
      'temp',
      `${Date.now()}_${fileName}`
    );
    fs.mkdirSync(path.dirname(tempFilePath), { recursive: true });
    fs.writeFileSync(tempFilePath, csvContent);

    // Send email with CSV attachment
    const emailSubject = `CSV Export: ${fileName}`;
    const emailText = `Hello ${user.name},\n\nPlease find attached the CSV export for ${fileName}.\n\nBest regards,\nYour Team`;
    const emailHtml = `<p>Hello ${user.name},</p><p>Please find attached the CSV export for ${fileName}.</p><p>Best regards,<br>Your Team</p>`;

    await sendEmail(user.email, emailSubject, emailText, emailHtml, [
      {
        filename: fileName,
        path: tempFilePath,
        contentType: 'text/csv',
      },
    ]);

    // Delete the temporary file
    fs.unlinkSync(tempFilePath);

    res.json({ message: 'CSV file sent to your email' });
  } catch (error) {
    console.error('Error sending CSV file via email:', error);
    res.status(500).json({ error: 'Failed to send CSV file via email' });
  }
});

const generateLeaderboardCSV = (data, selectedWalletType) => {
  const header = 'Rank,Username,UserId,TelegramUserId,WalletAddress';
  const rows = data.map((user, index) => {
    const walletAddress = user[selectedWalletType] || '';
    return `${index + 1},${user.name},${user.userId},${
      user.telegramUserId
    },${walletAddress}`;
  });
  return [header, ...rows].join('\n');
};

const generateReferrersCSV = (data, selectedWalletType) => {
  const header =
    'Rank,Username,UserId,TelegramUserId,ReferralCount,WalletAddress';
  const rows = data.map((user, index) => {
    const walletAddress = user[selectedWalletType] || '';
    return `${index + 1},${user.name},${user.userId},${user.telegramUserId},${
      user.referralCount
    },${walletAddress}`;
  });
  return [header, ...rows].join('\n');
};

const generateRaffleWinnersCSV = (data) => {
  const header =
    'Rank,Username,erc20WalletAddress,solanaWalletAddress,tonWalletAddress';

  const rows = data.map((winner, index) => {
    return `${index + 1},${winner.user.name},${
      winner.user?.erc20WalletAddress || ''
    },${winner.user?.solanaWalletAddress || ''},${
      winner.user?.tonWalletAddress || ''
    }`;
  });

  return [header, ...rows].join('\n');
};

module.exports = router;
