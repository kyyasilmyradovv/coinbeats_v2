// routes/verificationTask.js
const express = require('express');
const {
  createVerificationTask,
  twitterLogin,
  twitterCallback,
  verifyTwitterTask,
  getVerificationTasks,
} = require('../controllers/verificationTaskController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Route for creating a new verification task (Admin/Platform)
router.post('/create', authenticateToken, createVerificationTask);

// Route for initiating Twitter OAuth login
router.get('/twitter/login', twitterLogin);

// Route for handling Twitter OAuth callback
router.get('/twitter/callback', twitterCallback);

// Route for verifying Twitter task by a user
router.post('/verify-twitter', authenticateToken, verifyTwitterTask);

// Route for getting all verification tasks (for frontend to display)
router.get('/', authenticateToken, getVerificationTasks);

module.exports = router;
