// server/routes/academyType.js

const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  createAcademyType,
  getAllAcademyTypes,
  updateAcademyType,
  deleteAcademyType,
  addInitialQuestion,
  deleteInitialQuestion,
  updateInitialQuestion,
} = require('../controllers/academyTypeController');
const asyncHandler = require('express-async-handler');

const router = express.Router();

// Adjusted GET route to be publicly accessible
router.get(
  '/',
  authenticateToken,
  authorizeRoles('CREATOR', 'ADMIN', 'SUPERADMIN'),
  asyncHandler(getAllAcademyTypes)
);

// Other routes remain protected
router.post(
  '/',
  authenticateToken,
  authorizeRoles('ADMIN', 'SUPERADMIN'),
  asyncHandler(createAcademyType)
);
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('ADMIN', 'SUPERADMIN'),
  asyncHandler(updateAcademyType)
);
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('ADMIN', 'SUPERADMIN'),
  asyncHandler(deleteAcademyType)
);

// Routes for Initial Questions within an Academy Type
router.post(
  '/:id/questions',
  authenticateToken,
  authorizeRoles('ADMIN', 'SUPERADMIN'),
  asyncHandler(addInitialQuestion)
);
router.delete(
  '/questions/:questionId',
  authenticateToken,
  authorizeRoles('ADMIN', 'SUPERADMIN'),
  asyncHandler(deleteInitialQuestion)
);

// **New PUT Route for Updating Initial Questions**
router.put(
  '/questions/:questionId',
  authenticateToken,
  authorizeRoles('ADMIN', 'SUPERADMIN'),
  asyncHandler(updateInitialQuestion)
);

module.exports = router;
