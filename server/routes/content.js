// server/routes/content.js

const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const asyncHandler = require('express-async-handler');
const { upload } = require('../uploadConfig'); // Multer config

const {
  createPodcast,
  createEducator,
  createTutorial,
  getPodcasts,
  getEducators,
  getTutorials,

  // NEW: import your delete controllers
  deletePodcast,
  deleteEducator,
  deleteTutorial,

  createYoutubeChannel,
  createTelegramGroup,
  getYoutubeChannels,
  getTelegramGroups,
  deleteYoutubeChannel,
  deleteTelegramGroup,
} = require('../controllers/contentController');

const router = express.Router();

// ---------------- PODCASTS ----------------
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

router.get('/podcasts', authenticateToken, asyncHandler(getPodcasts));

// NEW: Delete Podcast
router.delete(
  '/podcasts/:id',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  asyncHandler(deletePodcast)
);

// ---------------- EDUCATORS ----------------
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

router.get('/educators', authenticateToken, asyncHandler(getEducators));

// NEW: Delete Educator
router.delete(
  '/educators/:id',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  asyncHandler(deleteEducator)
);

// ---------------- TUTORIALS ----------------
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

router.get('/tutorials', authenticateToken, asyncHandler(getTutorials));

// NEW: Delete Tutorial
router.delete(
  '/tutorials/:id',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  asyncHandler(deleteTutorial)
);

// ---------------- YOUTUBE CHANNELS ----------------
router.post(
  '/youtube-channels',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 },
  ]),
  asyncHandler(createYoutubeChannel)
);

router.get(
  '/youtube-channels',
  authenticateToken,
  asyncHandler(getYoutubeChannels)
);

// NEW: Delete YouTube Channel
router.delete(
  '/youtube-channels/:id',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  asyncHandler(deleteYoutubeChannel)
);

// ---------------- TELEGRAM GROUPS ----------------
router.post(
  '/telegram-groups',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 },
  ]),
  asyncHandler(createTelegramGroup)
);

router.get(
  '/telegram-groups',
  authenticateToken,
  asyncHandler(getTelegramGroups)
);

// NEW: Delete Telegram Group
router.delete(
  '/telegram-groups/:id',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  asyncHandler(deleteTelegramGroup)
);

module.exports = router;
