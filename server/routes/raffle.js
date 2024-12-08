const express = require('express');
const asyncHandler = require('express-async-handler');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  getMyRaffles,
  getMyTotalRaffles,
  updateOverallRaffle,
  getOverallRaffle,
  getRafflesHistory,
  getRaffleWinners,
} = require('../controllers/raffleController');

const router = express.Router();

// Admin routes for overall raffles
router.put(
  '/overall',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  asyncHandler(updateOverallRaffle)
);
router.get(
  '/history',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  asyncHandler(getRafflesHistory)
);
router.get(
  '/winners',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  asyncHandler(getRaffleWinners)
);

// User apis
router.get('/overall', asyncHandler(getOverallRaffle));
router.get('/total', asyncHandler(getMyTotalRaffles));
router.get('/', asyncHandler(getMyRaffles));

module.exports = router;
