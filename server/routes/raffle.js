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
  createRaffle,
  getOverallRafflesForUsers,
} = require('../controllers/raffleController');

const router = express.Router();

// Admin routes for overall raffles
router.post(
  '/overall',
  authenticateToken,
  authorizeRoles('CREATOR'),
  asyncHandler(createRaffle)
);
router.put(
  '/overall/:id',
  authenticateToken,
  authorizeRoles('CREATOR', 'SUPERADMIN'),
  asyncHandler(updateOverallRaffle)
);
router.get(
  '/history/:id',
  authenticateToken,
  authorizeRoles('CREATOR', 'SUPERADMIN'),
  asyncHandler(getRafflesHistory)
);
router.get(
  '/winners/:id',
  authenticateToken,
  authorizeRoles('CREATOR', 'SUPERADMIN'),
  asyncHandler(getRaffleWinners)
);

// User apis
router.get('/overall', authenticateToken, asyncHandler(getOverallRaffle));
router.get('/overall-for-users', asyncHandler(getOverallRafflesForUsers));
router.get('/total', asyncHandler(getMyTotalRaffles));
router.get('/', asyncHandler(getMyRaffles));

module.exports = router;
