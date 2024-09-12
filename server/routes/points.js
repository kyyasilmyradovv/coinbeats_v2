const express = require('express');
const asyncHandler = require('express-async-handler');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  getPointsByUserAndAcademy,
  getLeaderboard,
  getUserPoints,
  getUserPointsBreakdown,
} = require('../controllers/pointsController');

const router = express.Router();

// Public routes
router.get('/leaderboard', asyncHandler(getLeaderboard)); // Leaderboard is public

// Protected routes
router.get(
  '/breakdown/:userId',
  // authenticateToken,  // Add authentication here if you want to protect this route
  asyncHandler(getUserPointsBreakdown)
);

router.get(
  '/user/:userId',
  // authenticateToken,  // Add authentication here if needed
  asyncHandler(getUserPoints)
);

router.get(
  '/:userId/:academyId',
  // authenticateToken,  // Add authentication if this is a protected route
  asyncHandler(getPointsByUserAndAcademy)
);

module.exports = router;
