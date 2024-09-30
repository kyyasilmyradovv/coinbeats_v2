// server/routes/settings.js

const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const asyncHandler = require('express-async-handler');
const {
  getDefaultAcademyXp,
  setDefaultAcademyXp,
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

module.exports = router;
