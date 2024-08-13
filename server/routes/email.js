// server/routes/email.js

const express = require('express');
const { confirmEmail } = require('../controllers/emailController');
const asyncHandler = require('express-async-handler');

const router = express.Router();

// Define route for email confirmation
router.get('/confirm-email', asyncHandler(confirmEmail));

module.exports = router;
