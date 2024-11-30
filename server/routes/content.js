// server/routes/content.js

const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const asyncHandler = require('express-async-handler');
const { upload } = require('../uploadConfig'); // Reuse the central multer configuration

const {
  createPodcast,
  createEducator,
  createTutorial,
} = require('../controllers/contentController');

const router = express.Router();

// Routes for Podcasts
router.post(
  '/podcasts',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 },
  ]),
  asyncHandler(createPodcast)
);

// Routes for Educators
router.post(
  '/educators',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 },
  ]),
  asyncHandler(createEducator)
);

// Routes for Tutorials
router.post(
  '/tutorials',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 },
  ]),
  asyncHandler(createTutorial)
);

module.exports = router;
