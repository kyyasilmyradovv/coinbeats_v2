// server/routes/content.js

const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const asyncHandler = require('express-async-handler');
const { upload } = require('../uploadConfig');

const {
  // existing create
  createPodcast,
  createEducator,
  createTutorial,
  createYoutubeChannel,
  createTelegramGroup,

  // existing get
  getPodcasts,
  getEducators,
  getTutorials,
  getYoutubeChannels,
  getTelegramGroups,

  // existing delete
  deletePodcast,
  deleteEducator,
  deleteTutorial,
  deleteYoutubeChannel,
  deleteTelegramGroup,

  // NEW update controllers
  updatePodcast,
  updateEducator,
  updateTutorial,
  updateYoutubeChannel,
  updateTelegramGroup,
} = require('../controllers/contentController');

const router = express.Router();

// ================== PODCAST ==================
router.post(
  '/podcasts',
  authenticateToken,
  authorizeRoles('SUPERADMIN', 'ADMIN', 'CREATOR'),
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 },
  ]),
  asyncHandler(createPodcast)
);
router.get('/podcasts', authenticateToken, asyncHandler(getPodcasts));
router.put(
  '/podcasts/:id',
  authenticateToken,
  authorizeRoles('SUPERADMIN', 'ADMIN', 'CREATOR'),
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 },
  ]),
  asyncHandler(updatePodcast)
);
router.delete(
  '/podcasts/:id',
  authenticateToken,
  authorizeRoles('SUPERADMIN', 'ADMIN', 'CREATOR'),
  asyncHandler(deletePodcast)
);

// ================== EDUCATOR ==================
router.post(
  '/educators',
  authenticateToken,
  authorizeRoles('SUPERADMIN', 'ADMIN', 'CREATOR'),
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 },
  ]),
  asyncHandler(createEducator)
);
router.get('/educators', authenticateToken, asyncHandler(getEducators));
router.put(
  '/educators/:id',
  authenticateToken,
  authorizeRoles('SUPERADMIN', 'ADMIN', 'CREATOR'),
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 },
  ]),
  asyncHandler(updateEducator)
);
router.delete(
  '/educators/:id',
  authenticateToken,
  authorizeRoles('SUPERADMIN', 'ADMIN', 'CREATOR'),
  asyncHandler(deleteEducator)
);

// ================== TUTORIAL ==================
router.post(
  '/tutorials',
  authenticateToken,
  authorizeRoles('SUPERADMIN', 'ADMIN', 'CREATOR'),
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 },
  ]),
  asyncHandler(createTutorial)
);
router.get('/tutorials', authenticateToken, asyncHandler(getTutorials));
router.put(
  '/tutorials/:id',
  authenticateToken,
  authorizeRoles('SUPERADMIN', 'ADMIN', 'CREATOR'),
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 },
  ]),
  asyncHandler(updateTutorial)
);
router.delete(
  '/tutorials/:id',
  authenticateToken,
  authorizeRoles('SUPERADMIN', 'ADMIN', 'CREATOR'),
  asyncHandler(deleteTutorial)
);

// ================== YOUTUBE CHANNEL ==================
router.post(
  '/youtube-channels',
  authenticateToken,
  authorizeRoles('SUPERADMIN', 'ADMIN', 'CREATOR'),
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
router.put(
  '/youtube-channels/:id',
  authenticateToken,
  authorizeRoles('SUPERADMIN', 'ADMIN', 'CREATOR'),
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 },
  ]),
  asyncHandler(updateYoutubeChannel)
);
router.delete(
  '/youtube-channels/:id',
  authenticateToken,
  authorizeRoles('SUPERADMIN', 'ADMIN', 'CREATOR'),
  asyncHandler(deleteYoutubeChannel)
);

// ================== TELEGRAM GROUP ==================
router.post(
  '/telegram-groups',
  authenticateToken,
  authorizeRoles('SUPERADMIN', 'ADMIN', 'CREATOR'),
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
router.put(
  '/telegram-groups/:id',
  authenticateToken,
  authorizeRoles('SUPERADMIN', 'ADMIN', 'CREATOR'),
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 },
  ]),
  asyncHandler(updateTelegramGroup)
);
router.delete(
  '/telegram-groups/:id',
  authenticateToken,
  authorizeRoles('SUPERADMIN', 'ADMIN', 'CREATOR'),
  asyncHandler(deleteTelegramGroup)
);

module.exports = router;
