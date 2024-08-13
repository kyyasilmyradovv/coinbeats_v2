// server/routes/email.js

const express = require('express');
const { emailConfirmationStatus } = require('../controllers/sseController');
const router = express.Router();

// Correct the route path if necessary
router.get('/email-confirmation-status', emailConfirmationStatus);

module.exports = router;
