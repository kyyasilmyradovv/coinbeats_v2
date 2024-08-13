// server/routes/session.js

const express = require('express');
const { logSession } = require('../controllers/sessionController');
const asyncHandler = require('express-async-handler');

const router = express.Router();

router.post('/log-session', asyncHandler(logSession));

module.exports = router;
