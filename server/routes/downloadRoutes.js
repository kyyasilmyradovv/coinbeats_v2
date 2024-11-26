// routes/downloadRoutes.js

const express = require('express');
const router = express.Router();

// POST /api/download-csv
router.post('/download-csv', async (req, res) => {
  try {
    const { dataType, data, selectedWalletType, fileName } = req.body;

    let csvContent = '';
    if (dataType === 'leaderboard') {
      csvContent = generateLeaderboardCSV(data, selectedWalletType);
    } else if (dataType === 'referrers') {
      csvContent = generateReferrersCSV(data, selectedWalletType);
    } else {
      return res.status(400).json({ error: 'Invalid data type' });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    res.send(csvContent);
  } catch (error) {
    console.error('Error generating CSV file:', error);
    res.status(500).json({ error: 'Failed to generate CSV file' });
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

module.exports = router;
