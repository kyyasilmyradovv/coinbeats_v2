// server/routes/category.js

const express = require('express');
const asyncHandler = require('express-async-handler');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { getPoints } = require('../controllers/pointController');

const router = express.Router();

router.get(
  '/',
  authenticateToken,
  authorizeRoles('ADMIN', 'SUPERADMIN'),
  asyncHandler(getPoints)
);

module.exports = router;
