// server/routes/user.js

const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const telegramAuth = require('../middleware/telegramAuth');
const {
  getAllUsers,
  getCurrentUser,
  createUser,
  deleteUser,
  getUserDetailsById,
  getUserByTelegramId,
  updateUserRoles,
  updateIpFingerprint,
  registerCreator,
  userInteraction,
  confirmEmail,
  getBookmarkedAcademies,
  completeVerificationTask,
  handleLoginStreak,
  startVerificationTask,
  submitTask,
  getUserVerificationTasks,
  checkReferralCompletion,
  getTwitterAuthStatus,
  removeTwitterAccount,
  updateWalletAddresses,
} = require('../controllers/userController');
const asyncHandler = require('express-async-handler');

const router = express.Router();

// Define user-related routes
router.get('/me', telegramAuth, getCurrentUser);
router.post('/handle-login-streak', asyncHandler(handleLoginStreak));
router.post('/start-task', asyncHandler(startVerificationTask)); // No auth middleware
router.post('/submit-task', asyncHandler(submitTask));
router.post('/complete-task', asyncHandler(completeVerificationTask));
router.post('/verification-tasks', asyncHandler(getUserVerificationTasks));
router.get('/twitter/status', telegramAuth, asyncHandler(getTwitterAuthStatus));
router.post(
  '/twitter/remove',
  telegramAuth,
  asyncHandler(removeTwitterAccount)
);
router.post('/update-wallet-addresses', asyncHandler(updateWalletAddresses));
router.get(
  '/',
  authenticateToken,
  authorizeRoles('ADMIN', 'SUPERADMIN'),
  asyncHandler(getAllUsers)
);
router.get(
  '/details/:userId',
  authenticateToken,
  authorizeRoles('ADMIN', 'SUPERADMIN'),
  asyncHandler(getUserDetailsById)
);
router.get(
  '/:userId/check-referral-completion',
  asyncHandler(checkReferralCompletion)
);
router.post(
  '/',
  authenticateToken,
  authorizeRoles('ADMIN', 'SUPERADMIN'),
  asyncHandler(createUser)
);
router.delete(
  '/:userId',
  authenticateToken,
  authorizeRoles('ADMIN', 'SUPERADMIN'),
  asyncHandler(deleteUser)
);
router.get('/:telegramUserId', asyncHandler(getUserByTelegramId));
router.post(
  '/update-role',
  authenticateToken,
  authorizeRoles('ADMIN', 'SUPERADMIN'),
  asyncHandler(updateUserRoles)
);
router.post('/ip-fingerprint', asyncHandler(updateIpFingerprint));
router.post('/register-creator', asyncHandler(registerCreator));
router.post('/interaction', asyncHandler(userInteraction));
router.get('/confirm-email', asyncHandler(confirmEmail));
router.get(
  '/:userId/bookmarked-academies',
  asyncHandler(getBookmarkedAcademies)
);

module.exports = router;
