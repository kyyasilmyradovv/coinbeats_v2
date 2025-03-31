const express = require('express');
const router = express.Router();

router.use('/academies', require('./academiesRouter'));
router.use('/counter', require('./counterRouter'));

module.exports = router;
