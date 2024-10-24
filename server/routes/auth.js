// server/routes/auth.js

const express = require('express');
const {
  login,
  refreshToken,
  registerUser,
  twitterStart,
  twitterCallback,
} = require('../controllers/authController');
const asyncHandler = require('express-async-handler');

const router = express.Router();

router.post('/login', asyncHandler(login));
router.post('/refresh', asyncHandler(refreshToken));
router.post('/register', asyncHandler(registerUser));
router.get('/twitter/start', asyncHandler(twitterStart));
router.get('/twitter/callback', asyncHandler(twitterCallback));

module.exports = router;
