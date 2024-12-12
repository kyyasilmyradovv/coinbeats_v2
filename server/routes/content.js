// server/routes/content.js

const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const asyncHandler = require('express-async-handler');
const { upload } = require('../uploadConfig'); // Reuse the central multer configuration

const {
  createPodcast,
  createEducator,
  createTutorial,
  getPodcasts,
  getEducators,
  getTutorials,
} = require('../controllers/contentController');

const router = express.Router();

// Create routes
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

// Get routes (for listing)
router.get(
  '/podcasts',
  authenticateToken,
  // You can limit to certain roles if needed, or allow all authenticated
  // authorizeRoles('SUPERADMIN'),
  asyncHandler(getPodcasts)
);

router.get(
  '/educators',
  authenticateToken,
  //authorizeRoles('SUPERADMIN'),
  asyncHandler(getEducators)
);

router.get(
  '/tutorials',
  authenticateToken,
  //authorizeRoles('SUPERADMIN'),
  asyncHandler(getTutorials)
);

module.exports = router;
