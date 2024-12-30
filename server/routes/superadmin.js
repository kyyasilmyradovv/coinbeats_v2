// routes/superadmin.js

const express = require('express');
const asyncHandler = require('express-async-handler');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  getDashboardStats,
  scamManagementList,
  banGroup,
  unbanGroup,
  deleteGroup,
  banUser,
  unbanUser,
  deleteUser,
} = require('../controllers/superadminController');

const router = express.Router();

router.get(
  '/stats',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  asyncHandler(getDashboardStats)
);

// Only SUPERADMIN can do this
router.get(
  '/scam-management',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  asyncHandler(scamManagementList)
);

router.post(
  '/scam-management/ban-group',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  asyncHandler(banGroup)
);
router.post(
  '/scam-management/unban-group',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  asyncHandler(unbanGroup)
);
router.delete(
  '/scam-management/delete-group',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  asyncHandler(deleteGroup)
);

router.post(
  '/scam-management/ban-user',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  asyncHandler(banUser)
);
router.post(
  '/scam-management/unban-user',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  asyncHandler(unbanUser)
);
router.delete(
  '/scam-management/delete-user/:userId',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  asyncHandler(deleteUser)
);

module.exports = router;
