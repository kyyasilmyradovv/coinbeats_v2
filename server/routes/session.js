// server/routes/session.js

const express = require('express');
const { logSession } = require('../controllers/sessionController');

const router = express.Router();

// Route to log session data
router.post('/log-session', logSession);

module.exports = router;
