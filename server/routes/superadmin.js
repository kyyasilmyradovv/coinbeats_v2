// routes/superadmin.js

const express = require('express');
const asyncHandler = require('express-async-handler');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { getDashboardStats } = require('../controllers/superadminController');

const router = express.Router();

router.get(
  '/stats',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  asyncHandler(getDashboardStats)
);

module.exports = router;
