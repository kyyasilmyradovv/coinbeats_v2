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

const router = express.Router();

router.get('/users/count', authenticateToken, authorizeRoles('SUPERADMIN'), getUserCount);
router.get('/academies/count', authenticateToken, authorizeRoles('SUPERADMIN'), getAcademyCount);
router.get('/sessions/count', authenticateToken, authorizeRoles('SUPERADMIN'), getSessionCount);
router.get('/inbox/unread-count', authenticateToken, authorizeRoles('SUPERADMIN'), getUnreadInboxCount);
router.get('/subscriptions/count', authenticateToken, authorizeRoles('SUPERADMIN'), getSubscriptionCount);

module.exports = router;
