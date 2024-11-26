// routes/pointsRoutes.js

const express = require('express');
const asyncHandler = require('express-async-handler');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  getPointsByUserAndAcademy,
  getLeaderboard,
  getUserPoints,
  getUserPointsBreakdown,
  getWeeklySnapshots,
  getWeeklyLeaderboardSnapshot,
  getWeeklyTopReferrersSnapshot,
} = require('../controllers/pointsController');

const router = express.Router();

// Public routes
router.get('/leaderboard', asyncHandler(getLeaderboard)); // Leaderboard is public

// Protected routes
router.get(
  '/breakdown/:userId',
  // authenticateToken,  // Uncomment and configure authentication if needed
  asyncHandler(getUserPointsBreakdown)
);

router.get(
  '/user/:userId',
  // authenticateToken,  // Uncomment and configure authentication if needed
  asyncHandler(getUserPoints)
);

router.get(
  '/:userId/:academyId',
  // authenticateToken,  // Uncomment and configure authentication if needed
  asyncHandler(getPointsByUserAndAcademy)
);

// SUPERADMIN routes
router.get(
  '/weekly_snapshots',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  asyncHandler(getWeeklySnapshots)
);

router.get(
  '/weekly_leaderboard_snapshot',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  asyncHandler(getWeeklyLeaderboardSnapshot)
);

router.get(
  '/weekly_top_referrers_snapshot',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  asyncHandler(getWeeklyTopReferrersSnapshot)
);

module.exports = router;
