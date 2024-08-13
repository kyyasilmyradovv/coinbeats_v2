// server/routes/auth.js

const express = require('express');
const { login, refreshToken } = require('../controllers/authController');
const asyncHandler = require('express-async-handler');

const router = express.Router();

router.post('/login', asyncHandler(login));
router.post('/refresh', asyncHandler(refreshToken));

module.exports = router;
