// server/routes/auth.js

const express = require('express');
const {
  login,
  refreshToken,
  registerUser,
  twitterStart,
  twitterCallback,
  twitterOAuthStart,
  twitterOAuthCallback,
} = require('../controllers/authController');
const asyncHandler = require('express-async-handler');

const router = express.Router();

router.post('/login', asyncHandler(login));
router.post('/refresh', asyncHandler(refreshToken));
router.post('/register', asyncHandler(registerUser));
router.get('/twitter/start', asyncHandler(twitterStart));
router.get('/twitter/callback', asyncHandler(twitterCallback));
router.get('/twitter/oauth/start', asyncHandler(twitterOAuthStart));
router.get('/twitter/oauth/callback', asyncHandler(twitterOAuthCallback));

module.exports = router;
