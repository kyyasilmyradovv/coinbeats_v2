// server/routes/inbox.js

const express = require('express');
const {
  getPendingAcademies,
  approveAcademy,
  rejectAcademy,
} = require('../controllers/academyController');
const {
  getPendingFeedbackSubmissions,
  getPendingOtherSubmissions, // New function
  creditUserForFeedback,
  deleteFeedbackSubmission,
} = require('../controllers/inboxController');
const asyncHandler = require('express-async-handler');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Route to get pending academies
router.get('/', asyncHandler(getPendingAcademies));

// Route to approve an academy
router.post('/:id/approve', asyncHandler(approveAcademy));

// Route to reject an academy
router.post('/:id/reject', asyncHandler(rejectAcademy));

// Route to get pending academies
router.get(
  '/',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  asyncHandler(getPendingAcademies)
);

// New route to get pending feedback submissions
router.get(
  '/feedback',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  asyncHandler(getPendingFeedbackSubmissions)
);

// New route to get pending other submissions
router.get(
  '/submissions',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  asyncHandler(getPendingOtherSubmissions)
);

// Route to credit user for a submission
router.post(
  '/feedback/:submissionId/credit',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  asyncHandler(creditUserForFeedback)
);

// Route to delete a submission
router.delete(
  '/feedback/:submissionId',
  authenticateToken,
  authorizeRoles('SUPERADMIN'),
  asyncHandler(deleteFeedbackSubmission)
);

module.exports = router;
