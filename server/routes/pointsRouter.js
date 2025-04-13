const express = require('express');
const { protectForUser } = require('../controllers/userAuthControllers');
const {
  getLeaderboard,
  getMyStats,
} = require('../controllers/newPointsController');
const router = express.Router();

router.get('/leaderboard', getLeaderboard);
router.get('/my-stats', protectForUser, getMyStats);

module.exports = router;
