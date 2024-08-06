// server/routes/auth.js

const express = require('express');
const { login, refreshToken } = require('../controllers/authController');
const { registerCreator } = require('../controllers/userController'); // Import the controller

const router = express.Router();

router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/register-creator', registerCreator); // Add this line to handle creator registration

module.exports = router;
