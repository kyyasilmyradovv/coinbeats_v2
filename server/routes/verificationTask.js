const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  createVerificationTask,
  getVerificationTasks,
  updateVerificationTask,
  deleteVerificationTask,
  getVerificationTaskById,
  getTasksForGamesPage,
  getTasksForHomepage,
  getTasksForAcademypage,
  getVerificationTasksForAcademy,
} = require('../controllers/verificationTaskController');
const asyncHandler = require('express-async-handler');

const router = express.Router();

// Routes for platform-specific tasks (ADMIN and SUPERADMIN)
router.post(
  '/platform',
  authenticateToken,
  authorizeRoles('ADMIN', 'SUPERADMIN'),
  asyncHandler(createVerificationTask)
);
router.get(
  '/platform',
  authenticateToken,
  authorizeRoles('ADMIN', 'SUPERADMIN'),
  asyncHandler(getVerificationTasks)
);

// Routes for academy-specific tasks (CREATOR)
router.post(
  '/academy',
  authenticateToken,
  authorizeRoles('CREATOR'),
  asyncHandler(createVerificationTask)
);

// Allow unauthenticated access to GET academy tasks
router.get('/games', asyncHandler(getTasksForGamesPage));
router.get('/homepage', asyncHandler(getTasksForHomepage));
router.get('/end-of-academy', asyncHandler(getTasksForAcademypage));
router.get('/academy/:academyId', asyncHandler(getVerificationTasksForAcademy));

// Common routes
router.get(
  '/:taskId',
  authenticateToken,
  asyncHandler(getVerificationTaskById)
);

router.put(
  '/:taskId',
  authenticateToken,
  authorizeRoles('ADMIN', 'SUPERADMIN', 'CREATOR'),
  asyncHandler(updateVerificationTask)
);
router.delete(
  '/:taskId',
  authenticateToken,
  authorizeRoles('ADMIN', 'SUPERADMIN', 'CREATOR'),
  asyncHandler(deleteVerificationTask)
);

module.exports = router;
