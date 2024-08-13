// server/routes/question.js

const express = require('express');
const { getInitialQuestions } = require('../controllers/questionController');
const asyncHandler = require('express-async-handler');

const router = express.Router();

// Define the correct route using the correct handler
router.get('/initial-questions', asyncHandler(getInitialQuestions));

module.exports = router;
