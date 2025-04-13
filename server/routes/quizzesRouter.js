const express = require('express');
const {
  getQuestions,
  submitAnswer,
} = require('../controllers/quizControllers');
const { protectForUser } = require('../controllers/userAuthControllers');
const { checkInputs } = require('../middleware/checkInputs');
const router = express.Router();

router.use(protectForUser);
router.get('/', getQuestions);
router.post('/submit', checkInputs('submit_quiz', 'create'), submitAnswer);

module.exports = router;
