// server/routes/stats.js

const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  getUserCount,
  getAcademyCount,
  getSessionCount,
  getUnreadInboxCount,
  getSubscriptionCount,
} = require('../controllers/statsController');
const asyncHandler = require('express-async-handler');

const router = express.Router();

router.get('/users/count', authenticateToken, authorizeRoles('SUPERADMIN'), asyncHandler(getUserCount));
router.get('/academies/count', authenticateToken, authorizeRoles('SUPERADMIN'), asyncHandler(getAcademyCount));
router.get('/sessions/count', authenticateToken, authorizeRoles('SUPERADMIN'), asyncHandler(getSessionCount));
router.get('/inbox/unread-count', authenticateToken, authorizeRoles('SUPERADMIN'), asyncHandler(getUnreadInboxCount));
router.get('/subscriptions/count', authenticateToken, authorizeRoles('SUPERADMIN'), asyncHandler(getSubscriptionCount));

module.exports = router;
