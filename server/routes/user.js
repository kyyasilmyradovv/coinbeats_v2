// server/routes/user.js

const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  getAllUsers,
  createUser,
  deleteUser,
  getUserByTelegramId,
  updateUserRole,
  registerCreator,
  userInteraction
} = require('../controllers/userController');

const router = express.Router();

// Define user-related routes
router.get('/', authenticateToken, authorizeRoles('ADMIN', 'SUPERADMIN'), getAllUsers);
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'SUPERADMIN'), createUser);
router.delete('/:userId', authenticateToken, authorizeRoles('ADMIN', 'SUPERADMIN'), deleteUser);
router.get('/:telegramUserId', getUserByTelegramId);
router.post('/update-role', authenticateToken, authorizeRoles('ADMIN', 'SUPERADMIN'), updateUserRole);
router.post('/register-creator', registerCreator);
router.post('/user-interaction', userInteraction);

module.exports = router;
