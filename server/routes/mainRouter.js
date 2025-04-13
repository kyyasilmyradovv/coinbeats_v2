const express = require('express');
const router = express.Router();

router.use('/counter', require('./counterRouter'));
router.use('/academies', require('./academiesRouter'));
router.use('/academy-types', require('./academyTypesRouter'));
router.use('/categories', require('./categoriesRouter'));
router.use('/chains', require('./chainsRouter'));
router.use('/quizzes', require('./quizzesRouter'));
router.use('/user/auth', require('./userAuthRouter'));
router.use('/points', require('./pointsRouter'));
router.use('/raffles', require('./rafflesRouter'));

module.exports = router;
