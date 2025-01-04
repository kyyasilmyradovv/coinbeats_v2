// routes/discover.js

const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const asyncHandler = require('express-async-handler');
const discoverController = require('../controllers/discoverController');

const router = express.Router();

// Public routes for Educators
router.get('/educators', asyncHandler(discoverController.getAllEducators));
router.get('/educators/:id', asyncHandler(discoverController.getEducatorById));

// Public routes for Tutorials
router.get('/tutorials', asyncHandler(discoverController.getAllTutorials));
router.get('/tutorials/:id', asyncHandler(discoverController.getTutorialById));

// **New public routes for Podcasts**
router.get('/podcasts', asyncHandler(discoverController.getAllPodcasts));
router.get('/podcasts/:id', asyncHandler(discoverController.getPodcastById));

// Protected routes for SuperAdmin to create content
router.post(
  '/educators',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  asyncHandler(discoverController.createEducator)
);

// Similarly, add routes for creating/updating/deleting Lessons, Podcasts, and Tutorials.

// **Protected route to create a new Podcast**
router.post(
  '/podcasts',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  asyncHandler(discoverController.createPodcast)
);

// **Protected route to create a new Tutorial**
router.post(
  '/tutorials',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  asyncHandler(discoverController.createTutorial)
);

// YOUTUBE CHANNELS
router.get(
  '/youtube-channels',
  asyncHandler(discoverController.getAllYoutubeChannels)
);
router.get(
  '/youtube-channels/:id',
  asyncHandler(discoverController.getYoutubeChannelById)
);
router.post(
  '/youtube-channels',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  asyncHandler(discoverController.createYoutubeChannel)
);

// TELEGRAM GROUPS
router.get(
  '/telegram-groups',
  asyncHandler(discoverController.getAllTelegramGroups)
);
router.get(
  '/telegram-groups/:id',
  asyncHandler(discoverController.getTelegramGroupById)
);
router.post(
  '/telegram-groups',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  asyncHandler(discoverController.createTelegramGroup)
);

module.exports = router;
