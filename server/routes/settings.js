// server/routes/settings.js

const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const asyncHandler = require('express-async-handler');
const {
  getDefaultAcademyXp,
  setDefaultAcademyXp,
  getScholarshipText,
  updateScholarshipText,
} = require('../controllers/settingsController');

const router = express.Router();

// Get the default academy XP
router.get(
  '/default-academy-xp',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  asyncHandler(getDefaultAcademyXp)
);

// Set the default academy XP
router.post(
  '/default-academy-xp',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  asyncHandler(setDefaultAcademyXp)
);

// Get the scholarship text (public endpoint)
router.get('/scholarship-text', asyncHandler(getScholarshipText));

// Update the scholarship text (SUPERADMIN only)
router.put(
  '/scholarship-text',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  asyncHandler(updateScholarshipText)
);

module.exports = router;
