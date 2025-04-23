const express = require('express');
const { protectForUser } = require('../controllers/userAuthControllers');
const {
  getLeaderboard,
  getMyStats,
  getMyPointsHistory,
} = require('../controllers/newPointController');
const router = express.Router();

router.get('/leaderboard', getLeaderboard);
router.get('/my-stats', protectForUser, getMyStats);
router.get('/history', protectForUser, getMyPointsHistory);

module.exports = router;
