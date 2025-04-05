const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { getQuestions } = require('../controllers/quizControllers');
const router = express.Router();

router.get('/', getQuestions);

module.exports = router;
