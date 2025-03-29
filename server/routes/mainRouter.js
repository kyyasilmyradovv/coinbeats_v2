const express = require('express');
const router = express.Router();

router.use('/academies', require('./academiesRouter'));

module.exports = router;
