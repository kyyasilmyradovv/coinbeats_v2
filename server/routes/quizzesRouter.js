const express = require('express');
const { getQuestions } = require('../controllers/quizControllers');
const { protectForUser } = require('../controllers/userAuthControllers');
const router = express.Router();

router.use(protectForUser);
router.get('/', getQuestions);

module.exports = router;
