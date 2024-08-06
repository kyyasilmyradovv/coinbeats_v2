// server/routes/question.js

const express = require('express');
const { getInitialQuestions } = require('../controllers/questionController'); // Ensure this matches

const router = express.Router();

// Define the correct route using the correct handler
router.get('/initial-questions', getInitialQuestions);

module.exports = router;
