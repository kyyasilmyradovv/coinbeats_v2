// server/routes/category.js

const express = require('express');
const asyncHandler = require('express-async-handler');
const {
  getSurpriseBoxes,
  updateSurpriseBoxes,
  getSurprisePoints,
} = require('../controllers/surpriseBoxController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/', asyncHandler(getSurpriseBoxes));
router.put('/', asyncHandler(updateSurpriseBoxes));

router.get(
  '/points',
  authenticateToken,
  authorizeRoles('ADMIN', 'SUPERADMIN'),
  asyncHandler(getSurprisePoints)
);

module.exports = router;
