// routes/discover.js

const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const asyncHandler = require('express-async-handler');
const discoverController = require('../controllers/discoverController');

const router = express.Router();

// Public routes
router.get('/educators', asyncHandler(discoverController.getAllEducators));
router.get('/educators/:id', asyncHandler(discoverController.getEducatorById));
router.get('/tutorials', asyncHandler(discoverController.getAllTutorials));
router.get('/tutorials/:id', asyncHandler(discoverController.getTutorialById));

// Protected routes for SuperAdmin to create content
router.post(
  '/educators',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  asyncHandler(discoverController.createEducator)
);

// Similarly, add routes for creating/updating/deleting Lessons, Podcasts, and Tutorials.

module.exports = router;
