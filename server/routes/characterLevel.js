// server/routes/characterLevel.js

const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const asyncHandler = require('express-async-handler');
const { characterLevelUpload } = require('../uploadConfig'); // For image uploads

const {
  createCharacterLevel,
  getCharacterLevels,
  updateCharacterLevel,
  deleteCharacterLevel,
} = require('../controllers/characterLevelController');

const router = express.Router();

// Create a new character level
router.post(
  '/',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  characterLevelUpload.fields([{ name: 'lottie', maxCount: 1 }]), // Use the new middleware
  asyncHandler(createCharacterLevel)
);

// Get all character levels
router.get('/', asyncHandler(getCharacterLevels));

// Update a character level
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  characterLevelUpload.fields([{ name: 'lottie', maxCount: 1 }]), // Use the new middleware
  asyncHandler(updateCharacterLevel)
);

// Delete a character level
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  asyncHandler(deleteCharacterLevel)
);

module.exports = router;
