// routes/downloadRoutes.js

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// POST /api/download-csv
router.post('/download-csv', async (req, res) => {
  try {
    const { csvContent, fileName } = req.body;

    // Generate a unique filename to prevent conflicts
    const uniqueFileName = `${uuidv4()}_${fileName}`;
    const filePath = path.join(
      __dirname,
      '..',
      'public',
      'downloads',
      uniqueFileName
    );

    // Ensure the 'downloads' directory exists
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    // Save the CSV content to the file
    fs.writeFileSync(filePath, csvContent);

    // Generate the download URL
    const serverUrl =
      process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 4000}`;
    const downloadUrl = `${serverUrl}/downloads/${uniqueFileName}`;

    res.json({ downloadUrl });
  } catch (error) {
    console.error('Error saving CSV file:', error);
    res.status(500).json({ error: 'Failed to save CSV file' });
  }
});

module.exports = router;
