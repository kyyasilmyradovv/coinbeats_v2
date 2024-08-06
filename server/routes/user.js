// server/routes/user.js

const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  getAllUsers,
  createUser,
  deleteUser,
  getUserDetailsById, // Import the new function
  getUserByTelegramId, // Existing function
  updateUserRole,
  registerCreator,
  userInteraction
} = require('../controllers/userController');

const router = express.Router();

// Define user-related routes
router.get('/', authenticateToken, authorizeRoles('ADMIN', 'SUPERADMIN'), getAllUsers);
router.get('/details/:userId', authenticateToken, authorizeRoles('ADMIN', 'SUPERADMIN'), getUserDetailsById); // New route to get user details by database ID
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'SUPERADMIN'), createUser);
router.delete('/:userId', authenticateToken, authorizeRoles('ADMIN', 'SUPERADMIN'), deleteUser);
router.get('/:telegramUserId', getUserByTelegramId); // Existing route by Telegram ID
router.post('/update-role', authenticateToken, authorizeRoles('ADMIN', 'SUPERADMIN'), updateUserRole);
router.post('/register-creator', registerCreator);
router.post('/user-interaction', userInteraction);

module.exports = router;
